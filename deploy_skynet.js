const { SkynetClient } = require("@nebulous/skynet");
const config = require("./vue-skynet_config");
const fetch = require("node-fetch");
const base64js = require("base64-js");
const base32Encode = require("base32-encode");

const client = new SkynetClient(config.portal);

const path = "./dist";

console.log(`Uploading ${path} to ${config.portal}`);

// from https://github.com/kwypchlo/base32/blob/a68c5d5efab177688bea8368cf7efd03b130a0fa/src/crypto.ts
function toBase32(skylink) {
  const decodedSkylink = base64js.toByteArray(
    skylink.padEnd(skylink.length + 4 - (skylink.length % 4), "=")
  );
  return base32Encode(decodedSkylink, "RFC4648-HEX", {
    padding: false,
  }).toLowerCase();
}

function updateNamebaseDomain(skylink) {
  console.log(
    `Updating TXT record of ${config.namebaseDomain} to sia://${skylink}`
  );
  if (!config.namebaseDomain)
    return console.error("config.namebaseDomain cannot be empty");
  if (!config.namebaseAPIKey)
    return console.error("config.namebaseAPIKey cannot be empty");
  if (!config.namebaseAPISecret)
    return console.error("config.namebaseAPISecret cannot be empty");

  const credentials = Buffer.from(
    `${config.namebaseAPIKey}:${config.namebaseAPISecret}`
  );
  const encodedCredentials = credentials.toString("base64");
  const authorization = `Basic ${encodedCredentials}`;

  const jsonBody = {
    records: [
      {
        type: "TXT",
        host: "",
        value: `sia://${skylink}`,
        ttl: 0,
      },
    ],
  };

  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: authorization,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonBody),
  };

  fetch(
    `https://namebase.io/api/v0/dns/domains/${config.namebaseDomain}`,
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      if (!json || !json.success) {
        console.error("Namebase error:");
        console.error(json);
        return;
      } else {
        console.log(`Domain "${config.namebaseDomain}" successfully updated`);
        console.log(`TX Hash: ${json.txHash}`);
        console.log(`rawNameState: ${json.rawNameState}`);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

client
  .uploadDirectory(path)
  .then((resp) => {
    const skylink = resp.replace("sia://", "");
    const base32Skylink = toBase32(skylink);

    let base32Url = new URL(config.portal);
    base32Url.hostname = base32Url.hostname.replace("www.", "");
    base32Url.hostname = `${base32Skylink}.${base32Url.hostname}`;

    console.log(`Done: ${config.portal}/${skylink}/`);
    console.log(`Base32: ${base32Url}`);
    if (config.enableNamebase) {
      updateNamebaseDomain(skylink);
    }
  })
  .catch((err) => console.error(err.message));

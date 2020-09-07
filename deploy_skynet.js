const skynet = require("@nebulous/skynet");
const config = require("./vue-skynet_config");
const fetch = require("node-fetch");

const path = "./dist";

let opts = skynet.defaultOptions;

opts.portalUrl = config.portal;
console.log(`Uploading ${path} to ${config.portal}`);

function updateNamebaseDomain(skylink) {
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

skynet
  .uploadDirectory(path, opts)
  .then((resp) => {
    const skylink = resp.replace("sia://", "");
    console.log(`Done: ${config.portal}/${skylink}/`);
    if (config.enableNamebase) {
      console.log(
        `Updating TXT record of ${config.namebaseDomain} to ${skylink}`
      );
      updateNamebaseDomain(skylink);
    }
  })
  .catch((err) => console.error(err.message));

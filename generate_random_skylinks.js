const skynet = require("@nebulous/skynet");
const version = require("./package.json").version;
const { MD5 } = require("crypto-js");

let opts = skynet.defaultUploadOptions;
opts.dryRun = true;
opts.portalUrl = "https://skyportal.xyz";

const path = "./dist";
const search = "sky";

let found = false;

async function next() {
  let rand = MD5(Math.random().toString()).toString();
  opts.customFilename = `skygallery-v${version}-${rand}`;
  let skylink = await skynet
    .uploadDirectory(path, opts)
    .catch((err) => console.error(err.message));
  skylink = skylink.replace("sia://", "");
  found = skylink.toLowerCase().includes(search);
  if (found) {
    console.log(
      `Skylink that includes ${search} with i ${rand}: ${opts.portalUrl}/${skylink}/`
    );
    return;
  } else {
    next();
  }
}

next();

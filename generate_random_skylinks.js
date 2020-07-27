const skynet = require("@nebulous/skynet");

let opts = skynet.defaultUploadOptions;
opts.dryRun = true;
opts.portalUrl = "https://skyportal.xyz";

const path = "./dist";
const search = "gallery";

let found = false;

async function next() {
  opts.customFilename = `skygallery-${Math.floor(Math.random() * 10000)}`;
  let skylink = await skynet
    .uploadDirectory(path, opts)
    .catch((err) => console.error(err.message));
  skylink = skylink.replace("sia://", "");
  found = skylink.toLowerCase().includes("gallery");
  if (found) {
    console.log(
      `Skylink that includes ${search} with ${opts.customFilename}: ${opts.portalUrl}/${skylink}/`
    );
  } else {
    console.log(`${skylink}: ${found}`);
    next();
  }
}

next();

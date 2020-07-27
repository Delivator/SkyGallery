const skynet = require("@nebulous/skynet");

let opts = skynet.defaultUploadOptions;
opts.dryRun = true;
opts.portalUrl = "https://skyportal.xyz";

const path = "./dist";
const search = "skyg";

let found = false;

async function next() {
  const rand = Math.floor(Math.random() * 100000);
  opts.customFilename = `skygallery-${rand}`;
  let skylink = await skynet
    .uploadDirectory(path, opts)
    .catch((err) => console.error(err.message));
  skylink = skylink.replace("sia://", "");
  found = skylink.toLowerCase().includes(search);
  if (found) {
    console.log(
      `Skylink that includes ${search} with rand ${rand}: ${opts.portalUrl}/${skylink}/`
    );
    return;
  } else {
    console.log(`${skylink}: ${found}`);
    next();
  }
}

next();
next();
next();

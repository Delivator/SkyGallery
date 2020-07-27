const skynet = require("@nebulous/skynet");

let opts = skynet.defaultUploadOptions;
opts.dryRun = true;
opts.portalUrl = "https://skyportal.xyz";

const path = "./dist";
const search = "sky";

let found = false;
let i = 0;

async function next() {
  if (process.argv[2]) i = process.argv[2];
  opts.customFilename = `skygallery-${i}`;
  let skylink = await skynet
    .uploadDirectory(path, opts)
    .catch((err) => console.error(err.message));
  skylink = skylink.replace("sia://", "");
  found = skylink.toLowerCase().includes(search);
  if (found) {
    console.log(
      `Skylink that includes ${search} with i ${i}: ${opts.portalUrl}/${skylink}/`
    );
    return;
  } else {
    console.log(`${skylink} ${i}: ${found}`);
    next(++i);
  }
}

next();

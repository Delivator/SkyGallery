const skynet = require("@nebulous/skynet");
import version from "./package.json";

const portals = [
  // "http://skynet.local",
  "https://skyportal.xyz",
  // "https://siasky.net",
  // "https://siasky.dev",
  // "https://skynethub.io",
  // "https://skynet.cloudloop.io",
];

let opts = skynet.defaultUploadOptions;
opts.customFilename = `skygallery-${version}`;

const path = "./dist";

portals.forEach((portal) => {
  opts.portalUrl = portal;
  console.log(`Uploading ${path} to ${portal}`);

  skynet
    .uploadDirectory(path, opts)
    .then((resp) => {
      const skylink = resp.replace("sia://", "");
      console.log(`${portal}/${skylink}/`);
    })
    .catch((err) => console.error(err.message));
});

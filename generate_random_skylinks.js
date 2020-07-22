const skynet = require("@nebulous/skynet");

let opts = skynet.defaultUploadOptions;
opts.dryRun = true;
opts.portalUrl = "https://skyportal.xyz";

const path = "./dist";

for (let i = 0; i < 10; i++) {
  opts.customFilename = `skygallery-${i}`;
  skynet
    .uploadDirectory(path, opts)
    .then((resp) => {
      const skylink = resp.replace("sia://", "");
      console.log(`Skylink with index ${i}: ${opts.portalUrl}/${skylink}/`);
    })
    .catch((err) => console.error(err.message));
}

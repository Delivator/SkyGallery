const skynet = require("@nebulous/skynet");

const portalUrl = "https://skyportal.xyz";

let opts = skynet.DefaultUploadOptions;
opts.portalUrl = portalUrl;

console.log("Uploading ./dist to " + portalUrl);

skynet
  .UploadDirectory("./dist", opts)
  .then((resp) => {
    const skylink = resp.replace("sia://", "");
    console.log(`${portalUrl}/${skylink}/index.html`);
  })
  .catch((err) => console.error(err.message));

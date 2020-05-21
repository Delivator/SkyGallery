const skynet = require("@nebulous/skynet");

const portals = [
  "https://skyportal.xyz",
  "https://skynet.cloudloop.io",
  "https://siasky.net",
];

let opts = skynet.DefaultUploadOptions;
portals.forEach((portal) => {
  opts.portalUrl = portal;
  console.log("Uploading ./dist to " + portal);

  skynet
    .UploadDirectory("./dist", opts)
    .then((resp) => {
      const skylink = resp.replace("sia://", "");
      console.log(`${portal}/${skylink}/index.html`);
    })
    .catch((err) => console.error(err.message));
});

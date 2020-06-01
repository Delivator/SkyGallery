const skynet = require("@nebulous/skynet");

const portals = [
  "http://skynet.local",
  "https://skyportal.xyz",
  // "https://siasky.net",
  // "https://skynethub.io",
  // "https://skynet.cloudloop.io",
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

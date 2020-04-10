const express = require("express");
const app = express();
// const got = require("got");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

app.get("*", (req, res) => {
  // const options = {
  //   url: "https://siasky.net" + req.originalUrl,
  //   method: req.method
  // };
  // got(options)
  console.log(req);
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Skynet relay running: http://localhost:3000/");
});

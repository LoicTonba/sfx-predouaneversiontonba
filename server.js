const { createServer } = require("https");
const { readFileSync } = require("fs");
const next = require("next");
const { parse } = require("url");

const dev = false;
const port = Number(process.env.PORT || 14025);
const host = process.env.BIND_HOST || "SFX-DEV-01";

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const pfx = readFileSync(process.env.HTTPS_PFX_PATH);
  const passphrase = process.env.HTTPS_PFX_PASSWORD;

  createServer({ pfx, passphrase }, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, host, () => {
    console.log(`HTTPS ready on https://${host}:${port}`);
  });
});

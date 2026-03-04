const { createServer } = require("https");
const { readFileSync, existsSync } = require("fs");
const next = require("next");
const { parse } = require("url");

const dev = false;
const port = Number(process.env.PORT || 14027);

// Adresse d'ecoute (toutes interfaces)
const bindHost = (process.env.BIND_HOST || "0.0.0.0").trim();

// Nom public pour l'URL affichee
const publicHost =
  (process.env.PUBLIC_HOST || process.env.COMPUTERNAME || "localhost").trim();

const pfxPath = (process.env.HTTPS_PFX_PATH || "").trim();
const passphrase = (process.env.HTTPS_PFX_PASSWORD || "").trim();

if (!pfxPath) {
  throw new Error("HTTPS_PFX_PATH manquant.");
}
if (!existsSync(pfxPath)) {
  throw new Error(`Certificat introuvable: ${pfxPath}`);
}
if (!passphrase) {
  throw new Error("HTTPS_PFX_PASSWORD manquant.");
}

const app = next({ dev, hostname: bindHost, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const pfx = readFileSync(pfxPath);

  createServer({ pfx, passphrase }, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, bindHost, () => {
    console.log(`HTTPS ready on https://${publicHost}:${port}`);
    console.log(`Listening on ${bindHost}:${port}`);
  });
});

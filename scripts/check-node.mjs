const major = Number(process.versions.node.split('.')[0]);
if (major < 24) {
  console.error(`NavLog tests require Node.js 24 or newer; found ${process.version}. Install Node 24 LTS, run npm ci, then retry npm test.`);
  process.exit(1);
}

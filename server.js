const http = require("http");
const app = require("./app");
require("dotenv").config();

const port = process.env.PORT || 3000;
const domain = process.env.IP_ADDRESS || "http://localhost";

const server = http.createServer(app);

console.log(`server is running on ${domain}:${port}`);

server.listen(port);

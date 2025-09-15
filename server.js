// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

console.log("NODE_ENV", process.env.NODE_ENV);

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : (process.env.HOSTNAME || "0.0.0.0");
const port = Number(process.env.PORT) || 3000;

// Set API URL based on environment
const apiUrl = dev 
  ? 'http://localhost:3303'  // Development
  : process.env.NEXT_PUBLIC_API_URL; // Production - already includes port and /api path

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === "/a") {
        await app.render(req, res, "/a", query);
      } else if (pathname === "/b") {
        await app.render(req, res, "/b", query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${ hostname }:${ port }`);
  });
});

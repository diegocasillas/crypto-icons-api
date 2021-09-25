const express = require("express");
const app = express();
const redis = require("redis");
const { generateSVG, generatePNG } = require("./generators");

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

app.get(
  "/api/:style/:currency/:size/:color?",
  async (req, res, next) => {
    const { style, currency, size, color } = req.params;
    const toPNG = req.query.png === "true";
    const cacheKey = req.path;
    const filename = currency + "-" + style + "-" + size + ".png";

    if (size <= 0) {
      res.status(400).send({ error: "Invalid size" });
      return;
    }

    const sendPNG = (png, filename) => {
      res.set("Content-Type", "image/png");
      res.header("Content-disposition", "inline; filename=" + filename);
      res.send(png);
    };

    const sendSVG = (svg) => {
      res.set("Content-Type", "image/svg+xml");
      res.send(svg);
    };

    const client = redis.createClient({
      url: process.env.REDIS_URL,
      return_buffers: true,
    });

    client.on("error", async (err) => {
      try {
        client.quit();

        const svg = generateSVG({ style, currency, size, color });

        if (!toPNG) {
          return sendSVG(svg);
        }

        const png = await generatePNG(svg, size);
        return sendPNG(png, filename);
      } catch (e) {
        next(e);
      }
    });

    client.on("connect", () => {
      client.get(cacheKey, async (error, result) => {
        try {
          if (result !== null) {
            return toPNG ? sendPNG(result, filename) : sendSVG(result);
          }

          const svg = generateSVG({ style, currency, size, color });

          if (!toPNG) {
            sendSVG(svg);
            return next();
          }

          const png = await generatePNG(svg, size);
          sendPNG(png, filename);

          res.locals.setCache = () =>
            client.set(cacheKey, newResult, () => {
              client.quit();
            });
          return next();
        } catch (e) {
          next(e);
        }
      });
    });
  },
  [(req, res, next) => res.locals.setCache()]
);

app.use((error, req, res, next) => {
  if (error) {
    error.message === "FILE_NOT_FOUND"
      ? res.status(404).send({ error: "File not found" })
      : res.status(500).send({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));

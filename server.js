const express = require("express");
const app = express();
const { convert } = require("convert-svg-to-png");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = new JSDOM("").window;
const fs = require("fs");
const path = require("path");
const redis = require("redis");

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

app.get("/api/:style/:currency/:size/:color?", async (req, res) => {
  const style = req.params.style;
  const currency = req.params.currency;
  const size = req.params.size;
  const cacheKey = req.path;
  const filename = currency + "-" + style + "-" + size + ".png";

  if (size <= 0) {
    res.status(400).send({ error: "Invalid size" });
    return;
  }

  const client = redis.createClient({
    url: process.env.REDIS_URL,
    return_buffers: true,
  });

  client.on("error", function (err) {
    client.quit();
    generatePNG(req, res, null);
  });

  client.on("connect", function (err) {
    client.get(cacheKey, async (error, result) => {
      if (result == null) {
        console.log("Cache miss");
        generatePNG(req, res, client);
      } else {
        client.quit();
        console.log("Cache hit");
        sendPNG(res, result, filename);
      }
    });
  });
});

function sendPNG(response, png, filename) {
  response.set("Content-Type", "image/png");
  response.header("Content-disposition", "inline; filename=" + filename);
  response.send(png);
}

async function generatePNG(req, res, redis) {
  const style = req.params.style;
  const currency = req.params.currency;
  const size = req.params.size;
  const color = req.params.color;
  const cacheKey = req.path;
  const filename = currency + "-" + style + "-" + size + ".png";

  const svgPath = path.join(
    __dirname,
    "public",
    "svg",
    style,
    currency + ".svg"
  );

  if (!fs.existsSync(svgPath)) {
    res.status(404).send(null);
    return;
  }

  const svg = fs.readFileSync(svgPath, "utf8");
  const element = document.createElement("div");
  element.innerHTML = svg;

  const svgElement = element.getElementsByTagName("svg")[0];

  const colorCircle = element.getElementsByTagName("circle")[0];
  const iconCircle = element.getElementsByTagName("use")[1];

  const originalSize = svgElement.getAttribute("width");
  svgElement.setAttribute(
    "viewBox",
    "0 0 " + originalSize + " " + originalSize
  );

  svgElement.setAttribute("width", size);
  svgElement.setAttribute("height", size);

  if (color != null && style == "color") {
    const colorString = "#" + color;
    colorCircle.setAttribute("fill", colorString);
  } else if (color != null && style == "icon") {
    const colorString = "#" + color;
    iconCircle.setAttribute("fill", colorString);
  }

  const png = await convert(element.innerHTML, {
    height: size,
    width: size,
    puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });

  if (redis != null) {
    redis.set(cacheKey, png, function (err) {
      redis.quit();
    });
  }

  sendPNG(res, png, filename);
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log("Our app is running on http://localhost:" + port)
);

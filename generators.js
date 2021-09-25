const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");
const { convert } = require("convert-svg-to-png");

const generateSVG = ({ style, currency, size, color }) => {
  const svgPath = path.join(
    __dirname,
    "node_modules",
    "cryptocurrency-icons",
    "svg",
    style,
    currency + ".svg"
  );

  if (!fs.existsSync(svgPath)) {
    throw new Error("FILE_NOT_FOUND");
  }

  const svg = fs.readFileSync(svgPath, "utf8");

  const { JSDOM } = jsdom;
  const { document } = new JSDOM("").window;

  const svgContainer = document.createElement("div");
  svgContainer.innerHTML = svg;

  const svgElement = svgContainer.getElementsByTagName("svg")[0];

  const colorCircle = svgContainer.getElementsByTagName("circle")[0];
  const iconCircle = svgContainer.getElementsByTagName("use")[1];

  const DEFAULT_SIZE = 32;
  const originalSize = svgElement.getAttribute("width") || DEFAULT_SIZE;
  svgElement.setAttribute("viewBox", `0 0 ${originalSize} ${originalSize}`);

  svgElement.setAttribute("width", size);
  svgElement.setAttribute("height", size);

  if (color != null && style == "color") {
    const colorString = "#" + color;
    colorCircle.setAttribute("fill", colorString);
  } else if (color != null && style == "icon") {
    const colorString = "#" + color;
    iconCircle.setAttribute("fill", colorString);
  }
  return svgContainer.innerHTML;
};

const generatePNG = async (svg, size) => {
  return convert(svg, {
    height: size,
    width: size,
    puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });
};

exports.generateSVG = generateSVG;
exports.generatePNG = generatePNG;

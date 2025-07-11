#!/usr/bin/env node
const path = require("node:path");
const { execSync } = require("child_process");
const { version, bin } = require("./package.json");

function parseArg(arg) {
  try {
    if (arg === "true" || arg === "false" || arg === "null" || arg.startsWith("[") || arg.startsWith("{")) {
      return JSON.parse(arg);
    }
    return arg;
  } catch (err) {
    console.warn(`解析参数失败: ${arg}`, err);
    return arg;
  }
}

const cli = async function (args) {
  let options = args.reduce((acc, arg) => {
    const [key, value] = arg.split("=");
    acc[key.replace(/\-\-|\-/, "")] = !value ? true : parseArg(value);
    return acc;
  }, {});

  const hasVersion = options.version || options.V || options.v;

  if (hasVersion) {
    console.log("current version:", version);
  }

  if (Object.keys(options).length === 1) {
    if (hasVersion) {
      return;
    }
  }

  const { loadConfig } = await import("c12");

  const { config: configFromFile } = await loadConfig({
    name: Object.keys(bin)[0]
  });

  options = Object.assign(configFromFile, options);

  Object.keys(options).forEach(key => {
    process.env["ICON_FONT_" + key] = options[key];
  });

  const gulpFilePath = path.join(__dirname, "gulpfile.js");
  const gulpBin = path.join(__dirname, "node_modules", ".bin", "gulp");
  const cmd = `${gulpBin} --cwd ${process.cwd()} --gulpfile ${gulpFilePath} ${options.watch ? "start" : "build"}`;

  execSync(cmd, { stdio: "inherit" });
};

cli(process.argv.slice(2));

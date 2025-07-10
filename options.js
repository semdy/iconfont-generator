const defaultOptions = {
  sourceDir: "assets/icons/",
  distDir: "assets/icon-fonts/",
  fontName: "iconfont",
  className: "iconfont",
  classPrefix: "icon-",
  port: 8750,
  watch: false,
  debug: false
};

const {
  ICON_FONT_sourceDir: sourceDir,
  ICON_FONT_distDir: distDir,
  ICON_FONT_fontName: fontName,
  ICON_FONT_className: className,
  ICON_FONT_classPrefix: classPrefix,
  ICON_FONT_port: port,
  ICON_FONT_debug: debug,
  ICON_FONT_watch: watch
} = process.env;

const overrideOptions = {
  sourceDir,
  distDir,
  fontName,
  className,
  classPrefix,
  port,
  debug: debug ? JSON.parse(debug) : false,
  watch: watch ? JSON.parse(watch) : false
};

const options = { ...defaultOptions };

Object.keys(overrideOptions).forEach(key => {
  if (overrideOptions[key] !== undefined) {
    options[key] = overrideOptions[key];
  }
});

if (options.debug) {
  console.warn("options...\n", options);
}

module.exports = {
  defaultOptions,
  options
};

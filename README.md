# genterate iconfont for web and miniprogram

add, edit or remove a svg from `assets/icons` directory, the building will auto start and generate font files.

## feature

- auto generate .eot,.svg,.ttf,.woff files
- auto generate .css files include font base64 css file
- auto generate svg symbols into js file
- auto generate icons preview files and start a server for preview

## how to use

```bash
$ npm i iconfont-generator-v2 -g
$ iconfont-generator --watch --sourceDir=assets/icons --distDir=assets/icon-fonts
```

default options:

```javascript
{
  watch: false,
  sourceDir: "assets/icons/",
  distDir: "assets/icon-fonts/",
  fontName: "iconfont",
  className: "iconfont",
  classPrefix: "icon-",
  port: 8750,
  debug: false
};
```

### configuration file

make `iconfont-generator.config.js` file in project root directory, contents:

```javascript
export default {
  ...someOptions // see above default options
};
```

## develop

```bash
$ git colne git@github.com:semdy/iconfont-generator.git
$ cd iconfont-generator
$ npm install
$ npm start or npm run build
```

## live demo

- [icon font](https://semdy.github.io/iconfont-generator/assets/icon-fonts/preview_fontclass.html)
- [icon symbol](https://semdy.github.io/iconfont-generator/assets/icon-fonts/preview_symbol.html)

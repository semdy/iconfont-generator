const glob = require('glob')
const webfontsGenerator = require('webfonts-generator')

const svgs = glob.sync('assets/icons/**/*.svg')

webfontsGenerator({
    files: svgs,
    html: true,
    types: ['eot', 'woff', 'ttf', 'svg'],
    dest: 'dest/',
  }, function(error) {
    if (error) {
      console.log('Fail!', error);
    } else {
      console.log('Done!');
    }
  })
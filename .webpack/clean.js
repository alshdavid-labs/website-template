const { args } = require('./args')
const path = require('path')
const fs = require('fs-extra')

function clean({
  dir
}) {
  if (args.clean) {
    fs.removeSync(path.resolve(...dir));
  }
  if (args.exitAfterClean) {
    process.exit(0)
  }
}

module.exports = {
  clean
}
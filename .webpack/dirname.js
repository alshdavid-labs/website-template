const tmp = require('tmp')
const { args } = require('./args')

let __tmp_dirname
if (args.devServer) {
  tmp.setGracefulCleanup();
  __tmp_dirname = tmp.dirSync().name
}

module.exports = {
  __tmp_dirname
}
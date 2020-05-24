const yargs = require('yargs').argv
const dotenv = require('dotenv')
const buildID = require("crypto").randomBytes(15).toString('hex')

function argArray(input = []) {
  if (typeof input === 'string') {
    return [input]
  } 
  return input
}

const args = {
  prod: !!yargs.prod,
  clean: !!yargs.clean,
  exitAfterClean: !!yargs['exit-after-clean'],
  stats: !!yargs.stats,
  packages: argArray(yargs.package),
  env: {},
  envFile: {},
  devServer: yargs['$0'].includes('webpack-dev-server'),
}

for (const env of argArray(yargs.env)) {
  const [ key, value ] = env.split('=')
  args.env[key] = value
}

if (yargs['env-file']) {
  const env = dotenv.config({ path: yargs['env-file'] }).parsed
  args.envFile = env
}

if (args.stats === true) {
  args.prod = true
}

const modes = {
  prod: 'production',
  dev: 'development',
}

let mode = modes.dev
if (args.prod) {
  mode = modes.prod
  process.env.NODE_ENV = modes.prod
}

module.exports = {
  args,
  mode,
  modes,
  buildID,
}

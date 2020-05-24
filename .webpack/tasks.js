const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { args } = require('./args')

function processTasks(configs) {
  const tasks = []

  if (args.packages.length == 0) {
    tasks.push(...Object.values(configs))
  } else {
    for (const package of args.packages) {
      tasks.push(configs[package])
    }
  }

  if (args.stats) {
    tasks.forEach((task, i) => {
      task.plugins.push(new BundleAnalyzerPlugin({
        analyzerPort: 8888 + i
      }))
    })
  }

  return tasks
}

module.exports = {
  processTasks
}
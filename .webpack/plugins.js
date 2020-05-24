const path = require('path')
const fs = require('fs-extra')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DefinePlugin = require('webpack').DefinePlugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { args, buildID } = require('./args')
const { processTemplate } = require('./tools')

const plugins = {
  definePlugin: () => new DefinePlugin({
    '__environment': JSON.stringify({ ...args.envFile, ...args.env })
  }),
  cssExtract: (prefix = '') => new MiniCssExtractPlugin({ 
    filename: `${prefix}style.${buildID}.css`
  }),
  webpackHtml: (filePath) => {
    new HtmlWebpackPlugin({
      minify: false,
      filename: filePath[filePath.length - 1],
      template: path.join(...filePath),
      inject: true,
    })
  },
  html: ({
    inputDir,
    outputDir,
    templateOptions = {},
  }) => {
    return new EventHooksPlugin({
      afterEmit: () => {
        const template = fs.readFileSync(path.resolve(...inputDir), 'utf8')
        const processed = processTemplate(template, { 
          buildID, 
          development: args.devServer.toString(), 
          ...args.envFile, 
          ...args.env, 
          ...templateOptions 
        })
        fs.writeFileSync(path.resolve(...outputDir), processed)
      }
    })
  },
  tsConfigPaths: (configFile) => new TsconfigPathsPlugin({
    configFile: path.resolve(...configFile)
  }),
  copyAssets: (from) => new CopyWebpackPlugin({ 
    patterns: [{
      from: path.resolve(path.join(...from)),
      to: from[from.length - 1]
    }]
  }),
  copyAfterEmit: ({ fromDir, toDir }) => new EventHooksPlugin({
    afterEmit: () => fs.copyFileSync(
      path.join(...fromDir),
      path.join(...toDir),
    )
  })
}



module.exports = {
  plugins
}
const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const Args = {
  Production: 'production',
  Stats: '--stats',
}



const Paths = {
  Index: path.join(__dirname, 'src', 'index.ts'),
  Output: path.join(__dirname, 'build'),
}


const modes = {
  production: 'production',
  development: 'development',
}

let mode = modes.development

if (process.argv.includes(Args.Production)) {
  mode = modes.production
  process.env.NODE_ENV = modes.production
}

if (fs.existsSync(Paths.Output)) {
  fs.rmSync(Paths.Output, { recursive: true })
}

const config = {
  mode,
  devtool: 'source-map',
  entry:  {
    index: Paths.Index,
  },
  output: {
    filename: '[name].js',
    path: Paths.Output,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      minify: false,
      filename: 'index.html',
      template: 'src/index.html',
      inject:'head',
    }),
    {
      apply(compiler) {
        compiler.hooks.compilation.tap('ScriptAttributeInjector', (compilation) => 
          (HtmlWebpackPlugin).getHooks(compilation).alterAssetTags.tapAsync(
            'ScriptAttributeInjector', (data, cb) => {
              data.assetTags.scripts = data.assetTags.scripts.map(asset => {
                asset.attributes.type = 'module'
                return asset
              })
              return cb(null, data);
            }
          )
        )
      },
    },
    new CopyPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ]
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['module', 'main'],
    alias: {}
  },
  devServer: {
    hot: false,
    port: 8080,
    historyApiFallback: true,
    allowedHosts: 'all',
    host: '0.0.0.0',
    headers: [{
      key: 'Cache-Control',
      value: 'no-store'
    }],
    devMiddleware: {
      writeToDisk: true,
    }
  }
}

if (mode === modes.production) {
  config.output.filename = '[name].[chunkhash].js'
  config.module.rules[1].use.unshift(MiniCssExtractPlugin.loader)
  config.plugins.push(new MiniCssExtractPlugin({ 
    filename: '[name].[chunkhash].css',
  }))
} else {
  config.module.rules[1].use.unshift('style-loader')
}

if (process.argv.includes(Args.Stats)) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = config
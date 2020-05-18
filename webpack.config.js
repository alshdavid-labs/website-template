const path = require('path')
const yargs = require('yargs').argv
const fs = require('fs-extra')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DefinePlugin = require('webpack').DefinePlugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const build = require("crypto").randomBytes(15).toString('hex')

const args = {
  prod: !!yargs.prod,
  clean: !!yargs.clean,
  stats: !!yargs.stats,
  packages: typeof yargs.package === 'string' ? [yargs.package] : yargs.package || [],
  env: (typeof yargs.env === 'string' ? [yargs.env] : yargs.env || [])
    .reduce((p, c) => { p[c.split('=')[0]] = c.split('=')[1]; return p }, {}),
  envFile: yargs['env-file'] ? require('dotenv').config({ path: yargs['env-file'] }).parsed : {},
  devServer: yargs['$0'].includes('webpack-dev-server'),
}

if (args.clean) {
  fs.removeSync(path.join(__dirname, 'build'));
  process.exit(0)
}

if (args.stats) {
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

const rules = {
  js: (legacy = false) => ({
    test: /\.js$/,
    exclude: legacy 
    ? [
      /node_modules\/core-js/,
      /node_modules\/regenerator-runtime/,
    ] 
    : /node_modules/,
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", {
        modules: false,
        targets: legacy ? { ie: 11 } : { esmodules: true }
      }]],
    }
  }),
  ts: (configFile, declarationDir, legacy = false) => ({
    test: /\.tsx?$/,
    exclude: legacy 
      ? [
        /node_modules\/core-js/,
        /node_modules\/regenerator-runtime/,
      ] 
      : /node_modules/,
    use: [
      {
        loader: "babel-loader",
        options: {
          presets: [["@babel/preset-env", {
            modules: false,
            targets: legacy ? { ie: 11 } : { esmodules: true }
          }]],
        }
      },
      {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, ...configFile),
          compilerOptions: {
            ...(declarationDir ? {
              declaration: true,
              declarationDir: declarationDir,
            } : {})
          }
        },
      },
    ]
  }),
  css: () => ({
    test: /\.css$/,
    use: [
      ...(args.devServer ? [] : [{
        loader: require('mini-css-extract-plugin').loader,
        options: {
          hmr: mode === modes.dev,
        },
      }]),
      {
        loader: 'css-loader',
      },
    ],
  }),
  scss: () => ({
    test: /\.s[ac]ss$/i,
    use: [
      ...(args.devServer ? [] : [{
        loader: require('mini-css-extract-plugin').loader,
        options: {
          hmr: mode === modes.dev,
        },
      }]),
      'css-loader',
      'sass-loader',
    ],
  }),
}

const plugins = {
  definePlugin: () => new DefinePlugin({
    '__environment': JSON.stringify({ ...args.envFile, ...args.env })
  }),
  cssExtract: (prefix = '') => new MiniCssExtractPlugin({ 
    filename: `${prefix}style.${build}.css`
  }),
  html: (filePath) => new HtmlWebpackPlugin({
    minify: false,
    filename: filePath[filePath.length - 1],
    template: path.join(__dirname, ...filePath),
    inject: true,
  }),
  tsConfigPaths: (configFile) => new TsconfigPathsPlugin({
    configFile: path.resolve(__dirname, ...configFile)
  }),
  copyAssets: (from) => new CopyWebpackPlugin([{ 
    from: path.resolve(...from),
    to: from[from.length - 1]
  }])
}

const gui = {
  mode,
  entry:  path.join(__dirname, 'gui', 'index.ts'),
  output: {
    filename: `modern/index.${build}.js`,
    path: path.join(__dirname, 'build', 'gui'),
  },
  module: {
    rules: [
      rules.js(),
      rules.ts(['gui', 'tsconfig.json']),
      rules.css(),
      rules.scss(),
    ]
  },
  plugins: [
    plugins.definePlugin(),
    plugins.copyAssets(['gui', 'assets']),
    ...(args.devServer ? [
      plugins.html(['gui', 'index.html'])
    ] : [
      plugins.cssExtract('modern/'),
      new EventHooksPlugin({
        afterEmit: () => {
          const template = fs.readFileSync(path.resolve('gui', 'index.html'), 'utf8')
          const processed = template.replace(/{{ build }}/g, build)
          fs.writeFileSync(path.resolve('build', 'gui', 'index.html'), processed)
        }
      })
    ])
  ],
  resolve: {
    plugins: [
      plugins.tsConfigPaths(['gui', 'tsconfig.json'])
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'build', 'gui'),
    disableHostCheck: true,
    port: 9000
  }
}

const guiLegacy = {
  mode,
  entry:  [
    path.join(__dirname, 'gui', 'ie.ts'),
    path.join(__dirname, 'gui', 'index.ts'),
  ],
  output: {
    filename: `legacy/index.${build}.js`,
    path: path.join(__dirname, 'build', 'gui'),
  },
  module: {
    rules: [
      rules.js(true),
      rules.ts(['gui', 'tsconfig.json'], undefined, true),
      rules.css(),
      rules.scss(),
    ]
  },
  plugins: [
    plugins.definePlugin(),
    plugins.cssExtract('legacy/'),
  ],
  resolve: {
    plugins: [
      plugins.tsConfigPaths(['gui', 'tsconfig.json'])
    ]
  }
}

const packages = {
  gui,
  gui_legacy: guiLegacy,
}

const tasks = []

if (args.packages.length == 0) {
  tasks.push(...Object.values(packages))
} else {
  for (const package of args.packages) {
    tasks.push(packages[package])
  }
}

if (args.stats) {
  tasks.forEach((task, i) => {
    task.plugins.push(new BundleAnalyzerPlugin({
      analyzerPort: 8888 + i
    }))
  })
}

module.exports = tasks
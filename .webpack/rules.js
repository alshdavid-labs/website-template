const path = require('path')
const { args, modes, mode } = require('./args')
const { useObjectIfTruthy, processArray } = require('./tools')

const modernOptions = {
  ignore: [
    /node_modules/
  ],
  babelTarget: { esmodules: true }
}

const legacyOptions = {
  ignore: [
    /node_modules\/core-js/,
    /node_modules\/regenerator-runtime/,
  ],
  babelTarget: { ie: 11 }
}

const rules = {
  js: ({
    legacy = false,
  } = {}) => ({
    test: /\.js$/,
    exclude: legacy ? legacyOptions.ignore : modernOptions.ignore,
    loader: "babel-loader",
    options: {
      presets: [["@babel/preset-env", {
        modules: false,
        targets: legacy ? legacyOptions.babelTarget : modernOptions.babelTarget
      }]],
    }
  }),
  ts: ({
    configFile, 
    declarationDir, 
    legacy = false
  }) => ({
    test: /\.tsx?$/,
    exclude: legacy ? legacyOptions.ignore : modernOptions.ignore,
    use: [
      {
        loader: "babel-loader",
        options: {
          presets: [["@babel/preset-env", {
            modules: false,
            targets: legacy ? legacyOptions.babelTarget : modernOptions.babelTarget
          }]],
        }
      },
      {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(...configFile),
          compilerOptions: {
            ...useObjectIfTruthy(declarationDir, {
              declaration: true,
              declarationDir: declarationDir,
            })
          }
        },
      },
    ]
  }),
  css: () => ({
    test: /\.css$/,
    use: processArray([
      !args.devServer && {
        loader: require('mini-css-extract-plugin').loader,
        options: {
          hmr: mode === modes.dev,
        },
      },
      {
        loader: 'css-loader',
      },
    ]),
  }),
  scss: () => ({
    test: /\.s[ac]ss$/i,
    use: processArray([
      !args.devServer && {
        loader: require('mini-css-extract-plugin').loader,
        options: {
          hmr: mode === modes.dev,
        },
      },
      'css-loader',
      'sass-loader',
    ]),
  }),
}

module.exports = {
  rules
}
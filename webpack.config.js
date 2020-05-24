const path = require('path')
const { buildID, plugins, rules, args, mode, processTasks, processArray, clean, __tmp_dirname } = require('./.webpack')

clean({
  dir: [__dirname, 'build'],
})

const __out_dirname = args.devServer ? __tmp_dirname : __dirname

const gui = {
  mode,
  entry:  path.join(__dirname, 'gui', 'index.ts'),
  output: {
    filename: `modern/index.${buildID}.js`,
    path: path.join(__out_dirname, 'build', 'gui'),
  },
  module: {
    rules: [
      rules.js(),
      rules.ts({
        configFile: [__dirname, 'gui', 'tsconfig.json']
      }),
      rules.css(),
      rules.scss(),
    ]
  },
  plugins: processArray([
    plugins.definePlugin(),
    plugins.copyAssets([__dirname, 'gui', 'assets']),
    !args.devServer && plugins.cssExtract('modern/'),
    plugins.html({
      inputDir: [__dirname, 'gui', 'index.html'],
      outputDir: [__out_dirname, 'build', 'gui', 'index.html'],
      templateOptions: {
        modernScript: `modern/index.${buildID}.js`,
        modernStyle: !args.devServer ? `modern/style.${buildID}.css` : '',
        legacyScript: !args.devServer ? `legacy/index.${buildID}.js` : '',
        legcayStyle: !args.devServer ? `legacy/style.${buildID}.css` : '',
      }
    })
  ]),
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      plugins.tsConfigPaths([__dirname, 'gui', 'tsconfig.json'])
    ]
  },
  devServer: {
    contentBase: path.join(__out_dirname, 'build', 'gui'),
    disableHostCheck: true,
    writeToDisk: true,
    port: 9000
  }
}

const gui_legacy = {
  mode,
  entry:  [
    path.join(__dirname, 'gui', 'index.legacy.ts'),
    path.join(__dirname, 'gui', 'index.ts'),
  ],
  output: {
    filename: `legacy/index.${buildID}.js`,
    path: path.join(__dirname, 'build', 'gui'),
  },
  module: {
    rules: [
      rules.js({
        legacy: true
      }),
      rules.ts({
        configFile: [__dirname, 'gui', 'tsconfig.json'], 
        legacy: true
      }),
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
      plugins.tsConfigPaths([__dirname, 'gui', 'tsconfig.json'])
    ]
  }
}

module.exports = processTasks({
  gui,
  gui_legacy,
})
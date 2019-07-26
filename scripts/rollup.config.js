const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs')
const { uglify } = require('rollup-plugin-uglify')

module.exports = {
  inputOpt: {
    // input: '',
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
        presets: [['@babel/preset-env', { modules: false }]],
        runtimeHelpers: true,
        externalHelpers: true
      }),
      commonjs({
        include: 'node_modules/**',
        extensions: [ '.js'],
        sourceMap: false,
        ignore: [ 'conditional-runtime-dependency' ]
      }),
      uglify({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true
        }
      })
    ]
  },
  outputOpt: {
    // file: '',
    format: 'cjs'
  }
};




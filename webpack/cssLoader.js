'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');

var _NodeTemplatePlugin2 = _interopRequireDefault(_NodeTemplatePlugin);

var _NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');

var _NodeTargetPlugin2 = _interopRequireDefault(_NodeTargetPlugin);

var _LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');

var _LibraryTemplatePlugin2 = _interopRequireDefault(_LibraryTemplatePlugin);

var _SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

var _SingleEntryPlugin2 = _interopRequireDefault(_SingleEntryPlugin);

var _LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

var _LimitChunkCountPlugin2 = _interopRequireDefault(_LimitChunkCountPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exec = (loaderContext, code, filename) => {
  const module = new _module2.default(filename, loaderContext);
  module.paths = _module2.default._nodeModulePaths(loaderContext.context);
  module.filename = filename;
  module._compile(code, filename);
  return module.exports;
};

const findModuleById = (modules, id) => {
  for (const module of modules) {
    if (module.id === id) {
      return module;
    }
  }
  return null;
};

function pitch(request) {
  
  let context = this._module.issuer && this._module.issuer.context
  if(!context){
    context = this.context
  }
  let path = /src(\\|\/).+/.exec(context)
  let _target = ''
  if(path){
    path = path[0]
    if(path.search('pages') > -1){
      if(path.search(/\\/)>-1){
        _target = path.replace(/(.+)?src[\\]pages[\\]/,'')
      }else{
        _target = path.replace(/src[//\/]pages[//\/]/,'')
      }
      
    }else{
      if(path.search(/\\/)>-1){
        _target = path.replace(/(.+)?src[\\]/g,'').replace(/[\\][^\\]+/,'')
      }else{
        _target = path.replace(/(src[//\/])|[//\/][^//\/]+/g,'')
      }
    }
  }

  const query = _loaderUtils2.default.getOptions(this) || {};
  this.addDependency(this.resourcePath);
  const childFilename = '*'; 
  const publicPath = typeof query.publicPath === 'string' ? query.publicPath : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath
  };
  const childCompiler = this._compilation.createChildCompiler(`${request}`, outputOptions);
  new _NodeTemplatePlugin2.default(outputOptions).apply(childCompiler);
  new _LibraryTemplatePlugin2.default(null, 'commonjs2').apply(childCompiler);
  new _NodeTargetPlugin2.default().apply(childCompiler);
  new _SingleEntryPlugin2.default(this.context, `!!${request}`, 'cssBuild').apply(childCompiler);
  new _LimitChunkCountPlugin2.default({ maxChunks: 1 }).apply(childCompiler);
  let source;
  childCompiler.hooks.afterCompile.tap('childCompiler_afterCompile', compilation => {
    source = compilation.assets[childFilename] && compilation.assets[childFilename].source();
    compilation.chunks.forEach(chunk => {
      chunk.files.forEach(file => {
        delete compilation.assets[file];
      });
    });
  });

  const callback = this.async();
  childCompiler.runAsChild((err, entries, compilation) => {
    if (err) return callback(err);

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }
    compilation.fileDependencies.forEach(dep => {
      this.addDependency(dep);
    }, this);
    compilation.contextDependencies.forEach(dep => {
      this.addContextDependency(dep);
    }, this);
    if (!source) {
      return callback(new Error("Didn't get a result from child compiler"));
    }
    let text;
    try {
      text = exec(this, source, request);
      if (!Array.isArray(text)) {
        text = [[null, text]];
      } else {
        
        text = text.map(line => {
          const module = findModuleById(compilation.modules, line[0]);
          return {
            identifier: module.identifier(),
            content: line[1],
            media: line[2],
            sourceMap: line[3]
          };
        });
      }
      
    } catch (e) {
      return callback(e);
    }
    compilation._cssContent= text[0].content
    compilation._target = _target
    callback()
  });
}

exports.pitch = pitch;

exports.default = function (content, map, meta) {
  this.callback(null, operation(content), map, meta);
  return;
};
function operation(content){
  return ''
}

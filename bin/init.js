#!/usr/bin/env node

"use strict";
require("v8-compile-cache");

const ncp = require('ncp').ncp;
const { exec } = require('child_process');

ncp('./template/', `${process.cwd()}/src/`, function (err) {
 if (err) {
   return console.error(err);
 }
  ncp('./tpl_config/', `${process.cwd()}/`, function (err) {
    if (err) {
      return console.error(err);
    }
   
    let insts = "@babel/core @babel/plugin-syntax-dynamic-import @babel/plugin-transform-runtime @babel/preset-env @babel/runtime autoprefixer babel-loader babel-plugin-transform-object-assign clean-webpack-plugin css-loader extract-loader file-loader html-loader less less-loader mini-css-extract-plugin offline-plugin optimize-css-assets-webpack-plugin postcss postcss-loader sass-loader url-loader webpack webpack-cli webpack-dev-middleware webpack-dev-server webpack-hot-middleware webpack-manifest-plugin webpackbar"
    exec(`npm i -D ${insts}`,{cwd:process.cwd()},(err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('done!');
    })
  });
});


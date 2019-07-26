const webpack  = require("webpack")
const config = require("../config/webpack.prod.conf")
process.env.ENV_TYPE = 'build'
const compiler = webpack(config)
compiler.run((err, stats) => {
    if (err) {
        if (err.details) {
          console.error(err.details)
        }
        return;
      }
    
      const info = stats.toJson({color:true});
      if (stats.hasErrors()) {
        console.error(info.errors);
        return
      }
    
      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
      let assets = stats.compilation.assets
      let keys = Object.keys(assets)
      let u = keys.map(i=>{
          return `--> ${parseFloat((assets[i].size()/1024).toFixed(2)) }KiB ${i}`
      }).join('\n')
      console.info(['\x1B[32m', '\x1B[39m'].join('%s'),u)
      console.info('Compiled successfully!')
})


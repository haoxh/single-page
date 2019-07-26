const rollup = require('rollup')
const config = require('./rollup.config')

const inputOptions = config.inputOpt;
const outputOptions = config.outputOpt;

async function build() {
  const inputs = [{
    i:'src/module.js',
    f:'client/module.js'
  },{
    i:'src/router.js',
    f:'client/router.js',
  }]
  const ipts = inputs.map(i =>{
    let o = {...inputOptions}
    o.input = i.i
    return o
  })
  const pts = inputs.map(i =>{
    let o = {...outputOptions}
    o.file = i.f
    return o
  })
  const bundle1 = await rollup.rollup(ipts[0]);
  await bundle1.write(pts[0]);
  const bundle2 = await rollup.rollup(ipts[1]);
  await bundle2.write(pts[1]);
  
}
build();
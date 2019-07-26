
import Module from '@haoxh/sigle-page/client/module' 
import routers from '../../.router'
import '../styles/index.css'

if(process.env.NODE_ENV === 'production'){
  let offline = require('offline-plugin/runtime')
  if(offline) offline.install();
}

export default new Module(routers)


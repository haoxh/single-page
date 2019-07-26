
import {query} from './utils'

export default function Module(router) {
  this.router = router
  this.router.history = window.history
  this.router.location = window.location
  this.router.query = this.query
}
module.prototype = {
  constructor: module,
  define(path, option) {
    if (typeof path !== 'string') return
    this.router.hook(path, { ...option })
  },
  query() {
    let search = window.location.search
    if (search) {
      return query(search)
    }
  }
}

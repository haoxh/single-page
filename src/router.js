
let basePath = ''
let isMove = false
let currentPath = ''
let beforePath = ''
let isPopstate = false
let acuners = []
export default function Routers(routers) {
  if (!(this instanceof Routers)) {
    return new Routers(routers)
  }
  if (!Array.isArray(routers)) {
    return TypeError('routers must be an Array!')
  }
  currentPath = ''
  beforePath = ''
  this.routes = routers || [];
  this.ev = /Mobile/i.test(window.navigator.userAgent) ? 'touchend' : 'click'
  this.init();
  this._bindPopState();

  window.addEventListener('load', () => {
    this.isLoad = true;
    let path = window.location.href.replace(window.location.origin, '')
    if (/\/[^\/]+\.html(.+)?/.test(path)) {
      basePath = path.replace(/\/[^\/]+\.html(.+)?/, '')
    }
    this._replace.call(this, path, true);
  })
  this.pageX = 0
  this.pageY = 0
  document.addEventListener('touchstart', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      this.pageX = e.changedTouches[0].pageX
      this.pageY = e.changedTouches[0].pageY
    }
  }, true)
  document.addEventListener('touchmove', () => {
    isMove = true
  }, true)
  document.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      let diffX = e.changedTouches[0].pageX - this.pageX
      let diffY = e.changedTouches[0].pageY - this.pageY
      if (Math.abs(diffY) + Math.abs(diffX) > 4.2) {
        isMove = true
      } else {
        isMove = false
      }
    }
  }, true)
  return this
}
Routers.prototype = {
  constructor: Routers,
  beforeRouterHooks: [],
  afterRouterHooks: [],
  removeEvent: {},
  store: {},
  isPopstate: false,
  ative: false,
  isLoadActve: false,
  __state: {},
  openMove: false,
  setState(options, cb) {
    this.__state = this.state
    this.state = { ...this.state, ...options }
    if (typeof cb !== 'function') return
    if (JSON.stringify(this.__state) !== JSON.stringify(this.state)) {
      cb(this.state)
      setTimeout(()=> {
        this.uninstall()
        this.initBinding()
      })
    }
  },
  initBinding() {
    let _acuners = document.querySelectorAll('a')
    let toList = document.querySelectorAll('[data-to]')
    let _slice = Array.prototype.slice
    acuners = _slice.call(_acuners).concat(_slice.call(toList))
    this.moveIndex = 0
    acuners.forEach(el => {
      if (el.__binding) return
      el.__binding = true
      el.addEventListener(this.ev, this.binding.bind(this))
    })
  },
  uninstall() {
    acuners.forEach(el => {
      el.addremoveEventListener && el.addremoveEventListener(this.ev, this.binding.bind(this))
    })
    acuners = []
  },
  binding(e) {
    let prop = 'href';
    let target = e.currentTarget || e.srcElement;
    if (target.tagName.toLocaleLowerCase() !== 'a') prop = 'data-to'
    let path = target.getAttribute(prop)
    if (!path) return
    if (/^http(s)?:\/\/.+/.test(path)) return
    if (!e.cancelable) return
    e.preventDefault()
    if (this.ative) return
    if (target.isActive) return
    if (e.type === 'click') return
    if (isMove) {
      target.isActive = true
      isMove = false
      return
    }
    path = basePath + path
    this._push.call(this, path);
    setTimeout(()=> {
      if (target) target.isActive = null
    })
  },
  setTitle(t) {
    document.title = t;
    let i = document.createElement('iframe');
    i.style.display = 'none';
    i.onload = function () {
      setTimeout(function () {
        i.remove();
      }, 9)
    }
    document.body.appendChild(i);
  },
  init() {
    this._routes = this.routes.slice()
    for (var i = 0; i < this._routes.length; i++) {
      var router = this._routes[i]
      if (router.children) {
        this._routes = this._routes.concat(router.children)
      }
    }
  },
  hook(path, option) {
    for (var i = 0; i < this._routes.length; i++) {
      var router = this.routes[i]
      if (router.path === path) {
        this._routes[i].callback = option
      }
    }
  },
  addEventListener(element, type, listener, useCapture = false) {
    if (!(element instanceof HTMLElement)) {
      console.log("element Can't be " + element)
      return
    }
    element.addEventListener && element.addEventListener(type, listener, useCapture)
    this.addremoveEventListener(this.pathStr, element, type, listener, useCapture)
  },
  addremoveEventListener(path, element, type, listener, useCapture) {
    if (!this.removeEvent[path]) {
      this.removeEvent[path] = []
    }
    this.removeEvent[path].push({ element, type, listener, useCapture })
  },
  beforeRouter(cb) {
    if (typeof cb === 'function') {
      this.beforeRouterHooks.push(cb)
    }
  },
  afterRouter(cb) {
    if (typeof cb === 'function') {
      this.afterRouterHooks.push(cb)
    }
  },
  createContext(context) {
    let _this = { ...this, ...Object(context) }
    let oKeys = Object.getOwnPropertyNames(this.__proto__)
    let keys = Object.getOwnPropertyNames(context.__proto__)
    let _context = {}
    oKeys.forEach(k => {
      if (k !== "constructor") {
        _context[k] = this[k]
      }
    })
    keys.forEach(key => {
      _context[key] = context[key]
    })
    _this.__proto__ = _context
    return _this
  },
  isRun: false,
  go(path, type) {
    this.isRun = true
    let router = this.find(path)

    isPopstate = false
    let cb = {}, fn = {};
    if (router && router.callback && router.callback.el) {
      cb = router.callback
      if (typeof cb.el === 'function') {
        this.pathStr = path
        fn = new cb.el(this)
      }
      router.callback.context = null
      router.callback.context = this.createContext(fn)
    }
    if (this.isBlock) {
      this.isBlock = false
      return
    }
    this.openMove = false
    fn.beforeMount && fn.beforeMount.call(router.callback.context, this)
    let removeEvents = this.removeEvent[this.beforeRouter]
    if (removeEvents) {
      removeEvents && removeEvents.forEach(function (event) {
        let {
          element,
          type,
          listener,
          useCapture
        } = event
        element.removeEventListener && element.removeEventListener(type, listener, useCapture)
      })
      this.removeEvent[this.beforeRouter] = []
    }
    if (beforePath && beforePath !== path) {
      let beforeRouter = this.find(beforePath)
      if (beforeRouter && beforeRouter.callback) {
        if (beforeRouter.callback.el) {
          beforeRouter.destroyed && beforeRouter.destroyed.call(beforeRouter.callback.context)
        }
      }
    }
    if (this.isBlock) {
      this.isBlock = false
      return
    }
    let elem = document.querySelector('[data-router]')
    this.uninstall()
    if (currentPath !== path && !isPopstate) {
      if (type === 'pushState') {
        window.history.pushState({ path: path }, null, path);
      } else if (type === 'replaceState') {
        window.history.replaceState({ path: path }, null, path);
      }
    }
    if (!this.isLoad) {
      if (router.callback) {
        elem.innerHTML = router.callback.__html
        if (router.callback.__title) {
          this.setTitle(router.callback.__title)
        }
      }
    }
    this.initBinding()
    beforePath = this.currentPath
    setTimeout(() => {
      if (fn.mounted && this.isRun) {
        fn.mounted.call(router.callback.context)
        if (this.isBlock) this.isBlock = false
      }
    })
    this.ative = false
    currentPath = path
    this.isLoad = false
  },
  _next(path, type) {
    let router = this.find(path)
    let _this = this
    if (router && router.import) {
      if (router.isLoad) return
      router.isLoad = true
      router.import().then(() => {
        _this.go && _this.go.call(this, path, type)
        if (this.isNext) {
          this.isNext = false
          this.isBlock = true
        }
        router.isLoad = false
      }, function (err) {
        console.error(`${router.path} import error：`, err)
      })
    }
  },
  pushNext(path) {
    return this._next.call(this, path, 'pushState')
  },
  replaceNext(path) {
    return this._next.call(this, path, 'replaceState')
  },
  to(path, next) {
    this.isRun = false
    let _this = this
    this.beforeRouterHooks.forEach(function (beforeRouter) {
      if (!_this.isRun) {
        beforeRouter.call(_this, next.bind(this), beforePath, currentPath)
      }
    })
    if (!this.isRun) {
      next.call(_this, path)
    }
    this.isRun = false
    this.afterRouterHooks.forEach(function (afterRouter) {
      if (!_this.isRun) {
        afterRouter.call(_this, next.bind(this), beforePath, currentPath)
      }
    })

  },
  _push(path) {
    this.isLoad = false
    this.to.call(this, path, this.pushNext.bind(this))
  },
  push(path) {
    this._push.call(this, path)
    this.isNext = true
  },
  _replace(path) {
    this.isLoad = false
    this.to.call(this, path, this.replaceNext.bind(this))
  },
  replace(path) {
    this._replace.call(this, path)
    this.isNext = true
  },
  find(path) {
    return this._routes.find && this._routes.find(function (router) {
      if (router.path === path) return true
      if (path.search(router.path) > -1) return true
    })
  },
  _bindPopState: function () {
    let _this = this
    window.addEventListener('popstate', e => {
      let path = e.state && e.state.path;
      if (!path) {
        path = window.location.href.replace(window.location.origin, '')
      }
      isPopstate = true
      _this._replace.call(_this, path, true)
    });
  }
}


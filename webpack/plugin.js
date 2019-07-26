
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
//cheerio@1.0.0-rc.1 
const cheerio = require('cheerio')

module.exports = class {
	constructor(options) {
		this.options = options || {}
		this.options.globalScriptString = []
		if (options.globalScript) {
			options.globalScript.forEach(item => {
				fs.readFile(item, {
					encoding: 'utf-8',
					flag: 'r+'
				}, (err, data) => {
					this.options.globalScriptString.push(data.toString())
				});
			})
        }
        this.options.routerPath = this.options.routerPath || path.resolve(__dirname, '../src/.router/index.js')
        this.readdir(this.options.routerPath)
	}
	watchFile() {
		let isReady = false
		let routerMap = []
		let watcher = chokidar.watch(path.resolve(__dirname, '../src/pages'), {
			ignored: /(^|[\/\\])\../,
			persistent: true
		});

		watcher.on('add', path => {
			if (/index_page\.js$/.test(path)) {
				if (isReady) {
					routerMap.push(path)
					this.emitRouter(routerMap)
				} else {
					routerMap.push(path)
				}

			}
		})
		watcher.on('unlink', path => {
			let index = routerMap.indexOf(path)
			if (index > -1) {
				routerMap.splice(index, 1)
			}
			this.emitRouter(routerMap)
		});
		watcher.on('ready', () => {
			isReady = true
            this.emitRouter(routerMap)
            Promise.resolve().then(_=>{
                if(process.env.ENV_TYPE === 'build'){
                    watcher.close()
                }
            })
		})


    }
    readdir(routerPath){
        let path = routerPath.match(/.+[\\\/]+/)
        if(path && path[0]){
            path = path[0]
            try {
                fs.readdirSync(path)
            } catch (error) {
                try {
                    fs.mkdirSync(path)
                }catch (err){}
                
            }
        }
    }
	emitRouter(routerMap) {
        let routerPath = this.options.routerPath
        let content = "import Router from '@haoxh/sigle-page/client/router'" +
        "\nexport default new Router([" +
        `\n	${
            routerMap.map(item=>{
                item = item.replace(/\\/g,'\\\\')
                let name = item.replace(/[\\\/]+index_page.js$/,'').replace(/.+[\\\/]+/,'')
                let _path = name + '.html'
                return `{path:'/${_path}',import: ()=> import(/*  webpackChunkName: '${name}' */ '${item}')},`
            }).join('\n	')
        }` +
        "\n])";
        fs.writeFileSync(routerPath, content);
	}
	apply(compiler) {
		this.watchFile()
		compiler.hooks.emit.tapAsync('emit', (compilation, cb) => {
			Promise.resolve().then(_ => {
				let assets = compilation.assets

				let html = []
				let reg = /main_app_xr(\..*)?\.js$/
				let links = []
				let socus = []
				let keys = Object.keys(assets)
				let emitted = []
				let publicPath = this.options.publicPath || ''
				if (this.options.global) {
					if (typeof this.options.global === 'string') {
						links = [this.options.global]
					} else {
						links = this.options.global
					}
				}
				if (this.options.nconsole) {
					let n = 'static/js/nConsole.js'
					if (links.indexOf(n) === -1) {
						links.push(n)
					}

				}
				let headerScript = []

				if (this.options.globalScriptString.length) {
					const ip = require('./nConsole/localIpv4.js.js')
					this.options.globalScriptString.forEach(item => {
						item = item.replace(/\$_IP/g, ip)
						headerScript.push(`<script>${item}</script>`)
					})
				}
				let cssHtmlModules = {},
					cssCommonModules = [];
					
				if (compilation.children) {
					compilation.children.forEach(module => {
						if (module._target && module._cssContent) {

							if (module._target !== 'common') {
								if (!cssHtmlModules[module._target]) {
									cssHtmlModules[module._target] = this.cssMini(module._cssContent)
								} else {
									cssHtmlModules[module._target] += this.cssMini(module._cssContent)
								}

							} else {
								cssCommonModules.push(module._cssContent)
							}
						}
					})
				}
				cssCommonModules = this.cssMini(cssCommonModules.join(''))
				let cssHtmlModulesEmpty = Object.keys(cssHtmlModules).length === 0
				html = keys.filter(item => {
					if (reg.test(item) && !/.+\.hot-update\.js$/.test(item)) {
						if (links.indexOf(publicPath + item) === -1) {
							links.push(publicPath + item)
						}
					}
					if (/.+\.html$/.test(item)) {
						let _item = item.replace(/(\.html)$/, '').replace(/.+\/|\\/, '')

						if (assets[item].emitted || assets[item].emitted === undefined) {

							emitted.push(item.replace(/\.html$/, ''))
						}
						let _value = compilation.assets[item]._value.toString()
						if (!cssHtmlModulesEmpty && cssHtmlModules[_item]) {
							let pos = this.getHtmlRouterPos(_value)
							if (pos) {
								let endStr = _value.slice(pos.startIndex, _value.length).replace(/<style>.+?<\/style>/, '')
								_value = _value.slice(0, pos.startIndex) + `<style>${cssHtmlModules[_item]}</style>` + endStr
							}

						}
						compilation.assets[item]._value = this.setHeaderHtml(_value, headerScript)
						socus.push({
							value: `"{#${_item}#}"`,
							reg: new RegExp(`${_item}$`),
							text: _item,
							html: compilation.assets[item]._value.toString()
						})
						return true
					}
				})

				let scripts = links.map(item => {
					return `<script src="${item}"></script>`
				})

				html.forEach(item => {
					let content = compilation.assets[item]._value.toString()
					let isBuffer = compilation.assets[item]._value instanceof Buffer
					let bodyPos = 0
					let headPos = 0
					content = content.replace(/(<script.+<\/script><\/body>)/, '<\/body>')
					content = content.replace(/(<style.+<\/style><\/head>)/, '<\/head>')
					headPos = content.search(/<\/[\s]*head[\s]*>/i)
					// content = content.slice(0, headPos) + cssLink.join('') + content.slice(headPos, content.length)
					content = content.slice(0, headPos) + `<style>${cssCommonModules}</style>` + content.slice(headPos, content.length)
					bodyPos = content.search(/<\/[\s]*body[\s]*>/i)
					content = content.slice(0, bodyPos) + scripts.join('') + content.slice(bodyPos, content.length)

					if (isBuffer) {
						content = Buffer.from(content)
					}
					compilation.assets[item]._value = content
				})

				keys.forEach(name => {
					if (/.+\.js$/.test(name)) {
						if (/work_task/.test(name)) return
						socus.map(item => {
							if (name.replace(/(\.[^\/\\]+)?\.js$/, '').replace(/(.+\\)|(.+\/)/g, '') === item.text) {
								let concatSource = compilation.assets[name]

								if (concatSource.children && concatSource.children[0]) {
									let rawSource = concatSource.children[0]._value
									if (rawSource) {
										const $ = this.getDom(item.html)
										let str = item.html.toString()
										let u = /\u003ctitle\u003e.+?\u003c\u002ftitle\u003e/.exec(str)
										let title = ''
										if (u && u[0]) {
											title = u[0].replace(/(\u003ctitle\u003e)|(\u003c\u002ftitle\u003e)/g, '')
										}
										getDuplicateAttributes($("[data-router]"), item.html, title)

										function getDuplicateAttributes($elem, html, title) {
											let dom = $elem.get(0);
											if (dom && dom.children) {
												let result = html.slice(dom.children[0].startIndex, dom.children[dom.children.length - 1].endIndex + 1)

												let _value = rawSource
												if (rawSource) {
													if (rawSource.indexOf(item.value) > -1) {
														let startIndex = rawSource.search(item.value)
														rawSource = rawSource.slice(0, startIndex - 7) + `__title:"${title}",` + rawSource.slice(startIndex - 7, rawSource.length)
														_value = rawSource.replace(item.value, JSON.stringify(result))
													} else {
														_value = rawSource.replace(/(__html:".+?",)/, `__html:${JSON.stringify(result)},`)
													}
													if (_value.indexOf(new RegExp(item.value)) === -1 && !/__title:".+?"/.test(_value)) {
														let _index = _value.search('__html:')
														if (_index > -1) {
															_value = _value.slice(0, _index) + `__title:"${title}",` + _value.slice(_index, _value.length)
														}

													}
												}
												compilation.assets[name].children[0]._value = _value
											}
										}
									}
								}
							}
						})
					}
				})
				cb()
			})
		})

	}
	getDom(html) {
		return cheerio.load(html, {
			useHtmlParser2: true,
			withStartIndices: true,
			withEndIndices: true
		});
	}
	setHeaderHtml(html, scripts) {
		html = html.toString()
		let index = html.search('</head>')
		html = html.slice(0, index) + scripts.join('') + html.slice(index, html.length)
		return Buffer.from(html)
	}
	getHtmlRouterPos(html) {
		const $ = this.getDom(html)
		let $elem = $("[data-router]")
		let dom = $elem.get(0);
		if (dom && dom.children) {
			return {
				startIndex: dom.children[0].startIndex,
				endIndex: dom.children[dom.children.length - 1].endIndex + 1
			}
		}
	}
	cssMini(css) {
		return css.replace(/[\n\f]+/g, '').replace(/(\s*\{\s*)+/g, '{').replace(/(\s*;\s*)+/g, ';').replace(/(\s*:\s*)+/g, ':')
	}

}

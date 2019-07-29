# sigle page

- 具有单页面功能的多页面应用
- 独立的前端路由功能，不需服务器配置
- 框架代码只有4KB(引入的实际代码)
- oop 编程模式开发
- 完整的页面生命周期钩子函数
- css 将内联到html中，刷新页面无感知
- Service Workers 静态文件缓存

## 安装

``` sh
npm i @haoxh/single-page -D
```

初始化目录

``` sh
npx singlePageInit
```

开启

``` sh
node scripts/start.js
```

打包

``` sh
node scripts/build.js
```


> 目录

<pre style="color:#444">

├─ config wepack 配置 工具源码
├─ .router.js 自动生成的路由配置文件
├─ src 工作区域
│   ├─  common 公共js文件
│   │   ├─ js 公用js与入口
│   │   │     ├─ index.js 入口文件
│   │   │        ...
│   │   ├─ style
│   │         ├─ index.css
│   │            ...
│   ├─ pages 页面
│   │   ├─ home
│   │       ├─ home.html 需要编写的html
│   │       ├─ index.css (css/less)
│   │       ├─index_page.js 路由的入口文件
│   │         ...
</pre>

```js
//.router.js
//自动注入 router 不需编写
import Router from '../../lib/router'
export default new Router([
    {
        path:'/home.html',
        // webpackChunkName 注释必须编写
        import: ()=> import(/*  webpackChunkName: 'home' */ '../../pages/home/index_page.js')
    },
    {
        path:'/person.html',
        import: ()=> import(/*  webpackChunkName: 'person' */ '../../pages/person/index_page.js')
    },
])
```

```html
<!-- home/home.html -->
<html>
<head>
 <!-- 单页面跳转时自动设置 title -->
<title>home page</title>
</head>
<body>
    <div data-router>
       <!-- 编写的内容放在这里，包括数据模板等 -->
    </div>
</body>
</html>

```

```js
// home/page_index.js
import module from '../../common/js/index'
// 引入html
import './home.html'
// css 依赖注入, 将css注入到 当前页面的 html 中
import './index.less'

// 第一个参数为对应的路由的路径
module.define('/home.html', {
    el: class {
        //第一次进入页面时触发
        constructor(router){
            // 设置初始变量
            this.state = {
                a:1
            }
        }
        // 即将进入页面时触发,上个页面还在时
        beforeMount() {}
        // 进入页面并且html渲染后触发
        mounted() {
            // 修改 this.state
            this.setState({a:2},(state)=>{
                // 这里渲染新的DOM,跳转链接功能自动绑定
                // dom.innerHTML = this.state...
            })
            let el = document.querySelector('.home')
            // 使用 this.addEventListener 离开页面自动卸载对应的事件
            this.addEventListener(el, 'scroll', (e)=>{
                // code...
            })
            // 获取 pathname 后的参数，并以对象形式返回
            let query = this.query()
            // 设置标题。默认在html title 填写了，就不用重新设置
            this.setTitle('home')
        }
        // 离开页面时触发
        destroyed() {}
    }
})

```

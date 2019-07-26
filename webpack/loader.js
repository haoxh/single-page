const { getOptions } = require('loader-utils')
const path = require('path')
const acorn = require("acorn")

module.exports = function (content, map, meta) {
    const options = getOptions(this)
    let path = this.resourcePath
    this.callback(null, operation(content, this, path), map, meta);
    return;
};

let isPOSIX = path.sep === '/'
function operation(content, context,path) {
    if (path) {
        let sources = path
        if (/index_page(_.+)?\.js$/.test(sources)) {
            var tokens = [...acorn.tokenizer(content)];
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].value === "define") {
                    if (tokens[i + 4].type.label === '{') {
                        let token = tokens[i + 4]
                        let pos = token.end
                        let name = ''
                        if(isPOSIX){
                            name = sources.replace(/(\\|\/)index_page(_.+)?\.js/g,'').replace(/.+\/|\\/,'')
                        }else{
                            name = sources.replace(/((\\)+|\/)index_page(_.+)?\.js/g,'').replace(/.+(\/|\\)/,'')
                        }
                        content = content.slice(0, pos) + `__html:"{#${name}#}",` + content.slice(pos, content.length)
                    }
                    break
                }
            }
        }
    }
    return content;
}


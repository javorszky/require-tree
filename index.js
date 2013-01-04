// require-tree
// ============
/*
require() a directory tree

(c) Ricardo Tomasi 2012
License: MIT <ricardo.mit-license.org>

*/

var fs   = require('fs')
  , path = require('path')

function type (obj) {
    return Object.prototype.toString.call(obj)
        .match(/object\s(\w+)/, '')[1]
        .toLowerCase()
}

function isDirectory (fpath) {
    return fs.lstatSync(fpath).isDirectory()
}

function extend (obj, source) {
    for (var key in source){
        if (source.hasOwnProperty(key)) {
            obj[key] = source[key]    
        }
    }
    return obj
}

function require_tree (dir, options) {

    options = extend({
        index: true
    }, options)

    var dir       = path.resolve(dir)
      , forbidden = ['.json', '.node']
      , tree = {}

    var files = fs.readdirSync(dir)

    files.forEach(function(file){

        var ext   = path.extname(file)
          , name  = path.basename(file, ext)
          , fpath = path.join(dir, file)
          , item, obj

        if (isDirectory(fpath)) {
            tree[name] = require_tree(fpath, options)
            return
        }

        if ((!options.index && name === 'index')
            || forbidden.indexOf(ext) >= 0
            || !(ext in require.extensions)
        ) return

        obj = item = require(fpath)

        switch (type(options.main)) {
            case 'string':
                obj = item[options.main]
                break
            case 'function':
                obj = options.main(item, file)
                break
            case 'array':
                obj = {}
                Object.keys(item).forEach(function(key){
                    if (options.main.indexOf(key) >= 0)
                        obj[key] = item[key]
                })
        }

        switch (type(options.name)) {
            case 'string':
                name = item[options.name]
                break
            case 'function':
                name = options.name(item, file)
        }

        if (name === 'index') {
            extend(tree, obj)
        } else {
            tree[name] = obj
        }

    })

    return tree
}

module.exports = require_tree
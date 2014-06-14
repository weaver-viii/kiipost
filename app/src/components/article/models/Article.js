define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')
    var backbone = require('backbone')
    var _s = require('underscore.string')

    var url = require('components/utils/url')

    var wwwRegexp = /^www\./

    function Article() {
        this.url = '/api/article'
        Article.super_.apply(this, arguments)
    }

    inherits(Article, backbone.Model)
    module.exports = Article

    Article.prototype.parse = function(data) {
        if (data.url) {
            data.hostname = url.parse(data.url).hostname
                .replace(wwwRegexp, '')
        }
        if (!data.description) console.log(data)
        if (!data.description) data.description = _s.stripTags(data.html)

        return data
    }
})

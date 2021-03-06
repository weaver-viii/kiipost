'use strict'

var inherits = require('inherits')
var Model = require('backbone').Model
var Article = require('app/components/article/models/Article')

function Memo() {
    this.isMemo = true
    this.urlRoot = '/api/memos'
    this.defaults = {
        createdAt: new Date(),
        articles: []
    }
    Memo.super_.apply(this, arguments)
}

inherits(Memo, Model)
module.exports = Memo

Memo.prototype.initialize = function() {
    this.on('change:articles', this._onArticlesChange.bind(this))
}

Memo.prototype.parse = function(data) {
    if (data.articles[0]) {
        data.articles[0] = new Article(data.articles[0], {
            parse: true,
            parent: this
        })
    }
    return data
}

Memo.prototype._onArticlesChange = function(model, articles) {
    this.set('url', articles[0].get('url'))
}

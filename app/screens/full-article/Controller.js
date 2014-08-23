'use strict'

var Controller = require('backbone.controller')
var inherits = require('inherits')
var _ = require('underscore')

var LayeredTransition = require('app/components/animations/LayeredTransition')
var ArticleModel = require('app/components/article/models/Article')
var MemoModel = require('app/components/memo/models/Memo')
var StreamCollection = require('app/components/stream/collections/Stream')
var ArticleModel = require('app/components/article/models/Article')

var MemoFullArticleView = require('./views/MemoFullArticle')
var NewFullArticleView = require('./views/NewFullArticle')

var app = require('app')

function FullArticle(options) {
    this.routes = {
        'full-articles/new/:id': 'new',
        'full-articles/memos/:id': 'memos'
    }

    options = _.extend({}, FullArticle.DEFAULT_OPTIONS, options)
    this.models = options.models
    this.collections = {}
    Controller.call(this, options)
    this.router = this.options.router
}

inherits(FullArticle, Controller)
module.exports = FullArticle

FullArticle.DEFAULT_OPTIONS = {models: null}

FullArticle.prototype.initialize = function() {
    this.collections.articlesStream = new StreamCollection(null, {
        urlRoot: '/api/articles',
        model: ArticleModel
    })

    this.layeredTransition = new LayeredTransition({size: app.context.getSize()})
    this.views = {
        memoFullArticleView: new MemoFullArticleView({collections: this.collections}),
        newFullArticleView: new NewFullArticleView({
            models: this.models,
            collections: this.collections
        })
    }
    this.views.memoFullArticleView.on('close', this._onClose.bind(this))
    this.views.newFullArticleView.on('close', this._onClose.bind(this))
    app.context.on('fullArticle:open', this._onOpen.bind(this))
}

FullArticle.prototype.new = function(id) {
    this._show(id, false)
}

FullArticle.prototype.memos = function(id) {
    this._show(id, true)
}

FullArticle.prototype._show = function(id, isMemo, model, callback) {
    var prev = this.current
    var view = this._currView = isMemo ? this.views.memoFullArticleView : this.views.newFullArticleView
    var isCached = prev == id

    this.current = id

    if (!isCached) view.cleanup()

    if (model) {
        if (isMemo) model = model.get('articles')[0]
        else view.closeMemoEdit()
        view.setPreviewContent(model, show.bind(this))
    } else show.call(this)

    function show() {
        if (!isCached) view.spinner.show(true)
        app.controller.show(view, load.bind(this))
    }

    function load() {
        if (!isCached) this._load(id, isMemo)
        if (callback) callback()
    }
}

FullArticle.prototype._load = function(id, isMemo) {
    var view = this._currView

    this.isMemo = isMemo
    this.models.user.authorize.then(function() {
        var xhr
        var memo = new MemoModel(isMemo ? {_id: id} : {userId: this.models.user.id})
        view.setOptions({models: _.defaults({memo: memo}, view.models)})

        if (isMemo) {
            xhr = memo.fetch().then(function() {
                view.setOptions({model: memo.get('articles')[0]})
                view.setContent()
            })
        } else {
            view.setOptions({model: new ArticleModel({_id: id})})
            xhr = view.model.fetch().then(function() {
                memo.set('articles', [view.model])
                view.setContent()
            })
        }

        xhr.always(view.spinner.hide.bind(view.spinner))
    }.bind(this))
}

FullArticle.prototype._onOpen = function(model) {
    var isMemo = model.name == 'memo'

    this.layeredTransition.commit(app.controller)
    this._show(model.id, isMemo, model, function() {
        this.layeredTransition.commit(app.controller, true)
    }.bind(this))
    this.navigate((isMemo ? 'full-articles/memos' : 'full-articles/new') + '/' + model.id)
}

FullArticle.prototype._onClose = function() {
    app.context.emit('fullArticle:close', {isMemo: this.isMemo})
}

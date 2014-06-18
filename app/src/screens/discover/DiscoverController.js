define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var ArticleModel = require('components/article/models/Article')
    var StreamCollection = require('components/stream/collections/Stream')

    var DiscoverView = require('./views/Discover')

    function DiscoverController(options) {
        this.routes = {
            'discover': 'discover'
        }
        options = _.extend({}, DiscoverController.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }
    inherits(DiscoverController, Controller)
    module.exports = DiscoverController

    DiscoverController.prototype.initialize = function() {
        this.collection = new StreamCollection(null, {
            urlRoot: '/api/articles',
            model: ArticleModel
        })
        this.view = new DiscoverView({
            collection: this.collection,
            models: this.models
        })
        this.view.on('menu:change', this._onMenuChange.bind(this))
    }

    DiscoverController.prototype.discover = function() {
        app.controller.show(this.view, function() {
            this.view.menu.select('discover')
        }.bind(this))
        this.models.user.isAuthorized.then(this.view.load.bind(this.view))
    }

    DiscoverController.prototype._onMenuChange = function(name) {
        this.router.navigate(name, {trigger: true})

        // XXX dirty
        // Wait until animation on the next screen is done.
        setTimeout(function() {
            this.view.menu.select(name)
        }.bind(this), 500)
    }
})

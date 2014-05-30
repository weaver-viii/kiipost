define(function(require, exports, module) {
    var Controller = require('controller')
    var inherits = require('inherits')
    var _ = require('underscore')

    var app = require('app')

    var Collection = require('components/stream/collections/Stream')

    var DiscoverView = require('./views/Discover')

    function DiscoverController(options) {
        this.routes = {
            '': 'discover'
        }
        Controller.apply(this, arguments)
    }
    inherits(DiscoverController, Controller)
    module.exports = DiscoverController

    DiscoverController.prototype.initialize = function() {
        this.collection = new Collection(null, {
            basePath: '/api/discover',
            view: 'gallery'
        })
        this.view = new DiscoverView({collection: this.collection})
    }

    DiscoverController.prototype.discover = function() {
        app.renderController.show(this.view)
    }
})
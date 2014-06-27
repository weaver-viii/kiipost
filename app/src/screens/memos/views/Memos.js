
define(function(require, exports, module) {
    'use strict'

    var inherits = require('inherits')

    var View = require('famous/core/View')
    var Surface = require('famous/core/Surface')
    var Modifier = require('famous/core/Modifier')

    var HeaderView = require('components/header/views/Header')
    var StreamView = require('components/stream/views/Stream')
    var MenuView = require('components/menu/views/Menu')
    var JumperView = require('components/jumper/views/Jumper')
    var SpinnerView = require('components/spinner/views/Spinner')
    var BackgroundView = require('components/background/Background')

    var MemoView = require('./Memo')
    var app = require('app')

    function Memos() {
        View.apply(this, arguments)

        this.background = new BackgroundView({context: app.context})
        this.add(this.background)

        this.header = new HeaderView({
            context: app.context,
            models: this.options.models
        })

        this.menu = new MenuView({selected: 'memos'})
        this.menu.pipe(this._eventOutput)
        this.header.surface.add(this.menu)

        this.spinner = new SpinnerView()
        this.add(this.spinner)

        this.stream = new StreamView({
            ItemView: MemoView,
            views: [this.header],
            collection: this.options.collection,
            models: this.options.models
        })

        this.stream.on('stream:loadstart', this.spinner.show.bind(this.spinner))
        this.stream.on('stream:loadend', this.spinner.hide.bind(this.spinner))

        this.add(this.stream)

        // Header can scroll the scrollview.
        this.header.pipe(this.stream.scrollview)

        this.jumper = new JumperView({
            scrollview: this.stream.scrollview,
            context: app.context
        })
        this.add(this.jumper)
    }

    inherits(Memos, View)
    module.exports = Memos

    Memos.DEFAULT_OPTIONS = {}

    Memos.prototype.load = function() {
        if (this._loaded) return
        this.stream.load()
        this._loaded = true
    }
})

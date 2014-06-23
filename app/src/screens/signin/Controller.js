define(function(require, exports, module) {
    'use strict'

    var Controller = require('controller')
    var inherits = require('inherits')
    var backbone = require('backbone')

    var app = require('app')

    var SigninView = require('./views/Signin')
    var ios = require('./helpers/ios')

    function Signin(options) {
        this.routes = {
            '': 'signin'
        }

        options = _.extend({}, Signin.DEFAULT_OPTIONS, options)
        this.models = options.models
        Controller.call(this, options)
        this.router = this.options.router
    }

    inherits(Signin, Controller)
    module.exports = Signin

    Signin.DEFAULT_OPTIONS = {
        defaultScreen: 'saved'
    }

    Signin.prototype.initialize = function() {
        this.view = new SigninView({model: this.models.user})
        this.view.on('signin:start', this._onSigninStart.bind(this))
        this.view.on('signin:success', this._onSigninSuccess.bind(this))
        ios.isAvailable().then(this._signin.bind(this))
    }

    Signin.prototype.signin = function() {
        app.controller.show(this.view, this.options)
    }

    Signin.prototype._signin = function() {
        this.view.spinner.show(true)
        if (ios.isSupported()) {
            ios.signin()
                .then(this.view.load.bind(this.view))
                .catch(this.view.error.bind(this.view))
        }
    }

    Signin.prototype._go = function() {
        if (!backbone.history.getFragment()) {
            this.router.navigate(this.options.defaultScreen, {trigger: true})
        }
    }

    Signin.prototype._onSigninStart = _.debounce(function() {
        this._signin()
    }, 500, true)

    Signin.prototype._onSigninSuccess = function() {
        this._go()
    }
})
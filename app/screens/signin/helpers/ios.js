'use strict'

var qs = require('qs')
var transformKeys = require('shared/utils/transformKeys')
var rename = require('rename-keys')

exports.available = function() {
    var api = window.socialAuth

    return new Promise(function(fulfill, reject) {
        if (!api) {
            var err = new Error('Plugin not loaded.')
            err.type = 'PLUGIN_NOT_LOADED'
            return reject(err)
        }
        api.isTwitterAvailable(fulfill, function() {
            var err = new Error('App is disabled.')
            err.type = 'DISABLED'
            reject(err)
        })
    })
}

exports.signin = function() {
    var api = window.socialAuth

    return new Promise(function(fulfill, reject) {
        function getAccount() {
            var err = new Error('No accounts connected.')
            err.type = 'NOT_CONNECTED'

            api.returnTwitterAccounts(
                function success(names) {
                    if (!names.length) return reject(err)
                    auth(names[0])
                },
                function error() {
                    reject(err)
                }
            )
        }

        function auth(name) {
            api.performTwitterReverseAuthentication(
                function success(res) {
                    var params = qs.parse(res)
                    params = transformKeys(params, 'camelize')
                    params.provider = 'twitter'
                    rename(params, function(prop) {
                        switch (prop) {
                            case 'oauthToken': return 'accessToken'
                            case 'oauthTokenSecret': return 'accessTokenSecret'
                        }
                    })
                    fulfill(params)
                },
                function error(res) {
                    var err = new Error(res)
                    err.type = 'AUTH'
                    reject(err)
                },
                name
            )
        }

        exports.available()
            .then(getAccount)
            .catch(reject)
    })
}

exports.isSupported = function() {
    return Boolean(window.socialAuth)
}

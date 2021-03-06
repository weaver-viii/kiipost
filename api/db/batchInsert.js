var thunkify = require('thunkify')
var _ = require('underscore')
var m = require('mongoose')

/**
 * Insert an array of docs into mongo in one query.
 * - validate each document
 * - ignore duplicate key errors
 *
 * @param {String} model
 * @param {Array} data
 */
module.exports = thunkify(function(model, data, callback) {
    if (_.isEmpty(data)) return setImmediate(callback)

    var Model = m.model(model)
    var newData = []

    callback = _.once(callback)

    // Manual validation because batch insert can't.
    data.forEach(function(item) {
        var doc = new Model()

        doc.set(item).validate(function(err) {
            if (err) return callback(err)
            newData.push(doc.toObject())
            if (newData.length == data.length) insert()
        })
    })

    function insert() {
        Model.collection.insert(
            newData,
            {safe: true, continueOnError: true},
            function(err) {
                // Ignore MongoError: E11000 duplicate key error index
                if (err && err.code == 11000) err = null
                callback(err)
            }
        )
    }
})

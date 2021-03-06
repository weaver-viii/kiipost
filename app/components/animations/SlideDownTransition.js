'use strict'

var Transform = require('famous/core/Transform')
var easing = require('famous/transitions/Easing')
var inherits = require('inherits')

var BaseTransition = require('./BaseTransition')

function SlideDownTransition() {
    BaseTransition.apply(this, arguments)
}

SlideDownTransition.DEFAULT_OPTIONS = {
    inTransition: {
        duration: 300,
        curve: easing.outQuart
    },
    outTransition: {
        duration: 300,
        curve: easing.outQuart
    },
    size: null,
    z: 1
}

inherits(SlideDownTransition, BaseTransition)
module.exports = SlideDownTransition

SlideDownTransition.prototype.inOpacity =
SlideDownTransition.prototype.outOpacity = function() {
    return 1
}

SlideDownTransition.prototype.inTransform =
SlideDownTransition.prototype.outTransform = function(val) {
    var height = this.options.size[1]

    return Transform.translate(0, (height * val) - height, this.options.z)
}

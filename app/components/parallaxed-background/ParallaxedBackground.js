'use strict'

var inherits = require('inherits')
var _ = require('underscore')

var View = require('famous/core/View')
var Surface = require('famous/core/Surface')
var Modifier  = require('famous/core/Modifier')
var Transform = require('famous/core/Transform')
var ContainerSurface = require('famous/surfaces/ContainerSurface')

function ParallaxedBackground() {
    View.apply(this, arguments)

    var o = this.options
    var size = o.context.getSize()

    this.x = -o.offset
    this.y = -o.offset

    this.container = new ContainerSurface({
        classes: ['background'],
        properties: {overflow: 'hidden'}
    })
    this.add(new Modifier({
        transform: Transform.translate(0, 0, o.z)
    })).add(this.container)

    if (o.overlay) {
        this.overlay = new Surface({
            classes: ['overlay'],
            properties: {
                backgroundColor: '#000'
            }
        })
        this.container.add(new Modifier({opacity: 0.25})).add(this.overlay)
    }

    this.image = new Surface({
        properties: o.properties,
        size: [size[0] + o.offset * 2, size[1] + o.offset * 2]
    })
    this.modifier = new Modifier({origin: [0.5, 0.5]})
    this.container.add(this.modifier).add(this.image)

    if (o.content) this.setContent(o.content)

    this._onChange = _.throttle(this._transform.bind(this), 50)
    this.container.on('deploy', this.resume.bind(this))
    this.container.on('recall', this.pause.bind(this))
}

inherits(ParallaxedBackground, View)
module.exports = ParallaxedBackground

ParallaxedBackground.DEFAULT_OPTIONS = {
    offset: 0,
    content: 'components/content/images/background.jpg',
    properties: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: null
    },
    context: null,
    // Dark overlay over background to make fonts on top look good.
    overlay: false,
    z: -1
}

ParallaxedBackground.prototype.setContent = function(url) {
    if (!url) url = this.options.content
    this.image.setProperties({backgroundImage: 'url(' + url + ')'})
}

ParallaxedBackground.prototype.setProperties = function(props) {
    return this.image.setProperties(props)
}

ParallaxedBackground.prototype.pause = function() {
    window.removeEventListener('deviceorientation', this._onChange)
}

ParallaxedBackground.prototype.resume = function() {
    // Currently disabled.
    // We need either switch the pattern or create cordova plugin
    // with performant replacement.
    // https://bugs.webkit.org/show_bug.cgi?id=134447
    // window.addEventListener('deviceorientation', this._onChange)
}

ParallaxedBackground.prototype._transform = function(e) {
    var o = this.options
    var x = e.gamma
    var y = e.beta
    var set = false

    if (x < o.offset && x > -o.offset && this.x !== -x) {
        this.x = -x
        set = true
    }
    if (y < o.offset && y > -o.offset && this.y !== -y) {
        this.y = -y
        set = true
    }

    if (set) this.modifier.transformFrom(Transform.translate(this.x, this.y, 0))
}

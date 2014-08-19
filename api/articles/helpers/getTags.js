var _ = require('underscore')
var m = require('mongoose')

// Amount of tags we take from each saved article to find new articles.
var SEARCH_TAGS_AMOUNT = 3

// Amount of top tags in % considered for calculating the dna.
var DNA_TAGS_PER = 0.3

// Min length of the dna array.
var DNA_MIN_LENGHT = 5

// We try to get only tags which have higher freq number than this.
// If we can't satisfy the min length when applied this freq filter,
// we reduce this number by 1 until it is 1.
var DNA_START_FREQ = 3

/**
 * Get user tags for articles lookup.
 *
 * @param {ObjectId} userId
 * @param {Boolean} [full] return full memos and articles
 * @return {Array}
 */
module.exports = function(userId, full) {
    return function* () {
        var memos = yield m.model('memo')
            .find({userId: userId})
            .select(full ? {} : {'articles.tags': 1})
            .lean()
            .exec()

        var dna = calcDna(memos)
        var map = {}
        var data = []
        _(memos).each(function(memo) {
            var article = memo.articles[0]

            // Filter memos where tags amount is too low.
            if (!article || article.tags.length < SEARCH_TAGS_AMOUNT) return

            // Verify if this tags fit our dna, don't use them if not
            var maybeDna = _(article.tags).first(DNA_TAGS_PER * article.tags.length)
            if (!_.intersection(maybeDna, dna).length) return

            var searchTags = _(article.tags).first(SEARCH_TAGS_AMOUNT).sort()
            // Create map to avoid duplicates
            var tagsStr = String(searchTags)
            if (!map[tagsStr]) {
                map[tagsStr] = true
                data.push({
                    tags: searchTags,
                    memo: memo
                })
            }
        })

        return data
    }
}

/**
 * Calc dna - tags identifying users interests-
 */
function calcDna(memos) {
    // Create a tags frequency map.
    var tagsFreqMap = {}
    _(memos).each(function(memo) {
        var article = memo.articles[0]
        if (!article || !article.tags.length) return
        var tags = _(article.tags).first(DNA_TAGS_PER * article.tags.length)
        _(tags).each(function(tag) {
            if (tagsFreqMap[tag]) tagsFreqMap[tag]++
            else tagsFreqMap[tag] = 1
        })
    })
    // Create a tags dna array.
    var dna = []
    _(tagsFreqMap).each(function(freq, tag) {
        dna.push({tag: tag, freq: freq})
    })
    // Sort by decreasing frequency for median freq calculation.
    dna = _(dna).sortBy(function(obj) {
        return -obj.freq
    })

    function filter(minFreq) {
        return dna.filter(function(obj) {
            return obj.freq >= minFreq
        })
    }

    for (var freq = DNA_START_FREQ; freq > 0; freq--) {
        var newDna = filter(freq)
        if (newDna.length >= DNA_MIN_LENGHT) {
            dna = newDna
            break
        }
    }

    dna = _(dna).pluck('tag')

    return dna
}

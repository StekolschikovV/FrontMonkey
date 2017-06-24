/**
 * Compile scss files
 * @function ascss
 * @param {string} src - Source file name
 * @param {string} dest - Destination file name
 * @param {Object} [options] - Optional settings
 * @param {string} [options.status] - Status file path
 * @param {string[]} [options.reflects] - File patterns to reflects changes
 * @returns {Promise}
 */
'use strict'

const co = require('co')
const aglob = require('aglob')
const path = require('path')
const writeout = require('writeout')
const { fileHash } = require('akv')
const akvStatus = require('akv-status')
const { mkdirpAsync } = require('asfs')
const sass = require('node-sass')
const relative = (filename) => path.relative(process.cwd(), filename)

/** @lends function ascss */
function ascss (src, dest, options = {}) {
  src = relative(path.resolve(src))
  dest = relative(path.resolve(dest))

  let {
    status = 'tmp/ascss.status.json',
    reflects = []
  } = options
  let store = akvStatus(status)

  return co(function * () {
    reflects = yield aglob(reflects)

    if (reflects.length > 0) {
      let changed = yield store.filterStatusUnknown([ src, dest, ...reflects ])
      if (changed.length === 0) {
        return
      }
    }
    yield mkdirpAsync(path.dirname(dest))

    let from = yield fileHash(dest)
    let destMap = `${dest}.map`
    let { css, map, stats } = yield new Promise((resolve, reject) => {
      sass.render({
        file: src,
        outFile: dest,
        sourceMap: destMap,
        sourceMapContents: true
      }, (err, result) => err ? reject(err) : resolve(result))
    })
    yield writeout(dest, css, { mkdirp: true })
    yield writeout(destMap, map, { mkdirp: true })

    let to = yield fileHash(dest)
    let changed = from !== to
    if (changed) {
      console.log(`File generated: ${dest}`)
    }
  }).catch((err) => co(function * () {
    yield store.destroy()
    throw err
  }))
}

module.exports = ascss

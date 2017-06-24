'use strict'

const ascss = require('ascss')
const co = require('co')

co(function * () {
  yield ascss(
    'src/index.scss',
    'public/index.css',
    {}
  )
}).catch((err) => console.error(err))


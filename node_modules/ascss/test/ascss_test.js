/**
 * Test case for ascss.
 * Runs with mocha.
 */
'use strict'

const ascss = require('../lib/ascss.js')
const assert = require('assert')
const co = require('co')
const fs = require('fs')

describe('ascss', function () {
  this.timeout(8000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Ascss', () => co(function * () {
    let src = `${__dirname}/../misc/mocks/mock-main.scss`
    let dest = `${__dirname}/../tmp/foo/testing-css/testing-compiled.css`
    yield ascss(
      src,
      dest,
      {}
    )
    // assert.ok(fs.statSync(dest))
  }))
})

/* global describe, before, after, it */

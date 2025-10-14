/**
 * Jest polyfills for ArtPrints application
 * Created by Leon Jordaan
 */

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util')

Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill for fetch using whatwg-fetch if needed
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  )
}

// Polyfill for FormData
if (!global.FormData) {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map()
    }
    append(key, value) {
      this.data.set(key, value)
    }
    get(key) {
      return this.data.get(key)
    }
  }
}

// Polyfill for URL
if (!global.URL) {
  global.URL = require('url').URL
}

// Polyfill for URLSearchParams
if (!global.URLSearchParams) {
  global.URLSearchParams = require('url').URLSearchParams
}

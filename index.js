'use strict'

const Cookies = require('./lib/cookies')
const Storage = require('./lib/storage')
const pack = require('./package.json')

function uberdom () {
  if (window.u) {
    return window.u
  }

  const u = {}

  // ------------------------------------------------------------
  //  Properties
  // ------------------------------------------------------------

  u.version = pack.version
  u.cookies = new Cookies()
  u.storage = new Storage()
  u._empty = document.createElement('empty')
  u._empty.isEmpty = true

  // ------------------------------------------------------------
  // Helper functions.
  // ------------------------------------------------------------

  u.newEvent = function (name) {
    const event = document.createEvent('Event')
    event.initEvent(name, true, true)
    return event
  }

  u.create = function (htmlString) {
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()
    const kids = div.kids()
    return kids.length === 1 ? kids[0] : kids
  }

  u.ready = function (callback) {
    if (document.readyState !== 'loading') {
      return callback()
    }

    window.on('DOMContentLoaded', event => {
      callback(event)
    })
  }

  u.load = function (callback) {
    if (document.readyState === 'complete') {
      return callback()
    }

    window.on('load', (event) => {
      callback(event)
    })
  }

  u._getTarget = function (event, sel) {
    let t = event.target
    while (t !== event.currentTarget) {
      if (t.matches(sel)) {
        return t
      }

      t = t.parentElement
    }

    return null
  }

  u.extend = function () {
    // Apply extensions to Element
    for (const [key, func] of Object.entries(u._ext)) {
      window.Element.prototype[key] = func
    }

    // Apply selected extensions to window and document.
    window.on = u._ext.on
    window.off = u._ext.off
    window.document.find1 = u._ext.find1
    window.document.find = u._ext.find
    window.document.on = u._ext.on
    window.document.off = u._ext.off
    window.trigger = u._ext.trigger
    u.find = u._ext.find.bind(document)
    u.find1 = u._ext.find1.bind(document)
  }

  // ------------------------------------------------------------
  // DOM extensions.
  // ------------------------------------------------------------

  u._ext = {
    find: function (selector) {
      return Array.prototype.slice.call(this.querySelectorAll(selector))
    },

    find1: function (selector) {
      return this.querySelector(selector) || u._empty
    },

    kids: function () {
      return Array.prototype.slice.call(this.children)
    },

    dad: function (selector) {
      const result = selector ? this.closest(selector) : this.parentElement
      return result || u._empty
    },

    next: function () {
      return this.nextElementSibling || u._empty
    },

    prev: function () {
      return this.previousElementSibling || u._empty
    },

    index: function () {
      return this.dad().kids().indexOf(this)
    },

    data: function (key, value) {
      if (!key) {
        // Always return a copy
        return JSON.parse(JSON.stringify(this.dataset))
      }

      // Set the value
      if (value !== undefined) {
        this.dataset[key] = value
        return
      }

      // Convert boolean and numeric values
      const result = this.dataset[key]
      const isNumericOrBoolean = result && (result === 'true' || result === 'false' || !isNaN(result))
      return isNumericOrBoolean ? JSON.parse(result) : result
    },

    addTo: function (el) {
      return el.appendChild(this)
    },

    addAfter: function (el) {
      if (el.next().isEmpty) {
        return this.addTo(el.dad())
      }

      return this.addBefore(el.next())
    },

    addBefore: function (el) {
      return el.dad().insertBefore(this, el)
    },

    empty: function () {
      while (this.firstChild) {
        this.removeChild(this.firstChild)
      }
    },

    del: function () {
      this.dad().removeChild(this)
    },

    on: function (eventName, arg1, arg2) {
      const selector = typeof arg1 === 'string' ? arg1 : null
      const listener = arg2 || arg1

      if (!selector) {
        this.addEventListener(eventName, listener, true)
        return this
      }

      // In this case it is not possible to remove the listener.
      this.addEventListener(eventName, (event) => {
        const target = u._getTarget(event, selector)
        target && listener(event, target)
      }, true)

      return this
    },

    off: function (eventName, listener) {
      this.removeEventListener(eventName, listener, true)
      return this
    },

    trigger: function (name, args) {
      const ev = u.newEvent(name)
      args && Object.keys(args).forEach(key => {
        ev[key] = args[key]
      })
      this.dispatchEvent(ev)
    }
  }

  // ------------------------------------------------------------
  // Initialisation
  // ------------------------------------------------------------

  u.extend()
  window.u = u
  return window.u
}

module.exports = uberdom()

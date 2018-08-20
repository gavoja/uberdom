'use strict'

class Storage {
  get (key) {
    const data = window.localStorage.getItem(key)
    return data ? JSON.parse(data) : data
  }

  set (key, data) {
    window.localStorage.setItem(key, JSON.stringify(data))
  }

  del (key) {
    window.localStorage.removeItem(key)
  }
}

module.exports = Storage

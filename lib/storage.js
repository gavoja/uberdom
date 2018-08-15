'use strict'

class Storage {
  static getInstance () {
    Storage.instance = Storage.instance || new Storage()
    return Storage.instance
  }
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

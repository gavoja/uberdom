'use strict'

class Storage {
  static getInstance () {
    Storage.instance = Storage.instance || new Storage()
    return Storage.instance
  }
  getItem (key) {
    const data = window.localStorage.getItem(key)
    return data ? JSON.parse(data) : data
  }

  setItem (key, data) {
    window.localStorage.setItem(key, JSON.stringify(data))
  }

  removeItem (key) {
    window.localStorage.removeItem(key)
  }
}

module.exports = Storage

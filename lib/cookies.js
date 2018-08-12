'use strict'

class Cookies {
  static getInstance () {
    Cookies.instance = Cookies.instance || new Cookies()
    return Cookies.instance
  }

  get (name) {
    if (!name) {
      return null
    }

    return window.decodeURIComponent(window.document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + window.encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null
  }

  set (name, value, time) {
    let expires = ''
    if (time) {
      let date = new Date()
      date.setTime(date.getTime() + time)
      expires = `expires=${date.toGMTString()};`
    }

    name = window.encodeURIComponent(name)
    value = window.encodeURIComponent(value)
    window.document.cookie = `${name}=${value};${expires}path=/`
  }

  del (name, value) {
    this.set(name, '', -1)
  }

  has (name) {
    if (!name) {
      return false
    }

    return (new RegExp('(?:^|;\\s*)' + window.encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=')).test(window.document.cookie)
  }
}

module.exports = Cookies

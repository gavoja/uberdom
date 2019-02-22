'use strict'

class Cookies {
  get (name) {
    if (!name) {
      return null
    }

    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null
  }

  set (name, value, time) {
    let expires = ''
    if (time) {
      let date = new Date()
      date.setTime(date.getTime() + time)
      expires = `expires=${date.toGMTString()};`
    }

    name = encodeURIComponent(name)
    value = encodeURIComponent(value)
    document.cookie = `${name}=${value};${expires}path=/`
  }

  del (name, value) {
    this.set(name, '', -1)
  }

  has (name) {
    if (!name) {
      return false
    }

    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=')).test(document.cookie)
  }
}

module.exports = Cookies

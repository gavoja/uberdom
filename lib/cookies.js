'use strict'

class Cookies {
  get (name) {
    if (name) {
      return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(name).replace(/[-.+*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null
    }
  }

  set (name, value, params = {}) {
    // Accept expiry as integer.
    if (Number.isInteger(params.expires)) {
      const date = new Date()
      date.setTime(date.getTime() + params.expires)
      params.expires = date.toGMTString()
    }

    params.path = params.path || '/'

    // Convert params into string.
    const suffix = Object.keys(params)
      .map(k => params[k] === true ? k : `${k}=${params[k]}`)
      .join(';')

    name = encodeURIComponent(name)
    value = encodeURIComponent(value)
    document.cookie = `${name}=${value};${suffix}`
  }

  del (name, value) {
    this.set(name, '', { expires: -1 })
  }
}

module.exports = Cookies

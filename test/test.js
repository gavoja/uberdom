/* global u */
'use strict'

const puppeteer = require('puppeteer')
const assert = require('assert')
const test = require('triala')

test('uberdom', class {
  async _before () {
    const browser = await puppeteer.launch({ headless: true })
    this.page = await browser.newPage()
    await this.page.goto('http://localhost:8000')
    await this.page.evaluate(() => {
      window.test = {}
    })
  }

  async _beforeEach () {
    return this.page.evaluate(() => (window.test = {}))
  }

  async 'selecting elements' () {
    assert.equal(await this.page.evaluate(() => u.find('a').length), 3)
    assert.equal(await this.page.evaluate(() => u.find1('a').id), 'link1')
    assert.equal(await this.page.evaluate(() => u.find1('ul').find1('li').find1('a').id), 'link1')
  }

  async 'non existent elements' () {
    assert.equal(await this.page.evaluate(() => u.find('none').length), 0)
    assert.equal(await this.page.evaluate(() => u.find1('none').id), '')
    assert.equal(await this.page.evaluate(() => u.find1('none').isEmpty), true)
    assert.equal(await this.page.evaluate(() => u.find1('none').find1('anothernone').isEmpty), true)
  }

  async 'kids and dad' () {
    assert.equal(await this.page.evaluate(() => u.find1('ul').kids().length), 3)
    assert.equal(await this.page.evaluate(() => u.find1('li').dad().tagName), 'UL')
    assert.equal(await this.page.evaluate(() => u.find1('a').dad('ul').tagName), 'UL')
    assert.equal(await this.page.evaluate(() => u.find1('a').dad('none').isEmpty), true)
  }

  async 'next and prev' () {
    assert.equal(await this.page.evaluate(() => u.find1('li').next().kids().shift().id), 'link2')
    assert.equal(await this.page.evaluate(() => u.find1('li').next().prev().kids().shift().id), 'link1')
    assert.equal(await this.page.evaluate(() => u.find1('li').next().next().index()), 2)
  }

  async 'creating and deleting elements' () {
    assert.equal(await this.page.evaluate(() => {
      u.create(`
        <ul>
          <li><a id="link40" href="#link40">Link 40</a></li>
          <li><a id="link50" href="#link50">Link 50</a></li>
          <li><a id="link60" href="#link60">Link 60</a></li>
        </ul>
      `).addTo(u.find1('#dynamic'))
      u.create(`<li><a id="link55" href="#link55">Link 55</a></li>`).addAfter(u.find1('#link50').dad())
      u.create(`<li><a id="link45" href="#link45">Link 45</a></li>`).addBefore(u.find1('#link50').dad())
      return u.find('#dynamic li').length
    }), 5)

    assert.equal(await this.page.evaluate(() => {
      u.find1('#link50').dad().del()
      return u.find('#dynamic li').length
    }), 4)

    assert.equal(await this.page.evaluate(() => {
      u.find1('#dynamic').empty()
      return u.find('#dynamic li').length
    }), 0)
  }

  async 'on and off event' () {
    // Bind event listener.
    await this.page.evaluate(() => {
      test.handler = event => {
        test.result = event.target.dad().kids().shift().id
      }

      u.find1('#link1').on('click', test.handler)
    })

    // Trigger click.
    await this.page.click('#link1')
    assert.equal(await this.page.evaluate(() => test.result), 'link1')

    // Unbind event listener.
    await this.page.evaluate(() => {
      u.find1('#link1').off('click', test.handler)
      delete test.result
    })

    // Trigger click.
    await this.page.click('#link1')
    assert.equal(await this.page.evaluate(() => window.result), undefined)
  }

  async 'custom event' () {
    assert.equal(await this.page.evaluate(() => {
      test.handler = event => {
        test.result = 'custom'
      }

      u.find1('#link1').on('custom', test.handler)
      u.find1('#link1').trigger('custom')

      return test.result
    }), 'custom')
  }

  async 'event on dynamically created element' () {
    await this.page.evaluate(() => {
      test.result = []
      u.find1('body').on('click', 'a', (event, target) => {
        test.result.push(target.id)
      })

      u.create(`
        <p>
          <a id="link101" href="#link101">Link 101</a>
          <a id="link102" href="#link102">Link 102</a>
        </p>
      `).addTo(u.find1('#dynamic'))
    })

    await this.page.click('#link101')
    await this.page.click('#link102')

    assert.deepStrictEqual(await this.page.evaluate(() => test.result), ['link101', 'link102'])

    await this.page.evaluate(() => {
      u.find1('#dynamic').empty()
    })
  }

  async 'storage' () {
    await this.page.evaluate(() => {
      u.storage.set('obj', {foo: 'bar'})
    })

    await this.page.goto('http://example.com')
    await this.page.goto('http://localhost:8000')

    assert.deepStrictEqual(await this.page.evaluate(() => u.storage.get('obj')), {foo: 'bar'})
    assert.deepStrictEqual(await this.page.evaluate(() => {
      u.storage.del('obj')
      return u.storage.get('obj')
    }), null)
  }

  async 'query string' () {
    assert.deepStrictEqual(await this.page.evaluate(() => {
      return u.querystring.parse('foo=abc&foo=123&foo=false&bar=xyz%26&baz')
    }), {foo: ['abc', 123, false], bar: 'xyz&', baz: true})

    assert.equal(await this.page.evaluate(() => {
      return u.querystring.stringify({foo: ['abc', 123, false], bar: 'xyz&', baz: true})
    }), 'foo=abc&foo=123&foo=false&bar=xyz%26&baz')
  }
})

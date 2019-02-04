//a "Property" maintains a set of tweenable values
//for e.g.:
//  position [x, y]
//  color [r, g, b, a]
//  alpha [a]

//It will also store application-level flags like
//whether or not your data is hidden, or what type
//of property you might be dealing with

import keyframes from 'keyframes';

import xtend from 'xtend';

export default class Property {

  constructor(data) {
    this.keyframes = keyframes()
    this.value = null
    this.name = ''

    if (data) {
      this.load(data)
    }
  }

  dispose() {
    this.keyframes.clear()
  }
  
  export() {
    return xtend(this, {
      keyframes: this.keyframes.frames
    })
  }
  
  load(data) {
    this.dispose()
  
    if (!data) {
      return
    }
    
    for (var k in data) {
      if (!data.hasOwnProperty(k)) {
        continue
      }

      if (k === 'keyframes') {
        this.keyframes.frames = data.keyframes
      } else {
        this[k] = data[k]
      }
    }

  }
}

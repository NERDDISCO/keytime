import eases from 'eases'
import lerp from 'lerp-array'
import Property from './property.js'

export default class Keytime {

  constructor(data) {
    this.properties = []

    if (data) {
      this.load(data)
    }
  }

  ease(name, t) {
    return eases[name](t)
  }

  dispose() {
    this.properties.forEach(function (p) {
      p.dispose()
    })

    this.properties.length = 0
  }

  addProperty(propData) {
    this.properties.push(new Property(propData))
  }

  //Finds the max duration of all properties
  duration() {
    var maxTime = 0

    for (var j = 0; j < this.properties.length; j++) {
      var prop = this.properties[j]
      var frames = prop.keyframes.frames

      for (var i = 0; i < frames.length; i++) {
        maxTime = Math.max(frames[i].time, maxTime)
      }
    }

    return maxTime
  }

  //Returns the first control by the specified name or index
  property(prop) {
    var idx = typeof prop === 'number' 
      ? prop 
      : this.properties.findIndex(element => prop.name === element.name)

    return idx < 0 ? undefined : this.properties[idx]
  }

  //Loads timeline animation data
  load(data) {
    this.dispose()

    if (!data) {
      return
    }

    this.properties = data.map(function (d) {
      return new Property(d)
    })
  }

  export () {
    return this.properties.map(function (p) {
      return p.export()
    })
  }

  //Interpolate between two frames; subclasses can override to provide custom 
  //interpolators (e.g. quaternions, paths, etc)
  interpolate(property, frame1, frame2, time) {
    return this.lerp(frame1.value, frame2.value, time)
  }

  lerp(value1, value2, time) {
    return lerp(value1, value2, time)
  }

  //Determine the value at the given time stamp of the specified property
  valueOf(time, property) {
    let keys = property.keyframes
    let v = keys.interpolation(time)
    let v0 = v[0]
    let v1 = v[1]
    let t = v[2]

    //return default value of property
    if (v0 === -1 || v1 === -1) {
      return property.value
    }

    let start = keys.frames[v0]
    let end = keys.frames[v1]

    //frames match, return the first
    if (v0 === v1) {
      return start.value
    }

    //ease and interpolate frames
    else {
      var easeName = end.ease

      //remap time with easing equation
      if (easeName) {
        t = this.ease(easeName, t)
      }
        
      return this.interpolate(property, start, end, t)
    }
  }

  //Convenience to get the values of all properties at a given time stamp
  values(time, out) {
    if (!out) {
      out = {}
    }
      
    for (var i = 0; i < this.properties.length; i++) {
      var prop = this.properties[i]
      out[prop.name] = this.valueOf(time, prop)
    }

    return out
  }
}

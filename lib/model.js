const mongoose = require('mongoose')

const Schema = mongoose.Schema

// To fix https://github.com/Automattic/mongoose/issues/4291
mongoose.Promise = global.Promise

module.exports = class Model {

  constructor() {
    this.models = {}
  }

  init(schema) {
    Object.keys(schema).map(item => {
      const model = this.add(item, schema[item])
      if (model) {
        this.models[item] = model
      }
    })

    return this.models
  }

  add(name, schema) {
    const itemSchema = new Schema(schema)
    const item = mongoose.model(name, itemSchema)
    return item
  }
}
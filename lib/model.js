const Sequelize = require('sequelize')

module.exports = class Model {

  constructor() {
    this.models = {}
  }

  /**
   * Model init
   *
   * @param {object} db DB instance
   * @param {obejct} opts user configs
   * @param {boolean} multi is multi dbs
   * @returns
   */
  init(db, opts, multi) {
    Object.keys(opts.schema).map(item => {
      const model = this.add(db, item, opts.schema[item], opts.type)
      if (model) {
        if (multi) {
          this.models[`${opts.type}_${item}`] = model
        } else {
          this.models[item] = model
        }
      }
    })

    // DB sync
    if (opts.type === 'mysql' && opts.sync) {
      db.sync()
        .then(() => {
          global.logger.info(`"${opts.database}" Tables sync successfully.`)
        })
        .catch(err => {
          global.logger.error(`"${opts.database}" Tables sync fail: `, err)
        })
    }

    return this.models
  }

  /**
   * Add a model
   *
   * @param {object} db DB instance
   * @param {string} name table name
   * @param {obejct} schema table schema
   * @param {string} type DB type
   * @returns
   */
  add(db, name, schema, type) {
    if (type === 'mongodb') {
      const itemSchema = new db.Schema(schema)
      const itemModel = db.model(name, itemSchema)
      return itemModel
    } else if (type === 'mysql') {
      let schemaCopy, options, itemModel
      if (Array.isArray(schema)) {
        schemaCopy = Object.assign({}, schema[0])
        options = schema[1]
      } else {
        schemaCopy = Object.assign({}, schema)
      }

      Object.keys(schemaCopy).map(item => {
        // support  type: 'INTEGER(11)' => type: Sequelize('INTEGER')(11)
        const type = schemaCopy[item].type
        const p = /\([^)]*\)$/
        let typeParams = type.match(p)
        if (typeParams) {
          typeParams = typeParams[0].substring(1, typeParams[0].length - 1)
          const typeName = type.replace(p, '')
          schemaCopy[item].type = Sequelize[typeName](typeParams)
        } else {
          schemaCopy[item].type = Sequelize[type]
        }
      })
      if (options) {
        itemModel = db.define(name, schemaCopy, options)
      } else {
        itemModel = db.define(name, schemaCopy)
      }
      return itemModel
    }
  }
}
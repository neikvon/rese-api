const Controller = require('./controller')
const Database = require('./database')
const Model = require('./model')
const Router = require('./router')
const getConfigs = require('./configs')

// private methods
const modelInit = Symbol()
const controllerInit = Symbol()
const routerInit = Symbol()
const configInit = Symbol()

module.exports = class ReseApi {

  constructor(app, opts) {
    this.services = {}
    this.options = opts
    opts['app'] = app

    global.logger = global.logger || {
      log: console.log,
      debug: console.log,
      info: console.log,
      warn: console.log,
      error: console.error,
    }

    this.controller = new Controller()

    // support multi dbs
    const modelInstance = new Model()
    this.router = new Router(this.services, opts.router)

    if (Array.isArray(opts.db)) {
      opts.db.map(item => {
        this[configInit](modelInstance, true)
      })
    } else {
      this[configInit](modelInstance)
    }

    this.hook = this.controller.hook.bind(this.controller)
  }

  /**
   * Init user's configs
   *
   * @param {obejct} modelInstance Model instance
   * @param {boolean} multi if multi DBs
   */
  [configInit](modelInstance, multi) {
    const database = new Database(this.options.db)
    const db = database.connect()
    this.models = this[modelInit](db, modelInstance, multi)
    const defaultConfigs = getConfigs(this.models, this.options)
    this[routerInit](defaultConfigs)
  }

  [modelInit](db, modelInstance, multi) {
    return modelInstance.init(db, this.options.db, multi)
  }

  [routerInit](configs) {
    this.router.init(this.options.app)
    Object.keys(configs).map(item => {
      this.controller.add(item, configs[item])
      this.router.add(item, configs[item])
    })
  }

  /**
   * Add a service
   *
   * @param {string} name Service name
   * @param {object} options Service config
   */
  add(name, options) {
    const nameArr = name.split('.')
    let modelName = ''
    let actionName = ''
    if (nameArr.length > 1) {
      modelName = nameArr[0].toLowerCase()
      actionName = name.replace(modelName + '.', '').toLowerCase()
    }
    const serveName = (modelName ? modelName + '.' : modelName) + actionName
    if (serveName) {
      this.controller.add(serveName, options)
      this.router.add(serveName, options)
    } else {
      throw new Error('Please give the service a name.')
    }
  }

}
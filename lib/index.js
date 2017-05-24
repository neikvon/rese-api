const Controller = require('./controller')
const Database = require('./database')
const Model = require('./model')
const Router = require('./router')

// private methods
const modelInit = Symbol()
const controllerInit = Symbol()
const routerInit = Symbol()
const dataInit = Symbol()

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

    const controller = new Controller()

    // multi dbs
    const model = new Model()
    this.router = new Router(this.services, opts.router)

    if (Array.isArray(opts.db)) {
      opts.db.map(item => {
        const database = new Database(item)
        const db = database.connect()
        const models = this[modelInit](db, model, item)
        const data = this[dataInit](models, controller, item)
        this[routerInit](opts, data)
        this.models = models
      })
    } else {
      const database = new Database(opts.db)
      const db = database.connect()
      const models = this[modelInit](db, model, opts.db)
      const data = this[dataInit](models, controller, opts.db)
      this[routerInit](opts, data)
      this.models = models
    }

    this.hook = controller.hook.bind(controller)
    this.add = this.router.add.bind(this.router)
  }

  [dataInit](models, controller, opts) {
    let data = {}
    Object.keys(opts.schema).map(item => {
      const model = models[item]
      if (!model) {
        return
      }
      const name = item.toLowerCase()
      data[`${name}.find`] = {
        path: `/${name}`,
        method: 'get',
        controller: controller.add(model, name, 'find', opts.type),
      }
      data[`${name}.findById`] = {
        path: `/${name}/:id`,
        method: 'get',
        controller: controller.add(model, name, 'findById', opts.type),
      }
      data[`${name}.add`] = {
        path: `/${name}`,
        method: 'post',
        controller: controller.add(model, name, 'add', opts.type),
      }
      data[`${name}.update`] = {
        path: `/${name}/:id`,
        method: 'put',
        controller: controller.add(model, name, 'update', opts.type),
      }
      data[`${name}.delete`] = {
        path: `/${name}/:id`,
        method: 'delete',
        controller: controller.add(model, name, 'delete', opts.type),
      }
      data[`${name}.bulkDelete`] = {
        path: `/${name}/bulkdelete`,
        method: 'post',
        controller: controller.add(model, name, 'bulkDelete', opts.type),
      }
      data[`${name}.bulkUpdate`] = {
        path: `/${name}/bulkupdate`,
        method: 'post',
        controller: controller.add(model, name, 'bulkUpdate', opts.type),
      }
    })

    return data
  }

  [modelInit](db, model, opts) {
    return model.init(db, opts)
  }

  [routerInit](opts, configs) {
    this.router.init(opts.app, configs)
  }

}
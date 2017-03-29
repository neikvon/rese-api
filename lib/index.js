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
    const database = new Database(opts.db)
    const controller = new Controller()
    const db = database.connect()

    const model = new Model()
    const models = this[modelInit](db, model, opts)
    const configs = this[dataInit](models, controller, opts)

    this.router = new Router(this.services, opts.router)

    this[routerInit](opts, configs)

    this.models = models
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
        controller: controller.add(model, name, 'find', opts.db.type),
      }
      data[`${name}.findById`] = {
        path: `/${name}/:id`,
        method: 'get',
        controller: controller.add(model, name, 'findById', opts.db.type),
      }
      data[`${name}.add`] = {
        path: `/${name}`,
        method: 'post',
        controller: controller.add(model, name, 'add', opts.db.type),
      }
      data[`${name}.update`] = {
        path: `/${name}/:id`,
        method: 'put',
        controller: controller.add(model, name, 'update', opts.db.type),
      }
      data[`${name}.delete`] = {
        path: `/${name}/:id`,
        method: 'delete',
        controller: controller.add(model, name, 'delete', opts.db.type),
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
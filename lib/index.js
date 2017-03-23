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
    opts['app'] = app
    const db = new Database(opts.db)
    const controller = new Controller()

    const model = new Model()
    const models = this[modelInit](model, opts.schema)
    const configs = this[dataInit](models, controller, opts.schema)

    this.router = new Router(this.services, opts.router)

    db.connect()

    this[routerInit](opts, configs)

    this.models = models
    this.hook = controller.hook.bind(controller)
    this.add = this.router.add.bind(this.router)
  }

  [dataInit](models, controller, schemas) {
    let data = {}
    Object.keys(schemas).map(item => {
      const model = models[item]
      if (!model || !model.modelName) {
        return
      }
      const name = item.toLowerCase()
      data[`${name}.find`] = {
        path: `/${name}`,
        method: 'get',
        controller: controller.add(model, 'find'),
      }
      data[`${name}.findById`] = {
        path: `/${name}/:id`,
        method: 'get',
        controller: controller.add(model, 'findById'),
      }
      data[`${name}.add`] = {
        path: `/${name}`,
        method: 'post',
        controller: controller.add(model, 'add'),
      }
      data[`${name}.update`] = {
        path: `/${name}/:id`,
        method: 'put',
        controller: controller.add(model, 'update'),
      }
      data[`${name}.delete`] = {
        path: `/${name}/:id`,
        method: 'delete',
        controller: controller.add(model, 'delete'),
      }
    })

    return data
  }

  [modelInit](model, schema) {
    return model.init(schema)
  }

  [routerInit](opts, configs) {
    this.router.init(opts.app, configs)
  }

}
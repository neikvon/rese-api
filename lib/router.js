const KoaRouter = require('koa-router')
const {
  sequenceAndReturnOne
} = require('./helpers')

/**
 * controller wrap
 * wrap controllers for router
 *
 * @param {object} ctx context
 * @param {function} ctrl controller function
 * @param {object} hooks controller hook functions
 * @param {function} next koa router next function
 * @returns
 */
function controllerWrap(ctx, ctrl, hooks, next) {
  let result
  const preHooks = []
  hooks.pre.map(pre => {
    preHooks.push(() => pre(ctx))
  })

  return sequenceAndReturnOne(preHooks)
    .then(() => {
      return ctrl(ctx)
    })
    .then(data => {
      if (!data && ctx.body && ctx.body.data) {
        data = ctx.body.data
      }
      result = data
      const postHooks = []
      hooks.post.map(post => {
        // Use pre action's result for next action's data
        postHooks.push(preResult => post(ctx, preResult || result))
      })
      return sequenceAndReturnOne(postHooks)
    })
    .then(ret => {
      if (!ctx.body) {
        ctx.body = {
          code: 0,
          data: ret || result
        }
      }
      next && next()
    })
    .catch(err => {
      // throw errors to app error handler
      throw err
    })
}

module.exports = class Router {

  constructor(services, options) {
    this.route = new KoaRouter()
    this.services = services
    this.options = options
  }

  /**
   * router init
   *
   * @param {object} app application
   */
  init(app) {
    app
      .use(this.route.routes())
      .use(this.route.allowedMethods({
        throw: true,
      }))
  }

  /**
   * add service
   *
   * @param {string} name service name
   * @param {object} config item config
   *
   * @memberOf Router
   */
  add(name, config) {
    if (!name) {
      throw new Error('Please give the service a name.')
      return
    }
    if (!config) {
      throw new Error('Please give the service a config.')
      return
    }
    const prefix = config.prefix ? `/${config.prefix}` : `/${this.options.prefix}`
    config.path = `${prefix}${config.path.toLowerCase()}`
    if (!this.services[name]) {
      this.route[config.method || 'get'](name, config.path, (ctx, next) => controllerWrap(ctx, config.controller, config.hooks, next))
      this.services[name] = config
    } else {
      throw new Error(`module '${name}' already exist`)
    }
  }
}
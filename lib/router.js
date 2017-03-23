const KoaRouter = require('koa-router')

/**
 * controller wrap
 *
 * @param {object} ctrl controller
 * @param {object} ctx app context
 */
async function controllerWrap(ctrl, ctx) {
  try {
    let valid = false
    const hooks = ctrl.hooks

    if (hooks && hooks.pre) {
      if (Array.isArray(hooks.pre)) {
        await Promise.all(hooks.pre.map(async item => {
          await item(ctx)
        }))
      } else {
        await hooks.pre(ctx)
      }
    }

    const data = await ctrl.fn(ctx)

    if (Array.isArray(data)) {
      valid = !!data.length
    } else {
      valid = !!data
    }

    if (hooks && hooks.post) {
      if (Array.isArray(hooks.post)) {
        await Promise.all(hooks.post.map(async item => {
          await item(ctx, data)
        }))
      } else {
        await hooks.post(ctx, data)
      }
    }

    if (valid) {
      ctx.body = {
        code: 0,
        data
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'no data'
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(err)
    }
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.body = {
        code: -1,
        msg: 'no data'
      }
    } else {
      ctx.body = {
        code: -2,
        msg: err.message
      }
    }
  }
}

module.exports = class Router {

  constructor(services, options) {
    this.route = new KoaRouter()
    this.services = services
    this.options = options
  }

  /**
   * 路由初始化
   *
   * @param {object} app Koa Instance
   * @param {object} configs router configs
   * @returns
   *
   * @memberOf Router
   */
  init(app, configs) {
    Object.keys(configs).map(name => {
      this.add(name, configs[name])
    })

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
    if (!name || !config) {
      return
    }
    const prefix = config.prefix ? `/${config.prefix}` : `/${this.options.prefix}`
    config.path = `${prefix}${config.path.toLowerCase()}`
    if (!this.services[name]) {
      this.route[config.method || 'get'](name, config.path, (ctx, next) => controllerWrap(config.controller, ctx))
      this.services[name] = config
    } else {
      throw new Error(`module '${name}' already exist`)
    }
  }
}
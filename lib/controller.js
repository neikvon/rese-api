const {
  querystringParser
} = require('./helpers')

module.exports = class Controller {

  constructor() {
    this.controllers = {}
  }

  add(model, modelName, name, dbType, fn) {
    let action

    if (fn && typeof fn === 'function') {
      action = fn
    } else {
      action = async ctx => {
        switch (name) {
          case 'find':
            const querystring = querystringParser(ctx.querystring)
            if (querystring.limit) {
              if (dbType === 'mongodb') {
                return model[name](querystring.params).limit(querystring.limit)
              } else if (dbType === 'mysql') {
                return model.findAll({
                  where: querystring.params,
                  limit: querystring.limit
                })
              }
            } else {
              if (dbType === 'mongodb') {
                return model[name](querystring.params)
              } else if (dbType === 'mysql') {
                return model.findAll({
                  where: querystring.params
                })
              }
            }
            break
          case 'findById':
            return model[name](ctx.params.id)
            break
          case 'add':
            if (dbType === 'mongodb') {
              return new model(ctx.request.body).save()
            } else if (dbType === 'mysql') {
              return model.create(ctx.request.body)
            }
            break
          case 'update':
            if (dbType === 'mongodb') {
              return model['findByIdAndUpdate'](ctx.params.id, ctx.request.body, {
                // 返回更新后的数据
                new: true
              })
            } else if (dbType === 'mysql') {
              const ret = await model.update(ctx.request.body, {
                where: {
                  id: ctx.params.id
                }
              })
              return ret[0]
            }
            break
          case 'delete':
            if (dbType === 'mongodb') {
              return model['findByIdAndRemove'](ctx.params.id)
            } else if (dbType === 'mysql') {
              return model.destroy({
                where: {
                  id: ctx.params.id
                }
              })
            }
            break
        }
      }
    }

    const ctrl = {
      fn: action,
      hooks: {}
    }
    if (model) {
      this.controllers[`${modelName}.${name}`] = ctrl
    }
    return ctrl
  }

  hook(name, opts) {
    if (typeof name === 'string') {
      this._hook(name, opts)
    } else {
      const ctrls = []
      if (Array.isArray(name)) {
        name.map(item => {
          this._hook(item, opts)
        })
      } else {
        Object.keys(this.controllers).map(item => {
          this._hook(item, name)
        })
      }
    }
  }

  _hook(name, opts) {
    const ctrl = this.controllers[name]
    if (ctrl) {
      if (ctrl.hooks && ctrl.hooks.pre && opts.pre) {
        if (Array.isArray(ctrl.hooks.pre)) {
          ctrl.hooks.pre.unshift(opts.pre)
        } else {
          ctrl.hooks.pre = [opts.pre, ctrl.hooks.pre]
        }
      } else {
        ctrl.hooks = ctrl.hooks || {}
        ctrl.hooks.pre = opts.pre
      }

      if (ctrl.hooks && ctrl.hooks.post && opts.post) {
        if (Array.isArray(ctrl.hooks.post)) {
          ctrl.hooks.post.unshift(opts.post)
        } else {
          ctrl.hooks.post = [opts.post, ctrl.hooks.post]
        }
      } else {
        ctrl.hooks = ctrl.hooks || {}
        ctrl.hooks.post = opts.post
      }
    } else {
      throw new Error(`module '${name}' not found`)
    }
  }
}
const {
  querystringParser
} = require('./helpers')

module.exports = class Controller {

  constructor() {
    this.controllers = {}
  }

  add(model, name, fn) {
    let action

    if (fn && typeof fn === 'function') {
      action = fn
    } else {
      action = ctx => {
        switch (name) {
          case 'find':
            const querystring = querystringParser(ctx.querystring)
            if (querystring.limit) {
              return model[name](querystring.params).limit(querystring.limit)
            } else {
              return model[name](querystring.params)
            }
            break
          case 'findById':
            return model[name](ctx.params.id)
            break
          case 'add':
            return new model(ctx.request.body).save()
            break
          case 'update':
            return model['findByIdAndUpdate'](ctx.params.id, ctx.request.body, {
              // 返回更新后的数据
              new: true
            })
            break
          case 'delete':
            return model['findByIdAndRemove'](ctx.params.id)
            break
        }
      }
    }

    const ctrl = {
      fn: action,
      hooks: {}
    }
    if (model.modelName) {
      this.controllers[`${model.modelName.toLowerCase()}.${name}`] = ctrl
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
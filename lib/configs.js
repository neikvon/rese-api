const {
  querystringParser
} = require('./helpers')

/**
 * Init service configs
 *
 * @param {object} models
 * @param {obejct} opts
 * @returns
 */
module.exports = (models, options) => {
  const configs = {}
  Object.keys(options.db.schema).map(item => {
    const model = models[item]
    if (!model) {
      return
    }
    const name = item.toLowerCase()
    configs[`${name}.find`] = {
      path: `/${name}`,
      method: 'get',
      controller(ctx, opts = {}) {
        const querystring = querystringParser(ctx.querystring)
        if (options.db.type === 'mongodb') {
          return querystring.limit ?
            model[name](querystring.params).limit(querystring.limit) :
            model[name](querystring.params)
        } else if (options.db.type === 'mysql') {
          querystring['where'] = querystring.params
          delete querystring.params
          return model.findAll(querystring)
        }
      }
    }
    configs[`${name}.findById`] = {
      path: `/${name}/:id`,
      method: 'get',
      controller(ctx, opts = {}) {
        return model[name](ctx.params.id)
      }
    }
    configs[`${name}.add`] = {
      path: `/${name}`,
      method: 'post',
      controller(ctx, opts = {}) {
        if (options.db.type === 'mongodb') {
          return new model(ctx.request.body).save()
        } else if (options.db.type === 'mysql') {
          return model.create(ctx.request.body, opts)
        }
      }
    }
    configs[`${name}.update`] = {
      path: `/${name}/:id`,
      method: 'put',
      controller(ctx, opts = {}) {
        if (options.db.type === 'mongodb') {
          return model['findByIdAndUpdate'](ctx.params.id, ctx.request.body, {
            // 返回更新后的数据
            new: true
          })
        } else if (options.db.type === 'mysql') {
          return model.update(ctx.request.body, {
            where: {
              id: ctx.params.id
            }
          })
        }
      }
    }
    configs[`${name}.delete`] = {
      path: `/${name}/:id`,
      method: 'delete',
      controller(ctx, opts = {}) {
        if (options.db.type === 'mongodb') {
          return model['findByIdAndRemove'](ctx.params.id)
        } else if (options.db.type === 'mysql') {
          return model.destroy({
            where: {
              id: ctx.params.id
            }
          })
        }
      }
    }
    configs[`${name}.bulkAdd`] = {
      path: `/${name}/bulkadd`,
      method: 'post',
      controller(ctx, opts = {}) {
        const params = ctx.request.body
        if (options.db.type === 'mongodb') {
          return model['bulkWrite'](params.data)
        } else if (options.db.type === 'mysql') {
          return model.bulkCreate(params.data, params.options)
        }
      }
    }
    configs[`${name}.bulkDelete`] = {
      path: `/${name}/bulkdelete`,
      method: 'post',
      controller(ctx, opts = {}) {
        if (options.db.type === 'mongodb') {
          return model['deleteMany'](ctx.request.body)
        } else if (options.db.type === 'mysql') {
          return model.destroy({
            where: ctx.request.body
          })
        }
      }
    }
    configs[`${name}.bulkUpdate`] = {
      path: `/${name}/bulkupdate`,
      method: 'post',
      controller(ctx, opts = {}) {
        const params = ctx.request.body
        if (options.db.type === 'mongodb') {
          return model['update'](params.where, params.data, {
            multi: true, // whether multiple documents should be updated (false)
          })
        } else
        if (options.db.type === 'mysql') {
          return model.update(params.data, {
            where: params.where
          })
        }
      }
    }
  })

  return configs
}
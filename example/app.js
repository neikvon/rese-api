const Koa = require('koa')
const ReseApi = require('../lib')
const bodyparser = require('koa-bodyparser')
const log4js = require('log4js')
const mError = require('./middlewares/error-handler')
const mRequest = require('./middlewares/request-log')
const configs = require('./configs')

const app = new Koa()

// log4js config
log4js.configure(configs.logs.config, {
  cwd: configs.logs.cwd || './logs'
})
global.logger = log4js.getLogger()

// TRACE, DEBUG, INFO, WARN, ERROR, FATAL
global.logger.setLevel(configs.logs.level || 'WARN')

app.use(mError(global.logger))
app.use(mRequest(global.logger))
app.use(bodyparser())

const api = new ReseApi(app, configs)
const models = api.models
const router = api.router
const services = api.services

api.add('resource.count', {
  path: '/count',
  method: 'get',
  async controller(ctx) {
    console.log('== SELF: resource.count')

    return [1, 2, 3]

    // or
    // ctx.body = {
    //   code: 0,
    //   data: [1, 2, 3]
    // }
  }
})

api.hook('resource.count', {
  async pre(ctx) {
    console.log('<= PRE: hook1')
  },

  async post(ctx, data) {
    console.log('=> POST: hook1:', data)

    return [0].concat(data)

    // or

    // ctx.body = {
    //   code: 0,
    //   data: data.concat([4, 5, 6])
    // }

    // ctx.body = {
    //   code: -1,
    //   message: 'errrrr'
    // }
  }
})


const port = configs.server.port || 3000

app.listen(port, err => {
  if (err) {
    console.error(err)
  } else {
    console.log(`App start on http://localhost:${port}`)
  }
})
const {
  STATUS_CODES,
} = require('http')

// error handler
module.exports = logger => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      logger.error(ctx.url)
      logger.error(err)

      // ctx.app.emit('error', err, ctx)
      // ctx.status = ctx.status || 500

      // const code = STATUS_CODES[ctx.status]
      const code = ctx.status || 500
      ctx.status = 200
      ctx.type = 'application/json'
      ctx.body = {
        code: code,
        message: err.message
      }
    }
  }
}
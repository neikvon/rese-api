// request logs
module.exports = (logger, cb) => {
  return async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    const message = `${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`

    logger.trace(message)

    if (['POST', 'PUT', 'PATCH'].includes(ctx.method)) {
      logger.info('Request body: ', ctx.request.body)
    }
  }
}
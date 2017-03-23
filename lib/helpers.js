module.exports = {
  querystringParser(str) {
    const params = {}

    if (str) {
      // string to json
      str.split('&').map(item => {
        const qs = item.split('=')
        if (!isNaN(qs[1])) {
          params[qs[0]] = qs[1] * 1
        } else {
          params[qs[0]] = qs[1]
        }
      })

      if (params.limit) {
        const limit = params.limit
        delete params.limit

        return {
          params,
          limit
        }
      }
    }

    return {
      params
    }
  }
}
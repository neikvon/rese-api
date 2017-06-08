module.exports = {
  /**
   * Parse querystring
   *
   * @param {string} str URL params
   * @returns
   */
  querystringParser(str) {
    const ret = {}
    const params = {}

    if (str) {
      // string to json
      str.split('&').map(item => {
        const qs = item.split('=')
        if (qs[0].includes('.')) {
          const arr = qs[0].split('.')
          const inner = arr.pop()
          const outer = arr.join('.')
          params[outer] = params[outer] || {}
          params[outer][inner] = qs[1]
        } else {
          if (!isNaN(qs[1])) {
            params[qs[0]] = qs[1] * 1
          } else {
            params[qs[0]] = qs[1]
          }
        }
      })

      if (params.limit) {
        ret['limit'] = params.limit
        delete params.limit
      }

      if (params.offset !== undefined && params.offset !== null) {
        ret['offset'] = params.offset
        delete params.offset
      }

      if (params.order) {
        let order
        const orderData = params.order.split(',') // order=name|desc,age|asc
        orderData.map(item => {
          order = order || []
          const itemData = item.split('|')
          itemData[1] = itemData[1].toUpperCase()
          order.push(itemData)
        })
        ret['order'] = order
        delete params.order
      }

      ret['params'] = params
    }

    return ret
  },

  /**
   * Sequence tasks and return each result
   *
   * @param {array} tasks Array of tasks
   * @returns
   */
  sequenceAndReturnEach(tasks) {
    function recordValue(results, value) {
      results.push(value)
      return results
    }
    const pushValue = recordValue.bind(null, [])
    return tasks.reduce((promise, task) => {
      return promise.then(task).then(pushValue)
    }, Promise.resolve())
  },

  /**
   * Sequence tasks and return last result
   *
   * @param {array} tasks Array of tasks
   * @returns
   */
  sequenceAndReturnOne(tasks) {
    let ret
    return tasks.reduce((promise, task) => {
      return promise
        .then(task)
        .then(val => {
          // console.log('val: ', val)
          if (val !== undefined) {
            ret = val
          }
          return ret
        })
    }, Promise.resolve())
  }
}
module.exports = class Controller {

  constructor() {
    this.controllers = {}
  }

  /**
   * Add a controller
   *
   * @param {string} name controller name
   * @param {obejct} opts controller configs
   */
  add(name, opts) {
    if (this.controllers[name]) {
      throw new Error(`Controller ${name} already exist.`)
      return
    }
    if (!opts.controller || (typeof opts.controller !== 'function')) {
      throw new Error(`Controller should be a function.`)
      return
    }
    opts['hooks'] = opts['hooks'] || {}
    opts['hooks']['pre'] = opts['hooks']['pre'] || []
    opts['hooks']['post'] = opts['hooks']['post'] || []
    if (!Array.isArray(opts.hooks.pre)) {
      opts.hooks.pre = [opts.hooks.pre]
    }
    if (!Array.isArray(opts.hooks.post)) {
      opts.hooks.post = [opts.hooks.post]
    }

    this.controllers[name] = opts
  }

  /**
   * Hook a controller
   *
   * @param {string} name controller name
   * @param {object} opts hook configs
   */
  hook(name, opts) {
    if (typeof name === 'string') {
      this._hook(name, opts)
    } else {
      // hook array
      if (Array.isArray(name)) {
        name.map(item => {
          this._hook(item, opts)
        })
      } else {
        // hook all
        const hooks = name
        Object.keys(this.controllers).map(item => {
          this._hook(item, hooks)
        })
      }
    }
  }

  /**
   * Hook method
   *
   * @param {string} name controller name
   * @param {object} opts hook configs
   */
  _hook(name, opts) {
    const ctrl = this.controllers[name]
    if (ctrl) {
      if (opts.pre) {
        ctrl.hooks.pre.unshift(opts.pre)
      }
      if (opts.post) {
        ctrl.hooks.post.push(opts.post)
      }
    } else {
      throw new Error(`Service '${name}' not found`)
    }
  }
}
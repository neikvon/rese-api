const mongoose = require('mongoose')

module.exports = class Database {

  constructor(opts) {
    this.opts = opts
  }

  connect() {
    if (this.opts.type === 'mongodb') {
      const str = `mongodb://${this.opts.username}:${this.opts.password}@${this.opts.host}:${this.opts.port}/${this.opts.database}`
      mongoose.connect(str)
      mongoose.connection.on('error', console.error)
    }
  }
}
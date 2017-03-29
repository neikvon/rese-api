const mongoose = require('mongoose')
const Sequelize = require('sequelize')

module.exports = class Database {

  constructor(opts) {
    this.opts = opts
  }

  connect() {
    if (this.opts.type === 'mongodb') {
      // To fix https://github.com/Automattic/mongoose/issues/4291
      mongoose.Promise = global.Promise

      const str = `mongodb://${this.opts.username}:${this.opts.password}@${this.opts.host}:${this.opts.port}/${this.opts.database}`
      mongoose.connect(str)
      mongoose.connection.on('error', console.error)

      return mongoose
    } else if (this.opts.type === 'mysql') {
      const sequelize = new Sequelize(this.opts.database, this.opts.username, this.opts.password, {
        dialect: 'mysql',
        host: this.opts.host,
        port: this.opts.port,
        dialectOptions: {
          charset: 'utf8mb4',
        },
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        },
      })

      // Test the connection
      sequelize
        .authenticate()
        .then(() => {
          console.log('Connection has been established successfully.')
        })
        .catch(err => {
          console.log('Unable to connect to the database:', err)
        })

      return sequelize
    }
  }
}
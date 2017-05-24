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

      // https://stackoverflow.com/questions/7486623/mongodb-password-with-in-it
      const str = `mongodb://${this.opts.host}:${this.opts.port}/${this.opts.database}`
      mongoose.connect(str, {
        user: this.opts.username,
        pass: this.opts.password
      })
      mongoose.connection.on('error', err => {
        global.logger.error(`Database (MongoDB) "${this.opts.database}" connect fail: `, err.message)
      })

      return mongoose
    } else if (this.opts.type === 'mysql') {
      let sequelize
      try {
        sequelize = new Sequelize(this.opts.database, this.opts.username, this.opts.password, {
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
      } catch (err) {
        global.logger.log('Sequelize init error:', err)
      }

      // Test the connection
      sequelize
        .authenticate()
        .then(() => {
          global.logger.info(`Database (MySQL) "${this.opts.database}" connected successfully.`)
        })
        .catch(err => {
          global.logger.error(`Database (MySQL) "${this.opts.database}" connect fail: `, err.message)
          return
        })

      return sequelize
    }
  }
}
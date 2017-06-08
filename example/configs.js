module.exports = {
  server: {
    port: 3000
  },

  db: {
    type: 'mysql',
    host: '127.0.0.1',
    port: '3306',
    database: 'test',
    username: 'root',
    password: '123456',
    sync: true,
    schema: {
      Resource: [{
        md5: {
          type: 'STRING(65)',
          allowNull: false,
          validate: {
            notEmpty: true
          }
        }
      }],
    }
  },

  router: {
    prefix: 'api'
  },

  logs: {
    // config for log4js
    cwd: './logs',
    config: {
      appenders: [{
        type: 'console',
      }, {
        type: 'dateFile',
        filename: 'app',
        pattern: '_yyyy-MM-dd.log',
        alwaysIncludePattern: true,
      }, {
        type: 'logLevelFilter',
        level: 'ERROR',
        appender: {
          type: 'file',
          filename: 'errors.log'
        }
      }],
      replaceConsole: true
    },
    // TRACE, DEBUG, INFO, WARN, ERROR, FATAL
    level: 'TRACE',
  },
}
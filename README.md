# Rese API

> The Node.js RESTful API Service

## Usage

```bash
npm i -S koa rese-api
```

```js
import Koa from 'koa'
import reseApi from 'rese-api'
import configs from './configs'

const app = new Koa()
const reseApi = new ReseApi(app, configs)

app.listen(3000)
```


### Sample `configs.js`

```js
export deafult {

  db: {
    type: 'mongodb', // or 'mysql'
    host: '127.0.0.1',
    port: '27017',
    database: 'your-database-name',
    username: 'your-username',
    password: 'your-password',

    // mongodb
    // ref: http://mongoosejs.com/docs/guide.html
    schema: {
      City: {
        name: {
          type: String,
          required: [true, 'name required'],
        },
        totalPopulation: {
          type: Number,
          required: [true, 'totalPopulation required'],
        },
        country: String,
        zipCode: Number,
      },
      Person: {
        ...
      },
      ...
    },

    // OR mysql
    // ref: http://docs.sequelizejs.com/en/v3/docs/models-definition/
    schema: {
      City: {
        name: {
          type: 'STRING',
          allowNull: false,
          defaultValue: ''
        },
        totalPopulation: {
          type: 'BIGINT',
          allowNull: false,
        },
        country: {
          type: 'STRING'
        }
      },
      Image: [{
        md5: {
          type: 'STRING',
          allowNull: false,
          validate: {
            notEmpty: true
          }
        },
        size: {
          type: 'BIGINT(20)',
          allowNull: false,
          validate: {
            isNumeric: true
          }
        },
      }, {
        tableName: 'picture_info',
        timestamps: false,
      }]
      // http://docs.sequelizejs.com/en/v3/docs/models-definition/#configuration
      ...
    }
  },

  router: {
    prefix: 'api'
  }
}
```

Will generate services for each schema:

```js
'city.find': { path: '/api/city', method: 'get', controller: [Object] },
'city.findById': { path: '/api/city/:id', method: 'get', controller: [Object] },
'city.add': { path: '/api/city', method: 'post', controller: [Object] },
'city.update': { path: '/api/city/:id', method: 'put', controller: [Object] },
'city.delete': { path: '/api/city/:id', method: 'delete', controller: [Object] }
'person.find': ...
```

### `reseApi.services`
All services.

```bash
{
  'city.find': { path: '/api/city', method: 'get', controller: [Object] },
  ...
}
```

### `reseApi.models`
MongoDB: return mongoose models

MySQL: return sequelize models

### `reseApi.router`
Instance of KoaRouter
> https://github.com/alexmingoia/koa-router

### `reseApi.add(name, config)`
Add service.
- `name`: `{String}` required, service name
- `config`: `{Object}` required, service config

```js
reseApi.add('city.sz', {
  path: '/shaw',  // required
  method: 'get',  // optional，default: get
  prefix: 'cgi',  // optional，default: router.prefix
  controller: {   // required
    async fn(ctx) {
      // mongodb
      // const data = await app.models.City.find().limit(2)

      // mysql
      const data = await app.models.City.findAll({
        limit: 2
      })

      return data
    }
  },
})
```

### `reseApi.hook([name], opts)`
Hook service
- `name`: `{String|Array}` optional, service name or names
- `opts`: `{Object}` required, `{ pre: fn, post: fn}`

When no names, will hook all services.
```js
reseApi.hook('city.add', {
  async pre(ctx) {
    const name = ctx.request.body.name

    // mongodb
    // const params = {
    //   name
    // }

    // mysql
    const params = {
      where: {
        name
      }
    }

    const data = await app.models.City.findOne(params)
    if (data) {
      throw new Error(`${name} already exist`)
    }
  },
  post(ctx, data) {
    // console.log(data)
  }
})
```

## Demo
### Client request:
```
Request URL: api/resource?md5=27ad74bfc80ce829fd3fc58410e04f26&limit=30&offset=0&order=update_at|desc
Request Method:GET
```

## Changelog

**v0.0.3**
2017-05-24 12:34
- Change config style.

**v0.0.3**
2017-03-29 21:10
- Support sequelize configuration (http://docs.sequelizejs.com/en/v3/docs/models-definition/#configuration)

**v0.0.2**
2017-03-29 11:23
- Add MySQL supports. (using: http://docs.sequelizejs.com/en/v3/)

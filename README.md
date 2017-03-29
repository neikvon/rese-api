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
    type: 'mongodb',
    host: '127.0.0.1',
    port: '27017',
    database: 'your-database-name',
    username: 'your-username',
    password: 'your-password'
  },

  router: {
    prefix: 'api'
  },

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
Mongoose Models (mongoDB)

```bash
{
  City:
  {
    [Function: model]
    hooks: [Object],
    base: [Object],
    modelName: 'City',
    model: [Function: model],
    db: [Object],
    discriminators: undefined,
    schema: [Object],
    collection: [Object],
    Query: [Object],
    '$__insertMany': [Function],
    insertMany: [Function]
  },
  ...
}
```

```js
reseApi.models.City.findOne()
...
```
> http://mongoosejs.com/docs/models.html

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
      const data = await reseApi.models.City.find().limit(1)
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
    const data = await reseApi.models.City.find({
      name
    })
    if (data && data.length) {
      throw new Error(`${name} already exist`)
    }
  },
  post(ctx, data) {
    // console.log(data)
  }
})
```

# Guidance

[![Coverage Status](https://coveralls.io/repos/github/turbometalskater/guidance/badge.svg?branch=master)](https://coveralls.io/github/turbometalskater/guidance?branch=master)
[![Build Status](https://travis-ci.org/turbometalskater/guidance.svg?branch=master)](https://travis-ci.org/turbometalskater/guidance)

A Rails like middleware for routes loading on expressjs applications.
(heavily inspired from http://guides.rubyonrails.org/routing.html)


## Purposes & use

This module provide a Rails like approach for defining routes.
It also add helpers for the views appending it to the `res.locals` object.


### Required configuration:

First of all define your controllers.
They are simple exported objects where the _filename_ is the **controller name**, _object keys_ are the **controller's actions**, and the _object values_ are the **route handlers**.
Default location of the controllers is `process.cwd() + '/controllers'`

```javascript
// controllers/welcomeController.js

module.exports = {
  index: function(req, res) {
    return res.json({ hello: 'welcome' });
  },
  about: function(req, res) {
    return res.json({ hi: 'this is guidance' });
  }
};
```

Routes should be defined as a module that exports a function accepting the router object as parameter.
Use the router object to define your routes.

Define your routes like this (usually in a separated routes.js file):

```javascript
// routes.js
module.exports = function(router) {
  router.get('/', { to: 'welcome#index' });
  router.get('/about', { to: 'welcome#about' });
};
```
This snippets indicate that on `GET /` the express app respond with _welcome_ controller's _index_ action, and `GET /about` is mapped to the _welcome_ controller's _about_ action.

Finally use the middleware like this:

```javascript
const express = require('express');
const guidance = require('guidance');
const routes = require('routes'); // the module defined above (routes.js)

const app = express();
app.use(guidance.initialize(routes));

...
```


### Naming conventions

Some conventions are adopted for the correct mapping of the routes.


#### controllers

When referring to a controller name, the controller file is resolved to `<controllersPath>/<controllerName>.js`
where:
- _controllersPath_ is default to `process.cwd() + '/controllers'` (overridable with `guidance.initialize` options).
- _controllerName_ resolves to the controller name without an eventual `Controller` suffix (_welcomeController_ and _welcome_ both becomes _welcome_)


#### actions

When referring to an action name, the action handler is mapped to the relative controller's property with the same name.
An eventual `Action` suffix is removed from the name (_indexAction_ and _index_ both becomes _index_)

The controller's property should be obviously a callable.


## Reference

### Guidance

#### guidance.initialize(routes, options)

guidance middleware.

Accepted parameters:

- _routes_ the defined routes module
- _options.controllersDir_ the absolute path where to locate the controller modules. Defaults to `process.cwd() + '/controllers'`


### Router

#### Basic routing

Connect URLs to code in the following way (using the `to` key)

```javascript
router.get('/home', { to: 'welcome#index' })
router.post('/login', { to: 'session#create' })
```

When the express app receive a `GET /home` request, the index action handler of the welcome controller is used; the express app responds also on `POST /login` with the session controller's create action.

Any express supported method (router.METHOD) can be used.


#### Named parameters

Named parameters are also supported:

```javascript
router.get('/patients/:id', { to: 'patients#show' })
```

the `id` parameter is available to the `req.params` object of the action.


#### Named routes (views helpers)

A name can be assigned to the route (using the `as` key):

```javascript
router.get('/hp', { to: 'welcome#homepage', as: 'homepage' });
router.get('/patients/:id', { to: 'patients#show', as 'patient' })
```

This helpers are available to the views:

```javascript
homepage()  // returns '/hp'
patient(42) // returns '/patients/42'
```


#### Resources

Resources can also be defined:

```javascript
router.resources('photos')
```

This statement creates the following routes:

- `GET /photos` to _photos#index_
- `GET /photos/new` to _photos#new_
- `POST /photos` to _photos#create_
- `GET /photos/:id` to _photos#show_ with _id_ as parameter
- `GET /photos/:id/edit` to _photos#edit with _id_ as parameter
- `PATCH /photos/:id` to _photos#update with _id_ as parameter
- `PUT /photos/:id` to _photos#update with _id_ as parameter
- `DELETE /photos/:id` to _photos#delete with _id_ as parameter

It also creates the following helpers:

- `photosPath()` returns `/photos`
- `newPhotoPath()` returns `/photos/new`
- `editPhotoPath(42)` returns `/photos/42/edit`
- `photoPath(42)` returns `/photos/42`

Multiple resources can be defined at the same time:

```javascript
router.resources(['photos', 'books']);
```


#### Single resource

Single resource can be defined:

```javascript
router.resource('geocoder');
```

This statement creates the following routes:

- `GET /geocoder/new` to _geocoder#new_
- `POST /geocoder` to _photos#create_
- `GET /geocoder` to _geocoder#show_
- `GET /geocoder/edit` to _geocoder#edit
- `PATCH /geocoder` to _geocoder#update
- `PUT /geocoder` to _geocoder#update
- `DELETE /geocoder` to _geocoder#delete

It also creates the following helpers:

- `geocoderPath()` returns `/geocoder`
- `newGeocoderPath()` returns `/geocoder/new`
- `editGeocoderPath(42)` returns `/geocoder/42/edit`

Multiple single resources can be defined at the same time:

```javascript
router.resource(['geocoder', 'profile']);
```


#### Nesting resources

Resources can be nested:

```javascript
router.resources('magazines', function() {
  router.resources('ads');
});
```

In this case for example the express app can respond to `GET /magazines/42/ads/7` path.
It adds to `req.params` the following attributes:

- `magazineId` (in this case: 42)
- `id` (in this case: 7)


#### Namespace

Routes can be namespaced. In this case the controller should exists in a directory with the same name of the namespace.

```javascript
router.namespace('admin', function() {
  router.resources('articles');
});
```

In this case the article resource's actions are mapped to the following paths:

- `GET /admin/articles`
- `GET /admin/articles/new`
- `POST /admin/articles`
- `GET /admin/articles/:id`
- `GET /admin/articles/:id/edit`
- `PATCH /admin/articles/:id`
- `PUT /admin/articles/:id`
- `DELETE /admin/articles/:id`


#### Scopes

Routes can be also scoped. In this case the controller should exists in a directory with the same name of the scope.

```javascript
router.scope('admin', function() {
  router.resources('articles');
});
```

The difference with the namespace is that the routes paths don't have a prefix, but the controller lives inside a directory with the same name of the scope.


## Notes

A modern version of node is required (due to harmony syntax).
Actually tested with node v4.4.1 LTS.

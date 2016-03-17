# Guidance

A Rails like middleware for routes loading on expressjs applications.

__status__: under initial development

## Purposes & use

This module provide a Rails like approach for defining routes.  
In future it will register some handy variables and helpers like this:

- photosPath returns /photos
- newPhotoPath returns /photos/new
- editPhotoPath(id) returns /photos/:id/edit (for instance, editPhotoPath(10) returns /photos/10/edit)
- photoPath(id) returns /photos/:id (for instance, photoPath(10) returns /photos/10)

(inspired from http://guides.rubyonrails.org/routing.html#path-and-url-helpers)

At the moment this is the required configuration:

```
// define your routes like this (usually in a separated routes.js file)

module.exports = function(router) {
  router.get('/', { to: 'welcome#index' });
};

...

// use the middleware like this

const guidance = require('guidance');
const routes = require('routes');

const app = express();
app.use(guidance.initialize(routes));

```

### Reference

#### Defining routes

Routes should be defined in a module that returns a function accepting the router object.

Use the router object to define your routes.

Example:

```
module.exports = function(router) {
  router.get('/', { to: 'welcome#index' });
};
```
This snippets indicate that on `GET /` the express app respond with _welcome_ controller's _index_ action.


#### guidance.initialize(routes, options)

guidance middleware.

Accepted parameters:

- _routes_ the defined routes module
- _options.controllersDir_ the absolute path where to locate the controller modules. Defaults to `process.cwd() + '/controllers'`


## Notes

A modern version of node is required (due to harmony syntax).
Actually tested with node v4.4.0 LTS.

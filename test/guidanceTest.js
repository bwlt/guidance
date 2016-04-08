/*eslint-env mocha*/
'use strict';

const async = require('async');
const expect = require('chai').expect;
const express = require('express');
const path = require('path');
const request = require('supertest');

const guidance = require('../lib');


describe('guidance', function() {

  let app;
  let controllersDir;

  before(function() {
    controllersDir = path.join(process.cwd(), 'test/utils/controllers');
  });

  beforeEach(function() {
    app = express();
  });

  context('basic', function() {

    it('loads routes', function(done) {
      let routes = function(router) {
        router.get('/', { to: 'welcome#index' });
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      request(app)
        .get('/')
        .expect(200, done)
      ;
    });


    it('checks the controller existence', function() {
      let routes = function(router) {
        router.get('/', { to: 'foo#bar' });
      };

      expect(function() {
        app.use(guidance.initialize(routes, { controllersDir }));
      }).to.throw(Error, 'controller \'foo\' does not exists');
    });


    it('checks the controller action existence', function() {
      let routes = function(router) {
        router.get('/', { to: 'welcome#foo' });
      };

      expect(function() {
        app.use(guidance.initialize(routes, { controllersDir }));
      }).to.throw(Error, 'action \'foo\' on controller \'welcome\' does not exists');
    });


    it('use named params', function(done) {
      let routes = function(router) {
        router.get('/patients/:id', { to: 'patients#show' });
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      request(app)
        .get('/patients/42')
        .expect(function(res) {
          expect(res.body.message).to.equals('show patient 42');
        })
        .end(done)
      ;
    });


    it('use named routes', function(done) {
      let routes = function(router) {
        router.get('/hp', { to: 'welcome#homepage', as: 'homepage' });
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      request(app)
        .get('/hp')
        .expect(function(res) {
          expect(res.body.helpers).to.deep.equal({ homepagePath: '/hp'});
        })
        .end(done)
      ;
    });


    it('use root method', function(done) {

      let routes = function(router) {
        router.root({ to: 'welcome#index'});
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      request(app)
        .get('/')
        .expect(200)
        .end(done)
      ;
    });
  });

  context('resource', function() {

    it('loads resources', function(done) {
      let routes = function(router) {
        router.resources('photos');
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      async.series([
        function expectIndex(callback) {
          request(app)
            .get('/photos')
            .expect(200, 'index action', callback)
          ;
        },
        function expectNew(callback) {
          request(app)
            .get('/photos/new')
            .expect(200, 'new action', callback)
          ;
        },
        function expectCreate(callback) {
          request(app)
            .post('/photos')
            .expect(200, 'create action', callback)
          ;
        },
        function expectShow(callback) {
          request(app)
            .get('/photos/42')
            .expect(200, 'show action', callback)
          ;
        },
        function expectEdit(callback) {
          request(app)
            .get('/photos/42/edit')
            .expect(200, 'edit action', callback)
          ;
        },
        function expectUpdateWithPatch(callback) {
          request(app)
            .patch('/photos/42')
            .expect(200, 'update action', callback)
          ;
        },
        function expectUpdateWithPut(callback) {
          request(app)
            .put('/photos/42')
            .expect(200, 'update action', callback)
          ;
        },
        function expectDelete(callback) {
          request(app)
            .delete('/photos/42')
            .expect(200, 'delete action', callback)
          ;
        }
      ], done);
    });

    it('creates helpers', function(done) {
      let routes = function(router) {
        router.get('/test/:id', { to: 'books#testHelpers' });
        router.resources('books');
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      request(app)
        .get('/test/42')
        .expect(200)
        .expect(function(res) {
          expect(res.body.helpersValue).to.deep.equal({
            booksPath: '/books',
            newBookPath: '/books/new',
            editBookPath: '/books/42/edit',
            bookPath: '/books/42'
          });
        })
        .end(done)
      ;
    });

    it('defines multiple resources at the same time', function(done) {
      let routes = function(router) {
        router.resources(['photos', 'books']);
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      async.parallel([
        function(done) {
          request(app)
            .get('/photos')
            .expect(200, done)
          ;
        },
        function(done) {
          request(app)
            .get('/books')
            .expect(200, done)
          ;
        }
      ], done);
    });

    context('single resource', function() {

      it('loads resource', function(done) {
        let routes = function(router) {
          router.resource('geocoder');
        };

        app.use(guidance.initialize(routes, { controllersDir }));

        async.series([
          function expectNew(callback) {
            request(app)
              .get('/geocoder/new')
              .expect(200, 'new action', callback)
            ;
          },
          function expectCreate(callback) {
            request(app)
              .post('/geocoder')
              .expect(200, 'create action', callback)
            ;
          },
          function expectShow(callback) {
            request(app)
              .get('/geocoder')
              .expect(200, 'show action', callback)
            ;
          },
          function expectEdit(callback) {
            request(app)
              .get('/geocoder/edit')
              .expect(200, 'edit action', callback)
            ;
          },
          function expectUpdateWithPatch(callback) {
            request(app)
              .patch('/geocoder')
              .expect(200, 'update action', callback)
            ;
          },
          function expectUpdateWithPut(callback) {
            request(app)
              .put('/geocoder')
              .expect(200, 'update action', callback)
            ;
          },
          function expectDelete(callback) {
            request(app)
              .delete('/geocoder')
              .expect(200, 'delete action', callback)
            ;
          }
        ], done);

      });

      it('creates helpers', function(done) {
        let routes = function(router) {
          router.get('/test', { to: 'geocoder#testHelpers' });
          router.resource('geocoder');
        };

        app.use(guidance.initialize(routes, { controllersDir }));

        request(app)
          .get('/test')
          .expect(200)
          .expect(function(res) {
            expect(res.body.helpersValue).to.deep.equal({
              geocoderPath: '/geocoder',
              newGeocoderPath: '/geocoder/new',
              editGeocoderPath: '/geocoder/edit'
            });
          })
          .end(done)
        ;
      });


      it('defines multiple single resources at the same time', function(done) {
        let routes = function(router) {
          router.resource(['geocoder', 'profile']);
        };

        app.use(guidance.initialize(routes, { controllersDir }));

        async.parallel([
          function(done) {
            request(app)
              .get('/geocoder')
              .expect(200, 'show action')
              .end(done)
            ;
          },
          function(done) {
            request(app)
              .get('/profile')
              .expect(200, 'show action')
              .end(done)
            ;
          }
        ], done);
      });
    });

    context('nested', function() {
      it('nests resources', function(done) {
        let routes = function(router) {
          router.resources('magazines', function() {
            router.resources('ads');
          });
        };

        app.use(guidance.initialize(routes, { controllersDir }));

        request(app)
          .get('/magazines/42/ads/7')
          .expect(200)
          .end(done)
        ;
      });
    });

  });

  context('namespace', function() {
    it('loads namespace', function(done) {
      let routes = function(router) {
        router.resource('geocoder');
        router.namespace('admin', function() {
          router.resources('articles');
        });
        router.resources('photos');
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      async.parallel([
        function(done) {
          request(app)
            .get('/admin/articles')
            .expect(200)
            .end(done);
        },
        function(done) {
          request(app)
            .get('/geocoder/edit')
            .expect(200)
            .end(done);
        },
        function(done) {
          request(app)
            .get('/photos/42')
            .expect(200)
            .end(done);
        }
      ], done);
    });
  });

  context('scope', function() {
    it('loads scope', function(done) {
      let routes = function(router) {
        router.resource('geocoder');
        router.scope('admin', function() {
          router.resources('articles');
        });
        router.resources('photos');
      };

      app.use(guidance.initialize(routes, { controllersDir }));

      async.parallel([
        function(done) {
          request(app)
            .get('/articles')
            .expect(200)
            .end(done);
        },
        function(done) {
          request(app)
            .get('/geocoder/edit')
            .expect(200)
            .end(done);
        },
        function(done) {
          request(app)
            .get('/photos/42')
            .expect(200)
            .end(done);
        }
      ], done);
    });
  });

});

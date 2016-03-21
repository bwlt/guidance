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

  });

});

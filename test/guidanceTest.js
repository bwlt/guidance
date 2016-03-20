/*eslint-env mocha*/
'use strict';

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

});

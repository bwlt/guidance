/*eslint-env mocha*/
'use strict';

const express = require('express');
const path = require('path');
const request = require('supertest');

const guidance = require('../lib');
const routes = require('./utils/routes');


describe('guidance', function() {

  let app;

  beforeEach(function() {
    app = express();
    app.use(guidance.initialize(routes, { controllersDir: path.join(process.cwd(), 'test/utils/controllers') }));
  });

  it('should load routes', function(done) {
    request(app)
      .get('/')
      .expect(200, done)
    ;
  });

});

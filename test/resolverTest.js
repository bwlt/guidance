/*eslint-env mocha*/
'use strict';

const expect = require('chai').expect;
const methods = require('methods');

const Resolver = require('../lib/resolver');


describe('resolver', function() {

  let resolver = new Resolver;

  it('attach methods to resolver', function() {
    methods.forEach(function(method) {
      expect(resolver).to.respondTo(method);
    });
  });

});

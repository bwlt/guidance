/*eslint-env mocha*/
'use strict';

const expect = require('chai').expect;
const methods = require('methods');

const Parser = require('../lib/routeParser');


describe('routeParser', function() {

  let parser = new Parser;

  it('attach methods to parser', function() {
    methods.forEach(function(method) {
      expect(parser).to.respondTo(method);
    });
  });

});

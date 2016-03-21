/*eslint-env mocha*/
'use strict';

const expect = require('chai').expect;
const methods = require('methods');

const Router = require('../lib/router');


describe('router', function() {

  let router = new Router;

  it('attach methods to router', function() {
    methods.forEach(function(method) {
      expect(router).to.respondTo(method);
    });
  });

  describe('#_parseControllerActionNotation()', function() {

    it('parses correctly', function() {
      const parsed = router._parseControllerActionNotation('foo#bar');
      expect(parsed).to.deep.equal({controller:'foo', action:'bar'});
    });

    it('omits suffixes', function() {
      const parsed = router._parseControllerActionNotation('fooController#barAction');
      expect(parsed).to.deep.equal({controller:'foo', action:'bar'});
    });

    it('should not accepts wrong notations', function() {
      expect(function() {
        router._parseControllerActionNotation('wrongNotation');
      }).to.throw(TypeError);
    });

  });


  describe('#_getControllerFromNotation()', function() {

    const controllers = {
      foo: { bar: function(req, res) { res.json({hello: 'world'}); } }
    };

    it('works', function() {
      const controller = router._getControllerFromNotation('foo#barAction', controllers);
      expect(controller).to.be.equal(controllers.foo.bar);
    });
  });

});

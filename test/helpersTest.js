/*eslint-env mocha*/

const expect = require('chai').expect;

const helpers = require('../lib/helpers');


describe('helpers', function() {

  describe('#parseControllerActionNotation()', function() {

    it('parses correctly', function() {
      const parsed = helpers.parseControllerActionNotation('foo#bar');
      expect(parsed).to.deep.equal({controller:'foo', action:'bar'});
    });

    it('omits suffixes', function() {
      const parsed = helpers.parseControllerActionNotation('fooController#barAction');
      expect(parsed).to.deep.equal({controller:'foo', action:'bar'});
    });

    it('should not accepts wrong notations', function() {
      expect(function() {
        helpers.parseControllerActionNotation('wrongNotation');
      }).to.throw(TypeError);
    });

  });


  describe('#getControllerFromNotation()', function() {

    const controllers = {
      foo: { bar: function(req, res) { res.json({hello: 'world'}); } }
    };

    it('works', function() {
      const controller = helpers.getControllerFromNotation('foo#barAction', controllers);
      expect(controller).to.be.equal(controllers.foo.bar);
    });
  });

});

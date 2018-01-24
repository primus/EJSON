describe('EJSON', function () {
    'use strict';

    var assume = require('assume')
        , EJSON = require('./');

    it('has the `_canonicalStringify` method', function () {
        assume(EJSON._canonicalStringify).to.be.a('function');
    });

    it('is keyOrderSensitive', function () {
        assume(EJSON.equals({
            a: {b: 1, c: 2},
            d: {e: 3, f: 4}
        }, {
            d: {f: 4, e: 3},
            a: {c: 2, b: 1}
        })).to.equal(true);

        assume(EJSON.equals({
            a: {b: 1, c: 2},
            d: {e: 3, f: 4}
        }, {
            a: {c: 2, b: 1},
            d: {f: 4, e: 3}
        }, {keyOrderSensitive: true})).to.equal(false);

        assume(EJSON.equals({
            a: {}
        }, {
            a: {b: 2}
        }, {keyOrderSensitive: true})).to.equal(false);

        assume(EJSON.equals({
            a: {b: 2}
        }, {
            a: {}
        }, {keyOrderSensitive: true})).to.equal(false);
    });

    it('supports nesting and literal', function () {
        var d = new Date()
            , obj = {$date: d};

        var eObj = EJSON.toJSONValue(obj)
            , roundTrip = EJSON.fromJSONValue(eObj);

        assume(obj).to.deep.equal(roundTrip);
    });

    it('equals correctly', function () {
        assume(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, c: 3, b: 2})).to.equal(true);
        assume(EJSON.equals({a: 1, b: 2}, {a: 1, c: 3, b: 2})).to.equal(false);
        assume(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, b: 2})).to.equal(false);
        assume(EJSON.equals({a: 1, b: 2, c: 3}, {a: 1, c: 3, b: 4})).to.equal(false);
        assume(EJSON.equals({a: {}}, {a: {b: 2}})).to.equal(false);
        assume(EJSON.equals({a: {b: 2}}, {a: {}})).to.equal(false);
    });

    it('equality and falsiness', function () {
        assume(EJSON.equals(null, null)).to.equal(true);
        assume(EJSON.equals(undefined, undefined)).to.equal(true);
        assume(EJSON.equals({foo: 'foo'}, null)).to.equal(false);
        assume(EJSON.equals(null, {foo: 'foo'})).to.equal(false);
        assume(EJSON.equals(undefined, {foo: 'foo'})).to.equal(false);
        assume(EJSON.equals({foo: 'foo'}, undefined)).to.equal(false);
    });

    it('clones', function () {
        function cloneTest(x, identical) {
            var y = EJSON.clone(x);

            assume(y).to.deep.equal(x);
            assume(x === y).to.equal(!!identical);
        }

        cloneTest(null, true);
        cloneTest(undefined, true);
        cloneTest(42, true);
        cloneTest('asdf', true);
        cloneTest([1, 2, 3]);
        cloneTest([1, 'fasdf', {foo: 42}]);
        cloneTest({x: 42, y: 'asdf'});

        function testCloneArgs(/*arguments*/) {
            var clonedArgs = EJSON.clone(arguments);
            assume(clonedArgs).to.deep.equal([1, 2, 'foo', [4]]);
        }

        testCloneArgs(1, 2, 'foo', [4]);
    });

    it('supports custom types', function () {
        function CustomType(x) {
            this._x = x;
        }

        CustomType.prototype.typeName = function() {
            return 'CustomType'
        };

        CustomType.prototype.toJSONValue = function() {
            return this._x;
        };
        EJSON.addType('CustomType', function (json) {return new CustomType(json)});
        const a = new CustomType(123);
        const b = EJSON.toJSONValue(a);
        assume(b).deep.equals({__type: 'CustomType', __value: 123});
        const c = EJSON.fromJSONValue(b);
        assume(c.constructor.name).equals('CustomType');
        assume(c._x).equals(123);
    });
})
;

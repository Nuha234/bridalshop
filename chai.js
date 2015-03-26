!function (name, context, definition) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd  === 'object') {
    define(function () {
      return definition();
    });
  } else {
    context[name] = definition();
  }
}('chai', this, function () {

  function require(p) {
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

  require.modules = {};

  require.resolve = function (path) {
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

  require.register = function (path, fn) {
    require.modules[path] = fn;
  };

  require.relative = function (parent) {
    return function(p){
      if ('.' != p.charAt(0)) return require(p);

      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };

  require.alias = function (from, to) {
    var fn = require.modules[from];
    require.modules[to] = fn;
  };


  require.register("chai.js", function(module, exports, require){
    /*!
     * chai
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    var used = []
      , exports = module.exports = {};

    /*!
     * Chai version
     */

    exports.version = '1.4.2';

    /*!
     * Primary `Assertion` prototype
     */

    exports.Assertion = require('./chai/assertion');

    /*!
     * Assertion Error
     */

    exports.AssertionError = require('./chai/error');

    /*!
     * Utils for plugins (not exported)
     */

    var util = require('./chai/utils');

    /**
     * # .use(function)
     *
     * Provides a way to extend the internals of Chai
     *
     * @param {Function}
     * @returns {this} for chaining
     * @api public
     */

    exports.use = function (fn) {
      if (!~used.indexOf(fn)) {
        fn(this, util);
        used.push(fn);
      }

      return this;
    };

    /*!
     * Core Assertions
     */

    var core = require('./chai/core/assertions');
    exports.use(core);

    /*!
     * Expect interface
     */

    var expect = require('./chai/interface/expect');
    exports.use(expect);

    /*!
     * Should interface
     */

    var should = require('./chai/interface/should');
    exports.use(should);

    /*!
     * Assert interface
     */

    var assert = require('./chai/interface/assert');
    exports.use(assert);

  }); // module: chai.js

  require.register("chai/assertion.js", function(module, exports, require){
    /*!
     * chai
     * http://chaijs.com
     * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
     * MIT Licensed
     */

    /*!
     * Module dependencies.
     */

    var AssertionError = require('./error')
      , util = require('./utils')
      , flag = util.flag;

    /*!
     * Module export.
     */

    module.exports = Assertion;


    /*!
     * Assertion Constructor
     *
     * Creates object for chaining.
     *
     * @api private
     */

    function Assertion (obj, msg, stack) {
      flag(this, 'ssfi', stack || arguments.callee);
      flag(this, 'object', obj);
      flag(this, 'message', msg);
    }

    /*!
      * ### Assertion.includeStack
      *
      * User configurable property, influences whether stack trace
      * is included in Assertion error message. Default of false
      * suppresses stack trace in the error message
      *
      *     Assertion.includeStack = true;  // enable stack on error
      *
      * @api public
      */

    Assertion.includeStack = false;

    Assertion.addProperty = function (name, fn) {
      util.addProperty(this.prototype, name, fn);
    };

    Assertion.addMethod = function (name, fn) {
      util.addMethod(this.prototype, name, fn);
    };

    Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
      util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
    };

    Assertion.overwriteProperty = function (name, fn) {
      util.overwriteProperty(this.prototype, name, fn);
    };

    Assertion.overwriteMethod = function (name, fn) {
      util.overwriteMethod(this.prototype, name, fn);
    };

    /*!
     * ### .assert(expression, message, negateMessage, expected, actual)
     *
     * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
     *
     * @name assert
     * @param {Philosophical} expression to be tested
     * @param {String} message to display if fails
     * @param {String} negatedMessage to display if negated expression fails
     * @param {Mixed} expected value (remember to check for negation)
     * @param {Mixed} actual (optional) will default to `this.obj`
     * @api private
     */

    Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
      var ok = util.test(this, arguments);
      if (true !== showDiff) showDiff = false;

      if (!ok) {
        var msg = util.getMessage(this, arguments)
          , actual = util.getActual(this, arguments);
        throw new AssertionError({
            message: msg
          , actual: actual
          , expected: expected
          , stackStartFunction: (Assertion.includeStack) ? this.assert : flag(this, 'ssfi')
          , showDiff: showDiff
        });
      }
    };

    /*!
     * ### ._obj
     *
     * Quick reference to stored `actual` value for plugin developers.
     *
     * @api private
     */

    Object.defineProperty(Assertion.prototype, '_obj',
      { get: function () {
          return flag(this, 'object');
        }
      , set: function (val) {
          flag(this, 'object', val);
        }
    });

  }); 

  require.register("chai/core/assertions.js", function(module, exports, require){
   
    module.exports = function (chai, _) {
      var Assertion = chai.Assertion
        , toString = Object.prototype.toString
        , flag = _.flag;

     

      [ 'to', 'be', 'been'
      , 'is', 'and', 'have'
      , 'with', 'that', 'at'
      , 'of' ].forEach(function (chain) {
        Assertion.addProperty(chain, function () {
          return this;
        });
      });

      Assertion.addProperty('not', function () {
        flag(this, 'negate', true);
      });


      Assertion.addProperty('deep', function () {
        flag(this, 'deep', true);
      });


      function an(type, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object')
          , klassStart = type.charAt(0).toUpperCase()
          , klass = klassStart + type.slice(1)
          , article = ~[ 'A', 'E', 'I', 'O', 'U' ].indexOf(klassStart) ? 'an ' : 'a ';

        this.assert(
            '[object ' + klass + ']' === toString.call(obj)
          , 'expected #{this} to be ' + article + type
          , 'expected #{this} not to be ' + article + type
        );
      }

      Assertion.addChainableMethod('an', an);
      Assertion.addChainableMethod('a', an);


      function includeChainingBehavior () {
        flag(this, 'contains', true);
      }

      function include (val, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object')
        this.assert(
            ~obj.indexOf(val)
          , 'expected #{this} to include ' + _.inspect(val)
          , 'expected #{this} to not include ' + _.inspect(val));
      }

      Assertion.addChainableMethod('include', include, includeChainingBehavior);
      Assertion.addChainableMethod('contain', include, includeChainingBehavior);

      Assertion.addProperty('ok', function () {
        this.assert(
            flag(this, 'object')
          , 'expected #{this} to be truthy'
          , 'expected #{this} to be falsy');
      });

      Assertion.addProperty('true', function () {
        this.assert(
            true === flag(this, 'object')
          , 'expected #{this} to be true'
          , 'expected #{this} to be false'
          , this.negate ? false : true
        );
      });


      Assertion.addProperty('false', function () {
        this.assert(
            false === flag(this, 'object')
          , 'expected #{this} to be false'
          , 'expected #{this} to be true'
          , this.negate ? true : false
        );
      });

      Assertion.addProperty('null', function () {
        this.assert(
            null === flag(this, 'object')
          , 'expected #{this} to be null'
          , 'expected #{this} not to be null'
        );
      });

      Assertion.addProperty('undefined', function () {
        this.assert(
            undefined === flag(this, 'object')
          , 'expected #{this} to be undefined'
          , 'expected #{this} not to be undefined'
        );
      });


      Assertion.addProperty('exist', function () {
        this.assert(
            null != flag(this, 'object')
          , 'expected #{this} to exist'
          , 'expected #{this} to not exist'
        );
      });


      Assertion.addProperty('empty', function () {
        var obj = flag(this, 'object')
          , expected = obj;

        if (Array.isArray(obj) || 'string' === typeof object) {
          expected = obj.length;
        } else if (typeof obj === 'object') {
          expected = Object.keys(obj).length;
        }

        this.assert(
            !expected
          , 'expected #{this} to be empty'
          , 'expected #{this} not to be empty'
        );
      });

      function checkArguments () {
        var obj = flag(this, 'object')
          , type = Object.prototype.toString.call(obj);
        this.assert(
            '[object Arguments]' === type
          , 'expected #{this} to be arguments but got ' + type
          , 'expected #{this} to not be arguments'
        );
      }

      Assertion.addProperty('arguments', checkArguments);
      Assertion.addProperty('Arguments', checkArguments);

      function assertEqual (val, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'deep')) {
          return this.eql(val);
        } else {
          this.assert(
              val === obj
            , 'expected #{this} to equal #{exp}'
            , 'expected #{this} to not equal #{exp}'
            , val
            , this._obj
            , true
          );
        }
      }

      Assertion.addMethod('equal', assertEqual);
      Assertion.addMethod('equals', assertEqual);
      Assertion.addMethod('eq', assertEqual);


      Assertion.addMethod('eql', function (obj, msg) {
        if (msg) flag(this, 'message', msg);
        this.assert(
            _.eql(obj, flag(this, 'object'))
          , 'expected #{this} to deeply equal #{exp}'
          , 'expected #{this} to not deeply equal #{exp}'
          , obj
          , this._obj
          , true
        );
      });

      function assertAbove (n, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(
              len > n
            , 'expected #{this} to have a length above #{exp} but got #{act}'
            , 'expected #{this} to not have a length above #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj > n
            , 'expected #{this} to be above ' + n
            , 'expected #{this} to be at most ' + n
          );
        }
      }

      Assertion.addMethod('above', assertAbove);
      Assertion.addMethod('gt', assertAbove);
      Assertion.addMethod('greaterThan', assertAbove);

      function assertLeast (n, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(
              len >= n
            , 'expected #{this} to have a length at least #{exp} but got #{act}'
            , 'expected #{this} to not have a length below #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj >= n
            , 'expected #{this} to be at least ' + n
            , 'expected #{this} to be below ' + n
          );
        }
      }

      Assertion.addMethod('least', assertLeast);
      Assertion.addMethod('gte', assertLeast);

      function assertBelow (n, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(
              len < n
            , 'expected #{this} to have a length below #{exp} but got #{act}'
            , 'expected #{this} to not have a length below #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj < n
            , 'expected #{this} to be below ' + n
            , 'expected #{this} to be at least ' + n
          );
        }
      }

      Assertion.addMethod('below', assertBelow);
      Assertion.addMethod('lt', assertBelow);
      Assertion.addMethod('lessThan', assertBelow);


      function assertMost (n, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(
              len <= n
            , 'expected #{this} to have a length at most #{exp} but got #{act}'
            , 'expected #{this} to not have a length above #{exp}'
            , n
            , len
          );
        } else {
          this.assert(
              obj <= n
            , 'expected #{this} to be at most ' + n
            , 'expected #{this} to be above ' + n
          );
        }
      }

      Assertion.addMethod('most', assertMost);
      Assertion.addMethod('lte', assertMost);

      Assertion.addMethod('within', function (start, finish, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object')
          , range = start + '..' + finish;
        if (flag(this, 'doLength')) {
          new Assertion(obj, msg).to.have.property('length');
          var len = obj.length;
          this.assert(
              len >= start && len <= finish
            , 'expected #{this} to have a length within ' + range
            , 'expected #{this} to not have a length within ' + range
          );
        } else {
          this.assert(
              obj >= start && obj <= finish
            , 'expected #{this} to be within ' + range
            , 'expected #{this} to not be within ' + range
          );
        }
      });

      function assertInstanceOf (constructor, msg) {
        if (msg) flag(this, 'message', msg);
        var name = _.getName(constructor);
        this.assert(
            flag(this, 'object') instanceof constructor
          , 'expected #{this} to be an instance of ' + name
          , 'expected #{this} to not be an instance of ' + name
        );
      };

      Assertion.addMethod('instanceof', assertInstanceOf);
      Assertion.addMethod('instanceOf', assertInstanceOf);

      Assertion.addMethod('property', function (name, val, msg) {
        if (msg) flag(this, 'message', msg);

        var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
          , negate = flag(this, 'negate')
          , obj = flag(this, 'object')
          , value = flag(this, 'deep')
            ? _.getPathValue(name, obj)
            : obj[name];

        if (negate && undefined !== val) {
          if (undefined === value) {
            msg = (msg != null) ? msg + ': ' : '';
            throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
          }
        } else {
          this.assert(
              undefined !== value
            , 'expected #{this} to have a ' + descriptor + _.inspect(name)
            , 'expected #{this} to not have ' + descriptor + _.inspect(name));
        }

        if (undefined !== val) {
          this.assert(
              val === value
            , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
            , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
            , val
            , value
          );
        }

        flag(this, 'object', value);
      });

      function assertOwnProperty (name, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(
            obj.hasOwnProperty(name)
          , 'expected #{this} to have own property ' + _.inspect(name)
          , 'expected #{this} to not have own property ' + _.inspect(name)
        );
      }

      Assertion.addMethod('ownProperty', assertOwnProperty);
      Assertion.addMethod('haveOwnProperty', assertOwnProperty);



      function assertLengthChain () {
        flag(this, 'doLength', true);
      }

      function assertLength (n, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).to.have.property('length');
        var len = obj.length;

        this.assert(
            len == n
          , 'expected #{this} to have a length of #{exp} but got #{act}'
          , 'expected #{this} to not have a length of #{act}'
          , n
          , len
        );
      }

      Assertion.addChainableMethod('length', assertLength, assertLengthChain);
      Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

      Assertion.addMethod('match', function (re, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(
            re.exec(obj)
          , 'expected #{this} to match ' + re
          , 'expected #{this} not to match ' + re
        );
      });

      Assertion.addMethod('string', function (str, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).is.a('string');

        this.assert(
            ~obj.indexOf(str)
          , 'expected #{this} to contain ' + _.inspect(str)
          , 'expected #{this} to not contain ' + _.inspect(str)
        );
      });


      function assertKeys (keys) {
        var obj = flag(this, 'object')
          , str
          , ok = true;

        keys = keys instanceof Array
          ? keys
          : Array.prototype.slice.call(arguments);

        if (!keys.length) throw new Error('keys required');

        var actual = Object.keys(obj)
          , len = keys.length;

        // Inclusion
        ok = keys.every(function(key){
          return ~actual.indexOf(key);
        });

        // Strict
        if (!flag(this, 'negate') && !flag(this, 'contains')) {
          ok = ok && keys.length == actual.length;
        }

        // Key string
        if (len > 1) {
          keys = keys.map(function(key){
            return _.inspect(key);
          });
          var last = keys.pop();
          str = keys.join(', ') + ', and ' + last;
        } else {
          str = _.inspect(keys[0]);
        }

        // Form
        str = (len > 1 ? 'keys ' : 'key ') + str;

        // Have / include
        str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

        // Assertion
        this.assert(
            ok
          , 'expected #{this} to ' + str
          , 'expected #{this} to not ' + str
        );
      }

      Assertion.addMethod('keys', assertKeys);
      Assertion.addMethod('key', assertKeys);


      function assertThrows (constructor, errMsg, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        new Assertion(obj, msg).is.a('function');

        var thrown = false
          , desiredError = null
          , name = null
          , thrownError = null;

        if (arguments.length === 0) {
          errMsg = null;
          constructor = null;
        } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
          errMsg = constructor;
          constructor = null;
        } else if (constructor && constructor instanceof Error) {
          desiredError = constructor;
          constructor = null;
          errMsg = null;
        } else if (typeof constructor === 'function') {
          name = (new constructor()).name;
        } else {
          constructor = null;
        }

        try {
          obj();
        } catch (err) {
          // first, check desired error
          if (desiredError) {
            this.assert(
                err === desiredError
              , 'expected #{this} to throw ' + _.inspect(desiredError) + ' but ' + _.inspect(err) + ' was thrown'
              , 'expected #{this} to not throw ' + _.inspect(desiredError)
            );
            return this;
          }
          // next, check constructor
          if (constructor) {
            this.assert(
                err instanceof constructor
              , 'expected #{this} to throw ' + name + ' but ' + _.inspect(err) + ' was thrown'
              , 'expected #{this} to not throw ' + name + ' but ' + _.inspect(err) + ' was thrown');
            if (!errMsg) return this;
          }
          // next, check message
          if (err.message && errMsg && errMsg instanceof RegExp) {
            this.assert(
                errMsg.exec(err.message)
              , 'expected #{this} to throw error matching ' + errMsg + ' but got ' + _.inspect(err.message)
              , 'expected #{this} to throw error not matching ' + errMsg
            );
            return this;
          } else if (err.message && errMsg && 'string' === typeof errMsg) {
            this.assert(
                ~err.message.indexOf(errMsg)
              , 'expected #{this} to throw error including #{exp} but got #{act}'
              , 'expected #{this} to throw error not including #{act}'
              , errMsg
              , err.message
            );
            return this;
          } else {
            thrown = true;
            thrownError = err;
          }
        }

        var expectedThrown = name ? name : desiredError ? _.inspect(desiredError) : 'an error';
        var actuallyGot = ''
        if (thrown) {
          actuallyGot = ' but ' + _.inspect(thrownError) + ' was thrown'
        }

        this.assert(
            thrown === true
          , 'expected #{this} to throw ' + expectedThrown + actuallyGot
          , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
        );
      };

      Assertion.addMethod('throw', assertThrows);
      Assertion.addMethod('throws', assertThrows);
      Assertion.addMethod('Throw', assertThrows);

      Assertion.addMethod('respondTo', function (method, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object')
          , itself = flag(this, 'itself')
          , context = ('function' === typeof obj && !itself)
            ? obj.prototype[method]
            : obj[method];

        this.assert(
            'function' === typeof context
          , 'expected #{this} to respond to ' + _.inspect(method)
          , 'expected #{this} to not respond to ' + _.inspect(method)
        );
      });

      Assertion.addMethod('satisfy', function (matcher, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(
            matcher(obj)
          , 'expected #{this} to satisfy ' + _.inspect(matcher)
          , 'expected #{this} to not satisfy' + _.inspect(matcher)
          , this.negate ? false : true
          , matcher(obj)
        );
      });

      Assertion.addMethod('closeTo', function (expected, delta, msg) {
        if (msg) flag(this, 'message', msg);
        var obj = flag(this, 'object');
        this.assert(
            Math.abs(obj - expected) <= delta
          , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
          , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
        );
      });

    };

  }); // module: chai/core/assertions.js

  require.register("chai/error.js", function(module, exports, require){
  
    module.exports = AssertionError;


    function AssertionError (options) {
      options = options || {};
      this.message = options.message;
      this.actual = options.actual;
      this.expected = options.expected;
      this.operator = options.operator;
      this.showDiff = options.showDiff;

      if (options.stackStartFunction && Error.captureStackTrace) {
        var stackStartFunction = options.stackStartFunction;
        Error.captureStackTrace(this, stackStartFunction);
      }
    }

    AssertionError.prototype = Object.create(Error.prototype);
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.constructor = AssertionError;

    AssertionError.prototype.toString = function() {
      return this.message;
    };

  }); // module: chai/error.js

  require.register("chai/interface/assert.js", function(module, exports, require){


    module.exports = function (chai, util) {

      var Assertion = chai.Assertion
        , flag = util.flag;


      var assert = chai.assert = function (express, errmsg) {
        var test = new Assertion(null);
        test.assert(
            express
          , errmsg
          , '[ negation message unavailable ]'
        );
      };

      assert.fail = function (actual, expected, message, operator) {
        throw new chai.AssertionError({
            actual: actual
          , expected: expected
          , message: message
          , operator: operator
          , stackStartFunction: assert.fail
        });
      };

      assert.ok = function (val, msg) {
        new Assertion(val, msg).is.ok;
      };

      assert.equal = function (act, exp, msg) {
        var test = new Assertion(act, msg);

        test.assert(
            exp == flag(test, 'object')
          , 'expected #{this} to equal #{exp}'
          , 'expected #{this} to not equal #{act}'
          , exp
          , act
        );
      };



      assert.notEqual = function (act, exp, msg) {
        var test = new Assertion(act, msg);

        test.assert(
            exp != flag(test, 'object')
          , 'expected #{this} to not equal #{exp}'
          , 'expected #{this} to equal #{act}'
          , exp
          , act
        );
      };

 

      assert.strictEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.equal(exp);
      };


      assert.notStrictEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.not.equal(exp);
      };


      assert.deepEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.eql(exp);
      };


      assert.notDeepEqual = function (act, exp, msg) {
        new Assertion(act, msg).to.not.eql(exp);
      };


      assert.isTrue = function (val, msg) {
        new Assertion(val, msg).is['true'];
      };


      assert.isFalse = function (val, msg) {
        new Assertion(val, msg).is['false'];
      };

    

      assert.isNull = function (val, msg) {
        new Assertion(val, msg).to.equal(null);
      };

  
      assert.isNotNull = function (val, msg) {
        new Assertion(val, msg).to.not.equal(null);
      };


      assert.isUndefined = function (val, msg) {
        new Assertion(val, msg).to.equal(undefined);
      };

   

      assert.isDefined = function (val, msg) {
        new Assertion(val, msg).to.not.equal(undefined);
      };

   

      assert.isFunction = function (val, msg) {
        new Assertion(val, msg).to.be.a('function');
      };

    

      assert.isNotFunction = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('function');
      };

 

      assert.isObject = function (val, msg) {
        new Assertion(val, msg).to.be.a('object');
      };


      assert.isNotObject = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('object');
      };

      assert.isArray = function (val, msg) {
        new Assertion(val, msg).to.be.an('array');
      };


      assert.isNotArray = function (val, msg) {
        new Assertion(val, msg).to.not.be.an('array');
      };


      assert.isString = function (val, msg) {
        new Assertion(val, msg).to.be.a('string');
      };



      assert.isNotString = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('string');
      };

      assert.isNumber = function (val, msg) {
        new Assertion(val, msg).to.be.a('number');
      };


      assert.isNotNumber = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('number');
      };


      assert.isBoolean = function (val, msg) {
        new Assertion(val, msg).to.be.a('boolean');
      };



      assert.isNotBoolean = function (val, msg) {
        new Assertion(val, msg).to.not.be.a('boolean');
      };


      assert.typeOf = function (val, type, msg) {
        new Assertion(val, msg).to.be.a(type);
      };

 

      assert.notTypeOf = function (val, type, msg) {
        new Assertion(val, msg).to.not.be.a(type);
      };

      assert.instanceOf = function (val, type, msg) {
        new Assertion(val, msg).to.be.instanceOf(type);
      };


      assert.notInstanceOf = function (val, type, msg) {
        new Assertion(val, msg).to.not.be.instanceOf(type);
      };


      assert.include = function (exp, inc, msg) {
        var obj = new Assertion(exp, msg);

        if (Array.isArray(exp)) {
          obj.to.include(inc);
        } else if ('string' === typeof exp) {
          obj.to.contain.string(inc);
        }
      };

 
      assert.match = function (exp, re, msg) {
        new Assertion(exp, msg).to.match(re);
      };


      assert.notMatch = function (exp, re, msg) {
        new Assertion(exp, msg).to.not.match(re);
      };

  
      assert.property = function (obj, prop, msg) {
        new Assertion(obj, msg).to.have.property(prop);
      };


      assert.notProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.property(prop);
      };



      assert.deepProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop);
      };

 
      assert.notDeepProperty = function (obj, prop, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop);
      };

  

      assert.propertyVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.property(prop, val);
      };


      assert.propertyNotVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.property(prop, val);
      };

      assert.deepPropertyVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.have.deep.property(prop, val);
      };

      assert.deepPropertyNotVal = function (obj, prop, val, msg) {
        new Assertion(obj, msg).to.not.have.deep.property(prop, val);
      };

      assert.lengthOf = function (exp, len, msg) {
        new Assertion(exp, msg).to.have.length(len);
      };


      assert.Throw = function (fn, errt, errs, msg) {
        if ('string' === typeof errt || errt instanceof RegExp) {
          errs = errt;
          errt = null;
        }

        new Assertion(fn, msg).to.Throw(errt, errs);
      };


      assert.doesNotThrow = function (fn, type, msg) {
        if ('string' === typeof type) {
          msg = type;
          type = null;
        }

        new Assertion(fn, msg).to.not.Throw(type);
      };


      assert.operator = function (val, operator, val2, msg) {
        if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
          throw new Error('Invalid operator "' + operator + '"');
        }
        var test = new Assertion(eval(val + operator + val2), msg);
        test.assert(
            true === flag(test, 'object')
          , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
          , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
      };


      assert.closeTo = function (act, exp, delta, msg) {
        new Assertion(act, msg).to.be.closeTo(exp, delta);
      };

      assert.ifError = function (val, msg) {
        new Assertion(val, msg).to.not.be.ok;
      };

      (function alias(name, as){
        assert[as] = assert[name];
        return alias;
      })
      ('Throw', 'throw')
      ('Throw', 'throws');
    };

  }); // module: chai/interface/assert.js

  require.register("chai/interface/expect.js", function(module, exports, require){

    module.exports = function (chai, util) {
      chai.expect = function (val, message) {
        return new chai.Assertion(val, message);
      };
    };


  }); // module: chai/interface/expect.js

  require.register("chai/interface/should.js", function(module, exports, require){

    module.exports = function (chai, util) {
      var Assertion = chai.Assertion;

      function loadShould () {
        // modify Object.prototype to have `should`
        Object.defineProperty(Object.prototype, 'should',
          {
            set: function (value) {
              // See https://github.com/chaijs/chai/issues/86: this makes
              // `whatever.should = someValue` actually set `someValue`, which is
              // especially useful for `global.should = require('chai').should()`.
              //
              // Note that we have to use [[DefineProperty]] instead of [[Put]]
              // since otherwise we would trigger this very setter!
              Object.defineProperty(this, 'should', {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
              });
            }
          , get: function(){
              if (this instanceof String || this instanceof Number) {
                return new Assertion(this.constructor(this));
              } else if (this instanceof Boolean) {
                return new Assertion(this == true);
              }
              return new Assertion(this);
            }
          , configurable: true
        });

        var should = {};

        should.equal = function (val1, val2, msg) {
          new Assertion(val1, msg).to.equal(val2);
        };

        should.Throw = function (fn, errt, errs, msg) {
          new Assertion(fn, msg).to.Throw(errt, errs);
        };

        should.exist = function (val, msg) {
          new Assertion(val, msg).to.exist;
        }

        // negation
        should.not = {}

        should.not.equal = function (val1, val2, msg) {
          new Assertion(val1, msg).to.not.equal(val2);
        };

        should.not.Throw = function (fn, errt, errs, msg) {
          new Assertion(fn, msg).to.not.Throw(errt, errs);
        };

        should.not.exist = function (val, msg) {
          new Assertion(val, msg).to.not.exist;
        }

        should['throw'] = should['Throw'];
        should.not['throw'] = should.not['Throw'];

        return should;
      };

      chai.should = loadShould;
      chai.Should = loadShould;
    };

  }); // module: chai/interface/should.js

  require.register("chai/utils/addChainableMethod.js", function(module, exports, require){

    var transferFlags = require('./transferFlags');


    module.exports = function (ctx, name, method, chainingBehavior) {
      if (typeof chainingBehavior !== 'function')
        chainingBehavior = function () { };

      Object.defineProperty(ctx, name,
        { get: function () {
            chainingBehavior.call(this);

            var assert = function () {
              var result = method.apply(this, arguments);
              return result === undefined ? this : result;
            };

            // Re-enumerate every time to better accomodate plugins.
            var asserterNames = Object.getOwnPropertyNames(ctx);
            asserterNames.forEach(function (asserterName) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName)
                , functionProtoPD = Object.getOwnPropertyDescriptor(Function.prototype, asserterName);
              // Avoid trying to overwrite things that we can't, like `length` and `arguments`.
              if (functionProtoPD && !functionProtoPD.configurable) return;
              if (asserterName === 'arguments') return; // @see chaijs/chai/issues/69
              Object.defineProperty(assert, asserterName, pd);
            });

            transferFlags(this, assert);
            return assert;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/addChainableMethod.js

  require.register("chai/utils/addMethod.js", function(module, exports, require){
   
    module.exports = function (ctx, name, method) {
      ctx[name] = function () {
        var result = method.apply(this, arguments);
        return result === undefined ? this : result;
      };
    };

  }); // module: chai/utils/addMethod.js

  require.register("chai/utils/addProperty.js", function(module, exports, require){
   

    module.exports = function (ctx, name, getter) {
      Object.defineProperty(ctx, name,
        { get: function () {
            var result = getter.call(this);
            return result === undefined ? this : result;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/addProperty.js

  require.register("chai/utils/eql.js", function(module, exports, require){
    // This is (almost) directly from Node.js assert
    // https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/assert.js

    module.exports = _deepEqual;

    // for the browser
    var Buffer;
    try {
      Buffer = require('buffer').Buffer;
    } catch (ex) {
      Buffer = {
        isBuffer: function () { return false; }
      };
    }

    function _deepEqual(actual, expected, memos) {

      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
        if (actual.length != expected.length) return false;

        for (var i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i]) return false;
        }

        return true;

      // 7.2. If the expected value is a Date object, the actual value is
      // equivalent if it is also a Date object that refers to the same time.
      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual === expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected, memos);
      }
    }

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isArguments(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b, memos) {
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;

      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;

      // check if we have already compared a and b
      var i;
      if (memos) {
        for(i = 0; i < memos.length; i++) {
          if ((memos[i][0] === a && memos[i][1] === b) ||
              (memos[i][0] === b && memos[i][1] === a))
            return true;
        }
      } else {
        memos = [];
      }

      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b, memos);
      }
      try {
        var ka = Object.keys(a),
            kb = Object.keys(b),
            key;
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }

      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;

      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }

      // remember objects we have compared to guard against circular references
      memos.push([ a, b ]);

      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqual(a[key], b[key], memos)) return false;
      }

      return true;
    }

  }); // module: chai/utils/eql.js

  require.register("chai/utils/flag.js", function(module, exports, require){
  

    module.exports = function (obj, key, value) {
      var flags = obj.__flags || (obj.__flags = Object.create(null));
      if (arguments.length === 3) {
        flags[key] = value;
      } else {
        return flags[key];
      }
    };

  }); // module: chai/utils/flag.js

  require.register("chai/utils/getActual.js", function(module, exports, require){
  

    module.exports = function (obj, args) {
      var actual = args[4];
      return 'undefined' !== typeof actual ? actual : obj._obj;
    };

  }); // module: chai/utils/getActual.js

  require.register("chai/utils/getMessage.js", function(module, exports, require){
  

    var flag = require('./flag')
      , getActual = require('./getActual')
      , inspect = require('./inspect')
      , objDisplay = require('./objDisplay');


    module.exports = function (obj, args) {
      var negate = flag(obj, 'negate')
        , val = flag(obj, 'object')
        , expected = args[3]
        , actual = getActual(obj, args)
        , msg = negate ? args[2] : args[1]
        , flagMsg = flag(obj, 'message');

      msg = msg || '';
      msg = msg
        .replace(/#{this}/g, objDisplay(val))
        .replace(/#{act}/g, objDisplay(actual))
        .replace(/#{exp}/g, objDisplay(expected));

      return flagMsg ? flagMsg + ': ' + msg : msg;
    };

  }); // module: chai/utils/getMessage.js

  require.register("chai/utils/getName.js", function(module, exports, require){
   

    module.exports = function (func) {
      if (func.name) return func.name;

      var match = /^\s?function ([^(]*)\(/.exec(func);
      return match && match[1] ? match[1] : "";
    };

  }); // module: chai/utils/getName.js

  require.register("chai/utils/getPathValue.js", function(module, exports, require){
 

    var getPathValue = module.exports = function (path, obj) {
      var parsed = parsePath(path);
      return _getPathValue(parsed, obj);
    };

   
    function parsePath (path) {
      var str = path.replace(/\[/g, '.[')
        , parts = str.match(/(\\\.|[^.]+?)+/g);
      return parts.map(function (value) {
        var re = /\[(\d+)\]$/
          , mArr = re.exec(value)
        if (mArr) return { i: parseFloat(mArr[1]) };
        else return { p: value };
      });
    };

  

    function _getPathValue (parsed, obj) {
      var tmp = obj
        , res;
      for (var i = 0, l = parsed.length; i < l; i++) {
        var part = parsed[i];
        if (tmp) {
          if ('undefined' !== typeof part.p)
            tmp = tmp[part.p];
          else if ('undefined' !== typeof part.i)
            tmp = tmp[part.i];
          if (i == (l - 1)) res = tmp;
        } else {
          res = undefined;
        }
      }
      return res;
    };

  }); // module: chai/utils/getPathValue.js

  require.register("chai/utils/index.js", function(module, exports, require){
  
    var exports = module.exports = {};


    exports.test = require('./test');


    exports.getMessage = require('./getMessage');

    exports.getActual = require('./getActual');


    exports.inspect = require('./inspect');

    exports.objDisplay = require('./objDisplay');

    exports.flag = require('./flag');


    exports.transferFlags = require('./transferFlags');

  

    exports.eql = require('./eql');

    exports.getPathValue = require('./getPathValue');

    exports.getName = require('./getName');

    exports.addProperty = require('./addProperty');


    exports.addMethod = require('./addMethod');

    exports.overwriteProperty = require('./overwriteProperty');

    exports.overwriteMethod = require('./overwriteMethod');

    exports.addChainableMethod = require('./addChainableMethod');


  }); // module: chai/utils/index.js

  require.register("chai/utils/inspect.js", function(module, exports, require){
    // This is (almost) directly from Node.js utils
    // https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

    var getName = require('./getName');

    module.exports = inspect;


    function inspect(obj, showHidden, depth, colors) {
      var ctx = {
        showHidden: showHidden,
        seen: [],
        stylize: function (str) { return str; }
      };
      return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
    }

    // https://gist.github.com/1044128/
    var getOuterHTML = function(element) {
      if ('outerHTML' in element) return element.outerHTML;
      var ns = "http://www.w3.org/1999/xhtml";
      var container = document.createElementNS(ns, '_');
      var elemProto = (window.HTMLElement || window.Element).prototype;
      var xmlSerializer = new XMLSerializer();
      var html;
      if (document.xmlVersion) {
        return xmlSerializer.serializeToString(element);
      } else {
        container.appendChild(element.cloneNode(false));
        html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
        container.innerHTML = '';
        return html;
      }
    };
      
    // Returns true if object is a DOM element.
    var isDOMElement = function (object) {
      if (typeof HTMLElement === 'object') {
        return object instanceof HTMLElement;
      } else {
        return object &&
          typeof object === 'object' &&
          object.nodeType === 1 &&
          typeof object.nodeName === 'string';
      }
    };

    function formatValue(ctx, value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (value && typeof value.inspect === 'function' &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        return value.inspect(recurseTimes);
      }

      // Primitive types cannot have properties
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }

      // If it's DOM elem, get outer HTML.
      if (isDOMElement(value)) {
        return getOuterHTML(value);
      }

      // Look up the keys of the object.
      var visibleKeys = Object.keys(value);
      var keys = ctx.showHidden ? Object.getOwnPropertyNames(value) : visibleKeys;

      // Some type of object without properties can be shortcutted.
      // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
      // a `stack` plus `description` property; ignore those for consistency.
      if (keys.length === 0 || (isError(value) && (
          (keys.length === 1 && keys[0] === 'stack') ||
          (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
         ))) {
        if (typeof value === 'function') {
          var name = getName(value);
          var nameSuffix = name ? ': ' + name : '';
          return ctx.stylize('[Function' + nameSuffix + ']', 'special');
        }
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        }
        if (isDate(value)) {
          return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
        }
        if (isError(value)) {
          return formatError(value);
        }
      }

      var base = '', array = false, braces = ['{', '}'];

      // Make Array say that they are Array
      if (isArray(value)) {
        array = true;
        braces = ['[', ']'];
      }

      // Make functions say that they are functions
      if (typeof value === 'function') {
        var name = getName(value);
        var nameSuffix = name ? ': ' + name : '';
        base = ' [Function' + nameSuffix + ']';
      }

      // Make RegExps say that they are RegExps
      if (isRegExp(value)) {
        base = ' ' + RegExp.prototype.toString.call(value);
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + Date.prototype.toUTCString.call(value);
      }

      // Make error with message first say the error
      if (isError(value)) {
        return formatError(value);
      }

      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
        } else {
          return ctx.stylize('[Object]', 'special');
        }
      }

      ctx.seen.push(value);

      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }

      ctx.seen.pop();

      return reduceToSingleString(output, base, braces);
    }


    function formatPrimitive(ctx, value) {
      switch (typeof value) {
        case 'undefined':
          return ctx.stylize('undefined', 'undefined');

        case 'string':
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                   .replace(/'/g, "\\'")
                                                   .replace(/\\"/g, '"') + '\'';
          return ctx.stylize(simple, 'string');

        case 'number':
          return ctx.stylize('' + value, 'number');

        case 'boolean':
          return ctx.stylize('' + value, 'boolean');
      }
      // For some reason typeof null is "object", so special case here.
      if (value === null) {
        return ctx.stylize('null', 'null');
      }
    }


    function formatError(value) {
      return '[' + Error.prototype.toString.call(value) + ']';
    }


    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (Object.prototype.hasOwnProperty.call(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              String(i), true));
        } else {
          output.push('');
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
              key, true));
        }
      });
      return output;
    }


    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Getter/Setter]', 'special');
          } else {
            str = ctx.stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = ctx.stylize('[Setter]', 'special');
          }
        }
      }
      if (visibleKeys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (ctx.seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = formatValue(ctx, value[key], null);
          } else {
            str = formatValue(ctx, value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (array) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = ctx.stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = ctx.stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    }


    function reduceToSingleString(output, base, braces) {
      var numLinesEst = 0;
      var length = output.reduce(function(prev, cur) {
        numLinesEst++;
        if (cur.indexOf('\n') >= 0) numLinesEst++;
        return prev + cur.length + 1;
      }, 0);

      if (length > 60) {
        return braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];
      }

      return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    function isArray(ar) {
      return Array.isArray(ar) ||
             (typeof ar === 'object' && objectToString(ar) === '[object Array]');
    }

    function isRegExp(re) {
      return typeof re === 'object' && objectToString(re) === '[object RegExp]';
    }

    function isDate(d) {
      return typeof d === 'object' && objectToString(d) === '[object Date]';
    }

    function isError(e) {
      return typeof e === 'object' && objectToString(e) === '[object Error]';
    }

    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }

  }); // module: chai/utils/inspect.js

  require.register("chai/utils/objDisplay.js", function(module, exports, require){
  
    module.exports = function (obj) {
      var str = inspect(obj)
        , type = Object.prototype.toString.call(obj);

      if (str.length >= 40) {
        if (type === '[object Array]') {
          return '[ Array(' + obj.length + ') ]';
        } else if (type === '[object Object]') {
          var keys = Object.keys(obj)
            , kstr = keys.length > 2
              ? keys.splice(0, 2).join(', ') + ', ...'
              : keys.join(', ');
          return '{ Object (' + kstr + ') }';
        } else {
          return str;
        }
      } else {
        return str;
      }
    };

  }); // module: chai/utils/objDisplay.js

  require.register("chai/utils/overwriteMethod.js", function(module, exports, require){
 
    module.exports = function (ctx, name, method) {
      var _method = ctx[name]
        , _super = function () { return this; };

      if (_method && 'function' === typeof _method)
        _super = _method;

      ctx[name] = function () {
        var result = method(_super).apply(this, arguments);
        return result === undefined ? this : result;
      }
    };

  }); // module: chai/utils/overwriteMethod.js

  require.register("chai/utils/overwriteProperty.js", function(module, exports, require){
   
    module.exports = function (ctx, name, getter) {
      var _get = Object.getOwnPropertyDescriptor(ctx, name)
        , _super = function () {};

      if (_get && 'function' === typeof _get.get)
        _super = _get.get

      Object.defineProperty(ctx, name,
        { get: function () {
            var result = getter(_super).call(this);
            return result === undefined ? this : result;
          }
        , configurable: true
      });
    };

  }); // module: chai/utils/overwriteProperty.js

  require.register("chai/utils/test.js", function(module, exports, require){


    var flag = require('./flag');


    module.exports = function (obj, args) {
      var negate = flag(obj, 'negate')
        , expr = args[0];
      return negate ? !expr : expr;
    };

  }); // module: chai/utils/test.js

  require.register("chai/utils/transferFlags.js", function(module, exports, require){
 
    module.exports = function (assertion, object, includeAll) {
      var flags = assertion.__flags || (assertion.__flags = Object.create(null));

      if (!object.__flags) {
        object.__flags = Object.create(null);
      }

      includeAll = arguments.length === 3 ? includeAll : true;

      for (var flag in flags) {
        if (includeAll ||
            (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
          object.__flags[flag] = flags[flag];
        }
      }
    };

  }); // module: chai/utils/transferFlags.js

  require.alias("./chai.js", "chai");

  return require('chai');
});
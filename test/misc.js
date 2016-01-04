var assert = require('assert');

var misc = require('../misc.js');

describe('miscellaneous utilities', function() {
  describe('distinct map', function() {
    it('should sort items by the correct key', function() {
      assert.deepEqual(misc.distinctMap('item', [
        { name: 'Alice', item: 'cookies', quantity: 12 },
        { name: 'Bob', item: 'muffins', quantity: 5 },
        { name: 'Carol', item: 'muffins', quantity: 7 },
      ]), {
        'cookies': [{ name: 'Alice', item: 'cookies', quantity: 12 }],
        'muffins': [
          { name: 'Bob', item: 'muffins', quantity: 5 },
          { name: 'Carol', item: 'muffins', quantity: 7 },
        ],
      }, 'not purging key');

      assert.deepEqual(misc.distinctMap('item', [
        { name: 'Alice', item: 'cookies', quantity: 12 },
        { name: 'Bob', item: 'muffins', quantity: 5 },
        { name: 'Carol', item: 'muffins', quantity: 7 },
      ], true), {
        'cookies': [{ name: 'Alice', quantity: 12 }],
        'muffins': [
          { name: 'Bob', quantity: 5 },
          { name: 'Carol', quantity: 7 },
        ],
      }, 'purging key');
    });

    it('should sort items by a function', function() {
      assert.deepEqual(misc.distinctMap(function(order) {
        return order.item + ' ' + order.type;
      }, [
        { name: 'Alice', item: 'cookies', type: 'with sauce', quantity: 12 },
        { name: 'Bob', item: 'muffins', type: 'with butter', quantity: 5 },
        { name: 'Carol', item: 'muffins', type: 'with sauce',  quantity: 7 },
        { name: 'Dave', item: 'muffins', type: 'with butter', quantity: 6 },
      ]), {
        'cookies with sauce': [
          { name: 'Alice', item: 'cookies', type: 'with sauce', quantity: 12 },
        ],
        'muffins with butter': [
          { name: 'Bob', item: 'muffins', type: 'with butter', quantity: 5 },
          { name: 'Dave', item: 'muffins', type: 'with butter', quantity: 6 },
        ],
        'muffins with sauce': [
          { name: 'Carol', item: 'muffins', type: 'with sauce',  quantity: 7 },
        ],
      });
    });

    it('should work with undefined values', function() {
      assert.deepEqual(misc.distinctMap('foo', [
        { foo: 'hello' },
        { bar: 12 },
        { baz: 15 },
      ]), {
        hello: [{ foo: 'hello' }],
        // undefined is a perfectly valid key. Interesting...
        undefined: [
          { bar: 12 },
          { baz: 15 },
        ],
      }, 'undefined values');

      assert.deepEqual(misc.distinctMap('foo', [
        { foo: 'hello' },
        { bar: 12 },
        { baz: 15 },
      ], true), {
        // Last key was deleted
        hello: [{}],
        // Deleting a nonexistent key should do nothing
        undefined: [
          { bar: 12 },
          { baz: 15 },
        ],
      }, 'undefined values');
    });

    it('should work with empty lists', function() {
      assert.deepEqual(misc.distinctMap('foo', []), {}, 'empty object list');
      assert.deepEqual(misc.distinctMap('foo', [], true), {}, 'empty object list');
    });
  });
});

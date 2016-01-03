var expect = require('@quarterto/chai');
var sinon  = require('sinon');

var computed = require('./');

describe('computed decorator', () => {
	describe('called incorrectly', () => {
		it('should barf when not called', () => {
			expect(() => {
				class a {
					@computed
					a() {}
				}
			}).to.throw('@computed(...deps) must be called with arguments');
		});

		it('should barf when called with no args', () => {
			expect(() => {
				class a {
					@computed()
					a() {}
				}
			}).to.throw('@computed(...deps) requires a non-empty list of dependencies');
		});

		it('should barf when used incorrectly on non-method', () => {
			expect(() => {
				@computed
				class a {}
			}).to.throw('@computed(...deps) can only annotate methods and must be called with arguments');
		});

		it('should barf when used on non-method', () => {
			expect(() => {
				@computed()
				class a {}
			}).to.throw('@computed(...deps) can only annotate methods');
		});
	});
});

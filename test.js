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

	it('should cache simple results', () => {
		var s = sinon.spy();

		class A {
			a = 5;

			@computed('a')
			b() {
				s();
				return this.a * 5;
			}
		}

		var a = new A;
		expect(a.b()).to.equal(25);
		expect(a.b()).to.equal(25);
		expect(s).to.have.been.calledOnce();
	});

	it('should invalidate cache when static dependency changes', () => {
		class A {
			a = 5;

			@computed('a')
			b() {
				return this.a * 5;
			}
		}

		var a = new A;
		expect(a.b()).to.equal(25);
		a.a = 6;
		expect(a.b()).to.equal(30);
	});

	it('should be independent across instances', () => {
		class A {
			a = 5;

			@computed('a')
			b() {
				return this.a * 5;
			}
		}

		var a = new A;
		var b = new A;
		expect(a.b()).to.equal(25);
		expect(b.b()).to.equal(25);
		a.a = 6;
		expect(a.b()).to.equal(30);
		expect(b.b()).to.equal(25);
	});

});

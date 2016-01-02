var computed = require('./');

class Foo {
  a = 5;

  @computed('a')
  b() {
    console.log('b');
    return this.a * 5;
  }

  @computed('b')
  c() {
    console.log('c');
    return this.b() * 5;
  }

  @computed('b', 'c')
  d() {
    console.log('d');
    return this.b() + this.c();
  }
}

var foo = new Foo;
console.log(foo.b());
console.log(foo.c());
console.log(foo.d());

foo.a = 6;
console.log(foo.d());

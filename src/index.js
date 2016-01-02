var tdep = require('@quarterto/transitive-dependencies');

var methodDepsStore = new WeakMap();
var resultsMapStore = new WeakMap();

module.exports = function computed(...deps) {
	return function(target, name, descriptor) {
		var Class = target.constructor;
		var orig = descriptor.value;

		var methodDeps = methodDepsStore.get(Class);
		if(!methodDeps) {
			methodDepsStore.set(Class, methodDeps = []);
		}

		var values = [];

		deps.forEach(dep => {
			methodDeps.push([name, dep]);
			if(typeof target[dep] !== 'function') {
				values.push(dep);
				resultsMap.set(dep, target[dep]);
			}
		});

		var tdeps;

		descriptor.value = function() {
			if(!tdeps) tdeps = tdep(methodDeps, name);
			var resultsMap = resultsMapStore.get(this);
			if(!resultsMap) {
				resultsMapStore.set(this, new Map());
			}

			// yes, rerun the deps here. worst case, the cache will be fresh when orig is run
			var storedValid = resultsMap.has(name) && tdeps.every(dep => resultsMap.get(dep) === this[dep]());
			if(!storedValid) {
				var result = orig.call(this);
				resultsMap.set(name, result);
				return result;
			}

			return resultsMap.get(name);
		};
	};
};

var tdep = require('@quarterto/transitive-dependencies');

var methodDepsStore = new WeakMap();
var resultsMapStore = new WeakMap();
var staticResultsStore = new WeakMap();

var getOrCall = (that, key) => typeof that[key] === 'function' ? that[key]() : that[key];

module.exports = function computed(...deps) {
	return function(target, name, descriptor) {
		var Class = target.constructor;
		var orig = descriptor.value;

		var methodDeps = methodDepsStore.get(Class);
		if(!methodDeps) {
			methodDepsStore.set(Class, methodDeps = []);
		}

		var values = [];
		var staticResults = staticResultsStore.get(Class);
		if(!staticResults) {
			staticResultsStore.set(Class, staticResults = new Map());
		}

		deps.forEach(dep => {
			methodDeps.push([name, dep]);
			if(typeof target[dep] !== 'function') {
				values.push(dep);
				staticResults.set(dep, target[dep]);
			}
		});

		var tdeps;

		descriptor.value = function() {
			if(!tdeps) tdeps = tdep(methodDeps, name);
			var resultsMap = resultsMapStore.get(this);
			if(!resultsMap) {
				resultsMapStore.set(this, resultsMap = staticResults);
			}

			// yes, rerun the deps here. worst case, the cache will be fresh when orig is run
			var storedValid = resultsMap.has(name) && tdeps.every(dep => resultsMap.get(dep) === getOrCall(this, dep));
			if(!storedValid) {
				var result = orig.call(this);
				resultsMap.set(name, result);
				return result;
			}

			return resultsMap.get(name);
		};
	};
};

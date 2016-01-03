var tdep = require('@quarterto/transitive-dependencies');
var invertGraph = require('@quarterto/invert-graph');

var methodDepsStore = new WeakMap();
var resultsMapStore = new WeakMap();
var valueKeysStore = new WeakMap();

var getOrCall = (that, key) => typeof that[key] === 'function' ? that[key]() : that[key];

module.exports = function computed(...deps) {
	switch(typeof deps[0]) {
	case 'object':   throw new TypeError('@computed(...deps) must be called with arguments');
	case 'function': throw new TypeError('@computed(...deps) can only annotate methods and must be called with arguments');
	}

	return function(target, name, descriptor) {
		if(typeof target === 'function') throw new TypeError('@computed(...deps) can only annotate methods');
		if(deps.length === 0) throw new TypeError('@computed(...deps) requires a non-empty list of dependencies');

		var Class = target.constructor;
		var orig = descriptor.value;

		var methodDeps = methodDepsStore.get(Class);
		if(!methodDeps) {
			methodDepsStore.set(Class, methodDeps = []);
		}

		var valueKeys = valueKeysStore.get(Class);
		if(!valueKeys) {
			valueKeysStore.set(Class, valueKeys = new Set());
		}

		deps.forEach(dep => {
			methodDeps.push([name, dep]);
			if(typeof target[dep] !== 'function') {
				valueKeys.add(dep);
			}
		});

		var tdeps;

		descriptor.value = function() {
			if(!tdeps) tdeps = tdep(methodDeps, name);

			var resultsMap = resultsMapStore.get(this);
			if(!resultsMap) {
				resultsMapStore.set(this, resultsMap = new Map());
			}

			var storedValid = resultsMap.has(name) && tdeps
				.filter(dep => valueKeys.has(dep))
				.every (dep => {
					var unchanged = resultsMap.get(dep) === this[dep];
					if(!unchanged) {
						resultsMap.set(dep, this[dep]);
						tdep(invertGraph(methodDeps), dep).forEach(dependent => {
							resultsMap.delete(dependent);
						});
					}
					return unchanged;
				});

			
			if(!storedValid) {
				var result = orig.call(this);
				resultsMap.set(name, result);
				return result;
			}

			return resultsMap.get(name);
		};
	};
};


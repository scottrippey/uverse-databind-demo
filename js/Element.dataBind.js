(function(){
	Element.implement({
		dataBind: function(data, helper) {
			var el = this;

			var dataBindings = el.retrieve('$dataBindings');
			if (!dataBindings) {
				dataBindings = createDataBindings(el);
				el.store('$dataBindings', dataBindings);
			}

			dataBindings.each(function(dataBinding) {
				dataBinding(data, helper);
			});
		}
	});

	function createDataBindings(el) {
		var dataBoundEls = el.getElements('[data-bind]');
		if (el.match('[data-bind]'))
			dataBoundEls.push(el);

		var dataBindings = dataBoundEls.map(function(el) {
			var dataBindAttribute = el.get('data-bind');
			var compiled = createDataBindingFunction(dataBindAttribute);
			return compiled.bind(el);
		});
		return dataBindings;
	}


	/**
	 * Parses the data-bind attribute into an actual function.
	 * This method supports 2 syntaxes:
	 * 1. JavaScript - simply write full javascript code
	 *      Example: data-bind="this.set('text', 'Hello');"
	 * 2. JSON - this is simply a shortcut for this.set(...)
	 *      Example: data-bind="{ text: 'Hello' }"
	 * @param dataBindAttribute
	 * @returns {Function}
	 */
	function createDataBindingFunction(dataBindAttribute) {{
		if (dataBindAttribute.match(/^\s*\{/))
			dataBindAttribute = "this.set(#)".replace("#", dataBindAttribute)
		}
		var dataBindFn = new Function('data', 'helper', dataBindAttribute);
		return dataBindFn;
	}
})();

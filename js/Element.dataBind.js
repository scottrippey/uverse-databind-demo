(function(){
	Element.implement({
		/**
		 *
		 * @param {*} data
		 * @param {*} [helper]
		 * @param {Number} [index]
		 * @param {Number} [remaining]
		 * @returns {Element}
		 */
		dataBind: function(data, helper, index, remaining) {
			var dataBinding = getDataBinding(this);
			dataBinding(data, helper, index, remaining);
			return this;
		}
	});

	function getDataBinding(el) {
		var cachedDataBinding = el.retrieve('$dataBinding');
		if (cachedDataBinding) {
			return cachedDataBinding;
		}

		var dataBindings = [];

		var repeater;
		while (repeater = el.getElement('[data-bind-repeat]')) {
			var repeaterBinding = createDataRepeaterFunction(repeater);
			dataBindings.push(repeaterBinding);
			repeater.set('data-bind-repeat', null);
		}

		var dataBoundEls = el.getElements('[data-bind]');
		if (el.match('[data-bind]'))
			dataBoundEls.push(el);

		dataBoundEls.each(function(el) {
			var dataBindingFunction = createDataBindingFunction(el);
			dataBindings.push(dataBindingFunction);
		});

		var dataBinding = function(data, helper, index, remaining) {
			Array.each(dataBindings, function(binding) {
				binding(data, helper, index, remaining);
			});
		};

		el.store('$dataBinding', dataBinding);

		return dataBinding;
	}


	/**
	 * Parses the data-bind attribute into an actual function.
	 * This method supports 2 syntaxes:
	 * 1. JavaScript - simply write full javascript code
	 *      Example: data-bind="this.set('text', 'Hello');"
	 * 2. JSON - this is simply a shortcut for this.set(...)
	 *      Example: data-bind="{ text: 'Hello' }"
	 * @param el
	 * @returns {Function}
	 */
	function createDataBindingFunction(el) {{
		var dataBindAttribute = el.get('data-bind');
		if (dataBindAttribute.match(/^\s*\{/))
			dataBindAttribute = "this.set(#)".replace("#", dataBindAttribute)
		}
		var dataBindFn = new Function('data', 'helper', 'index', 'remaining', dataBindAttribute);
		return dataBindFn.bind(el);
	}

	function createDataRepeaterFunction(repeater) {
		var dataBindRepeatAttribute = repeater.get('data-bind-repeat');
		var functionText = "return #;".replace("#", dataBindRepeatAttribute);
		var getItems = new Function('data', 'helper', 'index', 'remaining', functionText);

		var repeaterTemplate = repeater.getChildren().dispose();
		var repeaterItems = [];
		var repeaterBinding = function(data, helper, index, remaining) {
			var items = getItems(data, helper, index, remaining);
			for (var itemIndex = 0, length = Math.max(items.length, repeaterItems.length); itemIndex < length; itemIndex++) {
				if (itemIndex >= items.length) {
					repeaterItems.pop().dispose();
					continue;
				}

				var repeaterItem;
				if (itemIndex < repeaterItems.length) {
					repeaterItem = repeaterItems[itemIndex];
				} else {
					var clonedElements = new Elements(repeaterTemplate.map(function(el) { return el.clone(); }));
					repeaterItem = clonedElements;
					repeater.adopt(repeaterItem);
					repeaterItems.push(repeaterItem);
				}

				var item = items[itemIndex], itemsRemaining = (items.length - 1 - itemIndex);

				repeaterItem.each(function(el) { el.dataBind(item, helper, itemIndex, itemsRemaining); });
			}
		};

		return repeaterBinding;
	}
})();

/**
 * EasyBind 1.4.2
 *
 * EasyBind: a very simple yet powerful one-way data-binding framework.
 * Created by Scott Rippey.
 *
 * Changelog:
 * 1.4.2 - Invented EasyBind framework
 * 1.4.1 - Never existed.  I just thought that a non-trivial version number sounded good.
 *
 * If you've read this far, you've probably figured out that
 * this isn't an open-source framework, it's just something
 * that I whipped up in a day.
 * Then, I decided to give it a catchy name, so that you'd
 * never catch on to my shenanegans.  But it looks like you've
 * bested me.  Well done.
 *
 */

(function(){
	Element.implement({
		/**
		 *
		 * @param {*} data
		 * @param {*} [helper]
		 * @param {*[]} [scope]
		 * @param {Number} [index]
		 * @param {Number} [remaining]
		 * @returns {Element}
		 */
		easyBind: function(data, helper, index, remaining) {
			var dataBinding = getEasyBinding(this);
			dataBinding(data, helper, index, remaining);
			return this;
		}
		,
		getClosest: function(matchingSelector, context) {
			var el = this;
			while (el && !el.match(matchingSelector)) {
				if (el === context)
					return null;
				el = el.getParent();
			}
			return el;
		}
		,
		show: function() {
			this.setStyles({ display: null });
		}
		,
		hide: function() {
			this.setStyles({ display: 'none' });
		}
		,
		toggle: function(force) {
			if (force === undefined) {
				force = (this.getStyle('display') === 'none');
			}
			if (force)
				this.show();
			else
				this.hide();
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
		var dataBindFn = new Function('data', 'helper', 'scope', 'index', 'remaining', dataBindAttribute);
		return dataBindFn.bind(el);
	}

	function createDataRepeaterFunction(repeater) {
		var dataBindRepeatAttribute = repeater.get('data-bind-repeat');
		var functionText = "return #;".replace("#", dataBindRepeatAttribute);
		var getItems = new Function('data', 'helper', 'scope', 'index', 'remaining', functionText);

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


	function getEasyBinding(el) {
		var cachedEasyBinding = el.retrieve('$easyBinding');
		if (cachedEasyBinding) {
			return cachedEasyBinding;
		}

		var boundEls = el.getElements('[data-bind],[data-bind-repeat]');
		if (el.match('[data-bind],[data-bind-repeat]')) {
			boundEls.push(el);
		}

		var unnestedBoundEls = boundEls.filter(function(boundEl) {
			var isNested = (boundEl.getClosest('[data-bind-repeat]', el) === el);
			return isNested;
		});

		var bindings = [];
		unnestedBoundEls.each(function(boundEl) {
			var bindRepeatText, bindText, binding;
			if (bindRepeatText = boundEl.get('data-bind-repeat')) {
				binding = createDataRepeaterBinding(boundEl, bindRepeatText);
				bindings.push(binding);
			} else if (bindText = boundEl.get('data-bind')) {
				binding = createDataBinding(boundEl, bindText);
				bindings.push(binding);
			}
		});

		var easyBinding = function(data, helper, index, remaining) {
			bindings.each(function(binding){
				binding(data, helper, index, remaining);
			});
		};
		el.store('$easyBinding', easyBinding);
		return easyBinding;
	}

	function createDataBinding(boundEl, bindText) {
		var isJsonSyntax = bindText.match(/^\s*\{/);
		if (isJsonSyntax)
			bindText = "this.set(#);".replace("#", bindText);
		var binding = new Function('data', 'helper', 'scope', 'index', 'remaining', bindText);
		return binding.bind(boundEl);
	}
	function createDataRepeaterBinding(repeaterEl, bindRepeatText) {
		var hasReturnStatement = bindRepeatText.match(/\breturn\s/);
		if (!hasReturnStatement)
			bindRepeatText = "return #;".replace("#", bindRepeatText);
		var getItems = new Function('data', 'helper', 'scope', 'index', 'remaining', bindRepeatText);

		var repeaterTemplate = repeaterEl.clone();
		var previousItems = [ repeaterEl ];
		var repeaterBinding = function(data, helper, index, remaining) {
			var items = getItems(data, helper, index, remaining);
			for (var itemIndex = 0, length = Math.max(items.length, previousItems.length); itemIndex < length; itemIndex++) {
				if (itemIndex >= items.length) {
					if (previousItems.length === 1) {
						// We must keep the last one,
						// so that we don't lose the DOM insertion point
						previousItems[0].hide();
					} else {
						previousItems.pop().dispose();
					}
					continue;
				}

				var repeaterItem;
				if (itemIndex < previousItems.length) {
					if (previousItems.length === 1) {
						previousItems[0].show();
					}
					repeaterItem = previousItems[itemIndex];
				} else {
					repeaterItem = repeaterTemplate.clone();
					previousItems.push(repeaterItem);

					var insertAfter = previousItems[previousItems.length - 1];
					insertAfter.grab(repeaterItem, 'after');
				}

				var item = items[itemIndex], itemsRemaining = (items.length - 1 - itemIndex);

				repeaterItem.easyBind(item, helper, itemIndex, itemsRemaining);
			}
		};

		return repeaterBinding;
	}
})();

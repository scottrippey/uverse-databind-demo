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
		 * @param {Object} [ez]
		 * @returns {Element}
		 */
		easyBind: function(data, ez) {
			ez = ez || {};
			var dataBinding = getEasyBinding(this);
			dataBinding(data, ez);
			return this;
		}
		,
		getClosest: function(matchingSelector) {
			return (el.match(matchingSelector) ? el : el.getParent(matchingSelector));
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
	function getEasyBinding(el) {
		var cachedEasyBinding = el.retrieve('$easyBinding');
		if (cachedEasyBinding) {
			return cachedEasyBinding;
		}

		var boundEls = el.getElements('[data-bind],[data-bind-repeat]');
		if (el.match('[data-bind]')) {
			boundEls.push(el);
		}

		var bindings = [];
		boundEls.each(function(boundEl) {
			var nestedParent = boundEl.getParent('[data-bind-repeat]');
			var isNested = (nestedParent && el.contains(nestedParent));
			if (isNested)
				return;

			var bindRepeatText = boundEl.get('data-bind-repeat')
				, bindText = boundEl.get('data-bind')
				, binding;
			if (bindRepeatText && (boundEl !== el)) {
				binding = createDataRepeaterBinding(boundEl, bindRepeatText);
			} else if (bindText) {
				binding = createDataBinding(boundEl, bindText);
			}
			bindings.push(binding);
		});

		var easyBinding = function(data, ez) {
			bindings.each(function(binding){
				binding(data, ez);
			});
		};
		el.store('$easyBinding', easyBinding);
		return easyBinding;
	}

	function createDataBinding(boundEl, bindText) {
		var functionText;
		var isJsonSyntax = bindText.match(/^\s*\{/);
		if (isJsonSyntax)
			functionText = "with (ez) { this.set(#); }".replace("#", bindText);
		else
			functionText = "with (ez) { # }".replace("#", bindText);

		var binding = new Function('data', 'ez', functionText);
		return binding.bind(boundEl);
	}
	function createDataRepeaterBinding(repeaterEl, bindRepeatText) {
		var functionText;
		var hasReturnStatement = bindRepeatText.match(/\breturn\s/);
		if (!hasReturnStatement)
			functionText = "with (ez) { return #; }".replace("#", bindRepeatText);
		else
			functionText = "with (ez) { # }".replace("#", bindRepeatText);

		var getItems = new Function('data', 'ez', functionText);

		var repeaterTemplate = repeaterEl.clone();
		var previousItems = [ repeaterEl ];
		var repeaterBinding = function(data, ez) {
			var items = getItems.call(repeaterEl, data, ez);
			if (!items || items.length === undefined) throw new Error("Repeat statement did not return an array. " + bindRepeatText);
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

					var insertAfter = previousItems[previousItems.length - 2];
					insertAfter.grab(repeaterItem, 'after');
				}

				var item = items[itemIndex], itemsRemaining = (items.length - 1 - itemIndex);
				Object.append(ez, {
					index: itemIndex
					,remaining: itemsRemaining
				});
				repeaterItem.easyBind(item, ez);
			}
		};

		return repeaterBinding;
	}

})();

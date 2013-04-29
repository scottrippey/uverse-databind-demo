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

		var unnestedBoundEls = getUnnestedBoundEls(el);

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

		var easyBinding = function(data, ez) {
			bindings.each(function(binding){
				binding(data, ez);
			});
		};
		el.store('$easyBinding', easyBinding);
		return easyBinding;
	}

	function getUnnestedBoundEls(el) {
		var boundEls = el.getElements('[data-bind],[data-bind-repeat]');
		if (el.match('[data-bind],[data-bind-repeat]')) {
			boundEls.push(el);
		}

		var unnestedBoundEls = boundEls.filter(function(boundEl) {
			var isNested = (boundEl.getClosest('[data-bind-repeat]', el) === el);
			return true; // isNested;
		});

		return unnestedBoundEls;
	}

	function createDataBinding(boundEl, bindText) {
		var isJsonSyntax = bindText.match(/^\s*\{/);
		if (isJsonSyntax)
			bindText = "with (ez) { this.set(#); }".replace("#", bindText);
		else
			bindText = "with (ez) { # }".replace("#", bindText);

		var binding = new Function('data', 'ez', bindText);
		return binding.bind(boundEl);
	}
	function createDataRepeaterBinding(repeaterEl, bindRepeatText) {
		var hasReturnStatement = bindRepeatText.match(/\breturn\s/);
		if (!hasReturnStatement)
			bindRepeatText = "with (ez) { return #; }".replace("#", bindRepeatText);
		else
			bindRepeatText = "with (ez) { # }".replace("#", bindRepeatText);

		var getItems = new Function('data', 'ez', bindRepeatText);

		var repeaterTemplate = repeaterEl.clone();
		var previousItems = [ repeaterEl ];
		var repeaterBinding = function(data, ez) {
			var items = getItems(data, ez);
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

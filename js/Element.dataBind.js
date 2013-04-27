Element.implement({
	dataBind: function(data, helper) {
		var dataBoundEls = this.getElements('[data-bind]');
		if (this.match('[data-bind]'))
			dataBoundEls.push(this);

		dataBoundEls.each(function(el) {
			var command = el.get('data-bind');
			var compiled = new Function('data','helper',command);
			compiled.call(el, data, helper);
		});
	}
});

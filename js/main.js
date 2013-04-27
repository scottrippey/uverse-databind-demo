window.addEvent('domready', function(){

	var flyoutDataItems = [
		{
			title: "Bacon andouille ribeye frankfurter"
			,isFavorite: true
		}
		,
		{
			title: "Ham biltong cow meatball "
			,isFavorite: false
		}
		,
		{
			title: "Tongue fatback cow bresaola"
			,isFavorite: true
		}
		,
		{
			title: "Prosciutto short loin frankfurter"
			,isFavorite: false
		}
	];

	var index = 0;
	function showNextData() {
		var flyoutData = flyoutDataItems[index++ % flyoutDataItems.length];
		var flyout = $$('.flyout');
		updateFlyout(flyout, flyoutData);
	}

	function updateFlyout(flyout, flyoutData) {
		flyout.dataBind(flyoutData);
	}

	setInterval(showNextData, 2000);
	showNextData();


});


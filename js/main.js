window.addEvent('domready', function(){

	var flyoutDataItems = [
		{
			title: "Bacon andouille ribeye frankfurter"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/400/300"
		}
		,
		{
			title: "Ham biltong cow meatball "
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/40/30"
		}
		,
		{
			title: "Tongue fatback cow bresaola"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/44/33"
		}
		,
		{
			title: "Prosciutto short loin frankfurter"
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/444/333"
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


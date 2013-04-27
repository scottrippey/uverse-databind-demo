window.addEvent('domready', function(){

	var flyoutDataItems = [
		{
			title: "Bacon ipsum"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/400/300"
			,description: "Bacon ipsum risket chuck tail ball tip kielbasa beef ham swine strip steak fatback meatloaf pork belly chicken shoulder. Capicola frankfurter boudin chicken, t-bone pork chop salami ham."
		}
		,
		{
			title: "Pork ball tip shank"
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/160/90"
			,description: "Pork ball tip shank doner pancetta chicken. Pork loin swine pastrami rump drumstick ribeye kielbasa venison doner sausage spare ribs ham hock tongue."
		}
		,
		{
			title: "Jerky short loin"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/300/400"
			,description: "Jerky short loin chuck hamburger jowl tail. Kielbasa turducken leberkas, frankfurter meatloaf prosciutto pork loin biltong hamburger beef pig. Chuck spare ribs pig, ham hock boudin shank bacon turkey pork chop pork loin kielbasa ball tip flank."
		}
		,
		{
			title: "Sirloin pancetta jerky "
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/300/300"
			,description: "Sirloin pancetta jerky doner fatback corned beef pork loin. Meatball strip steak venison flank andouille ground round pancetta meatloaf chuck prosciutto filet mignon tenderloin."
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


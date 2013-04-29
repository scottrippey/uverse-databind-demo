window.addEvent('domready', function(){




	var flyoutDataItems = [
		{
			title: "Bacon ipsum"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/400/300"
			,description: "Bacon ipsum risket chuck tail ball tip kielbasa beef ham swine strip steak fatback meatloaf pork belly chicken shoulder. Capicola frankfurter boudin chicken, t-bone pork chop salami ham."
			,tags: [ 'Bacon', 'ipsum', 'risket', 'chuck', 'tail', 'ball' ]
		}
		,
		{
			title: "Pork ball tip shank"
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/160/90"
			,description: "Pork ball tip shank doner pancetta chicken. Pork loin swine pastrami rump drumstick ribeye kielbasa venison doner sausage spare ribs ham hock tongue."
			,tags: [ 'Pork', 'ball', 'tip' ]
		}
		,
		{
			title: "Jerky short loin"
			,isFavorite: true
			,imageUrl: "http://lorempixel.com/300/400"
			,description: "Jerky short loin chuck hamburger jowl tail. Kielbasa turducken leberkas, frankfurter meatloaf prosciutto pork loin biltong hamburger beef pig. Chuck spare ribs pig, ham hock boudin shank bacon turkey pork chop pork loin kielbasa ball tip flank."
			,tags: [ 'Jerky', 'short', 'loin', 'chuck', 'hamburger', 'jowl', 'tail' ]
		}
		,
		{
			title: "Sirloin pancetta jerky "
			,isFavorite: false
			,imageUrl: "http://lorempixel.com/300/300"
			,description: "Sirloin pancetta jerky doner fatback corned beef pork loin. Meatball strip steak venison flank andouille ground round pancetta meatloaf chuck prosciutto filet mignon tenderloin."
			,tags: [ 'Sirloin', 'pancetta', 'jerky', 'doner', 'fatback' ]
		}
	];

	var index = 0;
	function getNextData() {
		return flyoutDataItems[index++ % flyoutDataItems.length];
	}

	$$('.flyout').addEvent('click', function() {
		var el = this;

		var data = getNextData();
		el.easyBind(data);

	}).fireEvent('click');


});


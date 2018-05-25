/*Tab Dancer jQuery plugin
 // Author: James McKenzie
 // jamesmckenzie.ca
 // Version: 0.8;
 */

$.fn.TabDancer = function(){
						
	var $tabsContainer = $(this),
		$tabs = $tabsContainer.find('li'),
		$activeTab = $tabs.find('.tab-active').first()
	
	//Add accessibility attributes and show active content
	$tabsContainer.attr('role', 'tablist');
	$tabs.each(function(){
		var $tab = $(this),
			targetID = $tab.children('a').attr('href').replace('#', '');
		
		if($tab.is('.tab-active')){
			$('#'+targetID).show();
		}
		$tab.attr('role', 'tab');
		$tab.attr('aria-controls', targetID);
	});
	
	//Enable tab changes
	$tabsContainer.find('li a').click(function(event) {
		event.preventDefault();
		var $self = $(this),
		 	$parent = $self.parent('li');
			
			//Find currently visible tab content and hides it
			$parent.siblings('.tab-active').each(function() {
				currentTabContent = $(this).children('a').attr('href');
				$(currentTabContent).hide();
			});
			$parent.siblings().attr('aria-selected', 'false');
			$parent.siblings().removeClass("tab-active");
			
			//Show new tab content
			$parent.attr('aria-selected', 'true');
			$parent.addClass("tab-active");
			$(this.hash).fadeIn();
			$self.focus();
	  });
};

/*Tab Dancer jQuery plugin
 // Author: James McKenzie
 // jamesmckenzie.ca
 // Version: 0.8;
 */

$.fn.TabDancer = function(){
						
	var $tabsContainer = $(this),
		$tabs = $tabsContainer.find('li'),
		$activeTab = $tabs.find('.tab-active').first(),
		$tabToggler = $('<li class="js-tab-toggler"><a href="#"></a></li>'),
		$tabTogglerLink = $tabToggler.find('a').first(),
		textMore = $tabsContainer.data('more-tabs-text') || "More";
	
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
	
	//Add tab toggler element
	$tabTogglerLink.append('<span class="tabs-more">'+textMore+'</span>');
	$tabs.last().after($tabToggler);
	
	//Responsive tab toggler to reveal hidden tabs
	var toggleTabs = function(event){
		event.preventDefault();
		
		//expand the tabs
		if(!$tabsContainer.hasClass('js-tab-stack-open')){
			//Allow auto height on the tabs container
			$tabsContainer.css('height', 'auto');
			
			$tabsContainer.toggleClass('js-tab-stack').toggleClass('js-tab-stack-open');
			
			//ANIMATE TRANSITION
			var $tabClonesContainer = $('<div class="js-tab-clone-container"></div>');
			$tabsContainer.append($tabClonesContainer);
			//Get target y-axis positions of each item
			for(var i = 0; i < $tabs.length; i++){
					
				$tabs[i].tabClone = $($tabs[i]).clone();
				$tabs[i].tabClone.addClass('js-tab-clone');
				$tabClonesContainer.append($tabs[i].tabClone);
				
			}
			
			//Create vertical space during animation
			$tabsContainer.height($tabClonesContainer.height());
			
			var $tabClones = [];
			
			//Before we measure the left offset of each item, ensure they all fit on one line temporarily
			$tabsContainer.css('width', '9999px');
			
			for(var i = $tabs.length-1; i > 0; i = i-1){
				$tabs[i].targetTop = $tabs[i].tabClone[0].offsetTop;
				$tabs[i].sourceLeft = $tabs[i].offsetLeft - parseInt($($tabs[i]).css('margin-left'));
				
				if(i==1){
					//Return the tabs container width to normal
					$tabsContainer.css('width','');
				}
				

				$($tabs[i]).css({'top':'0', 'left':$tabs[i].sourceLeft});
				$($tabs[i]).addClass('js-ready-for-anim');
				
				(function(x){
					setTimeout(function(){
						$($tabs[x]).css({'top':$tabs[x].targetTop, 'left':'0'});
					}, 1); /*This tiny delay allows the CSS animation to register a change*/
				})(i);
						
				//If we are complete all our animations
				if(i == 1) {
					setTimeout(function(){
						$tabsContainer.addClass('js-tab-stack-open-complete');
						$('.js-ready-for-anim').each(function(){
							
							$(this).css({
								'top':'',
								'left':''
							})
                            .removeClass('js-ready-for-anim');
						});
						$tabClonesContainer.remove();
						
						//Return the tabs container height to normal
						$tabsContainer.css('height','');
					
					}, 500); /*This delay must match the animation length*/
				}
			}
			
			//Move keyboard focus to active tab
			$(this).siblings('.tab-active').find('a').focus();
		} else {
			//Collapse the tabs
            
            for(var i = $tabs.length-1; i > 0; i = i-1){
                $tabs[i].sourceTop = $tabs[i].offsetTop;
                
                $($tabs[i]).css({'top':$tabs[i].sourceTop, 'left':'0'});
                $($tabs[i]).addClass('js-ready-for-anim');
            }
            
            $tabsContainer.removeClass('js-tab-stack-open-complete')
                .addClass('js-tab-stack')
                .removeClass('js-tab-stack-open');
            
            checkTabsWidth();
            
            //Set the active tab's 'left' property to be right after the last 'available' tab
            var rightMostLocation = $tabs[$tabs.length - 1].sourceLeft;
            
            for(var i = 1; i < $tabs.length; i = i+1){
                if(!$($tabs[i]).hasClass('tab-available') && $($tabs[i-1]).hasClass('tab-available')){
                    rightMostLocation = $tabs[i].sourceLeft;
                }
                
                if($($tabs[i]).hasClass('tab-active') && !$($tabs[i-1]).hasClass('tab-available') ){
                    $tabs[i].sourceLeft = rightMostLocation;
                }
            }
            
            
            for(var i = $tabs.length-1; i > 0; i = i-1){
                
                (function(x){
                    setTimeout(function(){
                        $($tabs[x]).css('top', '0');
                        $($tabs[x]).css('left', $tabs[x].sourceLeft);
                    }, 1);
                })(i);
                
                
            
                if(i == 1) {
                        setTimeout(function(){
                            $('.js-ready-for-anim').each(function(){
                                $(this).css({
                                    'top':'',
                                    'left':''
                                });
                            });
                             $('.js-ready-for-anim').removeClass('js-ready-for-anim');
                        }, 500);
                }
            }

		}
	};
	
	//Check width of tabs to see if they all fit in viewport
	var checkTabsWidth = function(){
		
		if(!$tabsContainer.hasClass('js-tab-stack-open')) {
			
			$tabsContainer.removeClass('js-tab-stack');
			
			var listWidth = $tabsContainer.width() - 10,
				itemWidth = 0,
				eachItemWidth = new Array(),
				eachItemObject = new Array(),
				marginAmount,
				activeItemWidth = $tabsContainer.children('.tab-active').width(),
				i = 0;
			
			//Set fixed height to tabs container to hide any items that overflow to a new line
			var $tabsContainerClone = $tabsContainer.clone();
			$tabsContainerClone.find('li').not(':first-child').remove();
			$tabsContainerClone.css('visibility', 'hidden');
			$tabsContainer.after($tabsContainerClone);
			$tabsContainer.css('height', $tabsContainerClone.height());
			$tabsContainerClone.remove();
			
			$tabsContainer.children('li').not('.js-tab-toggler').each(function() {
				$el = $(this);
				$el.removeClass('tab-available');
				marginAmount = parseInt($el.css('margin-left')) + parseInt($el.css('margin-right'));
				eachItemWidth[i] = $el.outerWidth() + marginAmount;						
				eachItemObject[i] = $el;
				itemWidth = itemWidth + eachItemWidth[i];	
				i ++;
			});
			
			if(itemWidth > listWidth) {
				$tabsContainer.addClass('js-tab-stack').find('.tabs-more').show();
				
				//Check again to be sure they still fit. If not, hide the .tabs-more text
				itemWidth = 0;
				
				$tabsContainer.children('.tab-active, .js-tab-toggler').each(function() {
					$el = $(this);
					marginAmount = parseInt($el.css('margin-left')) + parseInt($el.css('margin-right'));
					itemWidth = itemWidth + $el.outerWidth() + marginAmount;	
					
					if($el.hasClass('tab-active')){
						$el.addClass('tab-available');
					}
				});
				
				if(itemWidth > listWidth) {
					$tabsContainer.find('.tabs-more').hide();
				} 
				
				//See if any other tabs can fit in (set to 'tab-available')
				var tabTogglerWidth = $tabsContainer.children('.js-tab-toggler').width(),
					remainingWidth = listWidth - activeItemWidth - tabTogglerWidth;
										
				for (var x = 0; x < eachItemObject.length; x++) {
					
					if(!eachItemObject[x].hasClass('tab-active')) {
						remainingWidth = remainingWidth - eachItemWidth[x];
													
						if (remainingWidth > 0) {
							eachItemObject[x].addClass('tab-available');
						}
					}
					
				}
				
			} else { //Tabs all fit!
				$tabsContainer.removeClass('js-tab-stack');
			}
		}
	}
	
	$(window).resize(function() {
		if(this.resizeTO) clearTimeout(this.resizeTO);
		this.resizeTO = setTimeout(function() {
			$(this).trigger('resizeEnd');
		}, 500);
	});
			
	$(window).bind('resizeEnd', function() {
		/*----Convert Responsive Tabs to drop-down if needed ---*/
		checkTabsWidth();
	});
	
	$(window).trigger('resizeEnd');
	
	

	
	//Enable tab changes
	$tabsContainer.find('li a').click(function(event) {
		event.preventDefault();
		var $self = $(this),
		 	$parent = $self.parent('li');
			
		if(!$parent.hasClass('js-tab-toggler')) {
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
			
			//Collapse stacked tabs, if they are stacked
			if($tabsContainer.hasClass('js-tab-stack-open')){
				toggleTabs(event);
				checkTabsWidth();
			}
			
		} else {
			toggleTabs(event);
		}
		
	  });
};

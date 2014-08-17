require.config({
	paths: {
		'carousel': '../sandbox/hammer-carousel/public/panel/js/carousel'
	},
	shim: {
        // 'leap-plugins': { deps: ['leap'] }
	},
	urlArgs: 'bust=' + new Date().getTime()
});

define([
    'jquery',
    'ap/style',
    'carousel'
], function($, Style, Carousel) {

    //Define the methods and attributes of your module
    var initialize = function() {
        Style.link('panel/css/carousel.css');
        var carouselHoriz = $('#carousel');
        // var carouselHoriz = $('.horizontal');

    	$(function() {
            var carouselH = new Carousel.initialize(carouselHoriz);
            // var carouselV = new Carousel.initialize(carouselVert);

            setTimeout(function() {
                $(window).resize();    
            }, 500);
            
            // $(document).keydown(checkKeyCode);
        });
    };

    var checkKeyCode = function(e) {
        console.log(e.keyCode);

        switch(e.keyCode) {
            // left
            case 37:
            // right
            case 39:
            // up
            case 38:
            // down
            case 40:
            // F
            case 70:
                enterFullscreen();
        }
    };

    //Add functions from above to the module and return it.
    return {
        initialize: initialize
    };
});
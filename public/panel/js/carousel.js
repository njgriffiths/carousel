require.config({
	paths: {
		'hammer': '../sandbox/hammer-carousel/public/panel/js/hammer',
        // 'modern': '../sandbox/hammer-carousel/public/panel/js/hammer'
	},
	shim: {
        // 'leap-plugins': { deps: ['leap'] }
	},
	urlArgs: 'bust=' + new Date().getTime()
});

define([
    'jquery',
    'hammer',
    // 'modern'
    'modernizr'
], function($, Hammer, Modernizr) {

    var container, panes, pane_count, self;
    var pane_width = 0;
    var paneHeight = 0;
    var current_pane = 0;
    var currentPaneV = 0;

    //Define the methods and attributes of your module
    var initialize = function(element) {
        self = this;
        container = $('>ul.horizontal', element);
        panes = $('>ul>li', element);
        pane_count = panes.length;

        // size to fill screen
        setPaneDimensions(element);

        // setup a new hammer element
        new Hammer(element[0], { drag_lock_to_axis: true }).on('release dragleft dragright dragup dragdown swipeleft swiperight swipeup swipedown', handleHammer);

        $(window).on('load resize orientationchange', function() {
            setPaneDimensions(element);
        });

        // keyboard controls
        $(document).keydown(handleHammer);
    };

    /**
    * Handling the fullscreen functionality via the fullscreen API
    *
    * @see http://fullscreen.spec.whatwg.org/
    * @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
    */
    var enterFullscreen = function() {
        var element = document.body;

        // Check which implementation is available
        var requestMethod = element.requestFullScreen ||
                            element.webkitRequestFullscreen ||
                            element.webkitRequestFullScreen ||
                            element.mozRequestFullScreen ||
                            element.msRequestFullScreen;

        if (requestMethod) {
            requestMethod.apply(element);
        }
    };

    var handleHammer = function(e) {
        console.log('Hammer: ', e.type, e.keyCode);

        if (!e.gesture) {
            switch(e.keyCode) {
                // right
                case 39:
                    nextSlide();
                    break;
                // left
                case 37:
                    prevSlide();
                    break;
                // up
                case 38:
                    slideUp();
                    break;
                // down
                case 40:
                    slideDown();
                    break;
                // F
                case 70:
                    enterFullscreen();
                    break;
            }
        } else {
            // disable browser scrolling
            e.gesture.preventDefault();
    
            switch(e.type) {
                case 'dragright':
                case 'dragleft':
                    // stick to the finger
                    var pane_offset = -(100 / pane_count) * current_pane;
                    var drag_offset = ((100 / pane_width) * e.gesture.deltaX) / pane_count;

                    // slow down at the first and last pane
                    if ((current_pane === 0 && e.gesture.direction === 'right') ||
                        (current_pane === pane_count - 1 && e.gesture.direction === 'left')) {
                        drag_offset *= .4;
                    }

                    setContainerOffset(drag_offset + pane_offset);
                    break;

                case 'swipeleft':
                    nextSlide();
                    e.gesture.stopDetect();
                    break;

                case 'swiperight':
                    prevSlide();
                    e.gesture.stopDetect();
                    break;

                case 'release':
                    // more then 50% moved, navigate
                    if (Math.abs(e.gesture.deltaX) > pane_width / 2) {
                        if (e.gesture.direction === 'right') {
                            prevSlide();
                        } else {
                            nextSlide();
                        }
                    } else if (Math.abs(e.gesture.deltaY) > paneHeight / 2) {
                        console.log('')

                        if (e.gesture.direction === 'up') {
                            slideDown();
                        } else {
                            slideUp();
                        }
                    } else {
                        showPane(current_pane, true);
                    }

                    break;
            }
        }
    };

    var nextSlide = function() { return showPane(current_pane + 1, true); };
    var prevSlide = function() { return showPane(current_pane - 1, true); };
    var slideDown = function() { return showPane(currentPaneV - 1, true, 'vertical'); };
    var slideUp = function() { return showPane(currentPaneV + 1, true, 'vertical'); };

    var setContainerOffset = function(percent, animate, plane) {
        container.removeClass('animate');

        console.log(animate, plane, percent)
        console.log(Modernizr.csstransforms)

        if (animate) {
            container.addClass('animate');
        }

        if (Modernizr.csstransforms3d) {
            if (plane === 'vertical') {
                container.css('transform', 'translate3d(0,100%,0) scale3d(1,1,1)');    
            } else {
                container.css('transform', 'translate3d(' + percent + '%,0,0) scale3d(1,1,1)');
            }
            
        }
        else if (Modernizr.csstransforms) {
            if (plane === 'vertical') {
                container.css('transform', 'translate(0, 100%)');
            } else {
                container.css('transform', 'translate(' + percent + '%,0)');    
            }
            
        }
        else {
            if (plane === 'vertical') {
                console.log(paneHeight)
                // var px = ((paneHeight * pane_count) / 100) * percent;
                container.css('bottom', paneHeight + 'px');
            } else {
                var px = ((pane_width * pane_count) / 100) * percent;
                container.css('left', px + 'px');
            }
        }
    };


    // set the pane dimensions nd scale the container
    var setPaneDimensions = function(element) {
        pane_width = element.width();
        paneHeight = element.height();
        
        panes.each(function() {
            $(this).width(pane_width);
        });

        container.width(pane_width * pane_count);
    };

    var showPane = function(index, animate, plane) {
        // between the bounds
        index = Math.max(0, Math.min(index, pane_count - 1));
        current_pane = index;

        var offset = -((100 / pane_count) * current_pane);
        
        setContainerOffset(offset, animate, plane);
    };

    //Add functions from above to the module and return it.
    return {
        initialize: initialize
    };
});
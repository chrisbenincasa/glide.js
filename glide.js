/*

  Copyright 2012 Christian Benincasa

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  * jQuery glide v0.9
  * By: Christian Benincasa
  * A simple, lightweight, multi-oriented, multi-directional jQuery carousel!

*/

;(function($, window, document, undefined){
  $.fn.glide = function(options)
  {
    // If argument is one of the methods, call that methods with additional arguments
    if(methods[options]) {
      return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else {
      // Set options
      options = $.extend({}, defaultSettings, options);
      return this.each(function(){
        $this = $(this);
        $('.' + options.slideContainer, $this).children().wrapAll('<div class="slider_controller" />');

        var controller    = $('.slider_controller', $this),
            slides        = controller.children(),
            totalSlides   = slides.size() - 1,
            totalWidth    = slides.outerWidth(),
            maxHeight     = Math.max(slides.height(), slides.children().height(), $('.'+options.slideContainer).height()), 
            startSlide    = options.startSlide,
            currentSlide  = startSlide,
            animation     = options.animation,
            loaded        = false,
            animating, playTimer, previousSlide, nextSlide, position, direction;

        // Only one slide? 
        if(totalSlides < 2) {
          return;
        }

        //Default to first slide if startSlide is out of range
        if(startSlide < 0 || startSlide > totalSlides) {
          startSlide = 0;
        }

        // Prevent initialization if carousel if already initialized
        if(!$this.data('initialzied')) {
          init();  
        }

        function init()
        {
          //Hide slideContainer during setup
          $('.'+options.slideContainer, $this).css({
            overflow:'hidden',
            position:'relative'
          });

          // Set up controller to scroll vertically;
          if(options.orientation === 'vertical') {
            if(options.preload && controller.find('img').eq(startSlide).length) {
              $('.'+options.slideContainer, $this).css({
                background: 'url(' + options.preloadImage + ') no-repeat 50% 50%'
              });

              var img = controller.find('img').eq(startSlide),
                  src = img.attr('src'), 
                  imageParent;

              if(img.parent().hasClass('slider_controller'))
              {
                imageParent = img;
              } else {
                imageParent = controller.children().eq(startSlide);
              }

              //hide children first to prevent flickering
              controller.children().css('display', 'none');

              img.attr('src', src + '?' + (new Date()).getTime()).load(function(){
                maxHeight = Math.max(maxHeight, $(this).height());
                _createSlider();
              });
            } else {
              _createSlider();
            }
          }

          //begin horizontal slider setup
          else {
            //Display slide container
            $('.' + options.slideContainer, $this).css({
              display: 'block'
            });

            if(options.preload && controller.find('img').eq(startSlide).length)
            {
              $('.' + options.slideContainer, $this).css('background', 'url(' + options.preloadImage + ') no-repeat 50% 50%');
              var img = controller.find('img').eq(startSlide),
                  src = img.attr('src');

              controller.children().css({
                position: 'absolute',
                top: 0,
                left: controller.children().outerWidth(),
                zIndex: 0,
                display: 'none'
              });

              img.attr('src', src + '?' + (new Date()).getTime()).load(function(e){
                //Positioning set up for horizontal display
                totalWidth = controller.children().outerWidth();
                _createSlider();
                
              });
            } else {

              controller.children().css({
                position: 'absolute',
                top: 0,
                left: controller.children().outerWidth(),
                zIndex: 0,
                display: 'none'
              });
              
              _createSlider();
            }
            
          //End horizontal slide setup
          }

          //Function that arranges slides and does necessary CSS setup. Called exactly once.
          function _createSlider()
          {
            if(options.orientation === 'vertical')
            {
              controller.children().css({
                  position: 'absolute',
                  top: $('.' + options.slideContainer).height(),
                  left: 0,
                  zIndex: 0,
                  display: 'none'
                });

                $('.' + options.slideContainer, $this).css({
                  background: ''
                });

                controller.css({
                  position: 'relative',
                  height: (maxHeight*3),
                  width: totalWidth,
                  top: -(maxHeight)
                });

                $('.'+options.slideContainer, $this).css({
                  display: 'block'
                });

                generateCaptions();

                controller.children().eq(startSlide).fadeIn(options.fadeSpeed, options.fadeEasing, function(){
                  loaded = true;
                  if(options.customCaption.length !== 0)
                  {
                    caption = $(options.customCaption).eq(startSlide);

                    //only fading is supported for custom captions at this time
                    caption.delay(options.captionDelay).fadeIn(options.fadeSpeed / 2, fadeEasing);

                  } else {
                    caption = $(this).find('.slider-caption');
                    if(options.captionAnimation === 'slide')
                    { 
                      caption.show().animate({
                        'top': '-=' + caption.outerHeight()
                      });
                    } else {
                      caption.hide().css({'top': '-='+$(this).outerWidth()}).fadeIn();
                    }
                  }
                  options.loadedCallback.call($this);
                });
            } else {
              //Create carousel of 3 times length of slides
                controller.css({
                    position: 'relative',
                    width: (totalWidth*3),
                    height: maxHeight,
                    left: -(totalWidth)
                  });

                //Fade in first slide
                controller.children().eq(startSlide).fadeIn(options.fadeSpeed, options.fadeEasing, function(){
                  loaded = true;
                  $(this).css({
                    zIndex: 5
                  });

                $('.' + options.slideContainer, $this).css({
                  background: ''
                });

                  generateCaptions();

                  //Display first caption (if it exists)
                  //Check if custom caption class was defined, and if so, fade in that
                  //Otherwise, use built in caption (title attribute from element)
                  if(options.customCaption.length !== 0)
                  {
                    caption = $(options.customCaption).eq(startSlide);
                    caption.delay(options.captionDelay).fadeIn(options.fadeSpeed / 2, options.fadeEasing, function(){
                      options.loadedCallback.call($this);
                    });
                  } else {
                    caption = controller.find('.slider-caption').eq(startSlide);
                    if(options.captionAnimation === 'slide')
                    {
                      caption.animate({
                          'top': '-=' + caption.outerHeight()
                        }, 300, 'swing');
                      options.loadedCallback.call($this);
                    } else {
                      caption.hide().css({'top': '-='+caption.outerHeight()}).fadeIn(options.fadeSpeed / 2, function(){
                        options.loadedCallback.call($this);
                      });
                    }
                  }
              });
            }
          }

          //Generate link for each page if pagination is set to true
          if(options.pagination) {
            if(options.bootstrap)
            {
              $paginationWrapper = $('<div class="pagination" />').appendTo($this);
              if(options.paginationClass !== 'glide-pagination')  $paginationWrapper.addClass(options.paginationClass);
              switch(options.paginationPosition)
              {
                case 'center':
                  $paginationWrapper.addClass('pagination-centered');
                  break;
                case 'right':
                  $paginationWrapper.addClass('pagination-right');
                  break;
              }
              $pageList = $('<ul/>').appendTo($paginationWrapper);
              slides.each(function(index, elem){
                $pageList.append('<li><a href="#">' + (index + 1) + '</a></li>');
              });
              pagination = $pageList;
            } else {
              $paginationWrapper = $('<div class="' + options.paginationClass + '"/>').appendTo($this).css({
                textAlign: options.paginationPosition
              });
              pagination = $('.' + options.paginationClass, $this)
              slides.each(function(index, elem){
                pagination.append('<a href="#" class="' + options.paginationStyle + '">' + '<span>' + index + '</span>' + '</a>')
              });
            }
            $this.css('margin-bottom', '+=' + $paginationWrapper.outerHeight())
              pagination.children().click(function(event){
                event.preventDefault();
                if(!$(this).hasClass('active'))
                {
                  if(options.autoPlay)
                  {
                    $this.glide('stop');  
                  }
                  $this.glide('to', $(this).index());
                  if(options.autoPlay)
                  {
                    $this.glide('start');
                  }
                }
              }).eq(options.startSlide).addClass('active');
          }

          //Generate next and previous links if nextPrevLinks is set to true
          if(options.nextPrevLinks)
          {
            $this.append('<a href="#" class="'+options.prevClass+'">previous</a><a href="#" class="'+options.nextClass+'">next</a>')
          }

          /* Attach handlers in case */

          $('.' + options.nextClass, $this).click(function(event){
            event.preventDefault();
            if(options.autoPlay)
            { 
              $this.glide('stop');
            }
            $this.glide('next');
            if(options.autoPlay)
            {
              $this.glide('start');
            }
          });

          $('.' + options.prevClass, $this).click(function(event){
            event.preventDefault();
            if(options.autoPlay)
            { 
              $this.glide('stop');
            }
            $this.glide('prev');
            if(options.autoPlay)
            {
              $this.glide('start');
            }
          });

          //Finished initalizing
          //Call custom callback function
          options.initCallback.call($this, options)
          return $this;
        }

        function generateCaptions()
        {
          //Generate captions if custom ones aren't defined
          if(options.customCaption.length === 0)
          {
            controller.contents().find('img').each(function(index, ele){
              title = $(ele).attr('title')
              if(title !== undefined) {
                if(title.indexOf('#') === 0)
                {
                  title = $(title).html()
                }

                createCaption($(ele), title, index)
              }
            });
          }
        }

        //Generate caption elements and insert after corresponding slide
        function createCaption(slide, content, index)
        {
          content = $('<div class="slider-caption"><div>'+content+'</div></div>');
          slide.after(content);
          if(options.orientation === 'horizontal')
          {
            content.css({
              top: controller.height()
            });
          } else {
            content.css({
              display: 'none',
              top: $('.' + options.slideContainer).height()
            });
          }
          
        }

        //Enable keyboard navigation using the right and left arrows if user sets keyboardNav: true
        if(options.keyboardNav) {
          $(document).keydown(function(event){
            if(event.which !== 39 && event.which !== 37 && event.isTrigger !== true)
            {
              return;
            }
            if(event.which === 39)
            {
              $this.glide('next');
            }
            else if(event.which === 37)
            {
              $this.glide('prev');
            }
          });
        }

        //animate function
        function animate(direction, animation, slide, clicked)
        {
          clicked = clicked || false
          if(loaded && !animating) {
            animating = true;
            switch(direction) {
              case 'next':
                previousSlide = currentSlide;
                nextSlide = (currentSlide === totalSlides) ? 0 : currentSlide + 1;
                if (options.orientation === 'vertical')
                {
                  position = 0;
                  direction = 0;
                }
                else
                {
                  position = totalWidth*2;
                  direction = -position;
                }
                currentSlide = nextSlide;
                break;
              case 'prev':
                previousSlide = currentSlide;
                nextSlide = ((currentSlide - 1) === -1) ? (totalSlides) : (currentSlide - 1)
                if (options.orientation === 'vertical') {
                  position = maxHeight*2;
                  direction = -position;
                }
                else {
                  position = 0;
                  direction = 0;
                }
                currentSlide = nextSlide;
                break;
              case 'specific':
                if(!clicked) {
                  nextSlide = parseInt(slide, 10);
                  previousSlide = currentSlide; 
                }

                if(nextSlide > previousSlide) {
                  if (options.orientation === 'vertical') {
                    position = 0;
                    direction = 0;
                  }
                  else {
                    position = totalWidth*2;
                    direction = -position;
                  }
                }
                else {
                  if (options.orientation === 'vertical') {
                    position = maxHeight*2;
                    direction = -position;
                  }
                  else {
                    position = 0;
                    direction = 0;
                  }
                }
                currentSlide = nextSlide;
                break;
            }

            options.animationStart.call($this, currentSlide, controller.children().eq(currentSlide), previousSlide, controller.children().eq(previousSlide));

            //Crossfader
            if(animation === 'fade') {
              handleCaptionAnimation(previousSlide, false);

              controller.children().eq(nextSlide).css('z-index', 8)
                .fadeIn(options.fadeSpeed, options.fadeEasing, function(){
                  controller.children().eq(previousSlide)
                    .css({
                      display: 'none',
                      zIndex: 0
                    });

                  $(this).css('z-index', 5);

                  handleCaptionAnimation(nextSlide, true);
                  animating = false;
                  options.animationEnd.call($this, currentSlide, controller.children().eq(currentSlide), previousSlide, controller.children().eq(previousSlide));                  
                });
            }

            //Slider functions 
            else {
              if(options.orientation === 'vertical')
              {
                controller.children().eq(nextSlide).css({
                  top: position,
                  display: 'block'
                });

                handleCaptionAnimation(previousSlide, false);

                // Timeout vertical animation until caption is hidden so as not to see it moving
                setTimeout(function(){
                  controller.animate({
                    top: direction
                  }, options.slideSpeed, options.slideEasing, function(){
                    controller.css({
                      top: -maxHeight
                    });

                    controller.children().eq(nextSlide).css({
                      top: maxHeight,
                      zIndex: 5
                    });

                    controller.children().eq(previousSlide).css({
                      top: maxHeight,
                      display: 'none',
                      zIndex: 0
                    });

                    handleCaptionAnimation(nextSlide, true);

                  });
                }, options.slideSpeed)

                options.animationEnd.call($this, currentSlide, controller.children().eq(currentSlide), previousSlide, controller.children().eq(previousSlide));
                animating = false;

              } else {

                controller.children().eq(nextSlide).css({
                  left: position,
                  display: 'block'
                });

                handleCaptionAnimation(previousSlide, false)
                controller.animate({
                  left: direction
                }, options.slideSpeed, options.slideEasing, function(){
                  controller.css({
                    left: -totalWidth
                  });

                  controller.children().eq(nextSlide).css({
                    left: totalWidth,
                    zIndex: 5
                  });

                  controller.children().eq(previousSlide).css({
                    left: totalWidth,
                    display: 'none',
                    zIndex: 0
                  });

                  handleCaptionAnimation(nextSlide, true);

                  options.animationEnd.call($this, currentSlide, controller.children().eq(currentSlide), previousSlide, controller.children().eq(previousSlide));
                  animating = false;
                });
              }
              
              // Auto adjusts height of the carousel to height of current slide
              if(options.adjustHeight) {
                controller.parent('.'+options.slideContainer).animate({
                  height: controller.children().eq(nextSlide).innerHeight()
                  //height: controller.children(':eq('+nextSlide+')').innerHeight() - 4
                });
              }
            }

            // Update pagination
            if(options.pagination) {
              if(options.bootstrap)
              {
                $('.pagination', $this).find('li').eq(currentSlide).addClass('active').siblings('.active').removeClass('active');
              } else {
                $('.' + options.paginationClass, $this).children().eq(currentSlide).addClass('active').siblings('.active').removeClass('active');  
              }
            }

          }
        }

        // This function handles the caption transitions when the slide is changed
        function handleCaptionAnimation(captionIndex, show)
        {
          var caption = (options.customCaption.length !== 0) ? $(options.customCaption).eq(captionIndex) : controller.find('.slider-caption').eq(captionIndex);
          if(show)
          {
            if(options.customCaption.length !== 0)
            {
              //only fading is supported for custom captions at this time
              caption.delay(options.captionDelay).fadeIn(options.fadeSpeed / 2, options.fadeEasing);
            } else {
              if(options.captionAnimation === 'fade') caption.hide().css({'top': '-='+caption.outerHeight()}).delay(options.captionDelay).fadeIn(options.fadeSpeed, options.fadeEasing);
              else if(options.captionAnimation === 'slide') caption.delay(options.captionDelay).show().animate({top: "-=" + caption.outerHeight()}, options.slideSpeed, options.slideEasing)
            }
          } else {
            if(options.customCaption.length !== 0)
            {
              //only fading is supported for custom captions at this time
              caption.delay(options.captionDelay).fadeOut(options.fadeSpeed / 2, options.fadeEasing);
            } else {
              if(options.captionAnimation === 'fade') caption.fadeOut(options.fadeSpeed / 2, options.fadeEasing, function(){$(this).css({top: controller.height()})});
              else if(options.captionAnimation === 'slide') caption.animate({top: "+=" + caption.outerHeight()}, options.slideSpeed, options.slideEasing, function(){
                $(this).hide();
              });
            }
          }
        }

        //Stop the slider from transitioning automatically
        function stop()
        {
          if(typeof playTimer === 'number') {
            clearInterval(playTimer);
          }
        }
        
        //Save options to jQuery data object
        $this.data({'options': options, 'initialzied': true});

        $this.on('sliderTransition', function(event, info){
          slide = info['slide'] || 0
          animate(info['direction'], options.animation, slide);
        });

        /**
          * Custom event
          * sliderStop

          * Stop slider transitions
        **/
        $this.on('sliderStop', function(){
          stop();
        })

        //Handle changes to options on the fly
        $this.on('sliderChange', function(event, info){
          if(options.autoPlay > 0)
          {
            stop();
            clearInterval(playTimer);
            playTimer = setInterval(function(){
              animate('next', animation);
            }, options.autoPlay);
            if(options.pauseOnHover)
            {
              $this.on('mouseenter', function(){
                stop();
              }).on('mouseleave', function(){
                playTimer = setInterval(function(){
                  animate('next', animation);
                }, options.autoPlay);
              });
            }
          }
          else if(options.autoPlay === 0)
          {
            if(typeof playTimer === 'number')
            {
              clearInterval(playTimer); 
            }
          }

          animation = options.animation;
        });

        //Initialize options
        $this.trigger('sliderChange');

      });
    }
  };

  var methods = {
    /**
      * Get option on selected carousel
      *
      * @param string option      key of option to return
      * @returns *                returns value of any time (option-specific)
    **/
    get: function(option)
    {
      options = ($(this).data('options')) ? $(this).data('options') : defaultSettings;
      return (options[option]) ? options[option] : 'This option does not exist';
    }, 

    /**
      * Set option on selected carousel -- changes applied immediately
      *
      * @param string option      string name of option to change
      * @param value              option-specific value to set
      * @returns jQuery object
    **/
    set: function(option, value)
    {
      data = ($(this).data('options')) ? $(this).data('options') : null;
      data[option] = value;
      return $(this).trigger('sliderChange');
    },

    /**
      * Transition to next slide
      *
      * @returns jQuery object
    **/
    next: function()
    {
      return $(this).trigger('sliderTransition', {direction: 'next'});
    },

    /**
      * Transition to previous slide
      *
      * @returns jQuery object
    **/
    prev: function()
    {
      return $(this).trigger('sliderTransition', {direction: 'prev'});
    },

    /**
      * Transition to specific slide in selected carousel
      * 
      * @param integer slide      zero-indexed slide to transition to
      * @returns jQuery object
    **/
    to: function(slide)
    {
      return $(this).trigger('sliderTransition', {direction: 'specific', slide: slide});
    },

    /**
      * Start playing slideshow
      *
      * @param integer ms         time in milliseconds each slide is active, defaults to 3000
      * @returns jQuery object
    **/
    start: function(ms)
    {
      ms = ms ? ms : 3000;
      $(this).data('options')['autoPlay'] = ms;
      return $(this).trigger('sliderChange');
    },

    /**
      * Stop the carousel from playing
      *
      * @returns jQuery object
    **/
    stop: function()
    {
      return $(this).trigger('sliderStop');
    }
  }

  var defaultSettings = {
    preload           : false,              // preload slides, **recommended for image carousels, more accurate height and width calculation**
    preloadImage      : 'imgs/loading.gif', // image to show while slides are being loaded
    nextPrevLinks     : false,              // generate next-slide and previous-slide links
    pagination        : true,               // generate link for each slide
    paginationStyle   : 'circle',           // circle, square, diamond, *
    paginationPosition: 'center',
    orientation       : 'horizontal',       // horizontal, vertical **ignored if animation is set to fade**
    animation         : 'slide',            // slide, fade
    customCaption     : '',                 // HTML class to denote custom caption class to override default caption functionality, used for custom caption positioning         
    captionAnimation  : 'slide',            // slide, fade
    captionDelay      : 0,                  // delay caption animation (ms)
    pauseOnHover      : false,              // carousel will stop on when the cursor enters it
    startSlide        : 0,                  // zero-based slide index
    autoPlay          : 0,                  // when activated, will be the amount of time each slide is active in ms, 0 will deactivate autoPlay
    fadeSpeed         : 450,                // fade transition speed in ms
    fadeEasing        : 'swing',                 // fade easing, extend options using jquery.easing plugin
    slideSpeed        : 450,                // slide transition speed
    slideEasing       : 'swing',                 // slide easing, extend options using jquery.easing plugin
    adjustHeight      : false,              // carousel will adjust height its for each slide
    adjustHeightSpeed : 450,                // height transition speed
    adjustHeightEasing: 'swing',                 // height adjustment easing, extend options using jquery.easing plugin
    slideContainer    : 'slider_container', // class of container that holds slides
    currentClass      : 'current',          // class of slide that is active and showing
    paginationClass   : 'glide-pagination', // class applied to each pagination link
    nextClass         : 'next',             // class applied to next-slide link
    prevClass         : 'prev',             // class applied to previous-slide link
    browserHistory    : false,              // each slide transition will make use of pushState and enter a record in the user's browser history **not recommended if autoPlay > 0**
    keyboardNav       : false,              // enable navigation with arrow keys
    bootstrap         : false,              // experimental support for Twitter bootstrap integration
    initCallback      : function(){},       // callback function fired after carousel is initialized
    loadedCallback    : function(){},       // callback function fired after slides are loaded
    animationStart    : function(){},       // callback function fired before each animation
    animationEnd      : function(){}        // callback function fired after each animation ends
  };

})(jQuery, window, document);
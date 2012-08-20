$(document).ready(function(e){
  var scrollPositions = {
    'home'      : 0,
    'summary'   : $('#summary').offset().top - 40,
    'how'       : $('#how').offset().top - 40,
    'examples'  : $('#examples').offset().top - 40,
    'docs'      : $('#docs').offset().top - 40,
    'download'  : $('#download').offset().top - 40
  },
  navigating = false;
  
  $(window).on('scroll', function(e){
    var scroll = $('body').scrollTop(), link;
    if(!navigating)
    {
      if((scroll >= 0 && scroll < scrollPositions['summary']) || scroll < 0)
      { 
        link = 'home_link';
      }
      else if(scroll >= scrollPositions['summary'] && scroll < scrollPositions['how'])
      {
        link = 'summary_link';
      }
      else if(scroll >= scrollPositions['how'] && scroll < scrollPositions['examples'])
      {
        link = 'how_link';
      }
      else if(scroll >= scrollPositions['examples'] && scroll < scrollPositions['docs'])
      {
        link = 'examples_link';
      }
      else if(scroll >= scrollPositions['docs'] && scroll < scrollPositions['download'])
      {
        link = 'docs_link';
      }
      else {
        link = 'download_link';
      }  

      if(!$('.'+link).hasClass('active_link'))
      {
        $('.nav_inner a').removeClass('active_link');
        $('.'+link).addClass('active_link');
      }
    }

  });

  $('div.nav a, a.home_link').click(function(e){
    e.preventDefault();
    $this = $(this);
    $section = $($this.attr('href'));
    $this.siblings().add('a.home_link').removeClass('active_link');
    $this.addClass('active_link');
    scroll = ($this.hasClass('home_link')) ? 0 : $section.offset().top
    navigating = true;
    $('html,body').animate({
      scrollTop: scroll - 40
    }, function(){
      navigating = false;
    });
  }); 
});
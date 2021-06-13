//template.js

(function() {
  $(document).ready(function() {
    innerPage();
  });

  function innerPage() {
    //Инициализация lazy-load
    $('.lazyload').lazy({
  		threshold: 0,
      effect: 'fadeIn'
  	});
    // // Инициализация модуля Carousel
    // $('.carousel-slides').slick({
		// 	dots: false,
		// 	arrows: true,
		// 	prevArrow: $('.carousel-prev'),
		// 	nextArrow: $('.carousel-next'),
		// 	infinite: true
		// });
  }
})();
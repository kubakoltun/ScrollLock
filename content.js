function disableScroll() {
  window.addEventListener('scroll', function(event) {
    event.preventDefault();
    window.scrollTo(0, 0);
  }, { passive: false });
}

disableScroll();

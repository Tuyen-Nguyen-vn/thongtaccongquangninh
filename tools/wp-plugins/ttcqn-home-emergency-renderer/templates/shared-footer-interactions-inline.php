(function() {
if (!document.body.classList.contains('ttcqn-shared-footer-active')) return;
if (window.ttcqnSharedFooterInit) return;
window.ttcqnSharedFooterInit = true;

document.querySelectorAll('[data-footer-accordion]').forEach(function(section) {
  var button = section.querySelector('.footer-accordion-toggle');
  if (!button) return;

  button.addEventListener('click', function() {
    var isOpen = section.classList.toggle('is-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});
})();

document.querySelectorAll('.footer-back-top').forEach(function(button) {
  if (button.parentElement !== document.body) {
    document.body.appendChild(button);
  }

  function forceScrollTop(deadline) {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (window.scrollY <= 2 || Date.now() >= deadline) {
      return;
    }

    window.requestAnimationFrame(function() {
      forceScrollTop(deadline);
    });
  }

  button.addEventListener('click', function() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = reduceMotion ? 'auto' : 'smooth';
    var deadline = Date.now() + (reduceMotion ? 300 : 1800);

    window.scrollTo({ top: 0, behavior: behavior });
    forceScrollTop(deadline);

    window.setTimeout(function() {
      forceScrollTop(deadline);
    }, reduceMotion ? 0 : 250);
  });
});

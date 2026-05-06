
// Enhancements JS: scroll reveal, cursor dot, and interactive hover detection.
(function(){
  // Scroll reveal for elements with class 'fade-in' (or add it automatically to common sections)
  function revealOnScroll() {
    const els = document.querySelectorAll('.fade-in, .card, section, .panel, .hero, .content');
    const threshold = window.innerHeight - 80;
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < threshold) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  document.addEventListener('DOMContentLoaded', () => {
    revealOnScroll();
    // Add fade-in to top-level sections if they don't already have it
    document.querySelectorAll('section:not(.no-enhance), .hero, .content, .main').forEach(el=>{
      if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
    });

    // Create cursor dot
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let lastMove = {x: window.innerWidth/2, y: window.innerHeight/2};
    document.addEventListener('mousemove', (e)=>{
      lastMove.x = e.clientX;
      lastMove.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      // enlarge when over interactive elements
      const target = e.target;
      if (target && (target.closest('a') || target.closest('button') || target.closest('input') || target.closest('label') || target.closest('select') || target.closest('textarea') || target.closest('.btn') )){
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Reduce flashing on page load
    dot.style.opacity = '0.95';
  });
})();

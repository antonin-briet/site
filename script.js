// ===========================
// BURGER MENU
// ===========================
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===========================
// SCROLL: NAVBAR SHADOW
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.style.boxShadow = '0 2px 32px rgba(0,0,0,0.5)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

// ===========================
// FILTER BUTTONS (réalisations)
// ===========================
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      if (filter === 'all' || card.dataset.cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'fadeUp 0.4s ease both';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===========================
// SCROLL REVEAL
// ===========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .veille-card, .cert-card, .sps-card, .bloc-card, .timeline-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

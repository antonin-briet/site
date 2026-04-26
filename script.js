// ===========================
// BURGER MENU
// ===========================
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===========================
// SCROLL: NAVBAR SHADOW
// ===========================
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 2px 32px rgba(0,0,0,0.5)'
      : 'none';
  });
}

// ===========================
// FILTER BUTTONS (réalisations)
// ===========================
const cardsGrid = document.getElementById('cardsGrid');
if (cardsGrid) {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cardsGrid.querySelectorAll('.card').forEach(card => {
        const ctx = card.dataset.ctx || '';
        const match = filter === 'all' || ctx.includes(filter);
        card.classList.toggle('hidden', !match);
        // reset opacity so filtered-in cards are always visible
        if (match) {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }
      });
    });
  });
}

// ===========================
// SCROLL REVEAL (pages sans filtre uniquement)
// ===========================
if (!cardsGrid) {
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
}

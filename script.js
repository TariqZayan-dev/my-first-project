// --------- UTIL ---------
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// --------- MOBILE NAV ---------
const mobileBtn = $('.mobile-toggle');
const mobileMenu = $('#mobile-menu');
mobileBtn?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  mobileBtn.setAttribute('aria-expanded', String(open));
});

// --------- YEAR ---------
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --------- MENU DATA + RENDER ---------
const MENU = [
  { id:1, name:'Bruschetta Trio', price:28, tag:'V', cat:'starters', desc:'Tomato basil, roasted pepper, wild mushroom' },
  { id:2, name:'Burrata & Heirlooms', price:45, tag:'GF', cat:'starters', desc:'Creamy burrata, basil oil, balsamic' },
  { id:3, name:'Ragu Pappardelle', price:72, cat:'mains', desc:'12‑hour beef ragu, pecorino' },
  { id:4, name:'Wild Mushroom Risotto', price:66, tag:'V', cat:'mains', desc:'Porcini, parmesan, truffle oil' },
  { id:5, name:'Wood‑Fired Sea Bass', price:89, cat:'mains', desc:'Lemon caper butter, herbs' },
  { id:6, name:'Tiramisu', price:32, cat:'desserts', desc:'Mascarpone, espresso, cocoa' },
  { id:7, name:'Panna Cotta', price:29, cat:'desserts', desc:'Vanilla bean, berry compote' },
  { id:8, name:'Espresso', price:14, cat:'drinks', desc:'Single origin' },
  { id:9, name:'House Lemonade', price:18, cat:'drinks', desc:'Freshly squeezed, mint' }
];

const menuList = $('#menu-list');

function formatAED(val){
  try {
    return new Intl.NumberFormat('en-AE',{ style:'currency', currency:'AED'}).format(val);
  } catch (e) {
    return `AED ${val}`;
  }
}

function renderMenu(filter='all'){
  if(!menuList) return;
  const items = MENU.filter(m => filter==='all' ? true : m.cat===filter);
  menuList.innerHTML = items.map(m => `
    <article class="menu-item" role="article">
      <div>
        <h4>${m.name} ${m.tag ? `<span class="badge" title="Dietary tag">${m.tag}</span>`: ''}</h4>
        <p class="muted" style="margin:0">${m.desc}</p>
      </div>
      <div style="white-space:nowrap;font-weight:600">${formatAED(m.price)}</div>
    </article>
  `).join('');

  // Update selected state
  $$('.menu-filters .btn').forEach(b=> b.setAttribute('aria-selected','false'));
  const activeBtn = $(`.menu-filters .btn[data-filter="${filter}"]`);
  activeBtn?.setAttribute('aria-selected','true');
}

renderMenu('all');

$$('.menu-filters .btn').forEach(btn=>{
  btn.addEventListener('click', ()=> renderMenu(btn.dataset.filter));
});

// --------- RESERVATION FORM (Netlify only) ---------
(() => {
  const form = document.getElementById('reservation-form');
  const statusEl = document.getElementById('reserve-status');
  if (!form) return;

  const setHelp = (id, msg) => {
    const el = document.getElementById(id + '-help');
    if (el) el.textContent = msg || '';
  };
  const invalid = (id, msg) => {
    setHelp(id, msg);
    const f = document.getElementById(id);
    if (f) f.style.borderColor = 'var(--danger)';
  };
  const valid = (id) => {
    setHelp(id, '');
    const f = document.getElementById(id);
    if (f) f.style.borderColor = 'rgba(255,255,255,.14)';
  };

  // helper to encode for Netlify
  const encode = (data) =>
    Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k] ?? ''))
      .join('&');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    // Validation
    let ok = true;
    if(!data.name || data.name.length < 2){ invalid('name','Enter your full name'); ok=false } else { valid('name') }
    if(!data.phone || String(data.phone).replace(/\D/g,'').length < 9){ invalid('phone','Enter a valid phone'); ok=false } else { valid('phone') }
    if(!data.date){ invalid('date','Choose a date'); ok=false } else { valid('date') }
    if(!data.time){ invalid('time','Choose a time'); ok=false } else { valid('time') }
    if(!data.guests){ invalid('guests','Select number of guests'); ok=false } else { valid('guests') }

    if(!ok){ 
      if(statusEl) statusEl.textContent = 'Please fix the highlighted fields.'; 
      return; 
    }

    try {
      if(statusEl) statusEl.textContent = 'Booking…';

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'reservation', ...data })
      });

      if(statusEl) statusEl.textContent = 'Reservation received! Redirecting…';
      form.reset();

      // Wait 1.5 seconds then redirect
      // Redirect immediately after successful submit
 window.location.replace('/thanks.html');

    } catch (err) {
      if(statusEl) statusEl.textContent = 'Something went wrong. Please try again or call us.';
    }
  });
})();  // <- closes the reservation IIFE

// --------- WHATSAPP LINKS (site-wide) ---------
(() => {
  // Your WhatsApp number: country code + number, no "+" or spaces
  const WHATSAPP_NUMBER = '971542470680'; // 0542470680 -> 971542470680

  // Prefilled message
  const PREFILL = "I would like to order online please share menu!";

  // Build final URL
  const waURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

  // Apply to any link with class "wa-link"
  document.querySelectorAll('.wa-link').forEach(a => {
    a.href = waURL;
    a.target = '_blank';
    a.rel = 'noopener';
  });
})();
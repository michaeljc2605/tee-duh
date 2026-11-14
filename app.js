'use strict';

const $ = id => document.getElementById(id);

function activateTabs(tabs, index, onChange, moveFocus = false) {
  if (index < 0 || index >= tabs.length) return;
  tabs.forEach((tab, position) => {
    const active = position === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  onChange(index);
  if (moveFocus) tabs[index].focus();
}

function connectTabs(tabs, onChange) {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTabs(tabs, index, onChange));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateTabs(tabs, next, onChange, true);
      }
    });
  });
}

const personaTabs = [...document.querySelectorAll('[data-persona]')];
connectTabs(personaTabs, index => {
  personaTabs.forEach((tab, position) => {
    $(tab.getAttribute('aria-controls')).hidden = position !== index;
  });
});

const screens = [
  {
    image: 'homepage.webp',
    caption: 'Homepage · Original design screen from the project deck',
    alt: 'Tee-Duh homepage introducing Drop 03 with product styling and a Shop Collection action',
    kicker: '01 / INSPIRE',
    title: 'Start with a world\nthe shopper wants to enter.',
    text: 'The three-panel fashion image gives Drop 03 a clear visual identity. “Dressed for the heat” connects the styling to the brand’s Singapore context.',
    purpose: 'Alégor’s discovery comes first: the new drop and collection action are immediately visible.'
  },
  {
    image: 'catalogue-screen.webp',
    caption: 'Shop All catalogue · Original design screen from the project deck',
    alt: 'Tee-Duh Shop All catalogue with the Air Shirt as the lead product, category and fit filters, and visible prices',
    kicker: '02 / EXPLORE',
    title: 'Give the catalogue\na clear starting point.',
    text: 'Shop All leads with the Air Shirt and a short explanation of its fabric and everyday use. Category, fit and sorting controls support further exploration.',
    purpose: 'The lead product reflects Alégor’s priority. Separate Women and Men catalogues give the other personas their own starting points.'
  },
  {
    image: 'product-screen.webp',
    caption: 'Air Shirt product detail · Original design screen from the project deck',
    alt: 'Air Shirt product page showing front and back images, S$59 price, colour and size options, size guide, and separate Shopee and Lazada buttons',
    kicker: '03 / DECIDE',
    title: 'Make the details\npart of the decision.',
    text: 'Front and back views, visible pricing, colour and size options, and the size-guide link help shoppers inspect the piece. Two named marketplace buttons make the next destination clear.',
    purpose: 'Fit information supports Alégor; product and policy details support Diniyan. Both can see where checkout happens before leaving the site.'
  }
];

const screenTabs = [...document.querySelectorAll('[data-screen]')];
let currentScreen = 0;

function renderScreen(index) {
  currentScreen = index;
  const screen = screens[index];
  $('screen-panel').setAttribute('aria-labelledby', `screen-tab-${index}`);
  $('screen-image').src = `assets/screens/${screen.image}`;
  $('screen-image').alt = screen.alt;
  $('screen-caption').textContent = screen.caption;
  $('screen-kicker').textContent = screen.kicker;
  $('screen-title').replaceChildren(...screen.title.split('\n').flatMap((text, position) => position ? [document.createElement('br'), document.createTextNode(text)] : [document.createTextNode(text)]));
  $('screen-text').textContent = screen.text;
  $('screen-purpose').textContent = screen.purpose;
  $('screen-count').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
  $('screen-prev').disabled = index === 0;
  $('screen-next').disabled = index === screens.length - 1;
}

connectTabs(screenTabs, renderScreen);
$('screen-prev').addEventListener('click', () => activateTabs(screenTabs, currentScreen - 1, renderScreen));
$('screen-next').addEventListener('click', () => activateTabs(screenTabs, currentScreen + 1, renderScreen));

const dialog = $('screen-dialog');
$('expand-screen').addEventListener('click', () => {
  const screen = screens[currentScreen];
  $('dialog-image').src = `assets/screens/${screen.image}`;
  $('dialog-image').alt = screen.alt;
  $('dialog-caption').textContent = screen.caption;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else window.open(`assets/screens/${screen.image}`, '_blank', 'noopener');
});
$('close-screen').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const chapters = chapterLinks.map(link => document.querySelector(link.getAttribute('href')));
function updateReadingPosition() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  $('reading-progress').style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 0}%`;
  let current = chapters[0];
  for (const section of chapters) {
    if (section.getBoundingClientRect().top <= 150) current = section;
  }
  chapterLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${current.id}`;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let scrollScheduled = false;
window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    updateReadingPosition();
    scrollScheduled = false;
  });
}, { passive: true });
window.addEventListener('resize', updateReadingPosition);
window.addEventListener('load', updateReadingPosition);
updateReadingPosition();

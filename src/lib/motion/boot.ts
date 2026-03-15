import Lenis from 'lenis';
import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { animate, stagger } from 'animejs';

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

root.classList.add('js-ready');

if (prefersReducedMotion.matches) {
  root.classList.add('reduced-motion');
}

function initLenis() {
  if (prefersReducedMotion.matches) return;

  const lenis = new Lenis({
    duration: 1.02,
    wheelMultiplier: 0.84,
    touchMultiplier: 1,
    smoothWheel: true,
  });

  const frame = (time: number) => {
    lenis.raf(time);
    window.requestAnimationFrame(frame);
  };

  window.requestAnimationFrame(frame);
}

function revealElement(target: Element) {
  const items = Array.from(target.querySelectorAll<HTMLElement>('[data-reveal-item]'));

  if (!items.length) return;

  animate(items, {
    opacity: [0, 1],
    translateY: [28, 0],
    scale: [0.992, 1],
    filter: ['blur(10px)', 'blur(0px)'],
    duration: 900,
    delay: stagger(90),
    ease: 'out(5)',
  });
}

function initRevealObserver() {
  if (prefersReducedMotion.matches) return;

  const groups = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-group]'));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      }
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -12% 0px',
    },
  );

  groups.forEach((group) => observer.observe(group));
}

function initHeroReveal() {
  if (prefersReducedMotion.matches) return;

  const lines = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-line]'));
  const visuals = Array.from(document.querySelectorAll<HTMLElement>('[data-hero-visual]'));

  if (lines.length) {
    animate(lines, {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.992, 1],
      filter: ['blur(12px)', 'blur(0px)'],
      duration: 1080,
      delay: stagger(110, { start: 130 }),
      ease: 'out(6)',
    });
  }

  visuals.forEach((visual, index) => {
    animate(visual, {
      opacity: [0, 1],
      translateY: [36, 0],
      scale: [0.975, 1],
      filter: ['blur(14px)', 'blur(0px)'],
      duration: 1160,
      delay: 250 + index * 80,
      ease: 'out(6)',
    });
  });
}

function initHoverLift() {
  if (prefersReducedMotion.matches) return;

  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-hover-lift]'));

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      animate(item, {
        translateY: -3,
        scale: 1.005,
        duration: 220,
        ease: 'out(4)',
      });
    });

    item.addEventListener('mouseleave', () => {
      animate(item, {
        translateY: 0,
        scale: 1,
        duration: 220,
        ease: 'out(4)',
      });
    });
  });
}

function initEmbla() {
  const carousels = Array.from(document.querySelectorAll<HTMLElement>('[data-embla]'));

  carousels.forEach((carousel) => {
    const viewport = carousel.querySelector<HTMLElement>('[data-embla-viewport]');

    if (!viewport) return;

    const autoplay = prefersReducedMotion.matches
      ? []
      : [
          Autoplay({
            delay: 4200,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            rootNode: () => carousel,
          }),
        ];

    const embla = EmblaCarousel(
      viewport,
      {
        align: 'start',
        dragFree: true,
        loop: !prefersReducedMotion.matches,
      },
      autoplay,
    );

    const slides = Array.from(carousel.querySelectorAll<HTMLElement>('.embla__slide'));

    const syncSlides = () => {
      const inView = embla.slidesInView();

      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', inView.includes(index));
      });
    };

    syncSlides();
    embla.on('select', syncSlides);
    embla.on('scroll', syncSlides);
    embla.on('reInit', syncSlides);
  });
}

function initAccordion() {
  const accordions = Array.from(document.querySelectorAll<HTMLElement>('[data-accordion]'));

  accordions.forEach((accordion) => {
    const items = Array.from(accordion.querySelectorAll<HTMLDetailsElement>('details'));

    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;

        items.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.open = false;
          }
        });
      });
    });
  });
}

initLenis();
initHeroReveal();
initRevealObserver();
initHoverLift();
initEmbla();
initAccordion();

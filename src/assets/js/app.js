import MobileMenu from 'mmenu-light';
import Swal from 'sweetalert2';
import initHadeelMotion from './partials/motion';
import initTootTip from './partials/tooltip';
import AppHelpers from "./app-helpers";

class App extends AppHelpers {
  constructor() {
    super();
    window.app = this;
  }

  loadTheApp() {
    // HDL-06: one shared motion controller on the existing entry — no new
    // chunk or request; everything it drives is progressive enhancement.
    initHadeelMotion();
    this.commonThings();
    this.initiateNotifier();
    this.initiateMobileMenu();
    if (header_is_sticky) {
      this.initiateStickyMenu();
    }
    this.initAddToCart();
    this.initIconOnlyCartButtons();
    this.initiateDropdowns();
    this.initiateModals();
    this.initiateCollapse();
    
    // Ensure #more-menu-dropdown exists before running changeMenuDirection
    const menuDirInterval = setInterval(() => {
      if (document.querySelector('#more-menu-dropdown')) {
        this.changeMenuDirection();
        clearInterval(menuDirInterval);
      }
    }, 100);

    initTootTip();
    this.loadModalImgOnclick();

    salla.comment.event.onAdded(() => window.location.reload());

    this.status = 'ready';
    document.dispatchEvent(new CustomEvent('theme::ready'));
    this.log('Theme Loaded 🎉');
  }

  log(message) {
    salla.log(`ThemeApp(Hadeel)::${message}`);
    return this;
  }

    changeMenuDirection() {
      setTimeout(() => {
        app.all('.root-level.has-children', item => {
          if (item.classList.contains('change-menu-dir')) return;
          app.on('mouseover', item, () => {
            let allSubMenus = item.querySelectorAll('.sub-menu');
            allSubMenus.forEach((submenu, idx) => {
              if (idx === 0) return;
              let rect = submenu.getBoundingClientRect();
              if (rect.left < 10 || rect.right > window.innerWidth - 10) {
                app.addClass(item, 'change-menu-dir');
              }
            });
          });
        });
      }, 1000);
    }

  loadModalImgOnclick(){
    document.querySelectorAll('.load-img-onclick').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        let modal = document.querySelector('#' + link.dataset.modalId),
          img = modal.querySelector('img'),
          imgSrc = img.dataset.src;
        modal.open();

        if (img.classList.contains('loaded')) return;

        img.src = imgSrc;
        img.classList.add('loaded');
      })
    })
  }

  commonThings() {
    this.cleanContentArticles('.content-entry');
  }

  cleanContentArticles(elementsSelector) {
    let articleElements = document.querySelectorAll(elementsSelector);

    if (articleElements.length) {
      articleElements.forEach(article => {
        article.innerHTML = article.innerHTML.replace(/\&nbsp;/g, ' ')
      })
    }
  }

isElementLoaded(selector){
  return new Promise((resolve=>{
    const interval=setInterval(()=>{
    if(document.querySelector(selector)){
      clearInterval(interval)
      return resolve(document.querySelector(selector))
    }
   },160)
}))

  
  };

  copyToClipboard(event) {
    event.preventDefault();
    let aux = document.createElement("input"),
    btn = event.currentTarget;
    aux.setAttribute("value", btn.dataset.content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    this.toggleElementClassIf(btn, 'copied', 'code-to-copy', () => true);
    setTimeout(() => {
      this.toggleElementClassIf(btn, 'code-to-copy', 'copied', () => true)
    }, 1000);
  }

  initiateNotifier() {
    salla.notify.setNotifier(function (message, type, data) {
      if (window.enable_add_product_toast && data?.data?.googleTags?.event === "addToCart") {
        return;
      }
      if (typeof message == 'object') {
        return Swal.fire(message).then(type);
      }

      return Swal.mixin({
        toast: true,
        position: salla.config.get('theme.is_rtl') ? 'top-start' : 'top-end',
        showConfirmButton: false,
        timer: 2000,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message,
        showCloseButton: true,
        timerProgressBar: true
      })
    });
  }


  initiateMobileMenu() {
  // HDL-07: header_show_menu=false renders no trigger and no #mobile-menu —
  // bail instead of polling forever for an element that will never exist.
  if (!this.element("a[href='#mobile-menu']")) {
    return;
  }

  this.isElementLoaded('#mobile-menu').then((menu) => {

 
  const mobileMenu = new MobileMenu(menu, "(max-width: 1024px)", "( slidingSubmenus: false)");

  salla.lang.onLoaded(() => {
    mobileMenu.navigation({ title: salla.lang.get('blocks.header.main_menu') });
  });
  const drawer = mobileMenu.offcanvas({ position: salla.config.get('theme.is_rtl') ? "right" : 'left' });

  this.onClick("a[href='#mobile-menu']", event => {
    document.body.classList.add('menu-opened');
    event.preventDefault() || drawer.close() || drawer.open()
    
  });
  this.onClick(".close-mobile-menu", event => {
    document.body.classList.remove('menu-opened');
    event.preventDefault() || drawer.close()
  });
  });

  }

  /*
   * HDL-07 (T018): the one shared Sticky/Scrolled controller for all four layouts.
   * Installed only when header_is_sticky is a real boolean true (master.twig
   * serializes it), so sticky=false installs no scroll listener at all. Height is
   * measured from the actual shell (.inner) before it can pin and refreshed on
   * load/resize; scroll work is batched through at most one pending rAF callback
   * on a single passive listener. State classes are idempotent and layout-owned.
   */
  initiateStickyMenu() {
    const header = this.element('#mainnav');
    //when it's landing page, there is no header
    if (!header) {
      return;
    }

    this.setHeaderHeight();
    window.addEventListener('load', () => setTimeout(() => this.setHeaderHeight(), 500))
    window.addEventListener('resize', () => this.setHeaderHeight())

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const height = this.element('#mainnav .inner')?.clientHeight ?? 0;
        window.scrollY >= header.offsetTop + height ? header.classList.add('fixed-pinned', 'animated') : header.classList.remove('fixed-pinned');
        window.scrollY >= 200 ? header.classList.add('fixed-header') : header.classList.remove('fixed-header', 'animated');
      });
    }, { passive: true });
  }

  setHeaderHeight() {
    let height = this.element('#mainnav .inner').clientHeight,
      header = this.element('#mainnav');
    header.style.height = height + 'px';
  }

  initiateDropdowns() {
    document.querySelectorAll('.dropdown-toggler').forEach((wrapper) => {
      const btn = wrapper.querySelector('.dropdown__trigger');
      const menu = wrapper.querySelector('.dropdown__menu');
      if (!btn || !menu) return;

      const setOpen = (isOpen) => {
        wrapper.classList.toggle('is-opened', isOpen);
        document.body.classList.toggle('dropdown--is-opened', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        // Keyboard users land on the first destination, not the chrome around it.
        if (isOpen) menu.querySelector('a')?.focus({ preventScroll: true });
      };

      btn.addEventListener('click', () => setOpen(!wrapper.classList.contains('is-opened')));

      wrapper.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !wrapper.classList.contains('is-opened')) return;
        event.stopPropagation();
        setOpen(false);
        btn.focus();
      });

      menu.querySelector('.dropdown__close')?.addEventListener('click', () => {
        setOpen(false);
        btn.focus();
      });
    });

    // Click outside any open dropdown closes it and re-syncs its trigger state.
    document.addEventListener('click', ({ target }) => {
      document.querySelectorAll('.dropdown-toggler.is-opened').forEach((wrapper) => {
        if (wrapper.contains(target)) return;
        wrapper.classList.remove('is-opened');
        document.body.classList.remove('dropdown--is-opened');
        wrapper.querySelector('.dropdown__trigger')?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  initiateModals() {
    this.onClick('[data-modal-trigger]', e => {
      let id = '#' + e.target.dataset.modalTrigger;
      this.removeClass(id, 'hidden');
      setTimeout(() => this.toggleModal(id, true)); //small amont of time to running toggle After adding hidden
    });
    salla.event.document.onClick("[data-close-modal]", e => this.toggleModal('#' + e.target.dataset.closeModal, false));
  }

  toggleModal(id, isOpen) {
    // The transition lives in 02-generic/common.scss on the shared
    // .s-salla-modal-* classes (the markup may be runtime-injected by Salla
    // apps, so it stays class-based); only state classes are toggled here.
    this.toggleClassIf(`${id} .s-salla-modal-overlay`, 'opacity-100', 'opacity-0', () => isOpen)
      .toggleClassIf(`${id} .s-salla-modal-body`,
        'opacity-100 translate-y-0 sm:scale-100', //add these classes
        'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95', //remove these classes
        () => isOpen)
      .toggleElementClassIf(document.body, 'modal-is-open', 'modal-is-closed', () => isOpen);
    if (!isOpen) {
      // Bounded, token-derived cleanup: hide only after the close transition settles.
      const settle = (window.hadeelMotion?.durationMs?.('--motion-duration-ui', 300) ?? 300) + 50;
      setTimeout(() => this.addClass(id, 'hidden'), settle);
    }
  }

  initiateCollapse() {
    document.querySelectorAll('.btn--collapse')
      .forEach((trigger) => {
        const content = document.querySelector('#' + trigger.dataset.show);
        if (!content) return;

        const setOpen = (isOpen) => {
          // The helper adds its FIRST class when the callback is true, so the
          // open class must come first — inverted order keeps the panel closed.
          this.toggleElementClassIf([content, trigger], 'is-opened', 'is-closed', () => isOpen);
          trigger.setAttribute('aria-expanded', String(isOpen));
          // Collapsed content is visually folded but must also leave the tab order.
          content.inert = !isOpen;
        };

        if (!content.classList.contains('is-opened')) content.inert = true;

        trigger.addEventListener('click', () => {
          setOpen(!content.classList.contains('is-opened'));
        });

        content.addEventListener('keydown', (event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          setOpen(false);
          trigger.focus();
        });
      });
  }


  /**
   * These actions are responsible for pressing "add to cart" button,
   * they can be from any page, especially when mega-menu is enabled
   */
  initAddToCart() {
    // The badge is the theme's own markup, so it has to read the count from the
    // same place `salla-cart-summary` reads it at load; `onUpdated` alone only
    // fires after a change, which left the badge blank on first paint.
    this.updateCartCount(salla.storage.get('cart.summary.count'));

    salla.cart.event.onUpdated(summary => {
      document.querySelectorAll('[data-cart-total]').forEach(el => el.innerHTML = salla.money(summary.total));
      this.updateCartCount(summary.count);
    });

    salla.cart.event.onItemAdded((response, prodId) => {
      // HDL-07: header_show_cart=false removes the summary; the optional chain
      // keeps add-to-cart working without it.
      app.element('salla-cart-summary')?.animateToCart(app.element(`#product-${prodId} img`));
    });
  }

  /**
   * Writes the cart count into every `[data-cart-count]` badge and hides the
   * badge when the cart is empty — an empty pill with no digit is worse than
   * no pill at all.
   *
   * @param {number|string|null} count
   */
  updateCartCount(count) {
    const value = Number(count) || 0;

    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.innerText = value ? salla.helpers.number(value) : '';
      el.classList.toggle('is-empty', !value);
    });
  }

  initIconOnlyCartButtons() {
    const selector = '.s-product-card-content-footer salla-add-product-button';

    /* The server-resolved catalogue is the bridge; the default is English-only. */
    const getAddToCartLabel = () => salla.lang.getWithDefault('pages.cart.add_to_cart', 'Add to cart');

    const applyToButton = (button) => {
      if (!(button instanceof HTMLElement) || button.dataset.iconOnlyCartApplied === 'true') {
        return;
      }

      button.dataset.iconOnlyCartApplied = 'true';
      button.classList.add('s-product-card-add-btn-icon-only');
      button.setAttribute('shape', 'icon');
      button.setAttribute('width', 'normal');
      button.setAttribute('loader-position', 'center');
      button.setAttribute('aria-label', getAddToCartLabel());
      button.innerHTML = '<i class="sicon-shopping-bag" aria-hidden="true"></i>';
    };

    const applyToRoot = (root) => {
      if (!root || !(root instanceof Element || root instanceof Document)) return;
      if (root instanceof Element && root.matches(selector)) {
        applyToButton(root);
      }
      root.querySelectorAll?.(selector).forEach(applyToButton);
    };

    applyToRoot(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            applyToRoot(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

salla.onReady(() => (new App).loadTheApp());

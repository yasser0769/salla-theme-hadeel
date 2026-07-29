import 'lite-youtube-embed';
import BasePage from './base-page';
import Fslightbox from 'fslightbox';
window.fslightbox = Fslightbox;
import { zoom } from './partials/image-zoom';

class Product extends BasePage {
    onReady() {
        app.watchElements({
            totalPrice: '.total-price',
            productWeight: '.product-weight',
            beforePrice: '.before-price',
            startingPriceTitle: '.starting-price-title',
        });

        this.initProductOptionValidations();
        this.initProductDock();
        this.initRelatedProducts();

        if(imageZoom){
            // call the function when the page is ready
            this.initImagesZooming();
            // listen to screen resizing
            window.addEventListener('resize', () => this.initImagesZooming());
        }
    }

    initProductOptionValidations() {
      document.querySelector('.product-form')?.addEventListener('change', function(){
        this.reportValidity() && salla.product.getPrice(new FormData(this));
      });
    }

    initProductDock() {
      const dock = document.querySelector('[data-product-dock]');
      const form = document.querySelector('.product-form');
      const submit = dock?.querySelector('[data-product-dock-submit]');
      const dockQuantity = dock?.querySelector('[data-product-dock-quantity]');
      const mainQuantity = form?.querySelector('salla-quantity-input[name="quantity"]');
      const desktop = window.matchMedia('(min-width: 768px)');

      if (!dock || !form || !submit) return;

      const updateDockVisibility = () => {
        const visible = desktop.matches && window.scrollY > 180;
        dock.classList.toggle('is-visible', visible);
        dock.setAttribute('aria-hidden', visible ? 'false' : 'true');
      };

      submit.addEventListener('click', () => {
        if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
          return;
        }

        form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
      });

      dockQuantity?.addEventListener('change', async () => {
        if (!mainQuantity?.setValue) return;
        await mainQuantity.setValue(dockQuantity.quantity || 1, true);
      });

      mainQuantity?.addEventListener('change', async () => {
        if (!dockQuantity?.setValue) return;
        await dockQuantity.setValue(mainQuantity.quantity || 1, false);
      });

      window.addEventListener('scroll', updateDockVisibility, {passive: true});
      desktop.addEventListener?.('change', updateDockVisibility);
      updateDockVisibility();
    }

    initRelatedProducts() {
      const section = document.querySelector('[data-related-products]');
      const slider = section?.querySelector('salla-products-slider');

      if (!section || !slider) return;

      customElements.whenDefined('salla-products-slider').then(() => {
        const root = slider.shadowRoot || slider;
        const productSelector =
          'custom-salla-product-card, salla-product-card, .s-product-card-entry';
        const revealIfPopulated = () => {
          if (!root.querySelector(productSelector)) return false;
          section.hidden = false;
          observer.disconnect();
          return true;
        };
        const observer = new MutationObserver(revealIfPopulated);

        if (!revealIfPopulated()) {
          observer.observe(root, {childList: true, subtree: true});
        }
      });
    }

    initImagesZooming() {
      // skip if the screen is not desktop or if glass magnifier
      // is already crated for the image before
      const imageZoom = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active .img-magnifier-glass');
      if (window.innerWidth  < 1024 || imageZoom) return;
      setTimeout(() => {
          // set delay after the resizing is done, start creating the glass
          // to create the glass in the proper position
          const image = document.querySelector('.image-slider .swiper-slide-active img');
          zoom(image?.id, 2);
      }, 250);
  

      document.querySelector('salla-slider.details-slider').addEventListener('slideChange', (e) => {
          // set delay till the active class is ready
          setTimeout(() => {
              const imageZoom = document.querySelector('.image-slider .swiper-slide-active .img-magnifier-glass');
    
              // if the zoom glass is already created skip
              if (window.innerWidth  < 1024 || imageZoom) return;
              const image = document.querySelector('.image-slider .magnify-wrapper.swiper-slide-active img');
              zoom(image?.id, 2);
          }, 250)
      })
    }

    registerEvents() {
      salla.event.on('product::price.updated.failed',()=>{
        app.element('.price-wrapper').classList.add('hidden');
        const outOfStock = app.element('.out-of-stock');
        outOfStock.classList.remove('hidden');
        outOfStock.classList.remove('scale-pulse');
        void outOfStock.offsetWidth; // trigger reflow
        outOfStock.classList.add('scale-pulse');
      })
      salla.product.event.onPriceUpdated((res) => {

        app.element('.out-of-stock').classList.add('hidden')
        app.element('.price-wrapper').classList.remove('hidden')

        let data = res.data,
            is_on_sale = data.has_sale_price && data.regular_price > data.price,
            saving_amount = is_on_sale ? data.regular_price - data.price : 0;

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});
        document.querySelectorAll('[data-saving-value]').forEach((el) => {
          el.innerHTML = salla.money(saving_amount);
        });

        app.toggleClassIf('.price_is_on_sale','showed','hidden', ()=> is_on_sale)
        app.toggleClassIf('.starting-or-normal-price','hidden','showed', ()=> is_on_sale)
        app.toggleClassIf('.kalles-product-saving','showed','hidden', ()=> saving_amount > 0)

        document.querySelectorAll('.total-price, .product-weight').forEach(el => {
          el.classList.remove('scale-pulse');
          void el.offsetWidth; // trigger reflow
          el.classList.add('scale-pulse');
        });
      });

    }
}

Product.initiateWhenReady(['product.single']);

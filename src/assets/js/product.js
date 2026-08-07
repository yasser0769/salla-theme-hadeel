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
        this.initRelatedProducts();
        this.initAddToCartAnimation();
        this.initCompactInstallments();
        this.updateSalePricing();

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

    /**
     * Reads the rendered pricing block on first paint, or takes an explicit payload from
     * `product::price.updated`. The two sources are never mixed: falling back to the
     * wrapper for a field the API left out would measure the selected variant against the
     * page's base price and invent a discount. `hasSalePrice` mirrors Salla's own flag,
     * because a price lower than the regular price is not by itself a sale.
     */
    updateSalePricing(pricing) {
      const {regular, sale, hasSalePrice} = pricing || this.readRenderedPricing();
      const isOnSale = hasSalePrice
        && Number.isFinite(regular)
        && Number.isFinite(sale)
        && regular > sale;
      const savingAmount = isOnSale ? Number((regular - sale).toFixed(2)) : 0;
      const discountPercent = isOnSale && regular > 0
        ? Math.round((savingAmount / regular) * 100)
        : 0;

      document.querySelectorAll('[data-saving-value]').forEach((element) => {
        element.innerHTML = salla.money(savingAmount);
      });
      document.querySelectorAll('[data-discount-percent]').forEach((element) => {
        element.textContent = `-${discountPercent}%`;
        element.classList.toggle('hidden', !discountPercent);
      });
      app.toggleClassIf('.kalles-product-saving', 'showed', 'hidden', () => savingAmount > 0);

      return { isOnSale, savingAmount };
    }

    readRenderedPricing() {
      const priceWrapper = document.querySelector('[data-product-pricing]');

      return {
        regular: Number(priceWrapper?.dataset.regularPrice),
        sale: Number(priceWrapper?.dataset.salePrice),
        hasSalePrice: priceWrapper?.dataset.isOnSale === 'true',
      };
    }

    /**
     * salla-products-slider still renders its block title and arrows when the fetch
     * comes back with zero products, which left a titled empty gap on the page. It
     * announces the result on `salla-products-slider::products.fetched`, so listen for
     * that instead of watching the DOM for cards to appear.
     */
    initRelatedProducts() {
      const section = document.querySelector('[data-related-products]');
      if (!section) return;

      section.hidden = true;

      salla.event.on('salla-products-slider::products.fetched', (products) => {
        if (Array.isArray(products) && products.length) section.hidden = false;
      });
    }

    /**
     * Mirrors Kalles' buy-button control: wait for the configured interval, apply the
     * selected animation for one second, then remove it so the next loop can replay.
     * The class is applied to Twilight's real button rather than the custom-element
     * host. Reduced-motion users get no timer, and unavailable products are skipped.
     */
    initAddToCartAnimation() {
      const component = document.querySelector('[data-add-to-cart-animation]');
      const animation = component?.dataset.addToCartAnimation;
      const allowedAnimations = new Set([
        'bounce',
        'tada',
        'swing',
        'flash',
        'fade-in',
        'heart-beat',
        'shake',
      ]);

      if (!component || !allowedAnimations.has(animation)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const configuredInterval = Number(component.dataset.addToCartAnimationInterval);
      const intervalSeconds = Math.min(40, Math.max(2, configuredInterval || 6));
      const animationClass = `hadeel-atc-animation--${animation}`;

      customElements.whenDefined('salla-add-product-button').then(async () => {
        if (typeof component.componentOnReady === 'function') {
          await component.componentOnReady();
        }

        const play = () => {
          const button = component.querySelector('.s-button-btn:not(:disabled), .s-button-element:not(:disabled)');
          if (!button) return;

          button.classList.remove(animationClass);
          void button.offsetWidth;
          button.classList.add(animationClass);
          window.setTimeout(() => button.classList.remove(animationClass), 1000);
        };

        window.setInterval(play, intervalSeconds * 1000);
      });
    }

    /**
     * Renders merchant-selected providers independently from checkout configuration.
     * An active provider opens its authenticated Salla SDK dialog; otherwise the
     * theme-owned guide remains available as a safe fallback.
     */
    initCompactInstallments() {
      const container = document.querySelector('[data-hadeel-installments]');
      const bar = container?.querySelector('[data-installment-bar]');
      const nativeContainer = container?.querySelector('.hadeel-installments__native');
      const installment = container?.querySelector('salla-installment');
      const modal = document.getElementById('hadeel-installment-modal');
      const modalBrand = modal?.querySelector('[data-installment-modal-brand]');
      const buttons = Array.from(container?.querySelectorAll('[data-installment-provider]') || []);

      if (!container || !bar || !modal || !modalBrand || !buttons.length) return;

      let configuredProviders = [];
      try {
        const parsedProviders = JSON.parse(container.dataset.installmentProviders || '[]');
        configuredProviders = (Array.isArray(parsedProviders) ? parsedProviders : [parsedProviders])
          .map((provider) => typeof provider === 'string' ? provider : provider?.value)
          .filter(Boolean);
      } catch {
        configuredProviders = [];
      }

      const selectedProviders = new Set(configuredProviders);
      const visibleButtons = buttons.filter((button) => {
        const isSelected = selectedProviders.has(button.dataset.installmentProvider);
        button.hidden = !isSelected;
        button.disabled = !isSelected;
        return isSelected;
      });

      bar.hidden = visibleButtons.length === 0;

      visibleButtons.forEach((button) => {
        button.addEventListener('click', async () => {
          const provider = button.dataset.installmentProvider;
          const nativeSource = this.getInstallmentProviderSource(installment, provider);
          const nativeTrigger = this.getInstallmentProviderTrigger(nativeSource, provider);

          if (nativeTrigger) {
            nativeContainer?.removeAttribute('aria-hidden');
            nativeTrigger.click();
            return;
          }

          const brandLogo = button.querySelector('.hadeel-installments__brand-logo');

          modalBrand.dataset.installmentModalProvider = provider;
          modalBrand.replaceChildren(brandLogo?.cloneNode(true) || document.createTextNode(''));

          await customElements.whenDefined('salla-modal');
          if (typeof modal.componentOnReady === 'function') {
            await modal.componentOnReady();
          }
          await modal.setTitle(button.dataset.installmentTitle || '');
          await modal.open();
        });
      });

      customElements.whenDefined('salla-installment').then(async () => {
        if (typeof installment?.componentOnReady === 'function') {
          await installment.componentOnReady();
        }
      });
    }

    getInstallmentProviderSource(installment, provider) {
      if (!installment) return null;

      const selectors = {
        tamara: 'tamara-widget, .tamara-product-widget',
        tabby: '#tabbyPromo',
        mispay: 'mispay-widget',
      };

      return selectors[provider] ? installment.querySelector(selectors[provider]) : null;
    }

    getInstallmentProviderTrigger(source, provider) {
      if (!source) return null;

      if (provider === 'mispay') {
        return this.findDeepInstallmentElement(source.shadowRoot, (element) => element.matches('a'));
      }

      if (provider === 'tamara' && source.matches('.tamara-product-widget')) {
        return source;
      }

      const root = source.shadowRoot || source;
      const semanticTrigger = this.findDeepInstallmentElement(root, (element) => (
        element.matches('button, a, [role="button"]')
      ));
      if (semanticTrigger) return semanticTrigger;

      return this.findDeepInstallmentElement(root, (element) => (
        window.getComputedStyle(element).cursor === 'pointer'
      ));
    }

    findDeepInstallmentElement(root, predicate) {
      if (!root) return null;

      const children = Array.from(root.children || []);
      for (const element of children) {
        if (predicate(element)) return element;
      }

      for (const element of children) {
        const shadowMatch = this.findDeepInstallmentElement(element.shadowRoot, predicate);
        if (shadowMatch) return shadowMatch;

        const childMatch = this.findDeepInstallmentElement(element, predicate);
        if (childMatch) return childMatch;
      }

      return null;
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
            { isOnSale: is_on_sale } = this.updateSalePricing({
              regular: Number(data.regular_price),
              sale: Number(data.price),
              hasSalePrice: !!data.has_sale_price,
            });

        app.startingPriceTitle?.classList.add('hidden');

        app.productWeight.forEach((el) => {el.innerHTML = data.weight || ''});
        app.totalPrice.forEach((el) => {el.innerHTML = salla.money(data.price)});
        app.beforePrice.forEach((el) => {el.innerHTML = salla.money(data.regular_price)});
        app.toggleClassIf('.price_is_on_sale','showed','hidden', ()=> is_on_sale)
        app.toggleClassIf('.starting-or-normal-price','hidden','showed', ()=> is_on_sale)

        document.querySelectorAll('.total-price, .product-weight').forEach(el => {
          el.classList.remove('scale-pulse');
          void el.offsetWidth; // trigger reflow
          el.classList.add('scale-pulse');
        });
      });

    }
}

Product.initiateWhenReady(['product.single']);

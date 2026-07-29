import BasePage from '../base-page';
class ProductCard extends HTMLElement {
  constructor(){
    super()
  }
  
  connectedCallback(){
    // Parse product data
    this.product = this.product || JSON.parse(this.getAttribute('product')); 

    if (window.app?.status === 'ready') {
      this.onReady();
    } else {
      document.addEventListener('theme::ready', () => this.onReady() )
    }
  }

  onReady(){
      this.fitImageHeight = salla.config.get('store.settings.product.fit_type');
      this.placeholder = salla.url.asset(salla.config.get('theme.settings.placeholder'));
      this.getProps()
      this.quickViewLabel = document.documentElement.dir === 'rtl' ? 'عرض سريع' : 'Quick view';
      this.quickAddLabel = document.documentElement.dir === 'rtl' ? 'إضافة سريعة' : 'Quick add';
      this.detailsLabel = document.documentElement.dir === 'rtl' ? 'عرض التفاصيل' : 'View details';
      this.bindKallesCardInteractions();

	  this.source = salla.config.get("page.slug");
      // If the card is in the landing page, hide the add button and show the quantity
	  if (this.source == "landing-page") {
	  	this.hideAddBtn = true;
	  	this.showQuantity = window.showQuantity;
	  }

      salla.lang.onLoaded(() => {
        // Language
        this.remained = salla.lang.get('pages.products.remained');
        this.donationAmount = salla.lang.get('pages.products.donation_amount');
        this.startingPrice = salla.lang.get('pages.products.starting_price');
        this.addToCart = salla.lang.get('pages.cart.add_to_cart');
        this.outOfStock = salla.lang.get('pages.products.out_of_stock');
        this.quickViewLabel = salla.lang.getWithDefault?.('pages.products.quick_view', this.quickViewLabel) || this.quickViewLabel;

        // re-render to update translations
        this.render();
      })
      
      this.render()
  }

  initCircleBar() {
    let qty = this.product.quantity,
      total = this.product.quantity > 100 ? this.product.quantity * 2 : 100,
      roundPercent = (qty / total) * 100,
      bar = this.querySelector('.s-product-card-content-pie-svg-bar'),
      strokeDashOffsetValue = 100 - roundPercent;
    bar.style.strokeDashoffset = strokeDashOffsetValue;
  }

  formatDate(date) {
    let d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  } 

  getProductBadge() {
    if (this.product?.preorder?.label) {
      const label = this.product.preorder.label;
      return `<div class="s-product-card-promotion-title${this.isNewBadge(label) ? ' is-new' : ''}">${this.escapeHTML(label)}</div>`
    }

    if (this.product.promotion_title) {
      const label = this.product.promotion_title;
      return `<div class="s-product-card-promotion-title${this.isNewBadge(label) ? ' is-new' : ''}">${this.escapeHTML(label)}</div>`
    }
    if (this.showQuantity && this.product?.quantity) {
      return `<div
        class="s-product-card-quantity">${this.remained} ${salla.helpers.number(this.product?.quantity)}</div>`
    }
    if (this.showQuantity && this.product?.is_out_of_stock) {
      return `<div class="s-product-card-out-badge">${this.outOfStock}</div>`
    }
    return '';
  }

  isNewBadge(label = '') {
    return /(^|\s)(new|جديد|جديدة)(\s|$)/i.test(String(label).trim());
  }

  getPriceFormat(price) {
    if (!price || price == 0) {
      return salla.config.get('store.settings.product.show_price_as_dash')?'-':'';
    }

    return salla.money(price);
  }

  getProductPrice() {
    let price = '';
    if (this.product.is_on_sale) {
      price = `<div class="s-product-card-sale-price">
                <h4>${this.getPriceFormat(this.product.sale_price)}</h4>
                <span>${this.getPriceFormat(this.product?.regular_price)}</span>
              </div>`;
    }
    else if (this.product.starting_price) {
      price = `<div class="s-product-card-starting-price">
                  <p>${this.startingPrice}</p>
                  <h4> ${this.getPriceFormat(this.product?.starting_price)} </h4>
              </div>`
    }
    else{
      price = `<h4 class="s-product-card-price">${this.getPriceFormat(this.product?.price)}</h4>`
    }

    return price;
  }

  getAddButtonLabel() {
    if(this.product.has_preorder_campaign) {
        return salla.lang.get('pages.products.pre_order_now');
    }

    if (this.product.status === 'sale' && this.product.type === 'booking') {
      return salla.lang.get('pages.cart.book_now'); 
    }

    if (this.product.status === 'sale') {
      return salla.lang.get('pages.cart.add_to_cart');
    }

    if (this.product.type !== 'donating') {
      return salla.lang.get('pages.products.out_of_stock');
    }

    // donating
    return salla.lang.get('pages.products.donation_exceed');
  }

  getProps(){

    /**
     *  Horizontal card.
     */
    this.horizontal = this.hasAttribute('horizontal');
  
    /**
     *  Support shadow on hover.
     */
    this.shadowOnHover = this.hasAttribute('shadowOnHover');
  
    /**
     *  Hide add to cart button.
     */
    this.hideAddBtn = this.hasAttribute('hideAddBtn');
  
    /**
     *  Full image card.
     */
    this.fullImage = this.hasAttribute('fullImage');
  
    /**
     *  Minimal card.
     */
    this.minimal = this.hasAttribute('minimal');
  
    /**
     *  Special card.
     */
    this.isSpecial = this.hasAttribute('isSpecial');
  
    /**
     *  Show quantity.
     */
    this.showQuantity = this.hasAttribute('showQuantity');
  }

  escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  }

  getImageUrl(image) {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.src || image.original || image.image?.url || '';
  }

  getImageIdentity(url = '') {
    const cleanUrl = String(url).split('?')[0];
    const fileName = cleanUrl.split('/').pop() || cleanUrl;
    const sallaAssetHash = fileName.match(/-([A-Za-z0-9_]{20,})\.[a-z0-9]+$/i);

    return sallaAssetHash?.[1] || cleanUrl;
  }

  getSecondaryImageUrl() {
    const primaryUrl = this.getImageUrl(this.product?.image) || this.product?.thumbnail || '';
    const primaryIdentity = this.getImageIdentity(primaryUrl);
    const candidates = [
      this.discoveredSecondaryImageUrl,
      ...(Array.isArray(this.product?.images) ? this.product.images : []),
      ...(Array.isArray(this.product?.media) ? this.product.media : []),
      this.product?.secondary_image,
      this.product?.hover_image,
    ];

    return candidates
      .map((image) => this.getImageUrl(image))
      .find((url) => url && url !== primaryUrl && this.getImageIdentity(url) !== primaryIdentity) || '';
  }

  bindKallesCardInteractions() {
    if (this.kallesInteractionsBound) return;
    this.kallesInteractionsBound = true;

    this.addEventListener('mouseenter', () => this.loadSecondaryImage());
    this.addEventListener('focusin', () => this.loadSecondaryImage());
    this.addEventListener('click', (event) => {
      const quickViewButton = event.target.closest('.kalles-card-quick-view');
      if (!quickViewButton) return;

      event.preventDefault();
      event.stopPropagation();
      this.openQuickView();
    });
  }

  async loadSecondaryImage() {
    const secondaryImage = this.querySelector('.kalles-card-secondary-image');
    if (!secondaryImage || this.secondaryImageLoaded || this.secondaryImageLoading) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const directUrl = this.getSecondaryImageUrl();
    if (directUrl) {
      this.applySecondaryImage(directUrl);
      return;
    }

    if (!this.product?.url) return;
    this.secondaryImageLoading = true;

    try {
      const response = await fetch(this.product.url, { credentials: 'same-origin' });
      if (!response.ok) return;

      const html = await response.text();
      const productPage = new DOMParser().parseFromString(html, 'text/html');
      const primaryUrl = this.getImageUrl(this.product?.image) || this.product?.thumbnail || '';
      const primaryIdentity = this.getImageIdentity(primaryUrl);
      const productImages = [
        ...productPage.querySelectorAll('.kalles-product-gallery [slot="items"] img'),
      ];
      const secondaryUrl = productImages
        .map((image) => image.getAttribute('src') || image.getAttribute('data-src') || '')
        .find((url) => url && url !== primaryUrl && this.getImageIdentity(url) !== primaryIdentity);

      if (secondaryUrl) {
        this.applySecondaryImage(secondaryUrl);
      }
    } catch (error) {
      // A missing hover image should never block the product card itself.
    } finally {
      this.secondaryImageLoading = false;
    }
  }

  applySecondaryImage(url) {
    const secondaryImage = this.querySelector('.kalles-card-secondary-image');
    if (!secondaryImage || !url) return;
    this.discoveredSecondaryImageUrl = url;

    const revealImage = () => {
      if (!secondaryImage.naturalWidth) return;
      this.secondaryImageLoaded = true;
      this.classList.add('has-secondary-image');
    };

    if (secondaryImage.dataset.source === url) {
      if (secondaryImage.complete) revealImage();
      return;
    }

    secondaryImage.dataset.source = url;
    secondaryImage.addEventListener('load', revealImage, { once: true });
    secondaryImage.src = url;
    if (secondaryImage.complete) revealImage();
  }

  async openQuickView() {
    const modalId = 'hadeel-product-quick-view';
    document.getElementById(modalId)?.remove();

    const modal = document.createElement('salla-modal');
    modal.id = modalId;
    modal.setAttribute('width', 'lg');
    modal.setAttribute('position', 'middle');
    modal.setAttribute('is-closable', 'true');
    modal.setAttribute('no-padding', 'true');

    const imageUrl = this.getImageUrl(this.product?.image) || this.product?.thumbnail || this.placeholder || '';
    const productName = this.escapeHTML(this.product?.name || '');
    const productUrl = this.escapeHTML(this.product?.url || '#');
    const productId = this.escapeHTML(this.product?.id || '');
    const productStatus = this.escapeHTML(this.product?.status || 'sale');
    const productType = this.escapeHTML(this.product?.type || 'product');
    const subtitle = this.product?.subtitle
      ? `<p class="kalles-quick-view__subtitle">${this.escapeHTML(this.product.subtitle)}</p>`
      : '';

    modal.innerHTML = `
      <div class="kalles-quick-view" dir="${document.documentElement.dir || 'rtl'}">
        <a class="kalles-quick-view__media" href="${productUrl}" aria-label="${productName}">
          <img src="${this.escapeHTML(imageUrl)}" alt="${productName}" loading="eager">
        </a>
        <div class="kalles-quick-view__summary">
          <p class="kalles-quick-view__eyebrow">${this.escapeHTML(this.quickViewLabel)}</p>
          <h3>${productName}</h3>
          ${subtitle}
          <div class="kalles-quick-view__price">${this.getProductPrice()}</div>
          <salla-add-product-button
            class="kalles-quick-view__add"
            product-id="${productId}"
            product-status="${productStatus}"
            product-type="${productType}"
            fill="solid"
            width="wide">
            <i class="sicon-shopping-bag" aria-hidden="true"></i>
            <span>${this.escapeHTML(this.quickAddLabel)}</span>
          </salla-add-product-button>
          <a class="kalles-quick-view__details" href="${productUrl}">
            ${this.escapeHTML(this.detailsLabel)}
            <i class="sicon-arrow-left" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    `;

    modal.setAttribute('aria-label', productName);
    document.body.appendChild(modal);
    await customElements.whenDefined('salla-modal');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    modal.open();
  }

  render(){
    this.classList.add('s-product-card-entry'); 
    this.setAttribute('id', this.product.id);
    !this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-vertical') : '';
    this.horizontal && !this.fullImage && !this.minimal? this.classList.add('s-product-card-horizontal') : '';
    this.fitImageHeight && !this.isSpecial && !this.fullImage && !this.minimal? this.classList.add('s-product-card-fit-height') : '';
    this.isSpecial? this.classList.add('s-product-card-special') : '';
    this.fullImage? this.classList.add('s-product-card-full-image') : '';
    this.minimal? this.classList.add('s-product-card-minimal') : '';
    this.product?.donation?  this.classList.add('s-product-card-donation') : '';
    this.shadowOnHover?  this.classList.add('s-product-card-shadow') : '';
    this.product?.is_out_of_stock?  this.classList.add('s-product-card-out-of-stock') : '';
    this.isInWishlist = !salla.config.isGuest() && salla.storage.get('salla::wishlist', []).includes(Number(this.product.id));
      const primaryImageUrl = this.product?.image?.url || this.product?.thumbnail || this.placeholder || '';
      const secondaryImageUrl = this.getSecondaryImageUrl();
      const usesKallesActions = !this.hideAddBtn && !this.horizontal && !this.fullImage && !this.minimal;
      this.classList.remove('has-secondary-image');
      this.secondaryImageLoaded = false;

      this.innerHTML = `
        <div class="${!this.fullImage ? 's-product-card-image' : 's-product-card-image-full'}">
          <a href="${this.product?.url}" aria-label="${this.escapeHTML(this.product?.image?.alt || this.product.name)}">
           <img 
              class="s-product-card-image-${salla.url.is_placeholder(primaryImageUrl)
                ? 'contain'
                : this.fitImageHeight
                ? this.fitImageHeight
                : 'cover'}"
              src="${primaryImageUrl}"
              alt="${this.escapeHTML(this.product?.image?.alt || this.product.name)}"
              loading="lazy"
            />
            ${!this.fullImage && !this.minimal ? `
              <img
                class="kalles-card-secondary-image"
                src="${secondaryImageUrl || primaryImageUrl}"
                alt=""
                aria-hidden="true"
                loading="lazy"
              />` : ''}
            ${!this.fullImage && !this.minimal ? this.getProductBadge() : ''}
          </a>
          ${this.fullImage ? `<a href="${this.product?.url}" aria-label=${this.product.name} class="s-product-card-overlay"></a>`:''}
          ${!this.horizontal && !this.fullImage ?
            `<salla-button
              shape="icon"
              fill="outline"
              color="light"
              name="product-name-${this.product.id}"
              aria-label="Add or remove to wishlist"
              class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
              onclick="salla.wishlist.toggle(${this.product.id})"
              data-id="${this.product.id}">
              <i class="sicon-heart"></i>
            </salla-button>` : ``
          }
          ${usesKallesActions ? `
            <a class="kalles-card-expand" href="${this.product?.url}" aria-label="${this.detailsLabel}">
              <i class="sicon-arrow-up-left" aria-hidden="true"></i>
            </a>
            <div class="kalles-card-actions">
              <button class="kalles-card-quick-view" type="button" aria-label="${this.quickViewLabel}">
                <i class="sicon-search" aria-hidden="true"></i>
                <span>${this.quickViewLabel}</span>
              </button>
              <salla-add-product-button
                fill="solid"
                loader-position="center"
                class="kalles-card-quick-add"
                aria-label="${this.getAddButtonLabel()}"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}">
                <i class="sicon-shopping-bag" aria-hidden="true"></i>
                <span>${this.quickAddLabel}</span>
              </salla-add-product-button>
            </div>` : ''}
        </div>
        <div class="s-product-card-content">
          ${this.isSpecial && this.product?.quantity ?
            `<div class="s-product-card-content-pie">
              <span>
                <b>${salla.helpers.number(this.product?.quantity)}</b>
                ${this.remained}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -1 36 34" class="s-product-card-content-pie-svg">
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-base" />
                <circle cx="16" cy="16" r="15.9155" class="s-product-card-content-pie-svg-bar" />
              </svg>
            </div>`
            : ``}

          <div class="s-product-card-content-main ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            <h3 class="s-product-card-content-title">
              <a href="${this.product?.url}">${this.product?.name}</a>
            </h3>

            ${this.product?.subtitle && !this.minimal ?
              `<p class="s-product-card-content-subtitle opacity-80">${this.product?.subtitle}</p>`
              : ``}
          </div>
          ${this.product?.donation && !this.minimal && !this.fullImage ?
          `<salla-progress-bar donation=${JSON.stringify(this.product?.donation)}></salla-progress-bar>
          <div class="s-product-card-donation-input">
            ${this.product?.donation?.can_donate && this.product?.donation?.custom_amount_enabled  ?
              `<label for="donation-amount-${this.product.id}">${this.donationAmount} <span>*</span></label>
              <input
                type="text"
                onInput="${e => {
                  salla.helpers.inputDigitsOnly(e.target);
                  this.addBtn.donatingAmount = (e.target).value;
                }}"
                id="donation-amount-${this.product.id}"
                name="donating_amount"
                class="s-form-control"
                placeholder="${this.donationAmount}" />`
              : ``}
          </div>`
            : ''}
          <div class="s-product-card-content-sub ${this.isSpecial ? 's-product-card-content-extra-padding' : ''}">
            ${this.product?.donation?.can_donate ? '' : this.getProductPrice()}
            ${this.product?.rating?.stars ?
              `<div class="s-product-card-rating">
                <i class="sicon-star2 before:text-orange-300"></i>
                <span>${this.product.rating.stars}</span>
              </div>`
               : ``}
          </div>

          ${this.isSpecial && this.product.discount_ends
            ? `<salla-count-down date="${this.formatDate(this.product.discount_ends)}" end-of-day=${true} boxed=${true}
              labeled=${true} />`
            : ``}


          ${!this.hideAddBtn && !usesKallesActions ?
            `<div class="s-product-card-content-footer gap-2">
              <salla-add-product-button fill="outline" shape="icon" loader-position="center"
                class="s-product-card-add-btn-icon-only"
                aria-label="${this.getAddButtonLabel()}"
                product-id="${this.product.id}"
                product-status="${this.product.status}"
                product-type="${this.product.type}">
                <i class="sicon-shopping-bag" aria-hidden="true"></i>
              </salla-add-product-button>

              ${this.horizontal || this.fullImage ?
                `<salla-button 
                  shape="icon" 
                  fill="outline" 
                  color="light" 
                  id="card-wishlist-btn-${this.product.id}-horizontal"
                  aria-label="Add or remove to wishlist"
                  class="s-product-card-wishlist-btn animated ${this.isInWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}"
                  onclick="salla.wishlist.toggle(${this.product.id})"
                  data-id="${this.product.id}">
                  <i class="sicon-heart"></i> 
                </salla-button>`
                : ``}
            </div>`
            : ``}
        </div>
      `

      if (secondaryImageUrl) {
        this.applySecondaryImage(secondaryImageUrl);
      }

      this.querySelectorAll('[name="donating_amount"]').forEach((element)=>{
        element.addEventListener('input', (e) => {
          e.target
            .closest(".s-product-card-content")
            .querySelector("salla-add-product-button")
            .setAttribute("donating-amount", e.target.value); 
        });
      })

      if (this.product?.quantity && this.isSpecial) {
        this.initCircleBar();
      }

      // Optimistic & Per-card wishlist toggle
      this.querySelectorAll('.s-product-card-wishlist-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const willBeAdded = !btn.classList.contains('s-product-card-wishlist-added');
          app.toggleElementClassIf(btn, 's-product-card-wishlist-added', 'not-added', () => willBeAdded);
          app.toggleElementClassIf(btn, 'pulse-anime', 'un-favorited', () => willBeAdded);
        });
      });
    }
}

customElements.define('custom-salla-product-card', ProductCard);

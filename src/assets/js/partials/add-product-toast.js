class HadeelCartDrawer extends HTMLElement {
  constructor() {
    super();
    this.drawer = null;
    this.cart = null;
    this.refreshSequence = 0;
    this.isInitialized = false;

    this.handleItemAdded = response => this.refreshCart({
      open: true,
      fallbackCart: this.extractCart(response)
    });
    this.handleCartChanged = response => this.refreshCart({
      fallbackCart: this.extractCart(response)
    });
    this.handleClick = event => this.onDrawerClick(event);
    this.handleChange = event => this.onDrawerChange(event);
    this.handleCartTrigger = event => {
      // No drawer to show: let the trigger navigate to the cart page instead of
      // swallowing the click and leaving the icon inert.
      if (!this.drawer) return;

      // Inside the Salla app webview `salla-cart-summary` cancels its own anchor and hands
      // the cart to the native shell. Its handler sits on the inner anchor, so it has
      // already run by the time this one does — don't open a second surface on top of it.
      if (event.defaultPrevented) return;

      event.preventDefault();
      this.refreshCart({ open: true });
    };
  }

  connectedCallback() {
    if (window.app?.status === "ready") {
      this.init();
      return;
    }

    document.addEventListener("theme::ready", () => this.init(), { once: true });
  }

  disconnectedCallback() {
    if (!this.isInitialized) return;

    salla.event.off("cart::item.added", this.handleItemAdded);
    salla.event.off("cart::item.updated", this.handleCartChanged);
    salla.event.off("cart::item.deleted", this.handleCartChanged);
    this.drawer?.removeEventListener("click", this.handleClick);
    this.drawer?.removeEventListener("change", this.handleChange);
    this.cartTriggers?.forEach(trigger => trigger.removeEventListener("click", this.handleCartTrigger));
    this.drawer?.remove();
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    salla.lang.onLoaded(async () => {
      this.loadTranslations();
      this.renderShell();

      await customElements.whenDefined("salla-drawer");

      this.drawer = document.getElementById("hadeel-cart-drawer");
      await this.drawer?.componentOnReady?.();
      this.drawer?.querySelector(".s-drawer-close")?.setAttribute("aria-label", this.text.close);
      this.drawer?.addEventListener("click", this.handleClick);
      this.drawer?.addEventListener("change", this.handleChange);
      if (this.drawer) {
        this.cartTriggers = document.querySelectorAll(".header-cart, .mobile-toolbar__cart");
        this.cartTriggers.forEach(trigger => trigger.addEventListener("click", this.handleCartTrigger));
      }

      salla.event.on("cart::item.added", this.handleItemAdded);
      salla.event.on("cart::item.updated", this.handleCartChanged);
      salla.event.on("cart::item.deleted", this.handleCartChanged);
    });
  }

  loadTranslations() {
    this.text = {
      title: this.resolveTranslation("textTitle", "pages.cart.drawer_title"),
      close: this.resolveTranslation("textClose", "pages.cart.close_drawer"),
      remove: this.resolveTranslation("textRemove", "pages.cart.remove_item"),
      note: this.resolveTranslation("textNote", "pages.cart.item_note"),
      notePlaceholder: this.resolveTranslation("textNotePlaceholder", "pages.cart.item_note_placeholder"),
      shippingTaxNotice: this.resolveTranslation("textShippingTaxNotice", "pages.cart.shipping_tax_notice"),
      viewCart: this.resolveTranslation("textViewCart", "pages.cart.view_cart"),
      completeOrder: salla.lang.get("pages.cart.complete_order"),
      emptyCart: salla.lang.get("pages.cart.empty_cart"),
      loadError: this.resolveTranslation("textLoadError", "pages.cart.drawer_load_error"),
      retry: this.resolveTranslation("textRetry", "pages.cart.retry"),
      freeShipping: salla.lang.get("pages.cart.has_free_shipping"),
      total: salla.lang.get("pages.cart.total")
    };
  }

  resolveTranslation(datasetKey, translationKey) {
    const serverTranslation = this.dataset[datasetKey];
    if (serverTranslation && serverTranslation !== translationKey) return serverTranslation;

    const clientTranslation = salla.lang.get(translationKey);
    return clientTranslation !== translationKey ? clientTranslation : "";
  }

  renderShell() {
    this.innerHTML = `
      <salla-drawer
        id="hadeel-cart-drawer"
        class="hadeel-cart-drawer"
        drawer-title="${this.escapeHTML(this.text.title)}"
        position="right"
        width="sm"
        no-padding>
        <div class="hadeel-cart-drawer__content" data-cart-drawer-content></div>
        <div class="hadeel-cart-drawer__footer" data-cart-drawer-footer slot="footer"></div>
      </salla-drawer>
    `;
  }

  async refreshCart({ open = false, fallbackCart = null } = {}) {
    if (!this.drawer) return;

    const requestSequence = ++this.refreshSequence;

    if (open) {
      this.renderLoading();
      await this.drawer.open();
    }

    try {
      const response = await salla.cart.api.details(null, ["options"]);
      if (requestSequence !== this.refreshSequence) return;
      this.renderCart(this.extractCart(response) || fallbackCart);
    } catch (error) {
      if (requestSequence !== this.refreshSequence) return;

      if (fallbackCart) {
        this.renderCart(fallbackCart);
      } else {
        salla.log("HadeelCartDrawer: failed to fetch cart details", error);
        this.renderError();
      }
    }
  }

  extractCart(response) {
    return response?.data?.cart || response?.cart || null;
  }

  renderLoading() {
    const content = this.drawer?.querySelector("[data-cart-drawer-content]");
    const footer = this.drawer?.querySelector("[data-cart-drawer-footer]");
    if (!content || !footer) return;

    content.setAttribute("aria-busy", "true");
    content.innerHTML = `
      <div class="hadeel-cart-drawer__loading">
        <salla-skeleton width="100%" height="52px"></salla-skeleton>
        <salla-skeleton width="100%" height="120px"></salla-skeleton>
      </div>
    `;
    footer.innerHTML = `<salla-skeleton width="100%" height="104px"></salla-skeleton>`;
  }

  renderError() {
    const content = this.drawer?.querySelector("[data-cart-drawer-content]");
    const footer = this.drawer?.querySelector("[data-cart-drawer-footer]");
    if (!content || !footer) return;

    content.removeAttribute("aria-busy");
    content.innerHTML = `
      <div class="hadeel-cart-drawer__error" role="alert">
        <i class="sicon-warning2" aria-hidden="true"></i>
        <p>${this.escapeHTML(this.text.loadError)}</p>
        <button type="button" data-cart-drawer-retry>${this.escapeHTML(this.text.retry)}</button>
      </div>
    `;
    footer.innerHTML = "";
  }

  renderCart(cart) {
    if (!cart) return;

    this.cart = cart;
    const content = this.drawer?.querySelector("[data-cart-drawer-content]");
    const footer = this.drawer?.querySelector("[data-cart-drawer-footer]");
    if (!content || !footer) return;

    const items = Array.isArray(cart.items) ? cart.items : [];
    content.removeAttribute("aria-busy");

    content.innerHTML = items.length
      ? `${this.renderFreeShipping(cart.free_shipping_bar)}
         <div class="hadeel-cart-drawer__items">${items.map(item => this.renderItem(item)).join("")}</div>`
      : `<div class="hadeel-cart-drawer__empty">
           <i class="sicon-shopping-bag" aria-hidden="true"></i>
           <p>${this.escapeHTML(this.text.emptyCart)}</p>
         </div>`;

    footer.innerHTML = items.length ? this.renderFooter(cart) : "";
  }

  renderFreeShipping(freeShippingBar) {
    if (!freeShippingBar) return "";

    const percent = Math.min(100, Math.max(0, Number(freeShippingBar.percent) || 0));
    const message = freeShippingBar.has_free_shipping
      ? this.text.freeShipping
      : salla.lang.get("pages.cart.free_shipping_alert", {
          amount: salla.money(freeShippingBar.remaining)
        });

    return `
      <section class="hadeel-cart-drawer__shipping" aria-label="${this.escapeHTML(message)}">
        <p>${message}</p>
        <div class="hadeel-cart-drawer__shipping-track" aria-hidden="true">
          <span style="width:${percent}%"></span>
        </div>
      </section>
    `;
  }

  renderItem(item) {
    // Cart item ids can exceed Number.MAX_SAFE_INTEGER; keep the API value lossless.
    const id = this.escapeHTML(String(item.id));
    const quantity = Number(item.quantity) || 1;
    const maxQuantity = Number(item.max_quantity);
    const productName = this.escapeHTML(item.product_name || item.name || "");
    const productUrl = this.escapeHTML(item.url || "#");
    const productImage = this.escapeHTML(this.getProductImage(item));
    const options = this.extractOptions(item.options);
    const total = item.detailed_offers?.length ? item.total_special_price : item.total;
    const note = this.escapeHTML(item.notes || "");
    const removeText = this.escapeHTML(this.text.remove);
    const removeLabel = removeText || productName;
    const maxAttribute = Number.isFinite(maxQuantity) && maxQuantity > 0
      ? ` max="${maxQuantity}"`
      : "";

    return `
      <article class="hadeel-cart-drawer__item" data-cart-drawer-item="${id}">
        <div class="hadeel-cart-drawer__product">
          <div class="hadeel-cart-drawer__media">
            <a class="hadeel-cart-drawer__image" href="${productUrl}">
              <img src="${productImage}" alt="${productName}" loading="lazy">
            </a>
          </div>

          <div class="hadeel-cart-drawer__details">
            <a class="hadeel-cart-drawer__name" href="${productUrl}">${productName}</a>
            ${options.length ? `<div class="hadeel-cart-drawer__options">${options.map(option => `
              <span>${this.escapeHTML(option.name)}${option.hideValue ? "" : `: ${this.escapeHTML(option.value)}`}</span>
            `).join("")}</div>` : ""}
            <strong class="hadeel-cart-drawer__price">${salla.money(total)}</strong>
            <div class="hadeel-cart-drawer__actions">
              ${item.is_hidden_quantity || item.type === "donating"
                ? `<span class="hadeel-cart-drawer__quantity-static">${salla.helpers.number(quantity)}</span>`
                : `<salla-quantity-input
                     cart-item-id="${id}"
                     name="quantity"
                     value="${quantity}"${maxAttribute}>
                   </salla-quantity-input>`}
              <button
                type="button"
                class="hadeel-cart-drawer__remove"
                data-cart-drawer-remove="${id}"
                aria-label="${removeLabel}">
                ${removeText || '<i class="sicon-trash" aria-hidden="true"></i>'}
              </button>
            </div>
          </div>
        </div>

        ${item.can_add_note ? `
          <label class="hadeel-cart-drawer__note">
            <span>${this.escapeHTML(this.text.note)}</span>
            <textarea
              rows="2"
              data-cart-drawer-note="${id}"
              placeholder="${this.escapeHTML(this.text.notePlaceholder)}">${note}</textarea>
          </label>
        ` : ""}
      </article>
    `;
  }

  renderFooter(cart) {
    const taxNotice = this.text.shippingTaxNotice
      ? `<p class="hadeel-cart-drawer__tax-notice">${this.escapeHTML(this.text.shippingTaxNotice)}</p>`
      : "";
    const viewCart = this.text.viewCart
      ? `<a class="hadeel-cart-drawer__view-cart" href="${this.escapeHTML(salla.url.get("cart"))}">
           ${this.escapeHTML(this.text.viewCart)}
         </a>`
      : "";

    return `
      <div class="hadeel-cart-drawer__total">
        <strong>${this.escapeHTML(this.text.total)}</strong>
        <strong>${salla.money(cart.total)}</strong>
      </div>
      ${taxNotice}
      <salla-button
        type="button"
        width="wide"
        loader-position="center"
        data-cart-drawer-submit>
        ${this.escapeHTML(this.text.completeOrder)}
      </salla-button>
      ${viewCart}
    `;
  }

  getProductImage(item) {
    const image = item.product_image || item.image;
    if (typeof image === "string") return image;
    return image?.url || salla.url.asset("images/placeholder.png");
  }

  extractOptions(options) {
    if (!Array.isArray(options)) return [];

    return options.reduce((result, option) => {
      if (option.type === "splitter") return result;

      if (Array.isArray(option.details) && option.details.length) {
        const selected = option.type === "multiple-options"
          ? option.details.filter(detail => detail.is_selected)
          : [option.details.find(detail => detail.is_selected)].filter(Boolean);

        if (selected.length) {
          result.push({
            name: option.name || "",
            value: selected.map(detail => detail.name).join(", ")
          });
        }
      } else if (option.value) {
        result.push({
          name: option.name || "",
          value: option.value,
          hideValue: ["image", "file", "map"].includes(option.type)
        });
      }

      return result;
    }, []);
  }

  extractSelectedOptions(options) {
    if (!Array.isArray(options)) return {};

    return options.reduce((selectedOptions, option) => {
      if (!option?.id || option.type === "splitter") return selectedOptions;

      if (Array.isArray(option.details) && option.details.length) {
        const selectedDetails = option.details.filter(detail => detail.is_selected);
        if (!selectedDetails.length) return selectedOptions;

        selectedOptions[option.id] = option.type === "multiple-options"
          ? selectedDetails.map(detail => detail.id)
          : selectedDetails[0].id;
      } else if (option.value !== undefined && option.value !== null && option.value !== "") {
        selectedOptions[option.id] = option.value;
      }

      return selectedOptions;
    }, {});
  }

  async onDrawerClick(event) {
    const retryButton = event.target.closest?.("[data-cart-drawer-retry]");
    if (retryButton) {
      this.renderLoading();
      await this.refreshCart();
      return;
    }

    const removeButton = event.target.closest?.("[data-cart-drawer-remove]");
    if (removeButton) {
      const itemId = removeButton.dataset.cartDrawerRemove;
      const cartItem = removeButton.closest("[data-cart-drawer-item]");
      removeButton.load?.();
      cartItem?.classList.add("is-updating");

      try {
        await salla.cart.deleteItem(itemId);
      } catch (error) {
        cartItem?.classList.remove("is-updating");
        removeButton.stop?.();
      }
      return;
    }

    const submitButton = event.target.closest?.("[data-cart-drawer-submit]");
    if (submitButton) {
      submitButton.load?.();
      salla.cart.submit();
    }
  }

  async onDrawerChange(event) {
    const quantityInput = event.target.closest?.("salla-quantity-input");
    if (quantityInput) {
      const itemId = String(event.detail?.productId || quantityInput.getAttribute("cart-item-id") || "");
      const quantity = Number(event.detail?.quantity || event.target.value);
      if (!itemId || !quantity) return;

      await this.updateItem(itemId, { quantity });
      return;
    }

    const noteInput = event.target.closest?.("[data-cart-drawer-note]");
    if (noteInput) {
      const itemId = noteInput.dataset.cartDrawerNote;
      const item = this.cart?.items?.find(cartItem => String(cartItem.id) === itemId);
      if (!item) return;

      await this.updateItem(itemId, {
        quantity: Number(item.quantity) || 1,
        notes: noteInput.value
      });
    }
  }

  async updateItem(itemId, payload) {
    const cartItem = this.drawer?.querySelector(`[data-cart-drawer-item="${itemId}"]`);
    const item = this.cart?.items?.find(currentItem => String(currentItem.id) === String(itemId));
    const options = this.extractSelectedOptions(item?.options);
    cartItem?.classList.add("is-updating");

    try {
      await salla.cart.updateItem({
        id: itemId,
        ...payload,
        ...(Object.keys(options).length ? { options } : {})
      });
    } catch (error) {
      cartItem?.classList.remove("is-updating");
      salla.log("HadeelCartDrawer: failed to update cart item", error);
    }
  }

  escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

customElements.define("salla-hadeel-cart-drawer", HadeelCartDrawer);

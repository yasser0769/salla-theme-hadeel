import BasePage from './base-page';

const DENSITY_STORAGE_KEY = 'hadeel:collection-density';
const DESKTOP_DENSITIES = ['list', '2', '3', '4'];
const TABLET_DENSITIES = ['list', '2', '3'];
const MOBILE_DENSITIES = ['list', '2'];

class Products extends BasePage {
    onReady() {
        this.productsList = app.element('[data-collection-products]');
        this.collectionPage = app.element('[data-collection-page]');
        this.summary = app.element('[data-products-summary]');
        this.densityButtons = [...document.querySelectorAll('[data-collection-toolbar] [data-grid-density]')];

        this.initSorting();
        this.initFiltersDrawer();
        this.initDensityControls();
        this.initProductsSummary();
    }

    initSorting() {
        const sortSelect = app.element('#product-filter');
        if (!sortSelect || !this.productsList) return;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('sort')) sortSelect.value = urlParams.get('sort');

        sortSelect.addEventListener('change', async (event) => {
            const sort = event.currentTarget.value;
            window.history.replaceState(null, null, salla.helpers.addParamToUrl('sort', sort));
            this.productsList.sortBy = sort;
            this.productsList.setAttribute('filters', JSON.stringify({ sort }));
            await this.productsList.reload();
        });
    }

    /**
     * The drawer deliberately stays open while filters are applied. `salla-filters` emits
     * `salla-filters::changed` from every individual option toggle, every applied-chip
     * removal and from reset — not once per "apply" — and this drawer replaced the desktop
     * sidebar, so it is now the only filter UI at any width. Closing on that event let a
     * shopper pick exactly one filter before having to reopen the panel. `salla-drawer`
     * still closes on its own close button, on Escape and on the overlay.
     */
    initFiltersDrawer() {
        const drawer = app.element('[data-collection-filters-drawer]');
        const trigger = app.element('[data-collection-filter-trigger]');
        if (!drawer || !trigger) return;

        trigger.addEventListener('click', async () => {
            await customElements.whenDefined('salla-drawer');
            drawer.open();
        });
    }

    initDensityControls() {
        if (!this.collectionPage || !this.productsList || !this.densityButtons.length) return;

        const stored = this.readStoredDensity();
        this.applyDensity(this.getAvailableDensities().includes(stored) ? stored : this.getDefaultDensity(), false);

        this.densityButtons.forEach((button) => {
            button.addEventListener('click', () => this.applyDensity(button.dataset.gridDensity));
        });

        let previousDensitySet = this.getAvailableDensities().join(',');
        window.addEventListener('resize', () => {
            const nextDensitySet = this.getAvailableDensities().join(',');
            if (nextDensitySet === previousDensitySet) return;
            previousDensitySet = nextDensitySet;

            const current = this.collectionPage.dataset.gridDensity;
            this.applyDensity(this.getAvailableDensities().includes(current) ? current : this.getDefaultDensity(), false);
        }, { passive: true });
    }

    getAvailableDensities() {
        if (window.matchMedia('(max-width: 767px)').matches) return MOBILE_DENSITIES;
        if (window.matchMedia('(max-width: 1023px)').matches) return TABLET_DENSITIES;
        return DESKTOP_DENSITIES;
    }

    getDefaultDensity() {
        if (window.matchMedia('(max-width: 767px)').matches) return '2';
        if (window.matchMedia('(max-width: 1023px)').matches) return '3';
        return '4';
    }

    readStoredDensity() {
        try {
            return window.localStorage.getItem(DENSITY_STORAGE_KEY);
        } catch (_) {
            return null;
        }
    }

    applyDensity(density, persist = true) {
        if (!this.getAvailableDensities().includes(density)) return;

        this.collectionPage.dataset.gridDensity = density;
        this.productsList.dataset.gridDensity = density;
        this.densityButtons.forEach((button) => {
            const isActive = button.dataset.gridDensity === density;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (!persist) return;
        try {
            window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
        } catch (_) {
            // Storage can be unavailable in privacy modes; the UI still works for this visit.
        }
    }

    initProductsSummary() {
        if (!this.summary) return;

        salla.event.on('salla-products-list::products.fetched', (response) => {
            if (response?.title) this.summary.textContent = response.title;
        });
    }
}

Products.initiateWhenReady([
    'product.index',
    'product.index.latest',
    'product.index.offers',
    'product.index.search',
    'product.index.tag',
]);

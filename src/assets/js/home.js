import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // Critical product content switches to its final visible state
                // immediately — no hide-then-fade timer (HDL-06 FR-007/FR-008).
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-100 translate-y-0', 'inactive opacity-0 translate-y-3', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }
}

Home.initiateWhenReady(['index']);
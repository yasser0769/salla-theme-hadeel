import BasePage from './base-page';

class Loyalty extends BasePage {
    onReady() {
        // HDL-06: the real points total is server-rendered by loyalty.twig —
        // this page script never counts from zero, never manufactures a value,
        // and never hides it. The only runtime motion is one optional, bounded
        // feedback pulse through the shared controller, which no-ops under
        // reduced motion or when WAAPI is unavailable.
        const counter = document.querySelector('.count-anime');
        if (counter) {
            window.hadeelMotion?.feedback(counter);
        }
    }
}

Loyalty.initiateWhenReady(['loyalty']);

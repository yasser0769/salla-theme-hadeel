import BasePage from './base-page';

class ThankYou extends BasePage {
    onReady() {
        document.querySelectorAll('.thanks-item').forEach((item, i) => {
            // The stagger time comes from the motion token contract: JS sets the
            // index as data and --motion-stagger owns the duration (0ms outside
            // Rich and under OS reduce).
            item.style.setProperty('--motion-stagger-index', i);
            item.classList.add('slide-in-start');
        });
        let form = document.querySelector('#invoice-form');
        salla.order.event.onInvoiceSent(res =>{
            form.innerHTML = res.data.message;
            form.classList.add('sent');
        });
    }
}

ThankYou.initiateWhenReady(['thank-you']);

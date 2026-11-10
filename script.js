/**
 * PKHosting VPS Hosting - Interactive Pricing & Accessibility Logic
 * Vanilla JavaScript, zero external dependencies, robust offline execution.
 */

(function () {
  'use strict';

  // Exchange rates against 1 PKR (Hardcoded per specification)
  const EXCHANGE_RATES = {
    PKR: 1,
    USD: 1 / 278.50,
    GBP: 1 / 355.00
  };

  const CURRENCY_CONFIG = {
    PKR: { symbol: 'Rs ', decimals: 0, code: 'PKR' },
    USD: { symbol: '$', decimals: 2, code: 'USD' },
    GBP: { symbol: '£', decimals: 2, code: 'GBP' }
  };

  // State keys for persistence
  const STORAGE_KEYS = {
    BILLING: 'pkhosting_billing_cycle',
    CURRENCY: 'pkhosting_currency'
  };

  // Application State
  const state = {
    billing: 'monthly', // 'monthly' | 'annually'
    currency: 'PKR'     // 'PKR' | 'USD' | 'GBP'
  };

  // DOM Elements
  let billingButtons = [];
  let currencyButtons = [];
  let pricingCards = [];
  let tablePriceElements = [];
  let srAnnouncements = null;

  /**
   * Format numerical price into currency string
   * PKR formatted as whole numbers, USD/GBP formatted with 2 decimal places.
   */
  function formatPrice(amountPKR, currencyCode) {
    const rate = EXCHANGE_RATES[currencyCode] || 1;
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.PKR;
    const converted = amountPKR * rate;

    if (config.decimals === 0) {
      const rounded = Math.round(converted);
      return `${config.symbol}${rounded.toLocaleString('en-US')}`;
    } else {
      return `${config.symbol}${converted.toFixed(config.decimals)}`;
    }
  }

  /**
   * Calculate effective monthly rate, annual total, and annual savings
   * Annual billing formula strictly evaluated as: (Monthly Price x 10) / 12
   */
  function calculatePricing(monthlyPKR, billingCycle) {
    if (billingCycle === 'annually') {
      const annualMonthlyRatePKR = (monthlyPKR * 10) / 12;
      const annualTotalPKR = monthlyPKR * 10;
      const annualSavingsPKR = (monthlyPKR * 12) - annualTotalPKR; // Exactly 2 months free

      return {
        displayMonthlyRatePKR: annualMonthlyRatePKR,
        annualTotalPKR: annualTotalPKR,
        annualSavingsPKR: annualSavingsPKR,
        isAnnual: true
      };
    }

    return {
      displayMonthlyRatePKR: monthlyPKR,
      annualTotalPKR: monthlyPKR * 12,
      annualSavingsPKR: 0,
      isAnnual: false
    };
  }

  /**
   * Update the DOM for all pricing cards and table footer
   */
  function render() {
    const isAnnual = state.billing === 'annually';

    // 1. Update Pricing Cards
    pricingCards.forEach(card => {
      const monthlyPKR = parseFloat(card.getAttribute('data-monthly-pkr'));
      if (isNaN(monthlyPKR)) return;

      const pricing = calculatePricing(monthlyPKR, state.billing);
      const priceValEl = card.querySelector('[data-price-value]');
      const pricePeriodEl = card.querySelector('[data-price-period]');
      const billedTextEl = card.querySelector('[data-billed-text]');
      const savingsTagEl = card.querySelector('[data-savings-tag]');

      const formattedRate = formatPrice(pricing.displayMonthlyRatePKR, state.currency);
      const formattedAnnualTotal = formatPrice(pricing.annualTotalPKR, state.currency);
      const formattedSavings = formatPrice(pricing.annualSavingsPKR, state.currency);

      if (priceValEl) {
        priceValEl.textContent = formattedRate;
      }

      if (pricePeriodEl) {
        pricePeriodEl.textContent = '/month';
      }

      if (billedTextEl) {
        if (isAnnual) {
          billedTextEl.textContent = `Billed annually (${formattedAnnualTotal}/yr)`;
        } else {
          billedTextEl.textContent = 'Billed monthly';
        }
      }

      if (savingsTagEl) {
        if (isAnnual && pricing.annualSavingsPKR > 0) {
          savingsTagEl.textContent = `Save ${formattedSavings}/yr`;
          savingsTagEl.removeAttribute('hidden');
        } else {
          savingsTagEl.setAttribute('hidden', '');
        }
      }
    });

    // 2. Update Comparison Table Footer Rates
    tablePriceElements.forEach(el => {
      const planKey = el.getAttribute('data-table-price');
      const matchingCard = document.querySelector(`.pricing-card[data-plan="${planKey}"]`);
      if (!matchingCard) return;

      const monthlyPKR = parseFloat(matchingCard.getAttribute('data-monthly-pkr'));
      const pricing = calculatePricing(monthlyPKR, state.billing);
      const formattedRate = formatPrice(pricing.displayMonthlyRatePKR, state.currency);

      el.textContent = `${formattedRate}/mo`;
    });

    // 3. Update Toggle Buttons Visual & ARIA state
    billingButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-billing') === state.billing;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // 4. Update Currency Buttons Visual & ARIA state
    currencyButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-currency') === state.currency;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  /**
   * Announce state updates to screen readers
   */
  function announceToScreenReader(message) {
    if (!srAnnouncements) return;
    srAnnouncements.textContent = '';
    setTimeout(() => {
      srAnnouncements.textContent = message;
    }, 50);
  }

  /**
   * Persist state to localStorage
   */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLING, state.billing);
      localStorage.setItem(STORAGE_KEYS.CURRENCY, state.currency);
    } catch (e) {
      // Gracefully continue if localStorage is restricted (private browsing / sandbox)
      console.warn('LocalStorage unavailable for state persistence:', e);
    }
  }

  /**
   * Load persisted state from localStorage
   */
  function loadState() {
    try {
      const savedBilling = localStorage.getItem(STORAGE_KEYS.BILLING);
      const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);

      if (savedBilling === 'monthly' || savedBilling === 'annually') {
        state.billing = savedBilling;
      }

      if (savedCurrency === 'PKR' || savedCurrency === 'USD' || savedCurrency === 'GBP') {
        state.currency = savedCurrency;
      }
    } catch (e) {
      console.warn('Unable to read from LocalStorage:', e);
    }
  }

  /**
   * Setup keyboard navigation for segmented control radiogroups
   */
  function setupRadioKeyboardNav(buttons, onChange) {
    buttons.forEach((btn, index) => {
      btn.addEventListener('keydown', (e) => {
        let targetIndex = null;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          targetIndex = (index + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          targetIndex = (index - 1 + buttons.length) % buttons.length;
        }

        if (targetIndex !== null) {
          buttons[targetIndex].focus();
          onChange(buttons[targetIndex]);
        }
      });
    });
  }

  /**
   * Initialize interactive listeners
   */
  function init() {
    billingButtons = Array.from(document.querySelectorAll('.billing-toggle .seg-btn'));
    currencyButtons = Array.from(document.querySelectorAll('.currency-selector .seg-btn'));
    pricingCards = Array.from(document.querySelectorAll('.pricing-card'));
    tablePriceElements = Array.from(document.querySelectorAll('[data-table-price]'));
    srAnnouncements = document.getElementById('sr-announcements');

    // Load persisted preferences
    loadState();

    // Attach Billing Toggle Handlers
    billingButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-billing');
        if (state.billing === selected) return;

        state.billing = selected;
        saveState();
        render();

        const growthCard = document.querySelector('.pricing-card[data-plan="growth"]');
        const priceVal = growthCard ? growthCard.querySelector('[data-price-value]').textContent : '';
        const modeName = state.billing === 'annually' ? 'Annual billing with 2 months free' : 'Monthly billing';
        announceToScreenReader(`${modeName} selected. Most popular Growth plan is now ${priceVal} per month.`);
      });
    });

    // Keyboard support for billing buttons
    setupRadioKeyboardNav(billingButtons, (btn) => {
      btn.click();
    });

    // Attach Currency Selector Handlers
    currencyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-currency');
        if (state.currency === selected) return;

        state.currency = selected;
        saveState();
        render();

        const growthCard = document.querySelector('.pricing-card[data-plan="growth"]');
        const priceVal = growthCard ? growthCard.querySelector('[data-price-value]').textContent : '';
        announceToScreenReader(`Currency switched to ${state.currency}. Growth plan is now ${priceVal} per month.`);
      });
    });

    // Keyboard support for currency buttons
    setupRadioKeyboardNav(currencyButtons, (btn) => {
      btn.click();
    });

    // Initial render based on loaded state
    render();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

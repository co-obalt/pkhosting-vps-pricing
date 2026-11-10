/**
 * PKHosting VPS Hosting - Interactive Pricing & Accessibility Logic
 * Vanilla JavaScript, zero external dependencies, offline-first.
 */

(function () {
  'use strict';

  const EXCHANGE_RATES = {
    PKR: 1,
    USD: 1 / 278.5,
    GBP: 1 / 355.0
  };

  const CURRENCY_CONFIG = {
    PKR: { symbol: 'Rs ', decimals: 0 },
    USD: { symbol: '$', decimals: 2 },
    GBP: { symbol: '£', decimals: 2 }
  };

  const STORAGE_KEYS = {
    BILLING: 'pkhosting_billing_cycle',
    CURRENCY: 'pkhosting_currency'
  };

  const state = {
    billing: 'monthly',
    currency: 'PKR',
    selectedPlanKey: null
  };

  let billingButtons = [];
  let currencyButtons = [];
  let pricingCards = [];
  let tablePriceElements = [];
  let planSelectButtons = [];
  let srAnnouncements = null;
  let selectedPlanNote = null;
  let announceTimer = null;

  function formatPrice(amountPKR, currencyCode) {
    const rate = EXCHANGE_RATES[currencyCode] || 1;
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.PKR;
    const converted = amountPKR * rate;

    if (config.decimals === 0) {
      return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
    }

    return `${config.symbol}${converted.toFixed(config.decimals)}`;
  }

  /**
   * Annual billing formula: (Monthly Price x 10) / 12
   */
  function calculatePricing(monthlyPKR, billingCycle) {
    if (billingCycle === 'annually') {
      const monthlyEquivalentPKR = (monthlyPKR * 10) / 12;
      const annualTotalPKR = monthlyPKR * 10;
      const annualSavingsPKR = (monthlyPKR * 12) - annualTotalPKR;

      return {
        displayMonthlyRatePKR: monthlyEquivalentPKR,
        annualTotalPKR: annualTotalPKR,
        annualSavingsPKR: annualSavingsPKR
      };
    }

    return {
      displayMonthlyRatePKR: monthlyPKR,
      annualTotalPKR: monthlyPKR * 12,
      annualSavingsPKR: 0
    };
  }

  function updateSelectedPlanNote() {
    if (!selectedPlanNote || !state.selectedPlanKey) return;

    const card = document.querySelector(`.pricing-card[data-plan="${state.selectedPlanKey}"]`);
    if (!card) return;

    const planName = card.querySelector('.plan-name')?.textContent?.trim() || 'VPS';
    const monthlyPKR = parseFloat(card.getAttribute('data-monthly-pkr'));
    if (Number.isNaN(monthlyPKR)) return;

    const pricing = calculatePricing(monthlyPKR, state.billing);
    const rate = formatPrice(pricing.displayMonthlyRatePKR, state.currency);

    if (state.billing === 'annually') {
      const annualTotal = formatPrice(pricing.annualTotalPKR, state.currency);
      selectedPlanNote.textContent = `Selected: ${planName} at ${rate}/month (${annualTotal}/yr). Complete invoice payment via any Pakistani channel below.`;
    } else {
      selectedPlanNote.textContent = `Selected: ${planName} at ${rate}/month (billed monthly). Complete invoice payment via any Pakistani channel below.`;
    }
  }

  function render() {
    const isAnnual = state.billing === 'annually';

    pricingCards.forEach((card) => {
      const monthlyPKR = parseFloat(card.getAttribute('data-monthly-pkr'));
      if (Number.isNaN(monthlyPKR)) return;

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
        billedTextEl.textContent = isAnnual
          ? `Billed ${formattedAnnualTotal}/yr`
          : 'Billed monthly';
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

    tablePriceElements.forEach((el) => {
      const planKey = el.getAttribute('data-table-price');
      const matchingCard = document.querySelector(`.pricing-card[data-plan="${planKey}"]`);
      if (!matchingCard) return;

      const monthlyPKR = parseFloat(matchingCard.getAttribute('data-monthly-pkr'));
      if (Number.isNaN(monthlyPKR)) return;

      const pricing = calculatePricing(monthlyPKR, state.billing);
      const formattedRate = formatPrice(pricing.displayMonthlyRatePKR, state.currency);
      el.textContent = `${formattedRate}/mo`;
    });

    billingButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-billing') === state.billing;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    currencyButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-currency') === state.currency;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    updateSelectedPlanNote();
  }

  function announceToScreenReader(message) {
    if (!srAnnouncements) return;
    if (announceTimer) {
      clearTimeout(announceTimer);
    }
    srAnnouncements.textContent = '';
    announceTimer = setTimeout(() => {
      srAnnouncements.textContent = message;
    }, 40);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLING, state.billing);
      localStorage.setItem(STORAGE_KEYS.CURRENCY, state.currency);
    } catch (err) {
      // Storage may be disabled in private browsing or restricted sandboxes
    }
  }

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
    } catch (err) {
      // Fall back to default monthly PKR
    }
  }

  function setupRadioKeyboardNav(buttons) {
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
          buttons[targetIndex].click();
        }
      });
    });
  }

  function getGrowthRateText() {
    const growthCard = document.querySelector('.pricing-card[data-plan="growth"]');
    const priceEl = growthCard ? growthCard.querySelector('[data-price-value]') : null;
    return priceEl ? priceEl.textContent : '';
  }

  function init() {
    billingButtons = Array.from(document.querySelectorAll('.billing-toggle .seg-btn'));
    currencyButtons = Array.from(document.querySelectorAll('.currency-selector .seg-btn'));
    pricingCards = Array.from(document.querySelectorAll('.pricing-card'));
    tablePriceElements = Array.from(document.querySelectorAll('[data-table-price]'));
    planSelectButtons = Array.from(document.querySelectorAll('[data-select-plan]'));
    srAnnouncements = document.getElementById('sr-announcements');
    selectedPlanNote = document.getElementById('selected-plan-note');

    loadState();

    billingButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-billing');
        if (state.billing === selected) return;

        state.billing = selected;
        saveState();
        render();

        const modeName = state.billing === 'annually'
          ? 'Annual billing with 2 months free'
          : 'Monthly billing';
        announceToScreenReader(`${modeName} selected. Growth plan is now ${getGrowthRateText()} per month.`);
      });
    });

    currencyButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selected = btn.getAttribute('data-currency');
        if (state.currency === selected) return;

        state.currency = selected;
        saveState();
        render();

        announceToScreenReader(`Currency changed to ${state.currency}. Growth plan is now ${getGrowthRateText()} per month.`);
      });
    });

    planSelectButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.pricing-card');
        if (!card) return;
        state.selectedPlanKey = card.getAttribute('data-plan');
        updateSelectedPlanNote();
        if (selectedPlanNote) {
          announceToScreenReader(selectedPlanNote.textContent);
        }
      });
    });

    setupRadioKeyboardNav(billingButtons);
    setupRadioKeyboardNav(currencyButtons);

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

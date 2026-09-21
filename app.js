(() => {
  'use strict';

  const policies = {
    steady: {
      kicker: 'Balanced default',
      title: 'Steady distribution',
      description: 'Prioritizes broad holder coverage while reserving additional weight for long-term and active participants.',
      reason: 'Normal market conditions, stable holder composition, and no unusual participation imbalance.',
      broad: 70, loyal: 20, active: 10
    },
    loyalty: {
      kicker: 'Conviction weighted',
      title: 'Loyalty distribution',
      description: 'Increases the epoch weight assigned to wallets that maintained an eligible position across the published loyalty window.',
      reason: 'Holder retention is strong and sustained ownership should carry more weight than short-term participation.',
      broad: 45, loyal: 45, active: 10
    },
    participation: {
      kicker: 'Contribution weighted',
      title: 'Participation distribution',
      description: 'Adds weight to eligible wallets that completed the vault-defined participation signals during the current epoch.',
      reason: 'Verified participation is broad enough to reward without concentrating the holder pool in a small set of wallets.',
      broad: 45, loyal: 20, active: 35
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function setPolicy(key) {
    const policy = policies[key];
    if (!policy) return;
    $$('.policy-tab').forEach((tab) => {
      const active = tab.dataset.policy === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    $('#policyKicker').textContent = policy.kicker;
    $('#policyTitle').textContent = policy.title;
    $('#policyDescription').textContent = policy.description;
    $('#policyReason').textContent = policy.reason;
    ['broad', 'loyal', 'active'].forEach((name) => {
      $(`#${name}Value`).textContent = `${policy[name]}%`;
      $(`#${name}Bar`).style.width = `${policy[name]}%`;
    });
  }

  $$('.policy-tab').forEach((tab) => tab.addEventListener('click', () => setPolicy(tab.dataset.policy)));

  $$('.vault-nav').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.vault-nav').forEach((item) => item.classList.remove('active'));
      $$('.vault-panel').forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active');
      $(`#panel-${button.dataset.panel}`).classList.add('active');
    });
  });


  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((element) => observer.observe(element));

  setPolicy('steady');
})();

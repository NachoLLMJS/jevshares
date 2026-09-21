(() => {
  'use strict';

  const config = window.JEVSHARES_CONFIG || {};
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
  const toast = $('#toast');
  let toastTimer;
  let account = '';

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  }

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

  async function ensureChain(provider) {
    const expectedHex = `0x${Number(config.chainId).toString(16)}`;
    const current = await provider.request({ method: 'eth_chainId' });
    if (current.toLowerCase() === expectedHex.toLowerCase()) return true;
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: expectedHex }] });
      return true;
    } catch (error) {
      if (error && error.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: expectedHex,
            chainName: config.chainName,
            nativeCurrency: config.nativeCurrency,
            rpcUrls: config.rpcUrls,
            blockExplorerUrls: config.blockExplorerUrls
          }]
        });
        return true;
      }
      throw error;
    }
  }

  function renderAccount(address) {
    account = address || '';
    const label = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect wallet';
    $('#walletLabel').textContent = label;
    $$('.secondary-connect').forEach((button) => { button.textContent = account ? label : 'Connect wallet'; });
    document.body.classList.toggle('wallet-connected', Boolean(account));
  }

  async function connectWallet() {
    if (!window.ethereum) {
      notify('No EIP-1193 wallet found. Install a compatible wallet to continue.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await ensureChain(window.ethereum);
      renderAccount(accounts[0] || '');
      notify('Wallet connected. This release establishes account and network context only; contract reads remain disabled.');
    } catch (error) {
      const message = error && error.code === 4001 ? 'Wallet request cancelled.' : 'Unable to connect or switch to BNB Chain.';
      notify(message);
    }
  }

  $('#connectWallet').addEventListener('click', connectWallet);
  $$('.secondary-connect').forEach((button) => button.addEventListener('click', connectWallet));

  if (window.ethereum && typeof window.ethereum.on === 'function') {
    window.ethereum.on('accountsChanged', (accounts) => renderAccount(accounts[0] || ''));
    window.ethereum.on('chainChanged', () => {
      renderAccount('');
      notify('Network changed. Reconnect to verify the active chain.');
    });
  }

  $('#claimButton').addEventListener('click', () => {
    notify('Claim is unavailable until a verified vault and positive claimable balance are loaded.');
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

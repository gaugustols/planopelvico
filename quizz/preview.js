(() => {
  const id = '00000000-0000-4000-8000-000000000001';
  const proxy = '/api-client-proxy';
  const sessionPath = proxy + '/dynamic-public/session-new/session/v3';
  const sessionItem = sessionPath + '/' + id;
  const session = { data: { uuid: id, id } };
  const fixtures = new Map([
    ['GET ' + sessionItem, session],
    ['PUT ' + sessionItem, session],
    ['POST ' + sessionPath, session],
    ['GET ' + proxy + '/realtime/events/utm-data/' + id, { data: {} }],
    ['GET ' + proxy + '/dynamic-public/cart-v2/cart/v3/' + id, { data: [] }],
    ['GET /api/session/get-country', { country: 'US' }],
    ['POST ' + proxy + '/realtime/events/track-event', {}],
    ['POST ' + proxy + '/dynamic-public-direct/klaviyo/events', {}],
    ['POST ' + proxy + '/dynamic-public/upsell-flow/upsell/v3/start', { data: null }],
    ['POST /api/app-handoff', {}],
  ]);

  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const request = input instanceof Request ? input : null;
    const url = new URL(request ? request.url : input, location.href);
    const method = (init?.method || request?.method || 'GET').toUpperCase();
    if (url.origin !== location.origin) {
      return Promise.reject(new TypeError('Serviço externo desativado na demonstração.'));
    }
    const fixture = fixtures.get(method + ' ' + url.pathname);
    if (fixture !== undefined) {
      return Promise.resolve(new Response(JSON.stringify(fixture), {
        headers: { 'Content-Type': 'application/json' },
      }));
    }
    if (method !== 'GET' || url.pathname.startsWith(proxy + '/') || url.pathname.startsWith('/api/')) {
      return Promise.resolve(new Response('{}', { status: 404 }));
    }
    return originalFetch(input, init);
  };

  Object.defineProperty(navigator, 'sendBeacon', { value: () => true });
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button');
    if (!button || !location.pathname.includes('/checkout/')) return;
    if (button.textContent.trim().toLowerCase() !== 'get my plan') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.alert('Pagamento desativado nesta demonstração.');
  }, true);
})();

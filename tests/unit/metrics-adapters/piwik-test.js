import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

let sandbox, config;

module('piwik adapter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    sandbox = sinon.sandbox.create();
    config = {
      piwikUrl: "http://my-cool-url.com",
      siteId: 42
    };
  });

  hooks.afterEach(function() {
    sandbox.restore();
  });

  test('#identify calls piwik with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:piwik').create({ config });
    window._paq.push = sandbox.stub().returns(true);
    adapter.identify({
      userId: 123
    });
    assert.ok(window._paq.push.calledWith(['setUserId', 123]), 'it sends the correct arguments');
  });

  test('#trackEvent calls piwik with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:piwik').create({ config });
    window._paq.push = sandbox.stub().returns(true);
    adapter.trackEvent({
      category: 'button',
      action: 'click',
      name: 'nav buttons',
      value: 4
    });

    assert.ok(window._paq.push.calledWith(['trackEvent', 'button', 'click', 'nav buttons', 4]), 'it sends the correct arguments');
  });

  test('#trackPage calls piwik with the right arguments', function(assert) {
    const adapter = this.owner.factoryFor('ember-metrics@metrics-adapter:piwik').create({ config });
    window._paq.push = sandbox.stub().returns(true);
    adapter.trackPage({
      page: '/my-overridden-page?id=1',
      title: 'my overridden page'
    });
    assert.ok(window._paq.push.calledWith(['setCustomUrl', '/my-overridden-page?id=1']), 'it sends the correct arguments');
    assert.ok(window._paq.push.calledWith(['trackPageView', 'my overridden page']), 'it sends the correct arguments');
  });
});

import Ember from 'ember';
import canUseDOM from '../utils/can-use-dom';
import objectTransforms from '../utils/object-transforms';
import BaseAdapter from './base';

const {
  isPresent,
  copy,
  assert,
  merge,
  get,
  $,
  String: { capitalize },
} = Ember;
const { compact } = objectTransforms;

export default BaseAdapter.extend({
  toStringExtension() {
    return 'GoogleAnalytics';
  },

  init() {
    const config = copy(get(this, 'config'));
    const { id, alias } = config;

    assert(`[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`, id);

    delete config.id;
    delete config.alias;

    const hasAlias = isPresent(alias);
    const hasOptions = isPresent(Object.keys(config));

    if (canUseDOM) {
      /* jshint ignore:start */
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
      /* jshint ignore:end */

      let params = ['create', id];
      if (hasAlias) params.push(alias);
      if (hasOptions) params.push(config);

      window.ga(...params);
    }
  },

  identify(options = {}) {
    const compactedOptions = compact(options);
    const { distinctId } = compactedOptions;

    window.ga('set', 'userId', distinctId);
  },

  trackEvent(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'event' };
    let gaEvent = {};

    if (compactedOptions.nonInteraction) {
      gaEvent.nonInteraction = compactedOptions.nonInteraction;
      delete compactedOptions.nonInteraction;
    }

    for (let key in compactedOptions) {
      const capitalizedKey = capitalize(key);
      gaEvent[`event${capitalizedKey}`] = compactedOptions[key];
    }

    const event = merge(sendEvent, gaEvent);
    window.ga('send', event);

    return event;
  },

  trackPage(options = {}) {
    const compactedOptions = compact(options);
    const sendEvent = { hitType: 'pageview' };

    const event = merge(sendEvent, compactedOptions);
    window.ga('send', event);

    return event;
  },

  willDestroy() {
    $('script[src*="google-analytics"]').remove();
    delete window.ga;
  }
});

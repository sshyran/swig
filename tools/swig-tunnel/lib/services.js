/*
  This file contains all of the known services required to run most web-* apps.

  Adding Hosts:
    There are two formats for adding services to this file:
      1. 'svc-name'
      2. { name, host, remote }
          name: The name of the service
          host: When tunneling production, the hostname to use for the service.
          rmeote: The remote port the service should be tunneled to.

  NOTE: The config specified (the task defaults to 'losa') by the task command is
        combined with 'default' automatically.
*/

var _ = require('underscore'),
  configs = {
    'default': [

      { name: 'inventory_service', host: 'svc1' },
      { name: 'kafka', host: 'mq4.prod.iad.gilt.local' },
      'postgres',
      { name:'product_service', host: 'svc-product', remote: '80' },
      { name: 'rabbitmq', alias: 'amqp' },
      'svc-account',
      'svc-account-credits',
      'svc-brand-acquisition',
      'svc-cart',
      { name: 'svc-cerebro', host: 'svc13' },
      { name: 'svc-component', host: 'svc4' },
      { name:'config_service', host: 'svc-config', remote: '80' },
      { name: 'svc-data', host: 'svc3' },
      'svc-discount',
      'svc-email',
      'svc-email-delivery',
      'svc-email-subscription',
      'svc-email-template',
      'svc-freefall',
      { name: 'geoip_service', host: 'svc-geoip', remote: '80' },
      'svc-gift-certificate',
      'svc-gilt_detail',
      'svc-gilt_listing',
      { name: 'svc-homepage', host: 'svc13' },
      'svc-hopper-sale',
      { name: 'svc-image', host: 'svc3' },
      'svc-intl',
      'svc-inventory',
      { name: 'svc-localized-string', host: 'svc1' },
      'svc-loyalty',
      'svc-marketing',
      'svc-moment',
      { name: 'svc-natural-taxonomy', host: 'svc1' },
      'svc-pagegen',
      'svc-payment',
      'svc-payment-manager',
      { name: 'svc-persistent-session', host: 'svc13' },
      'svc-personal-sale',
      { name: 'preference_service', host: 'svc-preference', remote: '80' },
      'svc-product',
      { name: 'svc-product-brand', host: 'svc3' },
      'svc-product-disclaimer',
      'svc-product_recommendation',
      { name: 'svc-return-policy', host: 'svc10' },
      'svc-search',
      'svc-session',
      'svc-social',
      'svc-targeting',
      { name: 'svc-tax-duty', host: 'svc15' },
      { name: 'svc-taxonomy', host: 'svc15' },
      { name: 'svc-trending-product', host: 'svc4.prod.iad.gilt.local' },
      { name: 'svc-user', host: 'svc13' },
      'svc-user-group',
      { name: 'svc-user-set', host: 'svc3' },
      'svc-user-notification',
      'svc-user_recommendation',
      'svc-waitlist',
      'svc-waitlist-submit',
      { name: 'user_service', host: 'svc1' },
      { name: 'swift', host: 'stage53' },
      'web-inventory-status',
      'zookeeper'
    ],

    // non-default configs

    cityswift: [
      'svc-city',
      'svc-city-locale',
      'svc-city-offers',
      'svc-city-search',
      'svc-guest',
      'svc-invitation',
      'svc-offer-selector',
      'svc-order',
      'svc-social'
    ],

    effort: [
      'svc-effort'
    ],

    homepage: [
      'svc-city-locale',
      'svc-designer-profile',
      { name: 'svc-homepage', host: 'svc13' },
      'svc-intl',
      'svc-personal-sale',
      'svc-proxy',
      'svc-rogue',
      'svc-sale-selector',
      'svc-swift_account',
      'svc-targeting',
      'svc-taxonomy',
      'svc-user-set'
    ],

    mobile: [
      'svc-mobile-cart',
      'svc-mobile-product',
      'svc-mobile-loyalty',
      'svc-mobile-search',
      'svc-mobile-sale',
      'svc-mobile-user',
      'svc-mobile-waitlist'
    ],

    losa: [
      'admin-search-service',
      'svc-admin',
      { name: 'svc-component', host: 'svc4' },
      'svc-deep-logging',
      { name: 'svc-discount', host: 'svc5' },
      'svc-homepage',
      { name: 'svc-product-disclaimer', host: 'svc2' },
      { name: 'svc-proxy', host: 'stage55' },
      { name: 'svc-sale-selector', host: 'svc-sale-selector1.prod.ec2.gilt.local' },
      'svc-seo',
      'svc-shipping',
      'svc-user-set',
      'svc-taxonomy',
      'web-test',
      'web-x-domain'
    ],

    mosaic: [
      'svc-gilt-detail',
      'svc-gilt-listing',
      'svc-homepage',
      { name: 'svc-component', host: 'svc4' },
      'svc-user-set',
      'svc-homepage'
    ],

    syndication: [
      'svc-persistent-session',
      'svc-warehouse-units'
    ]
  };

_.each(configs, function (config, name) {
  configs[name] = _.union(configs.default, config);
});

configs.admin = _.union(configs.losa, [
  'svc-admin',
  'svc-admin-authorization'
]);

module.exports = configs;
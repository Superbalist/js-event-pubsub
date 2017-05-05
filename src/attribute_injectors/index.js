'use strict';

/**
 * @callback attributeInjectorCallback
 * @return {AttributeInjector}
 */

/**
 * @typedef {Object} AttributeInjector
 * @property {string} key
 * @property {*} value
 */

let dateAttributeInjector = require('./date_attribute_injector');
let hostnameAttributeInjector = require('./hostname_attribute_injector');
let uuid4AttributeInjector = require('./uuid4_attribute_injector');

module.exports = {
  date_attribute_injector: dateAttributeInjector,
  hostname_attribute_injector: hostnameAttributeInjector,
  uuid4_attribute_injector: uuid4AttributeInjector,
};

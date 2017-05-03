"use strict";

var dateAttributeInjector = require('./date_attribute_injector');
var hostnameAttributeInjector = require('./hostname_attribute_injector');
var uuid4AttributeInjector = require('./uuid4_attribute_injector');

module.exports = {
  date_attribute_injector: dateAttributeInjector,
  hostname_attribute_injector: hostnameAttributeInjector,
  uuid4_attribute_injector: uuid4AttributeInjector
};

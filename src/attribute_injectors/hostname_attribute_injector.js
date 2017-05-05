'use strict';

let os = require('os');

/**
 * @return {AttributeInjector}
 */
module.exports = () => {
  return {
    'key': 'hostname',
    'value': os.hostname(),
  };
};

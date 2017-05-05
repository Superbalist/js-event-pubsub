'use strict';

let uuid = require('uuid/v4');

/**
 * @return {AttributeInjector}
 */
module.exports = () => {
  return {
    'key': 'uuid',
    'value': uuid(),
  };
};

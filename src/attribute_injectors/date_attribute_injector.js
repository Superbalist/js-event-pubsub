'use strict';

/**
 * @return {AttributeInjector}
 */
module.exports = () => {
  return {
    'key': 'date',
    'value': (new Date()).toISOString(),
  };
};

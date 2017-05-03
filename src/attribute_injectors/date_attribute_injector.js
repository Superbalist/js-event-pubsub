"use strict";

module.exports = () => {
  return {
    'key': 'date',
    'value': (new Date()).toISOString()
  };
};

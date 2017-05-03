"use strict";

var uuid = require('uuid/v4');

module.exports = () => {
  return {
    'key': 'uuid',
    'value': uuid()
  };
};

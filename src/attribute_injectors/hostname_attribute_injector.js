"use strict";

var os = require('os');

module.exports = () => {
  return {
    'key': 'hostname',
    'value': os.hostname()
  };
};

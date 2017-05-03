"use strict";

var Ajv = require('ajv');
var request = require('request-promise-native');

class JSONSchemaEventValidator {
  constructor(ajv = null) {
    this.ajv = ajv || JSONSchemaEventValidator.makeDefaultAjv();
  }

  validates(event) {
    return this.ajv.compileAsync({$ref: event.schema}).then(function (validate) {
      return new Promise(function (resolve, reject) {
        if (validate(event.toMessage())) {
          resolve();
        } else {
          reject(validate.errors);
        }
      });
    });
  }

  static makeDefaultAjv() {
    let ajv = new Ajv({
      loadSchema: (uri) => {
        return request({uri: uri, json: true});
      },
      allErrors: true
    });

    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

    return ajv;
  }
}

module.exports = JSONSchemaEventValidator;

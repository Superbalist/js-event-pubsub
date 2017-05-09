'use strict';

let Ajv = require('ajv');
let request = require('request-promise-native');

/**
 * JSONSchemaEventValidator Class
 *
 * @implements {EventValidatorInterface}
 */
class JSONSchemaEventValidator {
  /**
   * Construct a JSONSchemaEventValidator
   *
   * @param {?Ajv} [ajv=null]
   */
  constructor(ajv = null) {
    /**
     * @type {Ajv}
     */
    this.ajv = ajv || JSONSchemaEventValidator.makeDefaultAjv();
  }

  /**
   * Validates an event.
   *
   * @param {SchemaEvent} event
   * @return {Promise<boolean>}
   * @example
   * validator.validates(event).then((success) => {
   *   // event validates!
   * }).catch((reason) => {
   *   // event failed validation
   *   console.log(reason);
   * });
   */
  validates(event) {
    return this.ajv.compileAsync({$ref: event.schema})
      .then(function(validate) {
        return new Promise(function(resolve, reject) {
          if (validate(event.toMessage())) {
            resolve(true);
          } else {
            reject(validate.errors);
          }
        });
      }
    );
  }

  /**
   * Factory a default instance of ajv.
   *
   * @return {Ajv}
   */
  static makeDefaultAjv() {
    let ajv = new Ajv({
      loadSchema: (uri) => {
        return request({uri: uri, json: true});
      },
      allErrors: true,
    });

    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

    return ajv;
  }
}

module.exports = JSONSchemaEventValidator;

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
   *   if (success) {
   *     console.log('event validates!');
   *   } else {
   *     console.log('event failed validation');
   *   }
   * });
   */
  validates(event) {
    return this.ajv.compileAsync({$ref: event.schema})
      .then(function(validate) {
        return validate(event.toMessage());
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

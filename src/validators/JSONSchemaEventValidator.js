'use strict';

let Ajv = require('ajv');
let request = require('request-promise-native');
let ValidationResult = require('../ValidationResult');

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
   * Validate an event.
   *
   * @param {SchemaEvent} event
   * @return {Promise<ValidationResult>}
   * @example
   * validator.validate(event).then((result) => {
   *   if (result.passes) {
   *     console.log('event validates!');
   *   } else {
   *     console.log('event failed validation');
   *     console.log(result.errors);
   *   }
   * });
   */
  validate(event) {
    let _this = this;

    return this.ajv.compileAsync({$ref: event.schema})
      .then(function(validate) {
        if (validate(event.toMessage())) {
          return new ValidationResult(_this, event, true);
        } else {
          let errors = validate.errors.map((error) => {
            return error.message;
          });
          return new ValidationResult(_this, event, false, errors);
        }
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

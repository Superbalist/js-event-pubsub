'use strict';

/**
 * ValidationResult Class
 */
class ValidationResult {
  /**
   * Construct an ValidationResult
   *
   * @param {EventValidatorInterface} validator
   * @param {EventInterface} event
   * @param {boolean} passes
   * @param {string[]} [errors=[]]
   */
  constructor(validator, event, passes, errors = []) {
    /**
     * @type {EventValidatorInterface}
     */
    this.validator = validator;

    /**
     * @type {EventInterface}
     */
    this.event = event;

    /**
     * @type {boolean}
     */
    this.passes = passes;

    /**
     * @type {boolean}
     */
    this.fails = !passes;

    /**
     * @type {string[]}
     */
    this.errors = errors;
  }
}

module.exports = ValidationResult;

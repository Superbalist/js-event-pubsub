'use strict';

/**
 * EventValidatorInterface Interface
 *
 * @abstract
 * @interface
 */
class EventValidatorInterface {
  /**
   * Validate an event.
   *
   * @param {EventInterface} event
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

  }
}

module.exports = EventValidatorInterface;

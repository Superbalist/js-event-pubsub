'use strict';

/**
 * EventValidatorInterface Interface
 *
 * @abstract
 * @interface
 */
class EventValidatorInterface {
  /**
   * Validates an event.
   *
   * @param {EventInterface} event
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

  }
}

module.exports = EventValidatorInterface;

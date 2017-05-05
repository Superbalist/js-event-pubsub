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
   * @return {Promise}
   * @example
   * validator.validates(event).then(() => {
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

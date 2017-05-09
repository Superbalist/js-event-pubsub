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
   *   if (success) {
   *     console.log('event validates!');
   *   } else {
   *     console.log('event failed validation');
   *   }
   * });
   */
  validates(event) {

  }
}

module.exports = EventValidatorInterface;

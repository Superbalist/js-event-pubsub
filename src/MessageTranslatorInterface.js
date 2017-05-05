'use strict';

/**
 * MessageTranslatorInterface Interface
 *
 * @abstract
 * @interface
 */
class MessageTranslatorInterface {
  /**
   * Translate a message into an event.
   *
   * @param {*} message
   * @return {?EventInterface}
   */
  translate(message) {

  }
}

module.exports = MessageTranslatorInterface;

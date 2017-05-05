'use strict';

/**
 * EventInterface Interface
 *
 * @abstract
 * @interface
 */
class EventInterface {
  /**
   * Return the event name.
   *
   * @return {string}
   * @example
   * console.log(event.getName());
   */
  getName() {

  }

  /**
   * Return all event attributes.
   *
   * @return {Object.<string, *>}
   * @example
   * console.log(event.getAttributes());
   */
  getAttributes() {

  }

  /**
   * Return an event attribute.
   *
   * @param {string} name
   * @return {*}
   * @example
   * console.log(event.getAttribute('user'));
   */
  getAttribute(name) {

  }

  /**
   * Set an event attribute.
   *
   * @param {string} name
   * @param {*} value
   * @example
   * event.setAttribute('first_name', 'Matthew');
   */
  setAttribute(name, value) {

  }

  /**
   * Check whether or not an event has an attribute.
   *
   * @param {string} name
   * @return {boolean}
   * @example
   * console.log(event.hasAttribute('user'));
   */
  hasAttribute(name) {

  }

  /**
   * Return the event in a message format ready for publishing.
   *
   * @return {*}
   * @example
   * let message = event.toMessage();
   */
  toMessage() {

  }

  /**
   * Check whether or not the event matches the given expression.
   *
   * @param {string} expr
   * @return {boolean}
   * @example
   * console.log(event.matches('user/created/*'));
   */
  matches(expr) {

  }
}

module.exports = EventInterface;

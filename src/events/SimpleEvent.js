'use strict';

/**
 * SimpleEvent Class
 *
 * @implements {EventInterface}
 * @example
 * let event = new SimpleEvent('user.created', {
 *   user: {
 *     id: 1456,
 *     first_name: 'Joe',
 *     last_name: 'Soap',
 *     email: 'joe.soap@example.org'
 *   }
 * });
 */
class SimpleEvent {
  /**
   * Construct a SimpleEvent
   *
   * @param {string} name
   * @param {Object.<string, *>} [attributes={}]
   */
  constructor(name, attributes = {}) {
    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {Object.<string, *>}
     */
    this.attributes = attributes;
  }

  /**
   * Return the event name.
   *
   * @return {string}
   * @example
   * console.log(event.getName());
   */
  getName() {
    return this.name;
  }

  /**
   * Return all event attributes.
   *
   * @return {Object.<string, *>}
   * @example
   * console.log(event.getAttributes());
   */
  getAttributes() {
    return this.attributes;
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
    return this.attributes.hasOwnProperty(name) ? this.attributes[name] : null;
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
    this.attributes[name] = value;
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
    return this.attributes.hasOwnProperty(name);
  }

  /**
   * Return the event in a message format ready for publishing.
   *
   * @return {*}
   * @example
   * let message = event.toMessage();
   */
  toMessage() {
    // we do a simple copy of the attributes
    let attributes = JSON.parse(JSON.stringify(this.attributes));
    attributes.event = this.name;
    return attributes;
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
    return expr === '*' || this.name === expr;
  }
}

module.exports = SimpleEvent;

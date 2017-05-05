'use strict';

let SimpleEvent = require('./SimpleEvent');
let semver = require('semver');

/**
 * @typedef {Object} ParsedEventExpression
 * @property {string} topic
 * @property {string} event
 * @property {string} version
 */

/**
 * TopicEvent Class
 *
 * @implements {EventInterface}
 * @extends {SimpleEvent}
 * @example
 * let event = new TopicEvent(
 *   'user',
 *   'created',
 *   '1.0',
 *   {
 *     user: {
 *       id: 1456,
 *       first_name: 'Joe',
 *       last_name: 'Soap',
 *       email: 'joe.soap@example.org'
 *     }
 *   }
 * );
 */
class TopicEvent extends SimpleEvent {
  /**
   * Construct a TopicEvent
   *
   * @param {string} topic
   * @param {string} name
   * @param {string} version
   * @param {Object.<string, *>} [attributes={}]
   */
  constructor(topic, name, version, attributes = {}) {
    super(name, attributes);

    /**
     * @type {string}
     */
    this.topic = topic;

    /**
     * @type {string}
     */
    this.version = version;
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
    attributes.topic = this.topic;
    attributes.event = this.name;
    attributes.version = this.version;
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
    let params = TopicEvent.parseEventExpr(expr);

    if (params.topic === '*') {
      return true;
    } else if (this.topic !== params.topic) {
      return false;
    }

    if (params.event === '*') {
      return true;
    } else if (this.name !== params.event) {
      return false;
    }

    if (params.version === '*') {
      return true;
    } else {
      return semver.satisfies(
        TopicEvent.normaliseSemVerStr(this.version),
        params.version
      );
    }
  }

  /**
   * Parse a event expression into a topic, event and version.
   *
   * @param {string} expr
   * @return {ParsedEventExpression}
   * @throws Error if the expression format is invalid
   */
  static parseEventExpr(expr) {
    let match = expr.match(/^([\w*.,]+)(\/([\w*.,]+)(\/([\w*.,]+))?)?$/i);
    if (!match) {
      throw new Error('The expression must be in the format "topic/event?/version?"');
    }

    let topic = match[1];
    let event = match[3] || '*';
    let version = match[5] || '*';

    if (topic === '*') {
      event = version = '*';
    } else if (event === '*') {
      version = '*';
    }

    return {
      topic: topic,
      event: event,
      version: version,
    };
  }

  /**
   * Normalise a version string to a valid semver string.
   *
   * The semver library requires a string such as '1.0.0' when performing
   * comparisons.  This function normalises strings such as '1', '1.0'
   * into '1.0.0'.
   *
   * @param {string} version
   * @return {string}
   */
  static normaliseSemVerStr(version) {
    let match = version.match(/^v?(0|[1-9]\d*)(\.(0|[1-9]\d*))?(\.(0|[1-9]\d*))?$/);
    if (match) {
      let major = match[1];
      let minor = match[3] || '0';
      let patch = match[5] || '0';
      return major + '.' + minor + '.' + patch;
    } else {
      return version;
    }
  }
}

module.exports = TopicEvent;

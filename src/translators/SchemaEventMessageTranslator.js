'use strict';

let SchemaEvent = require('../events/SchemaEvent');

/**
 * @typedef {Object} ParsedSchema
 * @property {string} topic
 * @property {string} event
 * @property {string} version
 */

/**
 * SchemaEventMessageTranslator Class
 *
 * @implements {MessageTranslatorInterface}
 */
class SchemaEventMessageTranslator {
  /**
   * Translate a message into an event.
   *
   * @param {*} message
   * @return {?SchemaEvent}
   */
  translate(message) {
    // message must be an object
    // this is a simple check, but should work for all cases here
    if (message === null || typeof(message) !== 'object') {
      return null;
    }

    // we must have a schema property
    if (!message.hasOwnProperty('schema')) {
      return null;
    }

    // don't include the schema as an attribute
    let attributes = JSON.parse(JSON.stringify(message)); // we do a simple copy of the attributes
    delete attributes['schema'];

    return new SchemaEvent(message.schema, attributes);
  }

  /**
   * Parse a schema url into a topic, event and version.
   *
   * If the schema uri cannot be parsed, null is returned.
   *
   * @param {string} schema
   * @return {?ParsedSchema}
   * @example
   * let str = 'http://my.domain.com/events/user/created/1.0.0.json';
   * let parsed = SchemaEventMessageTranslator.parseSchemaStr(str);
   * // parsed = {topic: 'user', event: 'created', version: '1.0.0'}
   */
  static parseSchemaStr(schema) {
    // schema must match the regular expression '(protocol)://(......)?/events/(topic)/(channel)/(version).json'
    // eg: http://schemas.my-website.org/events/user/created/1.0.json
    let match = schema.match(/^(.+):\/\/(.+\/)?events\/(.+)\/(.+)\/(.+)\.json$/);
    if (!match) {
      return null;
    }
    return {
      topic: match[3],
      event: match[4],
      version: match[5],
    };
  }
}

module.exports = SchemaEventMessageTranslator;

'use strict';

let TopicEvent = require('./TopicEvent');

/**
 * SchemaEvent Class
 *
 * @implements {EventInterface}
 * @extends {TopicEvent}
 * @example
 * let event = new SchemaEvent('schemas://events/user/created/1.0.json', {
 *   user: {
 *     id: 1456,
 *     first_name: 'Joe',
 *     last_name: 'Soap',
 *     email: 'joe.soap@example.org'
 *   }
 * });
 */
class SchemaEvent extends TopicEvent {
  /**
   * Construct a SchemaEvent
   *
   * @param {string} schema
   * @param {Object.<string, *>} [attributes={}]
   * @throws Error if the schema string format is invalid
   */
  constructor(schema, attributes = {}) {
    let SchemaEventMessageTranslator = require('../translators/SchemaEventMessageTranslator');
    let params = SchemaEventMessageTranslator.parseSchemaStr(schema);
    if (params === null) {
      throw new Error('The schema string must be in the format "(protocol)://(......)?/events/(topic)/(channel)/(version).json".');
    }
    super(params.topic, params.event, params.version, attributes);

    /**
     * @type {string}
     */
    this.schema = schema;
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
    attributes.schema = this.schema;
    return attributes;
  }
}

module.exports = SchemaEvent;

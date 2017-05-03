"use strict";

var TopicEvent = require('./TopicEvent');

class SchemaEvent extends TopicEvent {
  constructor(schema, attributes = {}) {
    let SchemaEventMessageTranslator = require('../translators/SchemaEventMessageTranslator');
    let params = SchemaEventMessageTranslator.parseSchemaStr(schema);
    if (params === null) {
      throw new Error('The schema string must be in the format "(protocol)://(......)?/events/(topic)/(channel)/(version).json".');
    }
    super(params.topic, params.event, params.version, attributes);

    this.schema = schema;
  }

  toMessage() {
    // we do a simple copy of the attributes
    let attributes = JSON.parse(JSON.stringify(this.attributes));
    attributes.schema = this.schema;
    return attributes;
  }
}

module.exports = SchemaEvent;

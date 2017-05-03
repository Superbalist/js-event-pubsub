"use strict";

var SchemaEvent = require('../events/SchemaEvent');

class SchemaEventMessageTranslator {
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
      version: match[5]
    }
  }
}

module.exports = SchemaEventMessageTranslator;

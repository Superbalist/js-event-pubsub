"use strict";

var SimpleEvent = require('../events/SimpleEvent');

class SimpleEventMessageTranslator {
  translate(message) {
    // message must be an object
    // this is a simple check, but should work for all cases here
    if (message === null || typeof(message) !== 'object') {
      return null;
    }

    // we must have an event property
    if (!message.hasOwnProperty('event')) {
      return null;
    }

    // don't include the event name as an attribute
    let attributes = JSON.parse(JSON.stringify(message)); // we do a simple copy of the attributes
    delete attributes['event'];

    return new SimpleEvent(message.event, attributes);
  }
}

module.exports = SimpleEventMessageTranslator;

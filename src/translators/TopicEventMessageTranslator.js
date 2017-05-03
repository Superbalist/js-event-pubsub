"use strict";

var TopicEvent = require('../events/TopicEvent');

class TopicEventMessageTranslator {
  translate(message) {
    // message must be an object
    // this is a simple check, but should work for all cases here
    if (message === null || typeof(message) !== 'object') {
      return null;
    }

    // we must have an event property
    for (let key of ['topic', 'event', 'version']) {
      if (!message.hasOwnProperty(key)) {
        return null;
      }
    }

    // don't include the topic, event and version as attributes
    let attributes = JSON.parse(JSON.stringify(message)); // we do a simple copy of the attributes
    delete attributes['topic'];
    delete attributes['event'];
    delete attributes['version'];

    return new TopicEvent(message.topic, message.event, message.version, attributes);
  }
}

module.exports = TopicEventMessageTranslator;

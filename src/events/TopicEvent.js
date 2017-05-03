"use strict";

var SimpleEvent = require('./SimpleEvent');
var semver = require('semver');

class TopicEvent extends SimpleEvent {
  constructor(topic, name, version, attributes = {}) {
    super(name, attributes);

    this.topic = topic;
    this.version = version;
  }

  toMessage() {
    // we do a simple copy of the attributes
    let attributes = JSON.parse(JSON.stringify(this.attributes));
    attributes.topic = this.topic;
    attributes.event = this.name;
    attributes.version = this.version;
    return attributes;
  }

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
      return semver.satisfies(TopicEvent.normaliseSemVerStr(this.version), params.version);
    }
  }

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
      version: version
    }
  }

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

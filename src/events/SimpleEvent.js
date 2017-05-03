"use strict";

class SimpleEvent {
  constructor(name, attributes = {}) {
    this.name = name;
    this.attributes = attributes;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(name) {
    return this.attributes.hasOwnProperty(name) ? this.attributes[name] : null;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  hasAttribute(name) {
    return this.attributes.hasOwnProperty(name);
  }

  toMessage() {
    // we do a simple copy of the attributes
    let attributes = JSON.parse(JSON.stringify(this.attributes));
    attributes.event = this.name;
    return attributes;
  }

  matches(expr) {
    return expr === '*' || this.name === expr;
  }
}

module.exports = SimpleEvent;

"use strict";

class EventManager {
  constructor(adapter, translator, validator = null, attributeInjectors = []) {
    this.adapter = adapter;
    this.translator = translator;
    this.validator = validator;
    this.attributeInjectors = attributeInjectors;
  }

  addAttributeInjector(attributeInjector) {
    this.attributeInjectors.push(attributeInjector);
  }

  listen(channel, expr, handler) {
    this.adapter.subscribe(channel, (message) => {
      let event = this.translator.translate(message);

      if (event) {
        // we were able to translate the message into an event
        if (event.matches(expr)) {
          // the event matches the listen expression
          if (this.validator === null) {
            // not using a validator
            handler(event);
          } else {
            this.validator.validates(event).then(() => {
              // event passed validation
              handler(event);
            });
          }
        }
      }
    });
  }

  _getValuesFromAttributeInjectors() {
    let values = {};

    for (let attributeInjector of this.attributeInjectors) {
      let v = attributeInjector();
      values[v.key] = v.value;
    }

    return values;
  }

  dispatch(channel, event) {
    // automagically inject attributes from injectors
    let attributes = this._getValuesFromAttributeInjectors();

    // we don't want to manipulate the original event
    let e = Object.assign(Object.create(event), event);
    for (let k in attributes) {
      if (attributes.hasOwnProperty(k)) {
        // only set injected attribute if event doesn't already have attribute
        if (!e.hasAttribute(k)) {
          let v = attributes[k];
          e.setAttribute(k, v);
        }
      }
    }

    this.adapter.publish(channel, e.toMessage());
  }
}

module.exports = EventManager;

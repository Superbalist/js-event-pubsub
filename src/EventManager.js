'use strict';

/**
 * @callback listenerCallback
 * @param {EventInterface} event
 */

/**
 * @callback translateFailCallback
 * @param {string} message
 */

/**
 * @callback listenExprFailCallback
 * @param {EventInterface} event
 * @param {string} expr
 */

/**
 * @callback validationFailCallback
 * @param {EventInterface} event
 * @param {EventValidatorInterface} validator
 */

/**
 * EventManager Class
 *
 * @example
 * let LocalPubSubAdapter = require('@superbalist/js-pubsub').LocalPubSubAdapter;
 * let eventPubSub = require('@superbalist/js-event-pubsub');
 * let EventManager = eventPubSub.EventManager;
 * let SimpleEventMessageTranslator = eventPubSub.translators.SimpleEventMessageTranslator;
 *
 * // create a new event manager
 * let adapter = new LocalPubSubAdapter();
 * let translator = new SimpleEventMessageTranslator();
 * let manager = new EventManager(adapter, translator);
 */
class EventManager {
  /**
   * Construct an EventManager
   *
   * @param {module:@superbalist/js-pubsub.PubSubAdapterInterface} adapter
   * @param {MessageTranslatorInterface} translator
   * @param {?EventValidatorInterface} [validator=null]
   * @param {attributeInjectorCallback[]} [attributeInjectors=[]]
   * @param {?translateFailCallback} [translateFailHandler=null]
   * @param {?listenExprFailCallback} [listenExprFailHandler=null]
   * @param {?validationFailCallback} [validationFailHandler=null]
   */
  constructor(
    adapter,
    translator,
    validator = null,
    attributeInjectors = [],
    translateFailHandler = null,
    listenExprFailHandler = null,
    validationFailHandler = null
  ) {
    /**
     * @type {module:@superbalist/js-pubsub.PubSubAdapterInterface}
     */
    this.adapter = adapter;

    /**
     * @type {MessageTranslatorInterface}
     */
    this.translator = translator;

    /**
     * @type {EventValidatorInterface}
     */
    this.validator = validator;

    /**
     * @type {attributeInjectorCallback[]}
     */
    this.attributeInjectors = attributeInjectors;

    /**
     * @type {translateFailCallback}
     */
    this.translateFailHandler = translateFailHandler;

    /**
     * @type {listenExprFailCallback}
     */
    this.listenExprFailHandler = listenExprFailHandler;

    /**
     * @type {validationFailCallback}
     */
    this.validationFailHandler = validationFailHandler;
  }

  /**
   * Add an attribute injector.
   *
   * @param {attributeInjectorCallback} attributeInjector
   * @example
   * manager.addAttributeInjector(() => {
   *   return {
   *     'key': 'service',
   *     'type': 'search',
   *   };
   * });
   */
  addAttributeInjector(attributeInjector) {
    this.attributeInjectors.push(attributeInjector);
  }

  /**
   * Listen for an event.
   *
   * @param {string} channel
   * @param {string} expr - The listen expression
   * @param {listenerCallback} handler
   * @example
   * // listen for an event on a topic
   * manager.listen('events', 'user/created', (event) => {
   *   console.log(event);
   * });
   *
   * // listen for an event on a topic matching the given version
   * manager.listen('events', 'user/created/1.0', (event) => {
   *   console.log(event);
   * });
   *
   * // listen for all events on a topic
   * manager.listen('events', 'user/*', (event) => {
   *   console.log(event);
   * });
   *
   * // listen for all events on the channel
   * manager.listen('events', '*', (event) => {
   *   console.log(event);
   * });
   */
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
            this.validator.validates(event).then((success) => {
              if (success) {
                // event passed validation
                handler(event);
              } else {
                // pass to validation fail handler?
                if (this.validationFailHandler) {
                  this.validationFailHandler(event, this.validator);
                }
              }
            });
          }
        } else {
          // pass to listen expr fail handler?
          if (this.listenExprFailHandler) {
            this.listenExprFailHandler(event, expr);
          }
        }
      } else {
        // pass to translate fail handler?
        if (this.translateFailHandler) {
          this.translateFailHandler(message);
        }
      }
    });
  }

  /**
   * Return all values from the attribute injectors.
   *
   * @return {Object.<string, *>}
   * @private
   */
  _getValuesFromAttributeInjectors() {
    let values = {};

    for (let attributeInjector of this.attributeInjectors) {
      let v = attributeInjector();
      values[v.key] = v.value;
    }

    return values;
  }

  /**
   * @param {EventInterface} event
   * @return {EventInterface}
   * @private
   */
  _prepEventForDispatch(event) {
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
    return e;
  }

  /**
   * Dispatch an event.
   *
   * @param {string} channel
   * @param {EventInterface} event
   * @example
   * let event = new SimpleEvent('user.created', {
   *   user: {
   *     id: 1456,
   *     first_name: 'Joe',
   *     last_name: 'Soap',
   *     email: 'joe.soap@example.org'
   *   }
   * });
   *
   * manager->dispatch('events', event);
   */
  dispatch(channel, event) {
    event = this._prepEventForDispatch(event);
    this.adapter.publish(channel, event.toMessage());
  }

  /**
   * Dispatch multiple events.
   *
   * @param {string} channel
   * @param {EventInterface[]} events
   * @example
   * let events = [
   *   new SimpleEvent('user.created', {
   *     user: {
   *       id: 1456,
   *       first_name: 'Joe',
   *       last_name: 'Soap',
   *       email: 'joe.soap@example.org'
   *     }
   *   }),
   *   new SimpleEvent('user.created', {
   *     user: {
   *       id: 6812,
   *       first_name: 'Joe',
   *       last_name: 'Soap',
   *       email: 'joe.soap@example.org'
   *     }
   *   }),
   * ];
   *
   * manager->dispatchBatch('events', events);
   */
  dispatchBatch(channel, events) {
    let messages = events.map((event) => {
      event = this._prepEventForDispatch(event);
      return event.toMessage();
    });
    this.adapter.publishBatch(channel, messages);
  }
}

module.exports = EventManager;

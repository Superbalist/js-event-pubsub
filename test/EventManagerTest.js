'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let pubsub = require('@superbalist/js-pubsub');
let PubSubAdapterInterface = pubsub.PubSubAdapterInterface;
let MessageTranslatorInterface = require('../lib/MessageTranslatorInterface');
let EventValidatorInterface = require('../lib/EventValidatorInterface');
let EventManager = require('../lib/EventManager');
let EventInterface = require('../lib/EventInterface');
let SimpleEvent = require('../lib/events/SimpleEvent');

describe('EventManager', () => {
  describe('construct instance', () => {
    it('should set the adapter property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.adapter).to.equal(adapter);
    });

    it('should set the translator property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.translator).to.equal(translator);
    });

    it('should set the validator property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let manager = new EventManager(adapter, translator, validator);
      expect(manager.validator).to.equal(validator);
    });

    it('should set the validator property to a default value of null if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.validator).to.be.null;
    });

    it('should set the attributeInjectors property', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let attributeInjectors = [
        () => ({key: 'service', value: 'search'}),
      ];
      let manager = new EventManager(
        adapter,
        translator,
        null,
        attributeInjectors
      );
      expect(manager.attributeInjectors).to.equal(attributeInjectors);
    });

    it('should set the attributeInjectors property to a default value of an empty array if not given', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);
      expect(manager.attributeInjectors).to.be.empty;
    });
  });

  describe('addAttributeInjector', () => {
    it('should append the attributeInjector to the attributeInjectors array', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      expect(manager.attributeInjectors).to.be.empty;

      let attributeInjector = () => ({key: 'service', value: 'search'});

      manager.addAttributeInjector(attributeInjector);

      expect(manager.attributeInjectors).to.have.lengthOf(1);
      expect(manager.attributeInjectors[0]).to.equal(attributeInjector);
    });
  });

  describe('listen', () => {
    it('should subscribe to the channel on the adapter', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      sinon.assert.calledOnce(adapter.subscribe);
      sinon.assert.calledWith(adapter.subscribe, 'my_channel');
    });

    it('when a message is received, the message should be translated to an event', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(translator.translate);
      sinon.assert.calledWith(translator.translate, {'event': 'user.created'});
    });

    it('when a message is received, the event should be matched against the listen expression', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(event.matches);
      sinon.assert.calledWith(event.matches, '*');
    });

    it('when a message is received, the event should be validated', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let validator = sinon.createStubInstance(EventValidatorInterface);
      validator.validates = sinon.stub()
        .returns(new Promise((resolve, reject) => {}));

      let manager = new EventManager(adapter, translator, validator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(validator.validates);
      sinon.assert.calledWith(validator.validates, event);
    });

    it('when a message is received & the translator fails, the handler should not be called', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(null);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.notCalled(handler);
    });

    it('when a message is received & the listen expression does not match, the event should not be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(false);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', 'order.created', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.notCalled(handler);
    });

    it('when a message is received & no validator is set, the event should be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let manager = new EventManager(adapter, translator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      sinon.assert.calledOnce(handler);
      sinon.assert.calledWith(handler, event);
    });

    it('when a message is received & validation succeeds, the event should be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let validationPromise = new Promise((resolve, reject) => {
        resolve(true);
      });

      let validator = sinon.createStubInstance(EventValidatorInterface);
      validator.validates = sinon.stub()
        .returns(validationPromise);

      let manager = new EventManager(adapter, translator, validator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      return validationPromise.then(() => {
        sinon.assert.calledOnce(handler);
        sinon.assert.calledWith(handler, event);
      });
    });

    it('when a message is received & validation fails, the event should not be passed to the handler', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.subscribe = sinon.stub();

      let event = sinon.createStubInstance(EventInterface);
      event.matches = sinon.stub()
        .returns(true);

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      translator.translate = sinon.stub()
        .returns(event);

      let validationPromise = new Promise((resolve, reject) => {
        resolve(false);
      });

      let validator = sinon.createStubInstance(EventValidatorInterface);
      validator.validates = sinon.stub()
        .returns(validationPromise);

      let manager = new EventManager(adapter, translator, validator);

      let handler = sinon.spy();

      manager.listen('my_channel', '*', handler);

      adapter.subscribe.yield({'event': 'user.created'});

      return validationPromise.then(() => {
        sinon.assert.notCalled(handler);
      });
    });
  });

  describe('dispatch', () => {
    it('should convert the event to a message and publish to the channel', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let event = sinon.createStubInstance(EventInterface);
      event.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      manager.dispatch('my_channel', event);

      sinon.assert.calledOnce(event.toMessage);

      sinon.assert.calledOnce(adapter.publish);
      sinon.assert.calledWith(adapter.publish, 'my_channel', {'event': 'user.created'});
    });

    it('should automagically inject values from attribute injectors into the message payload', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event = new SimpleEvent('user.created');

      manager.dispatch('my_channel', event);

      sinon.assert.calledOnce(adapter.publish);
      sinon.assert.calledWith(
        adapter.publish,
        'my_channel',
        {
          'event': 'user.created',
          'service': 'search',
          'hello': 'world',
        }
      );
    });

    it('should automagically inject values from attribute injectors into the message payload but not override conflicting attributes', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publish = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event = new SimpleEvent('user.created', {'service': 'www'});

      manager.dispatch('my_channel', event);

      sinon.assert.calledOnce(adapter.publish);
      sinon.assert.calledWith(
        adapter.publish,
        'my_channel',
        {
          'event': 'user.created',
          'service': 'www',
          'hello': 'world',
        }
      );
    });
  });

  describe('dispatchBatch', () => {
      it('should convert the events to an array of message and publish to the channel', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publishBatch = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      let event1 = sinon.createStubInstance(EventInterface);
      event1.toMessage = sinon.stub()
        .returns({'event': 'user.created'});

      let event2 = sinon.createStubInstance(EventInterface);
      event2.toMessage = sinon.stub()
        .returns({'event': 'order.created'});

      let events = [event1, event2];

      manager.dispatchBatch('my_channel', events);

      sinon.assert.calledOnce(event1.toMessage);
      sinon.assert.calledOnce(event2.toMessage);

      sinon.assert.calledOnce(adapter.publishBatch);
      sinon.assert.calledWith(
        adapter.publishBatch,
        'my_channel',
        [
          {'event': 'user.created'},
          {'event': 'order.created'},
        ]
      );
    });

    it('should automagically inject values from attribute injectors into the message payload', () => {
      let adapter = sinon.createStubInstance(PubSubAdapterInterface);
      adapter.publishBatch = sinon.stub();

      let translator = sinon.createStubInstance(MessageTranslatorInterface);
      let manager = new EventManager(adapter, translator);

      manager.addAttributeInjector(() => ({key: 'service', value: 'search'}));
      manager.addAttributeInjector(() => ({key: 'hello', value: 'world'}));

      let event1 = new SimpleEvent('user.created');
      let event2 = new SimpleEvent('order.created');

      let events = [event1, event2];

      manager.dispatchBatch('my_channel', events);

      sinon.assert.calledOnce(adapter.publishBatch);
      sinon.assert.calledWith(
        adapter.publishBatch,
        'my_channel',
        [
          {
            'event': 'user.created',
            'service': 'search',
            'hello': 'world',
          },
          {
            'event': 'order.created',
            'service': 'search',
            'hello': 'world',
          },
        ]
      );
    });
  });
});

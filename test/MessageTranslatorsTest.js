'use strict';

let chai = require('chai');
let expect = chai.expect;
let SimpleEventMessageTranslator = require('../lib/translators/SimpleEventMessageTranslator');
let TopicEventMessageTranslator = require('../lib/translators/TopicEventMessageTranslator');
let SchemaEventMessageTranslator = require('../lib/translators/SchemaEventMessageTranslator');
let SimpleEvent = require('../lib/events/SimpleEvent');
let TopicEvent = require('../lib/events/TopicEvent');
let SchemaEvent = require('../lib/events/SchemaEvent');

describe('Message Translators', () => {
  describe('SimpleEventMessageTranslator', () => {
    describe('translate', () => {
      it('should return null if the message is null', () => {
        let translator = new SimpleEventMessageTranslator();
        expect(translator.translate(null)).to.be.null;
      });

      it('should return null if the message is not an object', () => {
        let translator = new SimpleEventMessageTranslator();
        expect(translator.translate([])).to.be.null;
      });

      it('should return null if the message does not carry an "event"', () => {
        let translator = new SimpleEventMessageTranslator();
        expect(translator.translate({'hello': 'world'})).to.be.null;
      });

      it('should translate to a SimpleEvent', () => {
        let translator = new SimpleEventMessageTranslator();
        let event = translator.translate({'event': 'user.created'});
        expect(event).to.be.an.instanceof(SimpleEvent);
        expect(event.getName()).to.equal('user.created');
        expect(event.getAttributes()).to.be.empty;
      });

      it('should exclude the "event" as an attribute when translating and not manipulate the original message', () => {
        let translator = new SimpleEventMessageTranslator();
        let message = {
          'event': 'user.created',
          'first_name': 'Matthew',
        };
        let event = translator.translate(message);
        expect(event).to.be.an.instanceof(SimpleEvent);
        expect(event.getName()).to.equal('user.created');
        expect(event.getAttributes()).to.deep.equal({'first_name': 'Matthew'});
        expect(message).to.deep.equal({'event': 'user.created', 'first_name': 'Matthew'});
      });
    });
  });

  describe('TopicEventMessageTranslator', () => {
    describe('translate', () => {
      it('should return null if the message is null', () => {
        let translator = new TopicEventMessageTranslator();
        expect(translator.translate(null)).to.be.null;
      });

      it('should return null if the message is not an object', () => {
        let translator = new TopicEventMessageTranslator();
        expect(translator.translate([])).to.be.null;
      });

      it('should return null if the message does not carry a "topic", "event" or "version"', () => {
        let translator = new TopicEventMessageTranslator();
        expect(translator.translate({'hello': 'world'})).to.be.null;
        expect(translator.translate({'topic': 'user'})).to.be.null;
        expect(translator.translate({'topic': 'user', 'event': 'created'})).to.be.null;
      });

      it('should translate to a TopicEvent', () => {
        let translator = new TopicEventMessageTranslator();
        let event = translator.translate({
          'topic': 'user',
          'event': 'created',
          'version': '1.0',
        });
        expect(event).to.be.an.instanceof(TopicEvent);
        expect(event.topic).to.equal('user');
        expect(event.getName()).to.equal('created');
        expect(event.version).to.equal('1.0');
        expect(event.getAttributes()).to.be.empty;
      });

      it('should exclude the "topic", "event" & "version" properties as attributes when translating and not manipulate the original message', () => {
        let translator = new TopicEventMessageTranslator();
        let message = {
          'topic': 'user',
          'event': 'created',
          'version': '1.0',
          'first_name': 'Matthew',
        };
        let event = translator.translate(message);
        expect(event).to.be.an.instanceof(TopicEvent);
        expect(event.topic).to.equal('user');
        expect(event.getName()).to.equal('created');
        expect(event.version).to.equal('1.0');
        expect(event.getAttributes()).to.deep.equal({'first_name': 'Matthew'});
        expect(message).to.deep.equal({
          'topic': 'user',
          'event': 'created',
          'version': '1.0',
          'first_name': 'Matthew',
        });
      });
    });
  });

  describe('SchemaEventMessageTranslator', () => {
    describe('translate', () => {
      it('should return null if the message is null', () => {
        let translator = new SchemaEventMessageTranslator();
        expect(translator.translate(null)).to.be.null;
      });

      it('should return null if the message is not an object', () => {
        let translator = new SchemaEventMessageTranslator();
        expect(translator.translate([])).to.be.null;
      });

      it('should return null if the message does not carry a "schema"', () => {
        let translator = new SchemaEventMessageTranslator();
        expect(translator.translate({'hello': 'world'})).to.be.null;
      });

      it('should translate to a SchemaEvent', () => {
        let translator = new SchemaEventMessageTranslator();
        let event = translator.translate({'schema': 'http://schemas.my-website.org/events/user/created/1.0.json'});
        expect(event).to.be.an.instanceof(SchemaEvent);
        expect(event.topic).to.equal('user');
        expect(event.getName()).to.equal('created');
        expect(event.version).to.equal('1.0');
        expect(event.getAttributes()).to.be.empty;
      });

      it('should exclude the "schema" as an attribute when translating and not manipulate the original message', () => {
        let translator = new SchemaEventMessageTranslator();
        let message = {
          'schema': 'http://schemas.my-website.org/events/user/created/1.0.json',
          'first_name': 'Matthew',
        };
        let event = translator.translate(message);
        expect(event).to.be.an.instanceof(SchemaEvent);
        expect(event.topic).to.equal('user');
        expect(event.getName()).to.equal('created');
        expect(event.version).to.equal('1.0');
        expect(event.getAttributes()).to.deep.equal({'first_name': 'Matthew'});
        expect(message).to.deep.equal({
          'schema': 'http://schemas.my-website.org/events/user/created/1.0.json',
          'first_name': 'Matthew',
        });
      });
    });

    describe('parseSchemaStr', () => {
      it('should return an object with topic, event and version properties', () => {
        expect(SchemaEventMessageTranslator.parseSchemaStr('http://schemas.my-website.org/events/user/created/1.0.json'))
          .to.deep.equal({'topic': 'user', 'event': 'created', 'version': '1.0'});
        expect(SchemaEventMessageTranslator.parseSchemaStr('http://events/user/created/1.0.json'))
          .to.deep.equal({'topic': 'user', 'event': 'created', 'version': '1.0'});
      });

      it('should return null if the schema uri cannot be parsed', () => {
        expect(SchemaEventMessageTranslator.parseSchemaStr('bleh')).to.be.null;
      });
    });
  });
});

'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let EventValidatorInterface = require('../lib/EventValidatorInterface');
let EventInterface = require('../lib/EventInterface');
let ValidationResult = require('../lib/ValidationResult');

describe('ValidationResult', () => {
  describe('construct instance', () => {
    it('should set the validator property', () => {
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let event = sinon.createStubInstance(EventInterface);
      let result = new ValidationResult(validator, event, true, []);
      expect(result.validator).to.equal(validator);
    });

    it('should set the event property', () => {
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let event = sinon.createStubInstance(EventInterface);
      let result = new ValidationResult(validator, event, true, []);
      expect(result.event).to.equal(event);
    });

    it('should set the passes property', () => {
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let event = sinon.createStubInstance(EventInterface);
      let result = new ValidationResult(validator, event, true, []);
      expect(result.passes).to.be.true;
    });

    it('should set the fails property', () => {
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let event = sinon.createStubInstance(EventInterface);
      let result = new ValidationResult(validator, event, true, []);
      expect(result.fails).to.be.false;
    });

    it('should set the errors property', () => {
      let validator = sinon.createStubInstance(EventValidatorInterface);
      let event = sinon.createStubInstance(EventInterface);
      let result = new ValidationResult(validator, event, true, ['should have required property \'user\'']);
      expect(result.errors).to.deep.equal(['should have required property \'user\'']);
    });
  });
});

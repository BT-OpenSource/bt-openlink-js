/*
 * BT Openlink JavaScript API test suite
 * https://www.bt.com/unifiedtrading
 * Copyright (c) 2017 BT
 */
(function ($) {
    /*
     ======== A Handy Little QUnit Reference ========
     http://api.qunitjs.com/

     Test methods:
     module(name, {[setup][ ,teardown]})
     test(name, callback)
     expect(numberOfAssertions)
     stop(increment)
     start(decrement)
     Test assertions:
     ok(value, [message])
     equal(actual, expected, [message])
     notEqual(actual, expected, [message])
     propEqual(actual, expected, [message])
     notpropEqual(actual, expected, [message])
     strictEqual(actual, expected, [message])
     notStrictEqual(actual, expected, [message])
     throws(block, [expected], [message])
     */

    QUnit.testStart(function () {
        var domain = "test-domain";
        $.openlink.getUserJid = function () {
            return "test-user@" + domain;
        };
        $.openlink.getOpenlinkJid = function () {
            return "openlink." + domain;
        };
        $.openlink.getPubsubJid = function () {
            return "pubsub." + domain;
        };
    });

    module('iq.MakeCall');
    test('MakeCallRequest will generate unique a stanza id', function () {
        var makeCallRequest1 = new $.openlink.MakeCallRequest("test-interest-id", "test-call-id", "test-action");
        var makeCallRequest2 = new $.openlink.MakeCallRequest("test-interest-id", "test-call-id", "test-action");
        notEqual(makeCallRequest1.getId(), makeCallRequest2.getId());
    });

    test('MakeCallRequest will build a stanza', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest("test-interest-id");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza on an interest', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .onInterest("test-interest-id");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><interest>test-interest-id</interest></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza for another user', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .forUser('another-user@test-domain');
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>another-user@test-domain</jid></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with a destination', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .toDestination('dialable-number');
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><destination>dialable-number</destination></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with features', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withFeature("test-feature-1")
            .withFeature("test-feature-2", "test-value-1")
            .withFeature("test-feature-3", "test-value-1", "test-value-2");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><features><feature><id>test-feature-1</id></feature><feature><id>test-feature-2</id><value1>test-value-1</value1></feature><feature><id>test-feature-3</id><value1>test-value-1</value1><value2>test-value-2</value2></feature></features></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with a VoiceMessage feature', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withVoiceMessageFeature("test-feature-1")
            .withFeature("test-feature-2", "test-value-1");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><features><feature type=\"VoiceMessage\"><id>test-feature-1</id></feature><feature><id>test-feature-2</id><value1>test-value-1</value1></feature></features></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop"></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference key/value pair', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop", "test-orig-value");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop"><value>test-orig-value</value></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with two originator reference key/value pairs', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop-1", "test-orig-value-1")
            .withOriginatorReference("test-orig-prop-2", "test-orig-value-2");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop-1"><value>test-orig-value-1</value></property><property id="test-orig-prop-2"><value>test-orig-value-2</value></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference XML element', function () {
        var originatorReferenceXml = '<ref-1><someXml/><moretags>\"\'@&lt;&gt;\'\"</moretags></ref-1>';
        var originatorReferenceElement = $.parseXML(originatorReferenceXml).documentElement;
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference(originatorReferenceElement);
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref>' + originatorReferenceXml + '</originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });
    
}(jQuery));
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

    module('iq.RequestAction');
    test('RequestActionRequest will generate unique a stanza id', function () {
        var requestAction1 = new $.openlink.RequestActionRequest("test-interest-id", "HoldCall", "test-call-id");
        var requestAction2 = new $.openlink.RequestActionRequest("test-interest-id", "HoldCall", "test-call-id");
        notEqual(requestAction1.getId(), requestAction2.getId());
    });

    test('RequestActionRequest will build a stanza', function () {
        var requestAction = new $.openlink.RequestActionRequest("test-interest-id", "HoldCall", "test-call-id");
        var expected = '<iq type="set" id="' + requestAction.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#request-action" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><interest>test-interest-id</interest><action>HoldCall</action><call>test-call-id</call></in></iodata></command></iq>';
        equal(requestAction.toXml(), expected);
    });

    test('RequestActionRequest will build a stanza with value1 and value2', function () {
        var requestAction = new $.openlink.RequestActionRequest("test-interest-id", "JoinCall", "test-call-id")
            .withValue1("test-value-1")
            .withValue2("test-value-2");
        var expected = '<iq type="set" id="' + requestAction.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#request-action" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><interest>test-interest-id</interest><action>JoinCall</action><call>test-call-id</call><value1>test-value-1</value1><value2>test-value-2</value2></in></iodata></command></iq>';
        equal(requestAction.toXml(), expected);
    });

    test('RequestActionRequest will not build a stanza for an unrecognised action', function () {
        throws(function () {
            new $.openlink.RequestActionRequest("test-interest-id", "not-an-action", "test-call-id");
        }, /not a supported action/);
    });

    test('RequestActionRequest will build a supervised StartVoiceDrop request', function () {
        var requestAction = new $.openlink.RequestActionRequest("test-interest-id", "StartVoiceDrop", "test-call-id")
            .withValue1("MK1029")
            .setSupervised(true);
        var expected = '<iq type="set" id="' + requestAction.getId() + '" to="' + $.openlink.getOpenlinkJid() + '">' +
            '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#request-action" action="execute">' +
            '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
            '<in>' +
            '<interest>test-interest-id</interest>' +
            '<action>StartVoiceDrop</action>' +
            '<call>test-call-id</call>' +
            '<value1>MK1029</value1>' +
            '<features>' +
            '<feature>' +
            '<id>Conference</id>' +
            '<value1>true</value1>' +
            '</feature>' +
            '</features>' +
            '</in>' +
            '</iodata>' +
            '</command>' +
            '</iq>';
        equal(requestAction.toXml(), expected);
    });

    test('RequestActionRequest will not build a supervised StopVoiceDrop request', function () {
        var requestAction = new $.openlink.RequestActionRequest("test-interest-id", "StopVoiceDrop", "test-call-id")
            .withValue1("MK1029")
            .setSupervised(true);
        throws(function () {
            requestAction.toXml();
        }, /A supervised voice drop can only be performed with the 'StartVoiceDrop' request/);
    });

}(jQuery));
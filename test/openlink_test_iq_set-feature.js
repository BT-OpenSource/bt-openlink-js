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

    module('iq.SetFeature');
    test('SetFeatureRequest will generate unique a stanza id', function () {
        var setFeatureRequest1 = new $.openlink.SetFeatureRequest("test-profile-id", "test-feature-id");
        var setFeatureRequest2 = new $.openlink.SetFeatureRequest("test-profile-id", "test-feature-id");
        notEqual(setFeatureRequest1.getId(), setFeatureRequest2.getId());
    });

    test('SetFeatureRequest will build a stanza', function () {
        var setFeatureRequest = new $.openlink.SetFeatureRequest("test-profile-id", "test-feature-id");
        var expected = '<iq type="set" id="' + setFeatureRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#set-features" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><feature>test-feature-id</feature></in></iodata></command></iq>';
        equal(setFeatureRequest.toXml(), expected);
    });

    test('SetFeatureRequest will build a stanza with values', function () {
        var setFeatureRequest = new $.openlink.SetFeatureRequest("test-profile-id", "test-feature-id")
            .withValue1('test-value-1')
            .withValue2('test-value-2')
            .withValue3('test-value-3');
        var expected = '<iq type="set" id="' + setFeatureRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#set-features" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><feature>test-feature-id</feature><value1>test-value-1</value1><value2>test-value-2</value2><value3>test-value-3</value3></in></iodata></command></iq>';
        equal(setFeatureRequest.toXml(), expected);
    });

}(jQuery));
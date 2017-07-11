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

    module('iq.MakeIntercomCall');
    test('MakeIntercomCall will generate unique a stanza id', function () {
        var makeIntercomCall1 = new $.openlink.MakeIntercomCallRequest("test-profile-id").toUser("a-test-user");
        var makeIntercomCall2 = new $.openlink.MakeIntercomCallRequest("test-profile-id").toUser("a-test-user");
        notEqual(makeIntercomCall1.getId(), makeIntercomCall2.getId());
    });

    test('MakeIntercomCall will build a stanza to a user', function () {
        var makeIntercomCall = new $.openlink.MakeIntercomCallRequest("test-profile-id")
            .toUser("a-test-user");
        var expected = '<iq type="set" id="' + makeIntercomCall.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-intercom-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><destination>a-test-user</destination></in></iodata></command></iq>';
        equal(makeIntercomCall.toXml(), expected);
    });

    test('MakeIntercomCall will build a stanza to a group', function () {
        var makeIntercomCall = new $.openlink.MakeIntercomCallRequest("test-profile-id")
            .toGroup("a-test-group");
        var expected = '<iq type="set" id="' + makeIntercomCall.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-intercom-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><features><feature><id>a-test-group</id></feature></features></in></iodata></command></iq>';
        equal(makeIntercomCall.toXml(), expected);
    });

    test('MakeIntercomCall will not build a stanza without a user or group', function () {
        var makeIntercomCall = new $.openlink.MakeIntercomCallRequest("test-profile-id");
        throws(function () {
            makeIntercomCall.toXml();
        });
    });

    test('MakeIntercomCall will build a stanza to a group with features', function () {
        var makeIntercomCall = new $.openlink.MakeIntercomCallRequest("test-profile-id")
            .toGroup("a-test-group")
            .withFeature('test-feature-1', 'value-1', 'value-2');
        var expected = '<iq type="set" id="' + makeIntercomCall.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-intercom-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><features><feature><id>a-test-group</id></feature><feature><id>test-feature-1</id><value1>value-1</value1><value2>value-2</value2></feature></features></in></iodata></command></iq>';
        equal(makeIntercomCall.toXml(), expected);
    });

}(jQuery));
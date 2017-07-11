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

    module('iq.GetProfile');

    test('GetProfileRequest will generate unique a stanza id', function () {
        var getProfile1 = new $.openlink.GetProfileRequest("test-profile-id");
        var getProfile2 = new $.openlink.GetProfileRequest("test-profile-id");
        notEqual(getProfile1.getId(), getProfile2.getId());
    });

    test('GetProfileRequest will build a stanza', function () {
        var getProfile = new $.openlink.GetProfileRequest("test-profile-id");
        var expected = '<iq type="set" id="' + getProfile.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-profile" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile></in></iodata></command></iq>';
        equal(getProfile.toXml(), expected);
    });


}(jQuery));
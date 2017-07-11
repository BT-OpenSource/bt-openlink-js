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

    module('iq.GetInterest');

    test('GetInterestRequest will generate unique a stanza id', function () {
        var getInterest1 = new $.openlink.GetInterestRequest("test-interest-id");
        var getInterest2 = new $.openlink.GetInterestRequest("test-interest-id");
        notEqual(getInterest1.getId(), getInterest2.getId());
    });

    test('GetInterestRequest will build a stanza', function () {
        var getInterest = new $.openlink.GetInterestRequest("test-interest-id");
        var expected = '<iq type="set" id="' + getInterest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-interest" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><interest>test-interest-id</interest></in></iodata></command></iq>';
        equal(getInterest.toXml(), expected);
    });

}(jQuery));
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

    module('iq.pubsub');

    test('SubscribeRequest will generate unique a stanza id', function () {
        var subscribe1 = new $.openlink.SubscribeRequest("test-interest-id");
        var subscribe2 = new $.openlink.SubscribeRequest("test-interest-id");
        notEqual(subscribe1.getId(), subscribe2.getId());
    });

    test('SubscribeRequest will build a stanza', function () {
        var subscribe = new $.openlink.SubscribeRequest("test-interest-id");
        var expected = '<iq type="set" id="' + subscribe.getId() + '" to="' + $.openlink.getPubsubJid() + '"><pubsub xmlns="http://jabber.org/protocol/pubsub"><subscribe node="test-interest-id" jid="' + $.openlink.getUserJid() + '"/></pubsub></iq>';
        equal(subscribe.toXml(), expected);
    });

    test('UnsubscribeRequest will generate unique a stanza id', function () {
        var unsubscribe1 = new $.openlink.UnsubscribeRequest("test-interest-id");
        var unsubscribe2 = new $.openlink.UnsubscribeRequest("test-interest-id");
        notEqual(unsubscribe1.getId(), unsubscribe2.getId());
    });

    test('UnsubscribeRequest will build a stanza', function () {
        var unsubscribeRequest = new $.openlink.UnsubscribeRequest("test-interest-id");
        var expected = '<iq type="set" id="' + unsubscribeRequest.getId() + '" to="' + $.openlink.getPubsubJid() + '"><pubsub xmlns="http://jabber.org/protocol/pubsub"><unsubscribe node="test-interest-id" jid="' + $.openlink.getUserJid() + '"/></pubsub></iq>';
        equal(unsubscribeRequest.toXml(), expected);
    });
    
}(jQuery));
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

    module('iq.ping');
    test('Will parse an IQ ping stanza', function () {
        var stanzaXml = "<iq xmlns=\"jabber:client\" from=\"btp194094\" id=\"771-888\" to=\"trader1@btp194094/TestHarness\" type=\"get\"><ping xmlns=\"urn:xmpp:ping\"/></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'trader1@btp194094/TestHarness');
        equal(stanza.getFrom(), 'btp194094');
        equal(stanza.getId(), '771-888');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'get');
        equal(stanza.isError(), false);
        equal(stanza.constructor.name, 'IqPingRequest');
        equal(stanza.toXml(), stanzaXml);
    });

}(jQuery));
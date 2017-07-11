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

    module('presence parsing');
    test('Will parse a presence stanza without an id or type', function () {
        var stanzaXml = '<presence></presence>';
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), undefined);
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), undefined);
        equal(stanza.getType(), undefined);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'presence');
        equal(stanza.getChildElement(), undefined);
    });
    
    test('Will parse a generic presence stanza', function () {
        var stanzaXml = "<presence to='trader1@btp072883/TestHarness' from='trader2@btp072883/TestHarness' id='P5LKG-165'><subtag></subtag></presence>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'trader2@btp072883/TestHarness');
        equal(stanza.getId(), 'P5LKG-165');
        equal(stanza.getType(), undefined);
        equal(stanza.getStanzaType(), 'presence');
        equal(stanza.getChildElement().nodeName, 'subtag');
    });

    test('SetPriority will build a stanza', function () {
        var setPriorityRequest = new $.openlink.SetPriorityRequest(1);
        var expected = '<presence id="' + setPriorityRequest.getId() + '"><priority>1</priority></presence>';
        equal(setPriorityRequest.toXml(), expected);
    });

}(jQuery));
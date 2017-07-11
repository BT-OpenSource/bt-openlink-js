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

    module('iq.bind');
    test('Will parse an IQ bind stanza', function () {
        var stanzaXml = "<iq to='btp072883/28n6qhtai5' id='VEb33-65' type='result'><bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><jid>trader1@btp072883/TestHarness</jid></bind></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'btp072883/28n6qhtai5');
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), 'VEb33-65');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'result');
        equal(stanza.isError(), false);
        equal(stanza.constructor.name, 'IqBindResult');
        equal(stanza.getBoundJid(), 'trader1@btp072883/TestHarness');
        equal(stanza.toXml(), stanzaXml);
    });


}(jQuery));
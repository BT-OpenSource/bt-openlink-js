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

    module('iq parsing');
    test('Will parse an iq stanza without an id or type', function () {
        var stanzaXml = '<iq></iq>';
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), undefined);
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), undefined);
        equal(stanza.getType(), undefined);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getChildElement(), undefined);
    });
    test('Will parse a generic iq stanza', function () {
        var stanzaXml = "<iq to='adastralone@btp072883/TestHarness' from='openlink.btp072883' id='dXUrQM-1' type='result'></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'adastralone@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'dXUrQM-1');
        equal(stanza.getType(), 'result');
        equal(stanza.isResult(), true);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getChildElement(), undefined);
    });
    test('Will parse an iq stanza with an unknown child element', function () {
        var stanzaXml = "<iq to='adastralone@btp072883/TestHarness' from='openlink.btp072883' id='dXUrQM-1' type='meh'><outer-tag><inner-tag/></outer-tag></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'adastralone@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'dXUrQM-1');
        equal(stanza.getType(), 'meh');
        equal(stanza.isResult(), false);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getChildElement().nodeName, 'outer-tag');
    });

    test('Will parse an iq stanza with notes', function () {
        var stanzaXml = "<iq to='adastralone@btp072883/TestHarness' from='openlink.btp072883' id='iTGIz1-4' type='doh'><outer-tag><note>Voice Drop Server Not Reachable:vmstsp.itrader-dev-sm-2.btlabs.bt.co.uk</note><inner-tag/></outer-tag></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'adastralone@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'iTGIz1-4');
        equal(stanza.getType(), 'doh');
        equal(stanza.isResult(), false);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getChildElement().nodeName, 'outer-tag');

        var notes = stanza.getNotes();
        equal(notes.length, 1);
        var note1 = notes[0];
        equal(note1.type, undefined);
        equal(note1.from, undefined);
        equal(note1.errorType, undefined);
        equal(note1.errorCondition, undefined);
        equal(note1.text, "Voice Drop Server Not Reachable:vmstsp.itrader-dev-sm-2.btlabs.bt.co.uk");
    });

    
}(jQuery));
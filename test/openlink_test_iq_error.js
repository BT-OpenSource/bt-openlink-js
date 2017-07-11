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

    module('iq.Error');
    test('Will parse an IQ Error stanza', function () {
        var stanzaXml = "<iq to='adastralone@btp072883/TestHarness' from='openlink.btp072883' id='M3i4Sf-2' type='error'><error type='wait'><internal-server-error xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/><text xmlns='urn:ietf:params:xml:ns:xmpp-stanzas' xml:lang='en'>[Openlink - error] Invalid JID: unknown-user@btp072883</text></error></iq>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'adastralone@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'M3i4Sf-2');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'error');
        equal(stanza.isError(), true);
        equal(stanza.getXmppErrorType(), 'wait');
        equal(stanza.getXmppErrorCondition(), 'internal-server-error');
        equal(stanza.getXmppErrorText(), '[Openlink - error] Invalid JID: unknown-user@btp072883');
        equal(stanza.toXml(), stanzaXml);
    });

    test('Will parse an iq error with the original command and text', function () {
        var stanzaXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<iq xmlns=\"jabber:client\" from=\"openlink.btp072883\" id=\"a60FZp-14\" to=\"trader1@btp072883/TestHarness\" type=\"error\">\n" +
            "    <command xmlns=\"http://jabber.org/protocol/commands\" action=\"execute\" node=\"http://xmpp.org/protocol/openlink:01:00:00#get-call-history\">\n" +
            "    <iodata xmlns=\"urn:xmpp:tmp:io-data\" type=\"input\">\n" +
            "    <in>\n" +
            "    <jid>trader1@btp072883</jid>\n" +
            "<fromdate>02/26/2016</fromdate>\n" +
            "<uptodate>02/12/2016</uptodate>\n" +
            "</in>\n" +
            "</iodata>\n" +
            "</command>\n" +
            "<error code=\"400\" type=\"modify\">\n" +
            "    <bad-request xmlns=\"urn:ietf:params:xml:ns:xmpp-stanzas\"/>\n" +
            "    <text xmlns=\"urn:ietf:params:xml:ns:xmpp-stanzas\" xml:lang=\"en\">The uptodate ('02/12/2016') cannot be before the fromdate ('02/26/2016').</text>\n" +
            "</error>\n" +
            "</iq>";

        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'a60FZp-14');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'error');
        equal(stanza.isError(), true);
        equal(stanza.getXmppErrorType(), 'modify');
        equal(stanza.getXmppErrorCondition(), 'bad-request');
        equal(stanza.getXmppErrorText(), 'The uptodate (\'02/12/2016\') cannot be before the fromdate (\'02/26/2016\').');
        equal(stanza.toXml(), stanzaXml);
    });

    test('Will parse an iq error with the original command and text and notes', function () {
        var stanzaXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<iq xmlns=\"jabber:client\" from=\"openlink.btp072883\" id=\"9mpT9W-3\" to=\"adastralseven@btp072883/TestHarness\" type=\"error\">\n" +
            "  <command xmlns=\"http://jabber.org/protocol/commands\" node=\"http://xmpp.org/protocol/openlink:01:00:00#get-profiles\" status=\"completed\">\n" +
            "    <iodata xmlns=\"urn:xmpp:tmp:io-data\"/>\n" +
            "    <note errorCondition=\"service_unavailable\" errorType=\"wait\" from=\"its3.btp072883\" type=\"error\">its3.btp072883: wait: service_unavailable: Load of LDAP data not complete</note>\n" +
            "    <note>adastralseven@btp072883 has no provisioned profiles : cisco3.btp072883</note>\n" +
            "  </command>\n" +
            "  <error code=\"503\" type=\"wait\">\n" +
            "    <service-unavailable xmlns=\"urn:ietf:params:xml:ns:xmpp-stanzas\"/>\n" +
            "    <text xmlns=\"urn:ietf:params:xml:ns:xmpp-stanzas\" xml:lang=\"en\">No profiles are currently available for the user</text>\n" +
            "  </error>\n" +
            "</iq>\n";

        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'adastralseven@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), '9mpT9W-3');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'error');
        equal(stanza.isError(), true);
        equal(stanza.getXmppErrorType(), 'wait');
        equal(stanza.getXmppErrorCondition(), 'service-unavailable');
        equal(stanza.getXmppErrorText(), 'No profiles are currently available for the user');
        var notes = stanza.getNotes();
        equal(notes.length, 2, 'Expected two notes to be found');
        equal(notes[0].type, "error");
        equal(notes[0].from, "its3.btp072883");
        equal(notes[0].errorType, "wait");
        equal(notes[0].errorCondition, "service_unavailable");
        equal(notes[0].text, "its3.btp072883: wait: service_unavailable: Load of LDAP data not complete");
        equal(notes[1].type, undefined);
        equal(notes[1].from, undefined);
        equal(notes[1].errorType, undefined);
        equal(notes[1].errorCondition, undefined);
        equal(notes[1].text, "adastralseven@btp072883 has no provisioned profiles : cisco3.btp072883");
        equal(stanza.toXml(), stanzaXml);
    });

}(jQuery));
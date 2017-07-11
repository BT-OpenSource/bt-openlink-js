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

    module('iq.GetCallHistory');
    test('GetCallHistory will generate unique a stanza id', function () {
        var getCallHistory1 = new $.openlink.GetCallHistoryRequest();
        var getCallHistory2 = new $.openlink.GetCallHistoryRequest();
        notEqual(getCallHistory1.getId(), getCallHistory2.getId());
    });

    test('GetCallHistory will build a stanza', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest();
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });

    test('GetCallHistory will build a stanza for another user', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .forUser("test-user@another-domain");
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@another-domain</jid></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });

    test('GetCallHistory will build a stanza from a specific caller', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .fromCaller("test-caller-id");
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><caller>test-caller-id</caller></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });

    test('GetCallHistory will build a stanza to a specific destination', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .toDestination("test-called-id");
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><called>test-called-id</called></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza for missed calls', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .forMissedCalls();
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><calltype>missed</calltype></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza for outbound calls', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .forOutboundCalls();
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><calltype>out</calltype></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza for inbound calls', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .forInboundCalls();
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><calltype>in</calltype></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza from a certain date', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .fromDate(new Date(2015, 11, 8, 13, 58, 56));
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><fromdate>12/08/2015</fromdate></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza from any old date', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .fromDate('this-is-not-a-date');
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><fromdate>this-is-not-a-date</fromdate></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza to a certain date', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .untilDate(new Date(2015, 11, 8, 13, 58, 56));
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><uptodate>12/08/2015</uptodate></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza to a certain date', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .untilDate('this-is-not-a-date');
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><uptodate>this-is-not-a-date</uptodate></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza from a certain record', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .fromRecordNumber(5);
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><start>5</start></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });
    test('GetCallHistory will build a stanza from a certain page size', function () {
        var getCallHistory = new $.openlink.GetCallHistoryRequest()
            .withNumberOfRecords(50);
        var expected = '<iq type="set" id="' + getCallHistory.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-call-history" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><count>50</count></in></iodata></command></iq>';
        equal(getCallHistory.toXml(), expected);
    });

    var getCallHistoryResult =
        "<iq to='trader1@btp072883/TestHarness' from='openlink.btp072883' id='N3ckKu-3' type='result'>" +
        "  <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-call-history' status='completed'>" +
        "    <iodata xmlns=\"urn:xmpp:tmp:io-data\" type=\"output\">" +
        "      <out>" +
        "        <callhistory  xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/callhistory\" total=\"1000\" start=\"0\" count=\"50\">" +
        "          <call>" +
        "            <id>-941451430-sip:6003@uta.bt.com-DirectDial-1trader1@btsm11</id>" +
        "            <profile>UCTrader1-trader1@btsm11</profile>" +
        "            <interest>sip:6003@uta.bt.com-DirectDial-1trader1@btsm11</interest>" +
        "            <state>CallMissed</state>" +
        "            <direction>Incoming</direction>" +
        "            <caller>6001</caller>" +
        "            <callername>6001</callername>" +
        "            <called>6003</called>" +
        "            <calledname>6003/1</calledname>" +
        "            <duration>0</duration>" +
        "            <timestamp>2015-12-08 16:38:52.178</timestamp>" +
        "            <tsc>btsessionmanager11.btp072883</tsc>" +
        "          </call>" +
        "          <call>" +
        "            <id>1873445153-sip:6001@uta.bt.com-DirectDial-1trader1@btsm11</id>" +
        "            <profile>UCTrader1-trader1@btsm11</profile>" +
        "            <interest>sip:6001@uta.bt.com-DirectDial-1trader1@btsm11</interest>" +
        "            <state>CallDelivered</state>" +
        "            <direction>Outgoing</direction>" +
        "            <caller>6001</caller>" +
        "            <callername>6001/1</callername>" +
        "            <called>6003</called>" +
        "            <calledname>6003</calledname>" +
        "            <duration>0</duration>" +
        "            <timestamp>2015-12-08 16:38:51.415</timestamp>" +
        "            <tsc>btsessionmanager11.btp072883</tsc>" +
        "          </call>" +
        "        </callhistory >" +
        "      </out>" +
        "    </iodata>" +
        "  </command>" +
        "</iq>";
    test('GetCallHistoryResponse will not change the XML', function () {
        var iq = new $.openlink.stanza(getCallHistoryResult);

        equal(iq.toXml(), getCallHistoryResult);
    });

    test('GetProfilesResponse can be parsed', function () {
        var stanza = new $.openlink.stanza(getCallHistoryResult);

        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), 'N3ckKu-3');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'result');
        equal(stanza.getTotalNumberOfRecords(), 1000);
        equal(stanza.getFirstRecordNumberReturned(), 0);
        equal(stanza.getNumberOfRecordsReturned(), 50);

        var calls = stanza.getCalls();
        equal(calls.length, 2);

        propEqual(calls[0], {
            id: '-941451430-sip:6003@uta.bt.com-DirectDial-1trader1@btsm11',
            profile: 'UCTrader1-trader1@btsm11',
            interest: 'sip:6003@uta.bt.com-DirectDial-1trader1@btsm11',
            state: 'CallMissed',
            direction: 'Incoming',
            callerNumber: '6001',
            callerName: '6001',
            calledNumber: "6003",
            calledName: "6003/1",
            duration: 0,
            timestamp: new Date(2015, 11, 8, 16, 38, 52, 178),
            tsc: 'btsessionmanager11.btp072883'
        });
        propEqual(calls[1], {
            id: '1873445153-sip:6001@uta.bt.com-DirectDial-1trader1@btsm11',
            profile: 'UCTrader1-trader1@btsm11',
            interest: 'sip:6001@uta.bt.com-DirectDial-1trader1@btsm11',
            state: 'CallDelivered',
            direction: 'Outgoing',
            callerNumber: '6001',
            callerName: '6001/1',
            calledNumber: "6003",
            calledName: "6003",
            duration: 0,
            timestamp: new Date(2015, 11, 8, 16, 38, 51, 415),
            tsc: 'btsessionmanager11.btp072883'
        });

    });

}(jQuery));
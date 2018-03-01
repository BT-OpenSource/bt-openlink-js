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

    module('message parsing');
    test('Will parse a message stanza without an id or type', function () {
        var stanzaXml = '<message></message>';
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), undefined);
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), undefined);
        equal(stanza.getType(), undefined);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), 'message');
        equal(stanza.getChildElement(), undefined);
    });

    test('Will parse a generic message stanza', function () {
        var stanzaXml = "<message to='trader1@btp072883/TestHarness' from='trader2@btp072883/TestHarness' id='P5LKG-165'></message>";
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'trader2@btp072883/TestHarness');
        equal(stanza.getId(), 'P5LKG-165');
        equal(stanza.getType(), undefined);
        equal(stanza.getStanzaType(), 'message');
        equal(stanza.getChildElement(), undefined);
    });

    module('call-status event');
    var callStatusEvent =
        "<message to='trader1@btp072883' from='pubsub.btp072883' id='sip:6003@uta.bt.com-DirectDial-1trader1@btsm11__trader1@btp072883__taHRN'>\n" +
        "  <event xmlns='http://jabber.org/protocol/pubsub#event'>\n" +
        "    <items node=\"sip:6003@uta.bt.com-DirectDial-1trader1@btsm11\">\n" +
        "      <item id=\"L0pDQw6G1Q6AJWo\">\n" +
        "        <callstatus xmlns=\"http://xmpp.org/protocol/openlink:01:00:00#call-status\" busy=\"false\">\n" +
        "          <call>\n" +
        "            <id>1499444280-sip:6003@uta.bt.com-DirectDial-1trader1@btsm11</id>\n" +
        "            <site type=\"BTSESSIONMANAGER\">itrader-dev-sm-5</site>\n" +
        "            <profile>UCTrader1-trader1@btsm11</profile>\n" +
        "            <eventTimestamps>\n" +
        "              <switch>1448896015923</switch>\n" +
        "              <received>1448896015398</received>\n" +
        "              <published>1448896015405</published>\n" +
        "            </eventTimestamps>\n" +
        "            <interest>sip:6003@uta.bt.com-DirectDial-1trader1@btsm11</interest>\n" +
        "            <changed>State</changed>\n" +
        "            <state>CallDelivered</state>\n" +
        "            <direction>Incoming</direction>\n" +
        "            <caller>\n" +
        "              <number>6005</number>\n" +
        "              <name>6005</name>\n" +
        "            </caller>\n" +
        "            <called>\n" +
        "              <number>6003</number>\n" +
        "              <name>6003/1</name>\n" +
        "            </called>\n" +
        "            <duration>0</duration>\n" +
        "            <actions>\n" +
        "              <AnswerCall/>\n" +
        "            </actions>\n" +
        "            <features>\n" +
        "              <feature id=\"hs_1\" type=\"HANDSET\" label=\"Handset 1\">true</feature>\n" +
        "              <feature id=\"hs_2\" type=\"HANDSET\" label=\"Handset 2\">false</feature>\n" +
        "              <feature id=\"priv_1\" type=\"PRIVACY\" label=\"Privacy\">false</feature>\n" +
        "              <feature id=\"unknown-id\" type=\"unknown-type\" label=\"unknown-label\">false</feature>\n" +
        "              <feature id=\"MK1234\">VoiceMessage</feature>\n" +
        "              <feature id=\"MK1235\" type='VoiceMessage' label='test-message'>something else</feature>\n" +
        "              <feature id=\"NetrixButton_trader1\" type=\"DEVICEKEYS\" label=\"NetrixButton\">\n" +
        "                <devicekeys xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/features#device-keys\">\n" +
        "                  <key>key_1:1:7</key>\n" +
        "                </devicekeys>\n" +
        "              </feature>" +
        "              <feature id=\"voicerecorder_1\">" +
        "                <voicerecorder xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/features#voice-recorder\">" +
        "                  <recnumber>001</recnumber>\n" +
        "                  <recport>3</recport>\n" +
        "                  <recchan>28</recchan>" +
        "                  <rectype>?</rectype>\n" +
        "                  </voicerecorder>\n" +
        "                </feature>\n" +
        "            </features>\n" +
        "          </call>\n" +
        "        </callstatus>\n" +
        "      </item>\n" +
        "    </items>\n" +
        "  </event>\n" +
        "</message>\n";

    test('Parsing a call-status message will not change the XML', function () {
        var stanza = new $.openlink.stanza(callStatusEvent);

        equal(stanza.toXml(), callStatusEvent);
    });

    test('A call-status message can be parsed', function () {
        var stanza = new $.openlink.stanza(callStatusEvent);

        equal(stanza.getTo(), 'trader1@btp072883');
        equal(stanza.getFrom(), 'pubsub.btp072883');
        equal(stanza.getId(), 'sip:6003@uta.bt.com-DirectDial-1trader1@btsm11__trader1@btp072883__taHRN');
        equal(stanza.getStanzaType(), 'message');
        equal(stanza.getType(), undefined);
        equal(stanza.getNode(), 'sip:6003@uta.bt.com-DirectDial-1trader1@btsm11');
        equal(stanza.getChildElement().nodeName, 'event');

        var calls = stanza.getCalls();
        equal(calls.length, 1);

        propEqual(calls[0], {
            id: '1499444280-sip:6003@uta.bt.com-DirectDial-1trader1@btsm11',
            site: 'itrader-dev-sm-5',
            profile: 'UCTrader1-trader1@btsm11',
            interest: 'sip:6003@uta.bt.com-DirectDial-1trader1@btsm11',
            changed: 'State',
            state: 'CallDelivered',
            direction: 'Incoming',
            isIncoming: true,
            isOutgoing: false,
            callerNumber: '6005',
            callerName: '6005',
            callerE164: [],
            callerPreferredNumber: '6005',
            calledNumber: "6003",
            calledDestination: undefined,
            calledE164: [],
            calledPreferredNumber: '6003',
            calledName: "6003/1",
            duration: 0,
            actions: ['AnswerCall'],
            features: [
                {id: 'hs_1', type: 'Handset', label: 'Handset 1', isEnabled: true, isCallable: true, isSettable: true, isVoiceMessage: false, isGroupIntercom: false},
                {id: 'hs_2', type: 'Handset', label: 'Handset 2', isEnabled: false, isCallable: true, isSettable: true, isVoiceMessage: false, isGroupIntercom: false},
                {id: 'priv_1', type: 'Privacy', label: 'Privacy', isEnabled: false, isCallable: true, isSettable: true, isVoiceMessage: false, isGroupIntercom: false},
                {id: 'unknown-id', type: 'unknown-type', label: 'unknown-label', isEnabled: false, isCallable: false, isSettable: false, isVoiceMessage: false, isGroupIntercom: false},
                {id: 'MK1234', type: 'VoiceMessage', label: undefined, isEnabled: false, isCallable: true, isSettable: false, isVoiceMessage: true, isGroupIntercom: false},
                {id: 'MK1235', type: 'VoiceMessage', label: 'test-message', isEnabled: false, isCallable: true, isSettable: false, isVoiceMessage: true, isGroupIntercom: false},
                {id: 'NetrixButton_trader1', type: 'DeviceKeys', label: 'NetrixButton', isEnabled: false, isCallable: false, isSettable: true, isVoiceMessage: false, isGroupIntercom: false},
                {id: 'voicerecorder_1', type: 'VoiceRecorder', label: undefined, isEnabled: false, isCallable: false, isSettable: false, isVoiceMessage: false, isGroupIntercom: false}
                ]

        });
    });

    module('call-status number formatting');
    test('Will return all available numbers', function () {
        var stanza = new $.openlink.stanza(
            "<message to='trader1@btp072883' from='pubsub.btp072883' id='sip:6003@uta.bt.com-DirectDial-1trader1@btsm11__trader1@btp072883__taHRN'>\n" +
            "  <event xmlns='http://jabber.org/protocol/pubsub#event'>\n" +
            "    <items node='sip:6003@uta.bt.com-DirectDial-1trader1@btsm11'>\n" +
            "      <item id='L0pDQw6G1Q6AJWo'>\n" +
            "        <callstatus xmlns='http://xmpp.org/protocol/openlink:01:00:00#call-status' busy='false'>\n" +
            "          <call>\n" +
            "            <caller>\n" +
            "              <number e164='caller-e164#1,caller-e164#2'>cli</number>\n" +
            "            </caller>\n" +
            "            <called>\n" +
            "              <number e164='called-e164#1,called-e164#2' destination='destination-number'>dialled-number</number>\n" +
            "            </called>\n" +
            "          </call>\n" +
            "        </callstatus>\n" +
            "      </item>\n" +
            "    </items>\n" +
            "  </event>\n" +
            "</message>\n");

        var call = stanza.getCalls()[0];
        equal(call.callerNumber, 'cli');
        equal(call.callerE164[0], 'caller-e164#1');
        equal(call.callerE164[1], 'caller-e164#2');
        equal(call.callerPreferredNumber, 'cli');

        equal(call.calledNumber, 'dialled-number');
        equal(call.calledDestination, 'destination-number');
        equal(call.calledE164[0], 'called-e164#1');
        equal(call.calledE164[1], 'called-e164#2');
        equal(call.calledPreferredNumber, 'destination-number');
    });

    test('Will return E.164 number as preferred', function () {
        var stanza = new $.openlink.stanza(
            "<message to='trader1@btp072883' from='pubsub.btp072883' id='sip:6003@uta.bt.com-DirectDial-1trader1@btsm11__trader1@btp072883__taHRN'>\n" +
            "  <event xmlns='http://jabber.org/protocol/pubsub#event'>\n" +
            "    <items node='sip:6003@uta.bt.com-DirectDial-1trader1@btsm11'>\n" +
            "      <item id='L0pDQw6G1Q6AJWo'>\n" +
            "        <callstatus xmlns='http://xmpp.org/protocol/openlink:01:00:00#call-status' busy='false'>\n" +
            "          <call>\n" +
            "            <caller>\n" +
            "              <number e164='caller-e164'>cli</number>\n" +
            "            </caller>\n" +
            "            <called>\n" +
            "              <number e164='called-e164'>dialled-number</number>\n" +
            "            </called>\n" +
            "          </call>\n" +
            "        </callstatus>\n" +
            "      </item>\n" +
            "    </items>\n" +
            "  </event>\n" +
            "</message>\n");

        var call = stanza.getCalls()[0];
        equal(call.callerPreferredNumber, 'caller-e164');

        equal(call.calledPreferredNumber, 'called-e164');
    });


}(jQuery));
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
        "<message from='pubsub.win2008' to='803292039@win2008' id='D511516803292039@its2__803292039@win2008__beued'>\n" +
        "   <event xmlns='http://jabber.org/protocol/pubsub#event'>\n" +
        "       <items node='D511516803292039@its2'>\n" +
        "          <item id='W0Ewxx8KG0F9Rjh'>\n" +
        "               <callstatus xmlns='http://xmpp.org/protocol/openlink:01:00:00#call-status' busy='true'>\n" +
        "                   <call><id>ITS#536#10000005371#D511516803292039@its2</id>\n" +
        "                       <site type='ITS'>ExampleSite</site>\n" +
        "                       <profile devicenum='513'>803292039@its2</profile>\n" +
        "                       <interest>D511516803292039@its2</interest>\n" +
        "                       <changed>State</changed>\n" +
        "                       <state>CallConferenced</state>\n" +
        "                       <direction>Outgoing</direction>\n" +
        "                       <caller><number>511516</number><name>511516 Richard Cucks</name></caller>\n" +
        "                       <called><number>14120</number><name>14120</name></called>\n" +
        "                       <duration>5906</duration>\n" +
        "                       <actions><ClearConnection/><ClearCall/><SendDigit/><ClearConference/><ConnectSpeaker/></actions>\n" +
        "                       <features>\n" +
        "                           <feature id='priv_1'>false</feature>\n" +
        "                           <feature id='hs_1'>true</feature><feature id='hs_2'>false</feature>\n" +
        "                           <feature id='voicerecorder_1'>\n" +
        "                               <voicerecorder xmlns='http://xmpp.org/protocol/openlink:01:00:00/features#voice-recorder'>\n" +
        "                                   <recnumber>006</recnumber>\n" +
        "                                   <recport>1</recport>\n" +
        "                                   <recchan>1</recchan>\n" +
        "                                   <rectype>T</rectype>\n" +
        "                               </voicerecorder>\n" +
        "                           </feature>\n" +
        "                           <feature id='Netrix_803292039'>\n" +
        "                               <devicekeys xmlns='http://xmpp.org/protocol/openlink:01:00:00/features#device-keys'>\n" +
        "                                   <key>key_1:9:7</key>\n" +
        "                                   <key>key_1:8:7</key>\n" +
        "                                   <key>key_1:13:7</key>\n" +
        "                               </devicekeys></feature>\n" +
        "                       </features>\n" +
        "                       <participants>\n" +
        "                           <participant jid='803292039@win2008' type='Active' direction='Outgoing' timestamp='Fri Jan 27 16:58:11 GMT 2017' duration='5906'/>\n" +
        "                           <participant number='14120' type='Active' category='CONF' direction='Outgoing' timestamp='Fri Jan 27 16:58:19 GMT 2017' duration='0'/>\n" +
        "                       </participants>\n" +
        "                   </call>\n" +
        "               </callstatus>\n" +
        "           </item>\n" +
        "        </items>\n" +
        "   </event>\n" +
        "</message>";

    test('Parsing a call-status message will not change the XML', function () {
        var stanza = new $.openlink.stanza(callStatusEvent);

        equal(stanza.toXml(), callStatusEvent);
    });

    test('A call-status message can be parsed', function () {
        var stanza = new $.openlink.stanza(callStatusEvent);

        equal(stanza.getTo(), '803292039@win2008');
        equal(stanza.getFrom(), 'pubsub.win2008');
        equal(stanza.getId(), 'D511516803292039@its2__803292039@win2008__beued');
        equal(stanza.getStanzaType(), 'message');
        equal(stanza.getType(), undefined);
        equal(stanza.getNode(), 'D511516803292039@its2');
        equal(stanza.getChildElement().nodeName, 'event');

        var calls = stanza.getCalls();
        equal(calls.length, 1);

        propEqual(calls[0],
            {
                "actions": [
                    "ClearConnection",
                    "ClearCall",
                    "SendDigit",
                    "ClearConference",
                    "ConnectSpeaker"
                ],
                "calledDestination": undefined,
                "calledE164": [],
                "calledName": "14120",
                "calledNumber": "14120",
                "calledPreferredNumber": "14120",
                "callerE164": [],
                "callerName": "511516 Richard Cucks",
                "callerNumber": "511516",
                "callerPreferredNumber": "511516",
                "changed": "State",
                "direction": "Outgoing",
                "duration": 5906,
                "features": [
                    {
                        "id": "priv_1",
                        "isCallable": false,
                        "isEnabled": false,
                        "isGroupIntercom": false,
                        "isSettable": false,
                        "isVoiceMessage": false,
                        "label": undefined,
                        "type": "false"
                    },
                    {
                        "id": "hs_1",
                        "isCallable": false,
                        "isEnabled": true,
                        "isGroupIntercom": false,
                        "isSettable": false,
                        "isVoiceMessage": false,
                        "label": undefined,
                        "type": "true"
                    },
                    {
                        "id": "hs_2",
                        "isCallable": false,
                        "isEnabled": false,
                        "isGroupIntercom": false,
                        "isSettable": false,
                        "isVoiceMessage": false,
                        "label": undefined,
                        "type": "false"
                    },
                    {
                        "id": "voicerecorder_1",
                        "isCallable": false,
                        "isEnabled": false,
                        "isGroupIntercom": false,
                        "isSettable": false,
                        "isVoiceMessage": false,
                        "label": undefined,
                        "type": "VoiceRecorder"
                    },
                    {
                        "id": "Netrix_803292039",
                        "isCallable": false,
                        "isEnabled": false,
                        "isGroupIntercom": false,
                        "isSettable": true,
                        "isVoiceMessage": false,
                        "label": undefined,
                        "type": "DeviceKeys"
                    }
                ],
                "participants": [
                    {
                        "category": undefined,
                        "direction": "Outgoing",
                        "duration": "5906",
                        "jid": "803292039@win2008",
                        "number": undefined,
                        "timestamp": "Fri Jan 27 16:58:11 GMT 2017",
                        "type": "Active"
                    },
                    {
                        "category": "CONF",
                        "direction": "Outgoing",
                        "duration": "0",
                        "jid": undefined,
                        "number": "14120",
                        "timestamp": "Fri Jan 27 16:58:19 GMT 2017",
                        "type": "Active"
                    }
                ],
                "id": "ITS#536#10000005371#D511516803292039@its2",
                "interest": "D511516803292039@its2",
                "isIncoming": false,
                "isOutgoing": true,
                "profile": "803292039@its2",
                "site": "ExampleSite",
                "state": "CallConferenced"
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
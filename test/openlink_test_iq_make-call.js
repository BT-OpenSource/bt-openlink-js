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

    module('iq.make-call requests');
    test('MakeCallRequest will generate unique a stanza id', function () {
        var makeCallRequest1 = new $.openlink.MakeCallRequest("test-interest-id", "test-call-id", "test-action");
        var makeCallRequest2 = new $.openlink.MakeCallRequest("test-interest-id", "test-call-id", "test-action");
        notEqual(makeCallRequest1.getId(), makeCallRequest2.getId());
    });

    test('MakeCallRequest will build a stanza', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest("test-interest-id");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza on a profile', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .onProfile("test-profile-id");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><profile>test-profile-id</profile></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza on an interest', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .onInterest("test-interest-id");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><interest>test-interest-id</interest></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza for another user', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .forUser('another-user@test-domain');
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>another-user@test-domain</jid></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with a destination', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .toDestination('dialable-number');
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><destination>dialable-number</destination></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with features', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withFeature("test-feature-1")
            .withFeature("test-feature-2", "test-value-1")
            .withFeature("test-feature-3", "test-value-1", "test-value-2");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><features><feature><id>test-feature-1</id></feature><feature><id>test-feature-2</id><value1>test-value-1</value1></feature><feature><id>test-feature-3</id><value1>test-value-1</value1><value2>test-value-2</value2></feature></features></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with a VoiceMessage feature', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withVoiceMessageFeature("test-feature-1")
            .withFeature("test-feature-2", "test-value-1");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><features><feature type=\"VoiceMessage\"><id>test-feature-1</id></feature><feature><id>test-feature-2</id><value1>test-value-1</value1></feature></features></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop"></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference key/value pair', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop", "test-orig-value");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop"><value>test-orig-value</value></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with two originator reference key/value pairs', function () {
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference("test-orig-prop-1", "test-orig-value-1")
            .withOriginatorReference("test-orig-prop-2", "test-orig-value-2");
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref><property id="test-orig-prop-1"><value>test-orig-value-1</value></property><property id="test-orig-prop-2"><value>test-orig-value-2</value></property></originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    test('MakeCallRequest will build a stanza with an originator reference XML element', function () {
        var originatorReferenceXml = '<ref-1><someXml/><moretags>\"\'@&lt;&gt;\'\"</moretags></ref-1>';
        var originatorReferenceElement = $.parseXML(originatorReferenceXml).documentElement;
        var makeCallRequest = new $.openlink.MakeCallRequest()
            .withOriginatorReference(originatorReferenceElement);
        var expected = '<iq type="set" id="' + makeCallRequest.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#make-call" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>test-user@test-domain</jid><originator-ref>' + originatorReferenceXml + '</originator-ref></in></iodata></command></iq>';
        equal(makeCallRequest.toXml(), expected);
    });

    module('iq.make-call results');
    var makeCallResult = "<iq from='test-from-user@test-domain/test-resource' to='test-to-user@test-domain/test-resource' id='test-stanza-id' type='result'>\n" +
        "   <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#make-call' status='completed'>\n" +
        "     <iodata xmlns='urn:xmpp:tmp:io-data' type='output'>\n" +
        "      <out>\n" +
        "<callstatus xmlns='http://xmpp.org/protocol/openlink:01:00:00#call-status' busy='false'>\n" +
        "  <call>\n" +
        "    <id>test-call-id</id>\n" +
        "    <site id='42' type='BTSM' default='true'>test site name</site>\n" +
        "    <profile>test-profile-id</profile>\n" +
        "    <interest>test-interest-id</interest>\n" +
        "    <changed>State</changed>\n" +
        "    <state>CallOriginated</state>\n" +
        "    <direction>Incoming</direction>\n" +
        "    <caller>\n" +
        "      <number e164='test-caller-e164-number'>test-caller-number</number>\n" +
        "      <name>test-caller-name</name>\n" +
        "    </caller>\n" +
        "    <called>\n" +
        "      <number e164='test-called-e164-number' destination='test-called-destination'>test-called-number</number>\n" +
        "      <name>test-called-name</name>\n" +
        "    </called>\n" +
        "    <duration>60000</duration>\n" +
        "    <actions>\n" +
        "      <AnswerCall/>\n" +
        "    </actions>\n" +
        "    <features>\n" +
        "      <feature id='hs_1' type='Handset' label='Handset 1'>false</feature>\n" +
        "      <feature id='hs_2' type='Handset' label='Handset 2'>false</feature>\n" +
        "      <feature id='priv_1' type='Privacy' label='Privacy'>false</feature>\n" +
        "      <feature id='NetrixHiTouch_sales1' type='DeviceKeys' label='NetrixHiTouch'>\n" +
        "        <devicekeys xmlns='http://xmpp.org/protocol/openlink:01:00:00/features#device-keys'>\n" +
        "          <key>key_1:1:1</key>\n" +
        "        </devicekeys>\n" +
        "      </feature>\n" +
        "    </features>\n" +
        "    <participants>\n" +
        "      <participant direction='Incoming' duration='60000' jid='test-user@test-domain' starttime='2017-10-09T08:07:00.000Z' timestamp='Mon Oct 09 08:07:00 UTC 2017' type='Active'/>\n" +
        "    </participants>\n" +
        "  </call>\n" +
        "</callstatus>\n" +
        "      </out>\n" +
        "    </iodata>\n" +
        "  </command>\n" +
        "</iq>";

    test('MakeCallResult will not change the XML', function () {
        var iq = new $.openlink.stanza(makeCallResult);

        equal(iq.toXml(), makeCallResult);
    });

    test('MakeCallResult can be parsed', function () {
        var stanza = new $.openlink.stanza(makeCallResult);

        equal(stanza.getTo(), 'test-to-user@test-domain/test-resource');
        equal(stanza.getFrom(), 'test-from-user@test-domain/test-resource');
        equal(stanza.getId(), 'test-stanza-id');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');

        var calls = stanza.getCalls();
        equal(calls.length, 1);

        propEqual(calls[0], {
            "id": "test-call-id",
            "site": "test site name",
            "profile": "test-profile-id",
            "interest": "test-interest-id",
            "changed": "State",
            "state": "CallOriginated",
            "direction": "Incoming",
            "isIncoming": true,
            "isOutgoing": false,
            "callerNumber": "test-caller-number",
            "callerE164": [
                "test-caller-e164-number"
            ],
            "callerPreferredNumber": "test-caller-e164-number",
            "callerName": "test-caller-name",
            "calledNumber": "test-called-number",
            "calledE164": [
                "test-called-e164-number"
            ],
            "calledDestination": "test-called-destination",
            "calledPreferredNumber": "test-called-destination",
            "calledName": "test-called-name",
            "duration": 60000,
            "actions": [
                "AnswerCall"
            ],
            "participants": [
                {
                    "category": undefined,
                    "direction": "Incoming",
                    "duration": "60000",
                    "jid": "test-user@test-domain",
                    "number": undefined,
                    "timestamp": "Mon Oct 09 08:07:00 UTC 2017",
                    "type": "Active"
                }
            ],
            "features": [
                { "id": "hs_1", "isCallable": true, "isEnabled": false, "isGroupIntercom": false, "isSettable": true, "isVoiceMessage": false, "label": "Handset 1", "type": "Handset" },
                { "id": "hs_2", "isCallable": true, "isEnabled": false, "isGroupIntercom": false, "isSettable": true, "isVoiceMessage": false, "label": "Handset 2", "type": "Handset" },
                { "id": "priv_1", "isCallable": true, "isEnabled": false, "isGroupIntercom": false, "isSettable": true, "isVoiceMessage": false, "label": "Privacy", "type": "Privacy" },
                { "id": "NetrixHiTouch_sales1", "isCallable": false, "isEnabled": false, "isGroupIntercom": false, "isSettable": true, "isVoiceMessage": false, "label": "NetrixHiTouch", "type": "DeviceKeys" }
            ]
        });

    });

}(jQuery));
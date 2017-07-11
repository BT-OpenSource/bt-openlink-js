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

    module('iq.manage-voice-message');
    test('ManageVoiceMessageRequest will generate unique a stanza id', function () {
        var mvm1 = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record");
        var mvm2 = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record");
        notEqual(mvm1.getId(), mvm2.getId());
    });

    test('ManageVoiceMessageRequest will build a stanza with a label', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record").withLabel("VM label");
        var expected = '<iq type="set" id="' + mvm.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><action>Record</action><label>VM label</label></in></iodata></command></iq>';
        equal(mvm.toXml(), expected);
    });

    test('ManageVoiceMessageRequest will build a stanza with a feature', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Query").withFeature("featureId");
        var expected = '<iq type="set" id="' + mvm.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><action>Query</action><features><feature><id>featureId</id></feature></features></in></iodata></command></iq>';
        equal(mvm.toXml(), expected);
    });

    test('ManageVoiceMessageRequest will build a stanza with a feature and label', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record").withFeature("featureId").withLabel("VM label");
        var expected = '<iq type="set" id="' + mvm.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile><action>Record</action><label>VM label</label><features><feature><id>featureId</id></feature></features></in></iodata></command></iq>';
        equal(mvm.toXml(), expected);
    });

    test('ManageVoiceMessageRequest will not build a stanza with an unrecognised feature', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Unknown");
        throws(function () {
            mvm.toXml();
        }, /action is not supported/);
    });

    test('ManageVoiceMessageRequest will not build a stanza without a feature', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Create").withLabel("VM label");
        throws(function () {
            mvm.toXml();
        }, /A feature must be supplied/);
    });

    test('ManageVoiceMessageRequest will not build a stanza without a record action and two features', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record")
            .withLabel("VM label")
            .withFeature("featureId1")
            .withFeature("featureId2");
        throws(function () {
            mvm.toXml();
        }, /Only one feature can be supplied/);
    });

    test('ManageVoiceMessageRequest will not build a stanza without a label', function () {
        var mvm = new $.openlink.ManageVoiceMessageRequest("test-profile-id", "Record");
        throws(function () {
            mvm.toXml();
        }, /action requires a label/);
    });

    var manageVoiceMessageResponse = '<iq id="iq_44" to="trader1@collab.example.com" from="vmstsp.vms.example.com" type="result">' +
        '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" status="completed">' +
        '<iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '<out>' +
        '<devicestatus xmlns="http://xmpp.org/protocol/openlink:01:00:00#device-status">' +
        '<profile>trader1_myprofile</profile>' +
        '<features>' +
        '<feature id="MK1019">' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<label>Label for voicemessage</label>' +
        '<status>ok</status>' +
        '<action>Query</action>' +
        '<msglen>1.03</msglen>' +
        '<creationdate>2015-02-24 16:26:14.0</creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature id="MK1010">' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<label>Another voicemessage label</label>' +
        '<status>ok</status>' +
        '<action>Query</action>' +
        '<msglen>1.11</msglen>' +
        '<creationdate>2015-02-24 15:28:26.0</creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '</features>' +
        '</devicestatus>' +
        '</out>' +
        '</iodata>' +
        '</command>' +
        '</iq>';

    test('ManageVoiceMessageResponse will not change the XML', function () {
        var iq = new $.openlink.stanza(manageVoiceMessageResponse);

        equal(iq.toXml(), manageVoiceMessageResponse);
    });

    test('ManageVoiceMessageResponse Query can be parsed', function () {
        var stanza = new $.openlink.stanza(manageVoiceMessageResponse);

        equal(stanza.getTo(), 'trader1@collab.example.com');
        equal(stanza.getFrom(), 'vmstsp.vms.example.com');
        equal(stanza.getId(), 'iq_44');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');
        equal(stanza.constructor.name, 'ManageVoiceMessageResult');
        equal(stanza.getProfileId(), 'trader1_myprofile');

        var features = stanza.getFeatures();

        var i = 0;

        deepEqual(features[i++], {
            id: 'MK1019',
            label: 'Label for voicemessage',
            extension: undefined,
            status: 'ok',
            action: 'Query',
            messageLength: 1.03,
            creationDate: new Date(2015, 1, 24, 16, 26, 14, 0)
        });

        deepEqual(features[i++], {
            id: 'MK1010',
            label: 'Another voicemessage label',
            extension: undefined,
            status: 'ok',
            action: 'Query',
            messageLength: 1.11,
            creationDate: new Date(2015, 1, 24, 15, 28, 26, 0)
        });

        equal(features.length, i);

    });


    var manageVoiceMessageResponseRecord = '<iq id="iq_115" to="trader1@collab.example.com" from="vmstsp.vms.example.com" type="result" >' +
        '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" status="completed">' +
        '<iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '<out>' +
        '<devicestatus xmlns="http://xmpp.org/protocol/openlink:01:00:00#device-status">' +
        '<profile>trader1_myprofile</profile>' +
        '<features>' +
        '<feature id="MK1029">' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<status>ok</status>' +
        '<action>Record</action>' +
        '<exten>9703</exten>' +
        '</voicemessage>' +
        '</feature>' +
        '</features>' +
        '</devicestatus>' +
        '</out>' +
        '</iodata>' +
        '</command>' +
        '</iq>';

    test('ManageVoiceMessageResponse Record can be parsed', function () {
        var stanza = new $.openlink.stanza(manageVoiceMessageResponseRecord);

        equal(stanza.getTo(), 'trader1@collab.example.com');
        equal(stanza.getFrom(), 'vmstsp.vms.example.com');
        equal(stanza.getId(), 'iq_115');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');
        equal(stanza.constructor.name, 'ManageVoiceMessageResult');
        equal(stanza.getProfileId(), 'trader1_myprofile');

        var features = stanza.getFeatures();

        var i = 0;

        deepEqual(features[i++], {
            id: 'MK1029',
            label: undefined,
            extension: '9703',
            status: 'ok',
            action: 'Record',
            messageLength: undefined,
            creationDate: undefined
        });

        equal(features.length, i);

    });

    var manageVoiceMessageResponseBadDate = '<iq id="iq_44" to="trader1@collab.example.com" from="vmstsp.vms.example.com" type="result">' +
        '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" status="completed">' +
        '<iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '<out>' +
        '<devicestatus xmlns="http://xmpp.org/protocol/openlink:01:00:00#device-status">' +
        '<profile>trader1_myprofile</profile>' +
        '<features>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<creationdate></creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<creationdate>aaaa-bbb-cc dd:ee:ff.gggg</creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<creationdate>2016-01-01 dd:ee:ff.gggg</creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<creationdate>2016-01-01          </creationdate>' +
        '</voicemessage>' +
        '</feature>' +
        '</features>' +
        '</devicestatus>' +
        '</out>' +
        '</iodata>' +
        '</command>' +
        '</iq>';

    test('ManageVoiceMessageResponse will handle bad dates', function () {
        var stanza = new $.openlink.stanza(manageVoiceMessageResponseBadDate);

        var i = 0;
        var features = stanza.getFeatures();
        equal(features[i++].creationDate, undefined);
        equal(features[i++].creationDate, undefined);
        equal(features[i++].creationDate, undefined);
        deepEqual(features[i++].creationDate, new Date(2016, 0, 1));

        equal(features.length, i);
    });

    var manageVoiceMessageResponseBadLength = '<iq id="iq_44" to="trader1@collab.example.com" from="vmstsp.vms.example.com" type="result">' +
        '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message" status="completed">' +
        '<iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '<out>' +
        '<devicestatus xmlns="http://xmpp.org/protocol/openlink:01:00:00#device-status">' +
        '<profile>trader1_myprofile</profile>' +
        '<features>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<msglen></msglen>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<msglen>     </msglen>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<msglen>0a</msglen>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<msglen> 42 </msglen>' +
        '</voicemessage>' +
        '</feature>' +
        '<feature>' +
        '<voicemessage xmlns="http://xmpp.org/protocol/openlink:01:00:00/features#voice-message">' +
        '<msglen>42</msglen>' +
        '</voicemessage>' +
        '</feature>' +
        '</features>' +
        '</devicestatus>' +
        '</out>' +
        '</iodata>' +
        '</command>' +
        '</iq>';

    test('ManageVoiceMessageResponse will handle bad lengths', function () {
        var stanza = new $.openlink.stanza(manageVoiceMessageResponseBadLength);

        var i = 0;
        var features = stanza.getFeatures();
        equal(features[i++].messageLength, undefined);
        equal(features[i++].messageLength, undefined);
        equal(features[i++].messageLength, undefined);
        equal(features[i++].messageLength, 42);
        equal(features[i++].messageLength, 42);

        equal(features.length, i);
    });


}(jQuery));
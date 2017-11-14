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

    module('iq.GetFeatures');

    test('GetFeaturesRequest will generate unique a stanza id', function () {
        var getFeatures1 = new $.openlink.GetFeaturesRequest("test-profile-id");
        var getFeatures2 = new $.openlink.GetFeaturesRequest("test-profile-id");
        notEqual(getFeatures1.getId(), getFeatures2.getId());
    });

    test('GetFeaturesRequest will build a stanza', function () {
        var getFeatures = new $.openlink.GetFeaturesRequest("test-profile-id");
        var expected = '<iq type="set" id="' + getFeatures.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-features" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile></in></iodata></command></iq>';
        equal(getFeatures.toXml(), expected);
    });

    var getFeaturesResult = "<iq to='trader1@btp072883/TestHarness' from='openlink.btp072883' id='00ji01-3' type='result'>" +
        "   <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-features' status='completed'>" +
        '       <iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '           <out>' +
        '               <profile id="998399831@its3" devicenum="780"/>' +
        '               <features xmlns="http://xmpp.org/protocol/openlink:01:00:00/features">' +
        '                   <feature id="message_waiting"       type="MessageWaiting"   label="Message Waiting" />' +
        '                   <feature id="microphone_gain"       type="MicrophoneGain"   label="Set microphone volume" />' +
        '                   <feature id="microphone_mute"       type="MicrophoneMute"   label="Status of the microphone mute" />' +
        '                   <feature id="ringer_status"         type="RingerStatus"     label="Status of the device audible ringing" />' +
        '                   <feature id="speaker_mute"          type="SpeakerMute"      label="Status of the speaker mute" />' +
        '                   <feature id="sdn_4566"              type="SpeedDial"        label="Bill Broker (Desk)" />' +
        '                   <feature id="intercom_london"       type="GroupIntercom"    label="Group Intercom for London" />' +
        '                   <feature id="spkr_1"                type="SpeakerChannel"   label="Speaker Channel 1" />' +
        '                   <feature id="voice_message_35"      type="VoiceMessage"     label="Invitation to buy Tesco shares" />' +
        '                   <feature id="voice_playlist_5"      type="VoiceMessagePlaylist" label="Invitation to buy supermarket shares" />' +
        '                   <feature id="voice_recorder"        type="VoiceRecorder"    label="Status of voice recording" />' +
        '                   <feature id="voice_bridge_1"        type="VoiceBridge"      label="SIP VoiceBridge via Cisco Call Manager" />' +
        '                   <feature id="privacy"               type="Privacy"          label="Privacy" />' +
        '                   <feature id="hs1"                   type="Handset"          label="Handset 1" />' +
        '                   <feature id="do_not_disturb"        type="DoNotDisturb"     label="Status of device do not disturb" />' +
        '                   <feature id="call_forward"          type="CallForward"      label="Call Forward" />' +
        '                   <feature id="callback_1"            type="CallBack"         label="Callback to mobile phone" />' +
        '                   <feature id="conference"            type="Conference"       label="Allocate conference resources" />' +
        '                   <feature id="media_stream"          type="MediaStream"      label="Status of the media streaming" />' +
        '                   <feature id="netrix_device_1"       type="DeviceKeys"       label="ITS.Netrix Softphone" />' +
        '               </features>' +
        '           </out>' +
        '       </iodata>' +
        '   </command>' +
        '</iq>';

    var getFeaturesResultWithNote =
        "<iq to='trader1@itrader.local/TestHarness' from='openlink.itrader.local' id='Vxbigo-3' type='result'>" +
        "   <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-features' status='completed'>" +
        '       <iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        "           <out>" +
        '               <profile id="UCTrader1-trader1@btsm9"/>' +
        '               <features xmlns="http://xmpp.org/protocol/openlink:01:00:00/features">' +
        '                   <feature id="hs_2" type="HANDSET" label="Handset 2"/>' +
        '                   <feature id="fwd_1" type="CALLFORWARD" label="Call Forward"/>' +
        "               </features>" +
        "           </out>" +
        "       </iodata>" +
        "       <note>Voice Drop Server Not Reachable:vmstsp.itrader-dev-sm-2.btlabs.bt.co.uk</note>" +
        "   </command>" +
        "</iq>";

    test('GetFeaturesResult will not change the XML', function () {
        var iq = new $.openlink.stanza(getFeaturesResult);

        equal(iq.toXml(), getFeaturesResult);
    });

    test('GetFeaturesResult can be parsed', function () {
        var stanza = new $.openlink.stanza(getFeaturesResult);

        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), '00ji01-3');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'result');
        equal(stanza.isResult(), true);
        equal(stanza.getProfileId(), '998399831@its3');
        equal(stanza.getDeviceNumber(), '780');
        equal(stanza.getChildElement().nodeName, 'command');

        var features = stanza.getFeatures();

        var i = 0;
        propEqual(features[i++], {
            id: 'message_waiting',
            type: 'MessageWaiting',
            label: 'Message Waiting',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'microphone_gain',
            type: 'MicrophoneGain',
            label: 'Set microphone volume',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'microphone_mute',
            type: 'MicrophoneMute',
            label: 'Status of the microphone mute',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'ringer_status',
            type: 'RingerStatus',
            label: 'Status of the device audible ringing',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'speaker_mute',
            type: 'SpeakerMute',
            label: 'Status of the speaker mute',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'sdn_4566',
            type: 'SpeedDial',
            label: 'Bill Broker (Desk)',
            isSettable: false,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'intercom_london',
            type: 'GroupIntercom',
            label: 'Group Intercom for London',
            isSettable: false,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: true
        });
        propEqual(features[i++], {
            id: 'spkr_1',
            type: 'SpeakerChannel',
            label: 'Speaker Channel 1',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'voice_message_35',
            type: 'VoiceMessage',
            label: 'Invitation to buy Tesco shares',
            isSettable: false,
            isCallable: true,
            isVoiceMessage: true,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'voice_playlist_5',
            type: 'VoiceMessagePlaylist',
            label: 'Invitation to buy supermarket shares',
            isSettable: false,
            isCallable: true,
            isVoiceMessage: true,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'voice_recorder',
            type: 'VoiceRecorder',
            label: 'Status of voice recording',
            isSettable: false,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'voice_bridge_1',
            type: 'VoiceBridge',
            label: 'SIP VoiceBridge via Cisco Call Manager',
            isSettable: false,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'privacy',
            type: 'Privacy',
            label: 'Privacy',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'hs1',
            type: 'Handset',
            label: 'Handset 1',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'do_not_disturb',
            type: 'DoNotDisturb',
            label: 'Status of device do not disturb',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'call_forward',
            type: 'CallForward',
            label: 'Call Forward',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'callback_1',
            type: 'CallBack',
            label: 'Callback to mobile phone',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'conference',
            type: 'Conference',
            label: 'Allocate conference resources',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'media_stream',
            type: 'MediaStream',
            label: 'Status of the media streaming',
            isSettable: false,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'netrix_device_1',
            type: 'DeviceKeys',
            label: 'ITS.Netrix Softphone',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        equal(features.length, i);
    });

    test('GetFeaturesResultWithNote can be parsed', function () {
        var stanza = new $.openlink.stanza(getFeaturesResultWithNote);

        equal(stanza.getTo(), 'trader1@itrader.local/TestHarness');
        equal(stanza.getFrom(), 'openlink.itrader.local');
        equal(stanza.getId(), 'Vxbigo-3');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.getType(), 'result');
        equal(stanza.getProfileId(), 'UCTrader1-trader1@btsm9');
        equal(typeof stanza.getDeviceNumber(), 'undefined');
        equal(stanza.getChildElement().nodeName, 'command');

        var features = stanza.getFeatures();

        var i = 0;

        propEqual(features[i++], {
            id: 'hs_2',
            label: 'Handset 2',
            type: 'Handset',
            isSettable: true,
            isCallable: true,
            isVoiceMessage: false,
            isGroupIntercom: false
        });
        propEqual(features[i++], {
            id: 'fwd_1',
            label: 'Call Forward',
            type: 'CallForward',
            isSettable: true,
            isCallable: false,
            isVoiceMessage: false,
            isGroupIntercom: false
        });

        equal(features.length, i);
    });

}(jQuery));
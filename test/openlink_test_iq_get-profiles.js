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

    module('iq.GetProfiles');

    test('GetProfilesRequest will generate unique a stanza id', function () {
        var getProfiles1 = new $.openlink.GetProfilesRequest();
        var getProfiles2 = new $.openlink.GetProfilesRequest();
        notEqual(getProfiles1.getId(), getProfiles2.getId());
    });

    test('GetProfilesRequest will build a stanza for the connected user', function () {
        var getProfiles = new $.openlink.GetProfilesRequest();
        var expected = '<iq type="set" id="' + getProfiles.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-profiles" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>' + $.openlink.getUserJid() + '</jid></in></iodata></command></iq>';
        equal(getProfiles.toXml(), expected);
    });

    test('GetProfilesRequest will build a stanza for another user', function () {
        var forUserJid = "another-user@another-domain";
        var getProfiles = new $.openlink.GetProfilesRequest().forUser(forUserJid);
        var expected = '<iq type="set" id="' + getProfiles.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-profiles" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><jid>' + forUserJid + '</jid></in></iodata></command></iq>';
        equal(getProfiles.toXml(), expected);
    });

    var getProfilesResponse = '<iq type="result" id="741-109" from="openlink.btp072883" to="trader1@btp072883/TestHarness">' +
        '<command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-profiles" status="completed">' +
        '<iodata xmlns="urn:xmpp:tmp:io-data" type="output">' +
        '<out>' +
        '<profiles xmlns="http://xmpp.org/protocol/openlink:01:00:00/profiles">' +
        '<profile id="UCTrader1-trader1@btsm11" label="7001" default="true" online="true" device="uta">' +
        '<site id="11" type="BTSM" default="true">itrader-dev-sm-5</site>' +
        '<actions>' +
        '<action id="AnswerCall" label="Answers an alerting call on active profile device"/>' +
        '<action id="ClearCall" label="Clears the call"/>' +
        '<action id="ClearConnection" label="Clear this participant connection from active call or conference"/>' +
        '<action id="HoldCall" label="Place a call on hold"/>' +
        '<action id="RetrieveCall" label="Re-connect a held call"/>' +
        '<action id="JoinCall" label="Join a connected or conferenced call"/>' +
        '<action id="PrivateCall" label="Makes the active call private. Other users cannot join"/>' +
        '<action id="PublicCall" label="Makes the active private call public for other users to join"/>' +
        '<action id="StartVoiceDrop" label="Starts playing a pre-recorded voice message or playlist into the active call"/>' +
        '<action id="TransferCall" label=" Completes a transfer started with ConsultationCall. Releases the active profile device from the call."/>' +
        '<action id="SingleStepTransfer" label="Single Step transfer"/>' +
        '<action id="SendDigits" label="Causes dial digits to be sent on an originated call on the active device"/>' +
        '<action id="SendDigit" label="Send Digit"/>' +
        '<action id="ConsultationCall" label="Consultation Call"/>' +
        '</actions>' +
        '</profile>' +
        '</profiles>' +
        '</out>' +
        '</iodata>' +
        '<note type="error" from="cisco3.btp072883" errorType="auth" errorCondition="forbidden">cisco3.btp072883: auth: forbidden: null</note>' +
        '<note>Voice Drop Server Not Reachable : vmstsp.itrader-dev-sm-2.btlabs.bt.co.uk</note>' +
        '</command>' +
        '</iq>';

    test('GetProfilesResponse will not change the XML', function () {
        var iq = new $.openlink.stanza(getProfilesResponse);

        equal(iq.toXml(), getProfilesResponse);
    });

    test('GetProfilesResponse can be parsed', function () {
        var stanza = new $.openlink.stanza(getProfilesResponse);

        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'openlink.btp072883');
        equal(stanza.getId(), '741-109');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');

        var profiles = stanza.getProfiles();
        equal(profiles.length, 1);

        var profile1 = profiles[0];
        equal(profile1.id, "UCTrader1-trader1@btsm11");
        equal(profile1.label, "7001");
        equal(profile1.default, true);
        equal(profile1.online, true);
        equal(profile1.device,  "uta");
        equal(profile1.isVMS,  false);
        equal(profile1.site.id, 11);
        equal(profile1.site.name, "itrader-dev-sm-5");
        equal(profile1.site.type, "BTSM");
        equal(profile1.site.default, true);

        var notes = stanza.getNotes();
        equal(notes.length, 2);

        var note1 = notes[0];
        equal(note1.type, "error");
        equal(note1.from, "cisco3.btp072883");
        equal(note1.errorType, "auth");
        equal(note1.errorCondition, "forbidden");
        equal(note1.text, "cisco3.btp072883: auth: forbidden: null");

        var note2 = notes[1];
        equal(note2.type, undefined);
        equal(note2.from, undefined);
        equal(note2.errorType, undefined);
        equal(note2.errorCondition, undefined);
        equal(note2.text, "Voice Drop Server Not Reachable : vmstsp.itrader-dev-sm-2.btlabs.bt.co.uk");

    });

    test('GetProfilesResponse from just VMS can be parsed', function () {
        var vmsOnlyResponse = "<iq to='adastralfour@collab.sbsetupbt.com/TestHarness' from='openlink.collab.sbsetupbt.com' id='P4nqkm-8' type='result'>\n" +
            "<command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-profiles' status='completed'>\n" +
            "<iodata xmlns=\"urn:xmpp:tmp:io-data\" type=\"output\">\n" +
            "<out>\n" +
            "<profiles xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/profiles\">\n" +
            "<profile id=\"adastralfour_myprofile\" default=\"true\" online=\"true\" device=\"asterisk\">\n" +
            "<actions>\n" +
            "<action id=\"ClearConnection\" label=\"ClearConnection\"/>\n" +
            "<action id=\"ClearCall\" label=\"ClearCall\"/>\n" +
            "<action id=\"AddThirdParty\" label=\"AddThirdParty\"/>\n" +
            "<action id=\"RemoveThirdParty\" label=\"RemoveThirdParty\"/>\n" +
            "<action id=\"StartVoiceDrop\" label=\"StartVoiceDrop\"/>\n" +
            "<action id=\"StopVoiceDrop\" label=\"StopVoiceDrop\"/>\n" +
            "<action id=\"JoinCall\" label=\"JoinCall\"/>\n" +
            "<action id=\"SendDigit\" label=\"SendDigit\"/>\n" +
            "</actions>\n" +
            "</profile>\n" +
            "</profiles>\n" +
            "</out>\n" +
            "</iodata>\n" +
            "</command>\n" +
            "</iq>";

        var stanza = new $.openlink.stanza(vmsOnlyResponse);

        equal(stanza.getTo(), 'adastralfour@collab.sbsetupbt.com/TestHarness');
        equal(stanza.getFrom(), 'openlink.collab.sbsetupbt.com');
        equal(stanza.getId(), 'P4nqkm-8');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');

        var profiles = stanza.getProfiles();
        equal(profiles.length, 1);

        var profile1 = profiles[0];
        equal(profile1.id, "adastralfour_myprofile");
        equal(profile1.default, true);
        equal(profile1.online, true);
        equal(profile1.device,  "asterisk");
        equal(profile1.isVMS, true);
        equal(profile1.site, undefined);

    });

    test('A second profile from a GetProfilesResponse without a site can be parsed', function () {
        var responseWithoutSite = "<iq to='adastralfour@collab.sbsetupbt.com/TestHarness' from='openlink.collab.sbsetupbt.com' id='P4nqkm-8' type='result'>\n" +
            "<command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-profiles' status='completed'>\n" +
            "<iodata xmlns=\"urn:xmpp:tmp:io-data\" type=\"output\">\n" +
            "<out>\n" +
            "<profiles xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/profiles\">\n" +
            '<profile id="UCTrader1-trader1@btsm11" label="7001" default="true" online="true" device="uta">' +
            '<site id="11" type="BTSM" default="true">itrader-dev-sm-5</site>' +
            '<actions>' +
            '<action id="AnswerCall" label="Answers an alerting call on active profile device"/>' +
            '<action id="ClearCall" label="Clears the call"/>' +
            '<action id="ClearConnection" label="Clear this participant connection from active call or conference"/>' +
            '<action id="HoldCall" label="Place a call on hold"/>' +
            '<action id="RetrieveCall" label="Re-connect a held call"/>' +
            '<action id="JoinCall" label="Join a connected or conferenced call"/>' +
            '<action id="PrivateCall" label="Makes the active call private. Other users cannot join"/>' +
            '<action id="PublicCall" label="Makes the active private call public for other users to join"/>' +
            '<action id="StartVoiceDrop" label="Starts playing a pre-recorded voice message or playlist into the active call"/>' +
            '<action id="TransferCall" label=" Completes a transfer started with ConsultationCall. Releases the active profile device from the call."/>' +
            '<action id="SingleStepTransfer" label="Single Step transfer"/>' +
            '<action id="SendDigits" label="Causes dial digits to be sent on an originated call on the active device"/>' +
            '<action id="SendDigit" label="Send Digit"/>' +
            '<action id="ConsultationCall" label="Consultation Call"/>' +
            '</actions>' +
            '</profile>' +
            "<profile id=\"adastralfour_myprofile\" default=\"true\" online=\"true\" device=\"asterisk\">\n" +
            "<actions>\n" +
            "<action id=\"ClearConnection\" label=\"ClearConnection\"/>\n" +
            "<action id=\"ClearCall\" label=\"ClearCall\"/>\n" +
            "<action id=\"AddThirdParty\" label=\"AddThirdParty\"/>\n" +
            "<action id=\"RemoveThirdParty\" label=\"RemoveThirdParty\"/>\n" +
            "<action id=\"StartVoiceDrop\" label=\"StartVoiceDrop\"/>\n" +
            "<action id=\"StopVoiceDrop\" label=\"StopVoiceDrop\"/>\n" +
            "<action id=\"JoinCall\" label=\"JoinCall\"/>\n" +
            "<action id=\"SendDigit\" label=\"SendDigit\"/>\n" +
            "</actions>\n" +
            "</profile>\n" +
            "</profiles>\n" +
            "</out>\n" +
            "</iodata>\n" +
            "</command>\n" +
            "</iq>";

        var stanza = new $.openlink.stanza(responseWithoutSite);
        var profiles = stanza.getProfiles();

        var i = 0;
        var profile = profiles[i++];
        equal(profile.id, "UCTrader1-trader1@btsm11");
        equal(profile.label, "7001");
        equal(profile.default, true);
        equal(profile.online, true);
        equal(profile.device,  "uta");
        equal(profile.isVMS, false);
        equal(profile.site.id, 11);
        equal(profile.site.name, "itrader-dev-sm-5");
        equal(profile.site.type, "BTSM");
        equal(profile.site.default, true);

        profile = profiles[i++];
        equal(profile.id, "adastralfour_myprofile");
        equal(profile.label, undefined);
        equal(profile.default, true);
        equal(profile.online, true);
        equal(profile.device,  "asterisk");
        equal(profile.isVMS, true);
        equal(profile.site, undefined);

        equal(profiles.length, i);

    });

    test('GetProfilesResponse from a new VMS is recognised', function () {
        var vmsOnlyResponse = "<iq to='adastralfour@collab.sbsetupbt.com/TestHarness' from='openlink.collab.sbsetupbt.com' id='P4nqkm-8' type='result'>\n" +
            "<command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-profiles' status='completed'>\n" +
            "<iodata xmlns=\"urn:xmpp:tmp:io-data\" type=\"output\">\n" +
            "<out>\n" +
            "<profiles xmlns=\"http://xmpp.org/protocol/openlink:01:00:00/profiles\">\n" +
            "<profile id=\"adastralfour_myprofile\" default=\"true\" online=\"true\" device=\"vmstsp\">\n" +
            "<actions>\n" +
            "<action id=\"ClearConnection\" label=\"ClearConnection\"/>\n" +
            "<action id=\"ClearCall\" label=\"ClearCall\"/>\n" +
            "<action id=\"AddThirdParty\" label=\"AddThirdParty\"/>\n" +
            "<action id=\"RemoveThirdParty\" label=\"RemoveThirdParty\"/>\n" +
            "<action id=\"StartVoiceDrop\" label=\"StartVoiceDrop\"/>\n" +
            "<action id=\"StopVoiceDrop\" label=\"StopVoiceDrop\"/>\n" +
            "<action id=\"JoinCall\" label=\"JoinCall\"/>\n" +
            "<action id=\"SendDigit\" label=\"SendDigit\"/>\n" +
            "</actions>\n" +
            "</profile>\n" +
            "</profiles>\n" +
            "</out>\n" +
            "</iodata>\n" +
            "</command>\n" +
            "</iq>";

        var stanza = new $.openlink.stanza(vmsOnlyResponse);

        var profiles = stanza.getProfiles();
        var profile = profiles[0];
        equal(profile.isVMS, true);
    });


}(jQuery));
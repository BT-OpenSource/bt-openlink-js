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

    module('iq.GetInterests');

    test('GetInterestsRequest will generate unique a stanza id', function () {
        var getInterests1 = new $.openlink.GetInterestsRequest();
        var getInterests2 = new $.openlink.GetInterestsRequest();
        notEqual(getInterests1.getId(), getInterests2.getId());
    });

    test('GetInterestsRequest will build a stanza for the connected user', function () {
        var getInterests = new $.openlink.GetInterestsRequest("test-profile-id");
        var expected = '<iq type="set" id="' + getInterests.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#get-interests" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input"><in><profile>test-profile-id</profile></in></iodata></command></iq>';
        equal(getInterests.toXml(), expected);
    });

    var getInterestsResponse = "<iq to='trader1@btp072883/TestHarness' from='btsessionmanager11.btp072883' id='usG49S-2' type='result'>\n" +
        "   <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#get-interests' status='completed'>\n" +
        "       <iodata xmlns='urn:xmpp:tmp:io-data' type='output'>\n" +
        "           <out>\n" +
        "               <interests xmlns='http://xmpp.org/protocol/openlink:01:00:00/interests'>\n" +
        "                   <interest id='sip:1000@uta.bt.com-InternalConference-1trader1@btsm11' type='InternalConference' label='IC' value='trader1' maxCalls='3'>\n" +
        "                       <callstatus xmlns='http://xmpp.org/protocol/openlink:01:00:00#call-status' busy='false'>\n" +
        "                       <call>\n" +
        "                       <id>1162919591-sip:6002@uta.bt.com-DirectDial-1trader1@btsm11</id>\n" +
        "                       <site type='BTSESSIONMANAGER'>itrader-dev-sm-5</site>\n" +
        "                       <profile>UCTrader1-trader1@btsm11</profile>\n" +
        "                       <eventTimestamps>\n" +
        "                       <switch>1449049795743</switch>\n" +
        "                       <received>1449049794398</received>\n" +
        "                       <published>1449049794573</published>\n" +
        "                       </eventTimestamps>\n" +
        "                       <interest>sip:6002@uta.bt.com-DirectDial-1trader1@btsm11</interest>\n" +
        "                       <changed>State</changed>\n" +
        "                       <state>CallBusy</state>\n" +
        "                       <direction>Incoming</direction>\n" +
        "                       <caller>\n" +
        "                           <number>6001</number>\n" +
        "                           <name>6001</name>\n" +
        "                       </caller>\n" +
        "                       <called>\n" +
        "                           <number>6002</number>\n" +
        "                           <name>6002/1</name>\n" +
        "                       </called>\n" +
        "                       <duration>75884</duration>\n" +
        "                       <actions>\n" +
        "                           <JoinCall/>\n" +
        "                       </actions>\n" +
        "                       </call>\n" +
        "                       </callstatus>\n" +
        "                   </interest>\n" +
        "                   <interest id='sip:6001@uta.bt.com-DirectDial-1trader1@btsm11' type='DirectoryNumber' label='6001/1' value='trader1' default='true'/>\n" +
        "                   <interest id='sip:6001@uta.bt.com-DirectDial-2trader1@btsm11' type='DirectoryNumber' label='6001/2' value='trader1' default='true'/>\n" +
        "                   <interest id='sip:6002@uta.bt.com-DirectDial-1trader1@btsm11' type='DirectoryNumber' label='6002/1' value='trader1'/>\n" +
        "                   <interest id='sip:6002@uta.bt.com-DirectDial-2trader1@btsm11' type='DirectoryNumber' label='6002/2' value='trader1'/>\n" +
        "               </interests>\n" +
        "           </out>\n" +
        "       </iodata>\n" +
        "   </command>\n" +
        "</iq>";

    test('GetInterestsResponse will not change the XML', function () {
        var stanza = new $.openlink.stanza(getInterestsResponse);

        equal(stanza.toXml(), getInterestsResponse);
    });

    test('GetInterestsResponse can be parsed', function () {
        var stanza = new $.openlink.stanza(getInterestsResponse);

        equal(stanza.getTo(), 'trader1@btp072883/TestHarness');
        equal(stanza.getFrom(), 'btsessionmanager11.btp072883');
        equal(stanza.getId(), 'usG49S-2');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');

        var interests = stanza.getInterests();
        equal(interests.length, 5);

        propEqual(interests[0], {
            id: 'sip:1000@uta.bt.com-InternalConference-1trader1@btsm11',
            type: 'InternalConference',
            label: 'IC',
            value: 'trader1',
            default: false,
            maxCalls: 3
        });
        propEqual(interests[1], {
            id: 'sip:6001@uta.bt.com-DirectDial-1trader1@btsm11',
            type: 'DirectoryNumber',
            label: '6001/1',
            value: 'trader1',
            default: true,
            maxCalls: undefined
        });
        propEqual(interests[2], {
            id: 'sip:6001@uta.bt.com-DirectDial-2trader1@btsm11',
            type: 'DirectoryNumber',
            label: '6001/2',
            value: 'trader1',
            default: true,
            maxCalls: undefined
        });
        propEqual(interests[3], {
            id: 'sip:6002@uta.bt.com-DirectDial-1trader1@btsm11',
            type: 'DirectoryNumber',
            label: '6002/1',
            value: 'trader1',
            default: false,
            maxCalls: undefined
        });
        propEqual(interests[4], {
            id: 'sip:6002@uta.bt.com-DirectDial-2trader1@btsm11',
            type: 'DirectoryNumber',
            label: '6002/2',
            value: 'trader1',
            default: false,
            maxCalls: undefined
        });

    });
    
}(jQuery));
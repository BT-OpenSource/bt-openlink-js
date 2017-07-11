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

    module('iq.ManageInterests');

    test('ManageInterestsRequest will generate unique a stanza id', function () {
        var manageInterests1 = new $.openlink.ManageInterestsRequest();
        var manageInterests2 = new $.openlink.ManageInterestsRequest();
        notEqual(manageInterests1.getId(), manageInterests2.getId());
    });

    test('ManageInterestsRequest will build a stanza for the connected user', function () {
        var manageInterests = new $.openlink.ManageInterestsRequest("Allocate", "Indefinite");
        var expected = '<iq type="set" id="' + manageInterests.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-interests" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
            '<in><jid>' + $.openlink.getUserJid() + '</jid><action>Allocate</action><lease>Indefinite</lease></in></iodata></command></iq>';
        equal(manageInterests.toXml(), expected);
    });

    test('ManageInterestsRequest will build a stanza for another user', function () {
        var manageInterests = new $.openlink.ManageInterestsRequest("Allocate", "Indefinite");
        manageInterests = manageInterests.forUser("another-user@test-domain");
        var expected = '<iq type="set" id="' + manageInterests.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-interests" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
            '<in><jid>another-user@test-domain</jid><action>Allocate</action><lease>Indefinite</lease></in></iodata></command></iq>';
        equal(manageInterests.toXml(), expected);
    });

    test('ManageInterestsRequest will build a stanza for a line number', function () {
        var manageInterests = new $.openlink.ManageInterestsRequest("Allocate", "Indefinite");
        manageInterests = manageInterests.forNumber("3132");
        var expected = '<iq type="set" id="' + manageInterests.getId() + '" to="' + $.openlink.getOpenlinkJid() + '"><command xmlns="http://jabber.org/protocol/commands" node="http://xmpp.org/protocol/openlink:01:00:00#manage-interests" action="execute"><iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
            '<in><jid>' + $.openlink.getUserJid() + '</jid><action>Allocate</action><lease>Indefinite</lease><number>3132</number></in></iodata></command></iq>';
        equal(manageInterests.toXml(), expected);
    });

    var manageInterestsResponse = "<iq from='openlink.shakespeare.lit' id='manage-interests-1' to='user.agent@shakespeare.lit/globe' type='result' xml:lang='en'>" +
        "   <command xmlns='http://jabber.org/protocol/commands' node='http://xmpp.org/protocol/openlink:01:00:00#manage-interests' status='completed'>" +
        "       <iodata xmlns='urn:xmpp:tmp:io-data' type='output'>" +
        "           <out>" +
        "               <interests xmlns='http://xmpp.org/protocol/openlink:01:00:00/interests'>" +
        '	                <interest id="alan.trader_673456" type="DirectoryNumber" label="Extension 673456" value="673456" />' +
        " 	            </interests>" +
        "           </out>" +
        "       </iodata>" +
        "   </command>" +
        " </iq> ";

    test('ManageInterestsResponse will not change the XML', function () {
        var stanza = new $.openlink.stanza(manageInterestsResponse);

        equal(stanza.toXml(), manageInterestsResponse);
    });

    test('ManageInterestsResponse can be parsed', function () {
        var stanza = new $.openlink.stanza(manageInterestsResponse);

        equal(stanza.getTo(), 'user.agent@shakespeare.lit/globe');
        equal(stanza.getFrom(), 'openlink.shakespeare.lit');
        equal(stanza.getId(), 'manage-interests-1');
        equal(stanza.getStanzaType(), 'iq');
        equal(stanza.isResult(), true);
        equal(stanza.getType(), 'result');
        equal(stanza.getChildElement().nodeName, 'command');

        var interest = stanza.getInterest();
        propEqual(interest, {
            id: 'alan.trader_673456',
            type: 'DirectoryNumber',
            label: 'Extension 673456',
            value: '673456'
        });
    });

}(jQuery));
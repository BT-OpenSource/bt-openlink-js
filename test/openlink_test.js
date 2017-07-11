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

    module('openlink.connect');

    test('check mandatory options', function () {
        throws(function () {
            $.openlink.connect("ws://server:7070", {});
        }, /Required option/);
    });

    module('logging');
    test('A log request will fail if not connected', function () {
        throws(function () {
            $.openlink.log("some message");
        });
    });

    //test('A log request will encode the request and send it over the WebSocket', function () {
    //    // See https://github.com/jakerella/jquery-mockjax for mocking
    //    $.openlink.log("some message <maybe with tags>");
    //});

    module('General stanza parsing');
    test('Will parse a string that is not a stanza', function () {
        var stanzaXml = 'this-is-not-a-stanza';
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), undefined);
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), undefined);
        equal(stanza.getType(), undefined);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), undefined);
    });
    test('Will parse an unrecognised stanza', function () {
        var stanzaXml = '<somexml></somexml>';
        var stanza = new $.openlink.stanza(stanzaXml);
        equal(stanza.getTo(), undefined);
        equal(stanza.getFrom(), undefined);
        equal(stanza.getId(), undefined);
        equal(stanza.getType(), undefined);
        equal(stanza.toXml(), stanzaXml);
        equal(stanza.getStanzaType(), undefined);
        equal(stanza.getChildElement(), undefined);
    });

}(jQuery));

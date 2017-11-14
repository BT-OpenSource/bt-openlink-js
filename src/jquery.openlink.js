/*
 * BT Openlink JavaScript API
 * https://www.bt.com/unifiedtrading
 * Copyright (c) 2017 BT
 */
 (function ($) {
    "use strict";
    $.openlink = (function () {

        var isDefined = function (thingToCheck) {
            return typeof thingToCheck !== 'undefined';
        };

        var isFunction = function (thingToCheck) {
            return typeof thingToCheck === 'function';
        };

        var isString = function (thingToCheck) {
            return typeof thingToCheck === 'string';
        };

        var isNumber = function (thingToCheck) {
            return typeof thingToCheck === 'number' && !isNaN(thingToCheck);
        };

        var isObject = function (thingToCheck) {
            return typeof thingToCheck === 'object';
        };

        /*
         *********************************************
         *********************************************
         *********************************************
         *********************************************
         * This section covers the I/O -
         * i.e. connecting/disconnecting/sending/receiving packets
         *********************************************
         *********************************************
         *********************************************
         *********************************************
         */
        var checkOptionsPresent = function (optionsToCheck, requiredOptions) {
            var arrayLength = requiredOptions.length;
            for (var i = 0; i < arrayLength; i++) {
                var requiredOption = requiredOptions[i];
                if (!(requiredOptions[i] in optionsToCheck)) {
                    throw "Required option '" + requiredOption + "' not supplied";
                }
            }
        };

        // Contains the map of packet-ids to callbacks
        var callbacks;
        // Contains the normalised timeout value
        var timeout;
        // The various JIDs we need to communicate to/from
        var userJid, openlinkJid, pubsubJid;

        var connect = function (server, options) {

            var urlParser = document.createElement('a');
            urlParser.href = server;
            var normalisedServer = urlParser.protocol + "//" + urlParser.host;
            // Add a default timeout value if necessary
            if (isNumber(options.timeout)) {
                timeout = options.timeout;
            } else {
                timeout = 5000;
            }

            connectToOpenfire(normalisedServer, options);
        };

        var processXmppMessage = function (xmppMessage, onMessage) {
            var stanza = stanzaParser(xmppMessage);
            var id;
            if (isFunction(stanza.getId)) {
                id = stanza.getId();
            }
            if (id in callbacks) {
                var callback = callbacks[id];
                delete callbacks[id];
                if (isFunction(callback.responseHandler)) {
                    callback.responseHandler(stanza);
                }
            } else {
                onMessage(stanza);
            }
        };

        var connectToOpenfire = function (server, options) {

            checkOptionsPresent(options, ['opened', 'closed', 'failed', 'username', 'password', 'resource', 'message']);

            // Contains the Strophe XMPP client, used when connecting to new versions of Openfire
            var client;
            var loggedIn = false;
            var loggedOut = false;
            var authFailed = false;
            callbacks = {};

            isConnected = function () {
                return isObject(client) && isObject(client.transport) && isObject(client.transport.conn) && WebSocket.OPEN === client.transport.conn.readyState;
            };
            sendPacket = function (dataToSend) {
                client.send(dataToSend);
            };
            disconnectFromServer = function (code, reason) {
                if (isConnected()) {
                    loggedOut = true;
                    client.disconnect(code, reason);
                }
            };

            var urlParser = document.createElement('a');
            urlParser.href = server;
            var normalisedServer = urlParser.protocol + "//" + urlParser.host;
            var wsEndpoint = normalisedServer + "/ws/";
            var jid = options.username;
            if (jid.indexOf("@") === -1) {
                jid += "@";
            }

            client = XMPP.createClient({
                jid: jid,
                password: options.password,
                resource: options.resource,
                wsURL: wsEndpoint,
                transports: ['websocket']
            });

            client.on('auth:failed', function () {
                authFailed = true;
                options.failed('Incorrect credentials');
            });

            client.on('disconnected', function () {
                if (loggedIn) {
                    options.closed(loggedOut);
                } else if (!authFailed) {
                    options.failed('Unable to connect to server at ' + wsEndpoint);
                }
            });

            client.on('session:started', function (jid) {
                client.getRoster(function () {
                    loggedIn = true;
                    client.sendPresence();
                });
                userJid = jid.bare;
                pubsubJid = 'pubsub.' + jid.domain;
                openlinkJid = 'openlink.' + jid.domain;
                options.opened({
                    loggedInUser: jid.full,
                    pubsub: pubsubJid,
                    openlink: openlinkJid
                });
            });

            client.on('*', function (eventType, message) {
                if (eventType !== 'raw:incoming') {
                    console.log(eventType, message);
                }
            });

            client.on('raw:incoming', function (message) {
                if (loggedIn && !loggedOut) {
                    processXmppMessage(message, options.message);
                }
            });

            client.connect();
        };

        var isConnected;
        var sendPacket;
        var disconnectFromServer;

        var assertConnected = function () {
            if (!isConnected()) {
                throw "Must be connected";
            }
        };

        var disconnect = function () {
            disconnectFromServer();
        };

        var getUserJid = function () {
            assertConnected();
            return userJid;
        };

        var getOpenlinkJid = function () {
            assertConnected();
            return openlinkJid;
        };

        var getPubsubJid = function () {
            assertConnected();
            return pubsubJid;
        };

        var send = function (packet, responseHandler, timeoutHandler, sendTimeout) {
            assertConnected();
            var responseExpected = isFunction(packet.getId) && isDefined(packet.getId()) &&
                isFunction(packet.getStanzaType) && packet.getStanzaType() === 'iq' &&
                isFunction(packet.getType) && (packet.getType() === 'get' || packet.getType() === 'set') &&
                isFunction(responseHandler);
            if (responseExpected) {
                var id = packet.getId();
                if (id in callbacks) {
                    throw 'A packet with id "' + id + '" has already sent without a response being received';
                }
                callbacks[id] = {
                    responseHandler: responseHandler,
                    timeoutHandler: timeoutHandler
                };
                var callbackTimeout;
                if (isNumber(sendTimeout)) {
                    callbackTimeout = sendTimeout;
                } else {
                    callbackTimeout = timeout;
                }
                setTimeout(function () {
                    if (id in callbacks) {
                        var callback = callbacks[id];
                        delete callbacks[id];
                        if (isFunction(callback.timeoutHandler)) {
                            callback.timeoutHandler(id);
                        }
                    }
                }, callbackTimeout);
            }
            var dataToSend;
            if (isFunction(packet.toXml)) {
                dataToSend = packet.toXml();
            } else {
                dataToSend = packet.toString();
            }
            sendPacket(dataToSend);
        };

        /*
         *********************************************
         *********************************************
         *********************************************
         *********************************************
         * This section covers creation and parsing of
         * Openlink stanzas
         *********************************************
         *********************************************
         *********************************************
         *********************************************
         */
        // Generate a random base for the packet-id
        var idChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var idRoot = "";
        for (var i = 0; i < 6; i++) {
            idRoot += idChars.charAt(Math.floor(Math.random() * idChars.length));
        }
        idRoot += "-";
        var packetCount = 1;
        var getNextId = function () {
            return idRoot + (packetCount++);
        };

        var xmlEscape = function (stringToEscape) {
            return $('<div/>').text(stringToEscape).html();
        };

        var getAttributeValue = function (element, attributeName) {
            if (isObject(element) && isObject(element.attributes)) {
                var node = element.attributes[attributeName];
                if (isObject(node)) {
                    return node.nodeValue;
                }
            }
        };

        var getFirstChildElement = function (element) {
            var allChildren = getChildElements(element);
            if (allChildren.length > 0) {
                return allChildren[0];
            }
        };

        var getChildElementTextContent = function (element, elementName) {
            var childElement = getChildElementByElementName(element, elementName);
            if (isObject(childElement)) {
                return childElement.textContent;
            }
        };

        var getChildElementNumberContent = function (element, elementName) {
            var textValue = getChildElementTextContent(element, elementName);
            if (isString(textValue) && $.trim(textValue).length > 0) {
                var numberValue = +textValue;
                if (!isNaN(numberValue)) {
                    return numberValue;
                }
            }
        };

        var getChildElement = function (element) {
            var allChildren = getChildElements(element);
            if (allChildren.length === 1) {
                return allChildren[0];
            }
        };

        var getChildElements = function (element) {
            var children = [];
            if (isObject(element) && isObject(element.firstElementChild)) {
                var child = element.firstElementChild;
                while (child !== null) {
                    children.push(child);
                    child = child.nextElementSibling;
                }
            }
            return children;
        };

        var getChildElementsByElementName = function (element, elementName) {
            var allChildren = getChildElements(element);
            var allChildrenCount = allChildren.length;
            var children = [];
            for (var i = 0; i < allChildrenCount; i++) {
                var child = allChildren[i];
                if (child.nodeName === elementName) {
                    children.push(child);
                }
            }
            return children;
        };

        var getChildElementByElementName = function (element, tagName) {
            var allChildren = getChildElementsByElementName(element, tagName);
            if (allChildren.length === 1) {
                return allChildren[0];
            }
        };

        /*
         *********************************************
         *********************************************
         * A generic Stanza packet
         *********************************************
         *********************************************
         */
        function Stanza(xml, packetTo, packetFrom, id, packetType, childElement) {
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = packetType;
            this.childElement = childElement;
        }

        Stanza.prototype.toXml = function () {
            return this.xml;
        };
        Stanza.prototype.getStanzaType = function () {
            return this.stanzaType;
        };
        Stanza.prototype.getTo = function () {
            return this.to;
        };
        Stanza.prototype.getFrom = function () {
            return this.from;
        };
        Stanza.prototype.getId = function () {
            return this.id;
        };
        Stanza.prototype.getType = function () {
            return this.type;
        };
        Stanza.prototype.isResult = function () {
            return 'result' === this.type;
        };
        Stanza.prototype.isError = function () {
            return 'error' === this.type;
        };
        Stanza.prototype.getChildElement = function () {
            return this.childElement;
        };


        /*
         *********************************************
         *********************************************
         * A generic presence packet
         *********************************************
         *********************************************
         */
        function Presence(xml, packetTo, packetFrom, id, packetType, childElement) {
            this.stanzaType = "presence";
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = packetType;
            this.childElement = childElement;
        }

        Presence.prototype = new Stanza();
        Presence.prototype.constructor = Presence;

        /*
         *********************************************
         *********************************************
         * A generic message packet
         *********************************************
         *********************************************
         */
        function Message(xml, packetTo, packetFrom, id, packetType, childElement) {
            this.stanzaType = "message";
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = packetType;
            this.childElement = childElement;
        }

        Message.prototype = new Stanza();
        Message.prototype.constructor = Presence;

        /*
         *********************************************
         *********************************************
         * A generic IQ packet
         *********************************************
         *********************************************
         */
        function Iq(xml, packetTo, packetFrom, id, packetType, childElement) {
            this.stanzaType = "iq";
            this.notes = [];
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = packetType;
            this.childElement = childElement;
        }

        Iq.prototype = new Stanza();
        Iq.prototype.constructor = Iq;
        Iq.prototype.getNotes = function () {
            return this.notes;
        };

        var parseIqCommand = function (xml, packetTo, packetFrom, id, packetType, commandElement) {
            var node = getAttributeValue(commandElement, 'node');
            var parserCount = commandPacketTypes.length;
            for (var i = 0; i < parserCount; i++) {
                var packet = commandPacketTypes[i];
                if (packet.namespace === node && packet.type === packetType) {
                    return new packet.constructor(xml, packetTo, packetFrom, id, packetType, commandElement);
                }
            }
            // If we've not already returned something, just return the generic IQ stanza
            return new Iq(xml, packetTo, packetFrom, id, packetType, commandElement);
        };

        var stanzaParser = function (xml) {
            // All packets have the following
            var to, from, id, type;
            // Try to parse the xml
            var xmlDoc, childElement;
            try {
                xmlDoc = $.parseXML(xml);
                childElement = getFirstChildElement(xmlDoc.documentElement);
            } catch (error) {
                // Do nothing; we just want to not abort out at this point
            }
            if (isObject(xmlDoc) && isObject(xmlDoc.documentElement)) {
                var rootElement = xmlDoc.documentElement;
                to = getAttributeValue(rootElement, 'to');
                from = getAttributeValue(rootElement, 'from');
                id = getAttributeValue(rootElement, 'id');
                type = getAttributeValue(rootElement, 'type');
                switch (rootElement.nodeName) {
                    case 'presence':
                        return new Presence(xml, to, from, id, type, childElement);
                    case 'iq':
                        return iqParser(xml, to, from, id, type, rootElement);
                    case 'message':
                        return messageParser(xml, to, from, id, type, rootElement);
                }
            }
            // If we've not had an answer, return the default
            return new Stanza(xml, to, from, id, type, childElement);
        };

        var messageParser = function (xml, to, from, id, type, rootElement) {
            var eventElement = getChildElement(rootElement);
            var itemsElement = getChildElement(eventElement);
            var itemElement = getChildElement(itemsElement);
            var callStatusElements = getChildElementsByElementName(itemElement, 'callstatus');
            if (callStatusElements.length > 0) {
                return new CallStatusMessage(xml, eventElement, to, from, id, type, callStatusElements);
            }
            // If we've not already returned something, just return the generic IQ stanza
            return new Message(xml, to, from, id, type, eventElement);
        };

        var iqParser = function (xml, to, from, id, type, rootElement) {
            var childElement;
            if (type === 'error') {
                childElement = getChildElementByElementName(rootElement, 'error');
            } else {
                childElement = getFirstChildElement(rootElement);
            }
            if (isObject(childElement)) {
                var parsedMessage;
                switch (childElement.nodeName) {
                    case 'command':
                        parsedMessage = parseIqCommand(xml, to, from, id, type, childElement);
                        break;
                    case 'error':
                        parsedMessage = new IqError(xml, to, from, id, type, childElement);
                        break;
                    case 'ping':
                        parsedMessage = new IqPingRequest(xml, to, from, id);
                        break;
                    case 'bind':
                        parsedMessage = parseIqBind(xml, to, from, id, type, childElement);
                        break;
                    default:
                        parsedMessage = new Iq(xml, to, from, id, type, childElement);
                }
                // Do we have any notes?
                parsedMessage.notes = [];
                var noteElements = getChildElementsByElementName(getFirstChildElement(rootElement), 'note');
                var noteCount = noteElements.length;
                for (var j = 0; j < noteCount; j++) {
                    var noteElement = noteElements[j];
                    var noteType = getAttributeValue(noteElement, "type");
                    var noteFrom = getAttributeValue(noteElement, "from");
                    var noteErrorType = getAttributeValue(noteElement, "errorType");
                    var noteErrorCondition = getAttributeValue(noteElement, "errorCondition");
                    var noteText = noteElement.textContent;
                    parsedMessage.notes.push({
                        type: noteType,
                        from: noteFrom,
                        errorType: noteErrorType,
                        errorCondition: noteErrorCondition,
                        text: noteText
                    });
                }

                return parsedMessage;
            }
            // If we've not already returned something, just return the generic IQ stanza
            return new Iq(xml, to, from, id, type, childElement);
        };
        /*
         *********************************************
         *********************************************
         * An IQ error packet
         *********************************************
         *********************************************
         */
        function IqError(xml, packetTo, packetFrom, id, packetType, errorElement) {
            this.xml = xml;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            this.xmppErrorType = getAttributeValue(errorElement, 'type');
            // Find the first child element
            var errorConditionElement = getFirstChildElement(errorElement);
            if (isObject(errorConditionElement)) {
                this.xmppErrorCondition = errorConditionElement.nodeName;
                this.xmppErrorText = errorConditionElement.nodeName;
            }

            // And any text element
            var textContent = getChildElementTextContent(errorElement, 'text');
            if (isDefined(textContent)) {
                // Replace the error text with the more specific information
                this.xmppErrorText = textContent;
            }
        }

        IqError.prototype = new Iq();
        IqError.prototype.constructor = IqError;
        IqError.prototype.getXmppErrorType = function () {
            return this.xmppErrorType;
        };
        IqError.prototype.getXmppErrorCondition = function () {
            return this.xmppErrorCondition;
        };
        IqError.prototype.getXmppErrorText = function () {
            return this.xmppErrorText;
        };

        /*
         *********************************************
         *********************************************
         * An IQ ping request
         *********************************************
         *********************************************
         */
        function IqPingRequest(xml, packetTo, packetFrom, id) {
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = 'get';
        }

        IqPingRequest.prototype = new Iq();
        IqPingRequest.prototype.constructor = IqPingRequest;

        /*
         *********************************************
         *********************************************
         * IQ binds
         *********************************************
         *********************************************
         */
        var parseIqBind = function (xml, packetTo, packetFrom, id, packetType, childElement) {
            switch (packetType) {
                case 'result':
                    return new IqBindResult(xml, packetTo, packetFrom, id, childElement);
                default:
                    return new Iq(xml, packetTo, packetFrom, id, packetType, childElement);
            }
        };

        function IqBindResult(xml, packetTo, packetFrom, id, childElement) {
            this.xml = xml;
            this.to = packetTo;
            this.from = packetFrom;
            this.id = id;
            this.type = 'result';
            this.boundJid = getChildElementTextContent(childElement, "jid");
        }

        IqBindResult.prototype = new Iq();
        IqBindResult.prototype.constructor = IqBindResult;
        IqBindResult.prototype.getBoundJid = function () {
            return this.boundJid;
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-profiles request packet
         *********************************************
         *********************************************
         */
        var getProfilesNamespace = 'http://xmpp.org/protocol/openlink:01:00:00#get-profiles';

        function GetProfilesRequest() {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.userJid = $.openlink.getUserJid();
            return this;
        }

        GetProfilesRequest.prototype = new Iq();
        GetProfilesRequest.prototype.constructor = GetProfilesRequest;

        GetProfilesRequest.prototype.forUser = function (userJid) {
            this.userJid = userJid;
            return this;
        };

        GetProfilesRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getProfilesNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<jid>' + xmlEscape(this.userJid) + '</jid>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-profiles result packet
         *********************************************
         *********************************************
         */
        function GetProfilesResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.childElement = commandElement;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            this.profiles = [];
            var ioDataElement = getChildElementByElementName(commandElement, 'iodata');
            var outElement = getChildElement(ioDataElement);
            var profilesElement = getChildElement(outElement);
            var profileElements = getChildElements(profilesElement);
            var profileElementCount = profileElements.length;
            for (var i = 0; i < profileElementCount; i++) {
                var profileElement = profileElements[i];
                var profileId = getAttributeValue(profileElement, 'id');
                var isDefaultProfile = "true" === getAttributeValue(profileElement, 'default');
                var isOnline = "true" === getAttributeValue(profileElement, 'online');
                var siteElements = profileElement.getElementsByTagName("site");
                var device = getAttributeValue(profileElement, 'device');
                var isVMS = "asterisk" === device || "vmstsp" === device;
                var siteHolder = {};
                if (siteElements.length === 1) {
                    var siteElement = siteElements[0];
                    var siteId = getAttributeValue(siteElement, "id");
                    var siteType = getAttributeValue(siteElement, "type");
                    var isDefaultSite = "true" === getAttributeValue(siteElement, "default");
                    var siteName = siteElement.textContent;
                    siteHolder.site = {id: siteId, type: siteType, default: isDefaultSite, name: siteName};
                } else {
                    delete siteHolder.site;
                }
                this.profiles.push({
                    id: profileId,
                    default: isDefaultProfile,
                    online: isOnline,
                    site: siteHolder.site,
                    device: device,
                    isVMS: isVMS
                });
            }
        }

        GetProfilesResult.prototype = new Iq();
        GetProfilesResult.prototype.constructor = GetProfilesResult;
        GetProfilesResult.prototype.getProfiles = function () {
            return this.profiles;
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-interests request packet
         *********************************************
         *********************************************
         */
        var getInterestsNamespace = "http://xmpp.org/protocol/openlink:01:00:00#get-interests";

        function GetInterestsRequest(profileId) {
            this.type = 'set';
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.profile = profileId;
            return this;
        }

        GetInterestsRequest.prototype = new Iq();
        GetInterestsRequest.prototype.constructor = GetInterestsRequest;

        GetInterestsRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getInterestsNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-interests result packet
         *********************************************
         *********************************************
         */
        function GetInterestsResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.childElement = commandElement;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            this.interests = [];
            var ioDataElement = getChildElement(commandElement);
            var outElement = getChildElement(ioDataElement);
            var interestsElement = getChildElement(outElement);
            var interestElements = getChildElements(interestsElement);
            var interestElementCount = interestElements.length;
            for (var i = 0; i < interestElementCount; i++) {
                var interestElement = interestElements[i];
                this.interests.push({
                    id: getAttributeValue(interestElement, "id"),
                    type: getAttributeValue(interestElement, "type"),
                    label: getAttributeValue(interestElement, "label"),
                    value: getAttributeValue(interestElement, "value"),
                    default: "true" === getAttributeValue(interestElement, "default")
                });
            }
        }

        GetInterestsResult.prototype = new Iq();
        GetInterestsResult.prototype.constructor = GetInterestsResult;
        GetInterestsResult.prototype.getInterests = function () {
            return this.interests;
        };

        /*
         *********************************************
         *********************************************
         * An IQ manage-interests request packet
         *********************************************
         *********************************************
         */
        var manageInterestNamespace = "http://xmpp.org/protocol/openlink:01:00:00#manage-interests";

        function ManageInterestsRequest(action, lease) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.action = action;
            this.lease = lease;
            this.userId = $.openlink.getUserJid();
            return this;
        }

        ManageInterestsRequest.prototype = new Iq();
        ManageInterestsRequest.prototype.constructor = ManageInterestsRequest;

        ManageInterestsRequest.prototype.forUser = function (userId) {
            this.userId = userId;
            return this;
        };

        ManageInterestsRequest.prototype.forNumber = function (number) {
            this.number = number;
            return this;
        };

        ManageInterestsRequest.prototype.toXml = function () {
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + manageInterestNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<jid>' + xmlEscape(this.userId) + '</jid>' +
                '<action>' + xmlEscape(this.action) + '</action>' +
                '<lease>' + xmlEscape(this.lease) + '</lease>';
            if (isDefined(this.number)) {
                xml += '<number>' + xmlEscape(this.number) + '</number>';
            }
            xml += '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        /*
         *********************************************
         *********************************************
         * An IQ manage-interests result packet
         *********************************************
         *********************************************
         */
        function ManageInterestsResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.childElement = commandElement;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            var ioDataElement = getChildElement(commandElement);
            var outElement = getChildElement(ioDataElement);
            var interestsElement = getChildElement(outElement);

            var interestElement = getChildElement(interestsElement);
            this.interest = {
                id: getAttributeValue(interestElement, "id"),
                type: getAttributeValue(interestElement, "type"),
                label: getAttributeValue(interestElement, "label"),
                value: getAttributeValue(interestElement, "value")
            };

        }

        ManageInterestsResult.prototype = new Iq();
        ManageInterestsResult.prototype.constructor = ManageInterestsResult;
        ManageInterestsResult.prototype.getInterest = function () {
            return this.interest;
        };


        /*
         *********************************************
         *********************************************
         * An IQ get-profile request packet
         *********************************************
         *********************************************
         */
        var getProfileNamespace = "http://xmpp.org/protocol/openlink:01:00:00#get-profile";

        function GetProfileRequest(profileId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            return this;
        }

        GetProfileRequest.prototype = new Iq();
        GetProfileRequest.prototype.constructor = GetProfileRequest;

        GetProfileRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getProfileNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-interest request packet
         *********************************************
         *********************************************
         */
        var getInterestNamespace = "http://xmpp.org/protocol/openlink:01:00:00#get-interest";

        function GetInterestRequest(interestId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.interest = interestId;
            return this;
        }

        GetInterestRequest.prototype = new Iq();
        GetInterestRequest.prototype.constructor = GetInterestRequest;

        GetInterestRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getInterestNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<interest>' + xmlEscape(this.interest) + '</interest>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-features request packet
         *********************************************
         *********************************************
         */
        var getFeaturesNamespace = "http://xmpp.org/protocol/openlink:01:00:00#get-features";

        function GetFeaturesRequest(profileId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            return this;
        }

        GetFeaturesRequest.prototype = new Iq();
        GetFeaturesRequest.prototype.constructor = GetFeaturesRequest;

        GetFeaturesRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getFeaturesNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-features result packet
         *********************************************
         *********************************************
         */
        function GetFeaturesResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.childElement = commandElement;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            var ioDataElement = getChildElementByElementName(commandElement, "iodata");
            var outElement = getChildElement(ioDataElement);
            var profileElement = getChildElementByElementName(outElement, 'profile');
            this.profile = getAttributeValue(profileElement, "id");
            this.deviceNumber = getAttributeValue(profileElement, "devicenum");
            this.features = [];
            var featuresElement = getChildElementByElementName(outElement, 'features');
            var featureElements = getChildElements(featuresElement);
            var featuresElementCount = featureElements.length;
            for (var i = 0; i < featuresElementCount; i++) {
                var featureElement = featureElements[i];
                var featureType = getFeatureType(getAttributeValue(featureElement, "type"));
                this.features.push({
                    id: getAttributeValue(featureElement, "id"),
                    label: $.trim(getAttributeValue(featureElement, "label")),
                    type: featureType.properName,
                    isSettable: featureType.isSettable,
                    isCallable: featureType.isCallable,
                    isVoiceMessage: featureType.isVoiceMessage,
                    isGroupIntercom: featureType.isGroupIntercom
                });
            }
        }

        GetFeaturesResult.prototype = new Iq();
        GetFeaturesResult.prototype.constructor = GetFeaturesResult;
        GetFeaturesResult.prototype.getProfileId = function () {
            return this.profile;
        };
        GetFeaturesResult.prototype.getDeviceNumber = function () {
            return this.deviceNumber;
        };
        GetFeaturesResult.prototype.getFeatures = function () {
            return this.features;
        };

        var getFeatureXML = function (featureId, value1, value2, value3) {
            var xml = '<feature><id>' + xmlEscape(featureId) + '</id>';
            if (isDefined(value1)) {
                xml += '<value1>' + xmlEscape(value1) + '</value1>';
            }
            if (isDefined(value2)) {
                xml += '<value2>' + xmlEscape(value2) + '</value2>';
            }
            if (isDefined(value3)) {
                xml += '<value3>' + xmlEscape(value3) + '</value3>';
            }
            xml += '</feature>';
            return xml;
        };

        var getFeaturesXML = function (features) {
            var xml = '';
            var featureCount = features.length;
            if (featureCount > 0) {
                xml += '<features>';
                for (var i = 0; i < featureCount; i++) {
                    xml += features[i];
                }
                xml += '</features>';
            }
            return xml;
        };

        /*
         *********************************************
         *********************************************
         * An IQ make-call request packet
         *********************************************
         *********************************************
         */
        var makeCallNamespace = "http://xmpp.org/protocol/openlink:01:00:00#make-call";

        function MakeCallRequest() {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.userJid = $.openlink.getUserJid();
            this.destination = null;
            this.interest = null;
            this.features = [];
            this.orginatorReferences = [];
            return this;
        }

        MakeCallRequest.prototype = new Iq();
        MakeCallRequest.prototype.constructor = MakeCallRequest;
        MakeCallRequest.prototype.onInterest = function (interestId) {
            this.interest = interestId;
            return this;
        };
        MakeCallRequest.prototype.toDestination = function (destination) {
            this.destination = destination;
            return this;
        };
        MakeCallRequest.prototype.forUser = function (userJid) {
            this.userJid = userJid;
            return this;
        };
        MakeCallRequest.prototype.withFeature = function (featureId, value1, value2) {
            this.features.push(getFeatureXML(featureId, value1, value2));
            return this;
        };
        MakeCallRequest.prototype.withVoiceMessageFeature = function (featureId) {
            this.features.push('<feature type="VoiceMessage"><id>' + xmlEscape(featureId) + '</id></feature>');
            return this;
        };
        MakeCallRequest.prototype.withOriginatorReference = function (propertyKey, propertyValue) {
            if (Object.prototype.toString.call(propertyKey) === '[object Element]') {
                this.orginatorReferences.push(new XMLSerializer().serializeToString(propertyKey));
            } else {
                var xml = '<property id="' + xmlEscape(propertyKey) + '">';
                if (isDefined(propertyValue)) {
                    xml += '<value>' + xmlEscape(propertyValue) + '</value>';
                }
                xml += '</property>';
                this.orginatorReferences.push(xml);
            }
            return this;
        };

        MakeCallRequest.prototype.toXml = function () {
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + makeCallNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<jid>' + xmlEscape(this.userJid) + '</jid>';
            if (this.interest !== null) {
                xml += '<interest>' + xmlEscape(this.interest) + '</interest>';
            }
            if (this.destination !== null) {
                xml += '<destination>' + xmlEscape(this.destination) + '</destination>';
            }
            xml += getFeaturesXML(this.features);
            var originatorReferenceCount = this.orginatorReferences.length;
            if (originatorReferenceCount > 0) {
                xml += '<originator-ref>';
                for (var j = 0; j < originatorReferenceCount; j++) {
                    xml += this.orginatorReferences[j];
                }
                xml += '</originator-ref>';
            }
            xml +=
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        /*
         *********************************************
         *********************************************
         * An IQ get-call-history request packet
         *********************************************
         *********************************************
         */
        var getCallHistoryNamespace = "http://xmpp.org/protocol/openlink:01:00:00#get-call-history";

        function GetCallHistoryRequest() {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.userJid = $.openlink.getUserJid();
            return this;
        }

        GetCallHistoryRequest.prototype = new Iq();
        GetCallHistoryRequest.prototype.constructor = GetCallHistoryRequest;
        GetCallHistoryRequest.prototype.forUser = function (userJid) {
            this.userJid = userJid;
            return this;
        };
        GetCallHistoryRequest.prototype.fromCaller = function (caller) {
            this.caller = caller;
            return this;
        };
        GetCallHistoryRequest.prototype.toDestination = function (destination) {
            this.called = destination;
            return this;
        };
        GetCallHistoryRequest.prototype.forInboundCalls = function () {
            this.callType = 'in';
            return this;
        };
        GetCallHistoryRequest.prototype.forOutboundCalls = function () {
            this.callType = 'out';
            return this;
        };
        GetCallHistoryRequest.prototype.forMissedCalls = function () {
            this.callType = 'missed';
            return this;
        };
        GetCallHistoryRequest.prototype.fromDate = function (date) {
            this.fromDateTime = date;
            return this;
        };
        GetCallHistoryRequest.prototype.untilDate = function (date) {
            this.untilDateTime = date;
            return this;
        };
        GetCallHistoryRequest.prototype.fromRecordNumber = function (recordNumber) {
            this.recordNumber = recordNumber;
            return this;
        };
        GetCallHistoryRequest.prototype.withNumberOfRecords = function (recordCount) {
            this.numberOfRecords = recordCount;
            return this;
        };

        /*
         * Converts a date object to the format mm/dd/YYYY
         * If the object is not a date, it's simply toString()'ed
         */
        var formatCallHistoryDate = function (date) {
            if (Object.prototype.toString.call(date) !== '[object Date]') {
                return date.toString();
            } else {
                return zeroPad(date.getMonth() + 1) + "/" + zeroPad(date.getDate()) + "/" + date.getFullYear();
            }
        };

        var zeroPad = function (number) {
            return ("00" + number).slice(-2);
        };

        GetCallHistoryRequest.prototype.toXml = function () {
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + getCallHistoryNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<jid>' + xmlEscape(this.userJid) + '</jid>';
            if (isDefined(this.caller)) {
                xml += '<caller>' + xmlEscape(this.caller) + '</caller>';
            }
            if (isDefined(this.called)) {
                xml += '<called>' + xmlEscape(this.called) + '</called>';
            }
            if (isDefined(this.callType)) {
                xml += '<calltype>' + xmlEscape(this.callType) + '</calltype>';
            }
            if (isDefined(this.fromDateTime)) {
                xml += '<fromdate>' + formatCallHistoryDate(this.fromDateTime) + '</fromdate>';
            }
            if (isDefined(this.untilDateTime)) {
                xml += '<uptodate>' + formatCallHistoryDate(this.untilDateTime) + '</uptodate>';
            }
            if (isDefined(this.recordNumber)) {
                xml += '<start>' + xmlEscape(this.recordNumber) + '</start>';
            }
            if (isDefined(this.numberOfRecords)) {
                xml += '<count>' + xmlEscape(this.numberOfRecords) + '</count>';
            }
            xml += '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        /**
         * Parses a date of the format 2015-12-08 16:38:52.178
         * @param dateString
         * @returns {Date}
         */
        var parseCallHistoryDate = function (dateString) {
            var year = parseInt(dateString.substr(0, 4));
            var month = parseInt(dateString.substr(5, 2)) - 1;
            var dayOfMonth = parseInt(dateString.substr(8, 2));
            var hour = parseInt(dateString.substr(11, 2));
            var mins = parseInt(dateString.substr(14, 2));
            var secs = parseInt(dateString.substr(17, 2));
            var millis = parseInt(dateString.substr(20, 2));
            return new Date(year, month, dayOfMonth, hour, mins, secs, millis);
        };


        /*
         *********************************************
         *********************************************
         * An IQ get-call-history result packet
         *********************************************
         *********************************************
         */
        function GetCallHistoryResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            this.calls = [];
            var ioDataElement = getChildElement(commandElement);
            var outElement = getChildElement(ioDataElement);
            var callHistoryElement = getChildElement(outElement);
            this.totalNumberOfRecords = parseInt(getAttributeValue(callHistoryElement, "total"));
            this.firstRecordNumber = parseInt(getAttributeValue(callHistoryElement, "start"));
            this.numberOfRecordsReturned = parseInt(getAttributeValue(callHistoryElement, "count"));
            var callsElements = getChildElements(callHistoryElement);
            var callElementCount = callsElements.length;
            for (var i = 0; i < callElementCount; i++) {
                var callElement = callsElements[i];
                this.calls.push({
                    id: getChildElementTextContent(callElement, "id"),
                    profile: getChildElementTextContent(callElement, "profile"),
                    interest: getChildElementTextContent(callElement, "interest"),
                    state: getChildElementTextContent(callElement, "state"),
                    direction: getChildElementTextContent(callElement, "direction"),
                    callerNumber: getChildElementTextContent(callElement, "caller"),
                    callerName: getChildElementTextContent(callElement, "callername"),
                    calledNumber: getChildElementTextContent(callElement, "called"),
                    calledName: getChildElementTextContent(callElement, "calledname"),
                    duration: parseInt(getChildElementTextContent(callElement, "duration")),
                    timestamp: parseCallHistoryDate(getChildElementTextContent(callElement, "timestamp")),
                    tsc: getChildElementTextContent(callElement, "tsc")
                });
            }
        }

        GetCallHistoryResult.prototype = new Iq();
        GetCallHistoryResult.prototype.constructor = GetInterestsResult;
        GetCallHistoryResult.prototype.getCalls = function () {
            return this.calls;
        };
        GetCallHistoryResult.prototype.getFirstRecordNumberReturned = function () {
            return this.firstRecordNumber;
        };
        GetCallHistoryResult.prototype.getNumberOfRecordsReturned = function () {
            return this.numberOfRecordsReturned;
        };
        GetCallHistoryResult.prototype.getTotalNumberOfRecords = function () {
            return this.totalNumberOfRecords;
        };

        /*
         *********************************************
         *********************************************
         * An IQ make-intercom-call request packet
         *********************************************
         *********************************************
         */
        var makeIntercomCallNamespace = "http://xmpp.org/protocol/openlink:01:00:00#make-intercom-call";

        function MakeIntercomCallRequest(profileId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            this.features = [];
            this.destinationSet = false;
            return this;
        }

        MakeIntercomCallRequest.prototype = new Iq();
        MakeIntercomCallRequest.prototype.constructor = MakeIntercomCallRequest;
        MakeIntercomCallRequest.prototype.toUser = function (userJid) {
            this.destinationSet = true;
            this.toUserJid = userJid;
            return this;
        };
        MakeIntercomCallRequest.prototype.toGroup = function (groupIntercomId) {
            this.destinationSet = true;
            this.features.push(getFeatureXML(groupIntercomId));
            return this;
        };
        MakeIntercomCallRequest.prototype.withFeature = function (featureId, value1, value2) {
            this.features.push(getFeatureXML(featureId, value1, value2));
            return this;
        };

        MakeIntercomCallRequest.prototype.toXml = function () {
            if (!this.destinationSet) {
                throw "Either a destination user or group must be specified";
            }
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + makeIntercomCallNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>';
            if (isDefined(this.toUserJid)) {
                xml += '<destination>' + xmlEscape(this.toUserJid) + '</destination>';
            }
            xml += getFeaturesXML(this.features);
            xml += '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        /*
         *********************************************
         *********************************************
         * An IQ query-features request packet
         *********************************************
         *********************************************
         */
        var queryFeaturesNamespace = "http://xmpp.org/protocol/openlink:01:00:00#query-features";

        function QueryFeaturesRequest(profileId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            return this;
        }

        QueryFeaturesRequest.prototype = new Iq();
        QueryFeaturesRequest.prototype.constructor = QueryFeaturesRequest;

        QueryFeaturesRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + queryFeaturesNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ set-feature request packet
         *********************************************
         *********************************************
         */
        var setFeatureNamespace = "http://xmpp.org/protocol/openlink:01:00:00#set-features";

        function SetFeatureRequest(profileId, featureId) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            this.feature = featureId;
            this.value1 = null;
            this.value2 = null;
            this.value3 = null;
            return this;
        }

        SetFeatureRequest.prototype = new Iq();
        SetFeatureRequest.prototype.constructor = SetFeatureRequest;
        SetFeatureRequest.prototype.withValue1 = function (value1) {
            this.value1 = value1;
            return this;
        };
        SetFeatureRequest.prototype.withValue2 = function (value2) {
            this.value2 = value2;
            return this;
        };
        SetFeatureRequest.prototype.withValue3 = function (value3) {
            this.value3 = value3;
            return this;
        };

        SetFeatureRequest.prototype.toXml = function () {
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + setFeatureNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '<feature>' + xmlEscape(this.feature) + '</feature>';
            if (this.value1 !== null) {
                xml += '<value1>' + xmlEscape(this.value1) + '</value1>';
            }
            if (this.value2 !== null) {
                xml += '<value2>' + xmlEscape(this.value2) + '</value2>';
            }
            if (this.value3 !== null) {
                xml += '<value3>' + xmlEscape(this.value3) + '</value3>';
            }
            xml +=
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };


        /*
         *********************************************
         *********************************************
         * A <presence><priority> request packet
         *********************************************
         *********************************************
         */
        function SetPriorityRequest(priority) {
            this.id = getNextId();
            this.priority = priority;
            return this;
        }

        SetPriorityRequest.prototype = new Presence();
        SetPriorityRequest.prototype.constructor = SetPriorityRequest;

        SetPriorityRequest.prototype.toXml = function () {
            return '<presence id="' + xmlEscape(this.getId()) + '">' +
                '<priority>' + xmlEscape(this.priority) + '</priority>' +
                '</presence>';
        };


        /*
         *********************************************
         *********************************************
         * An IQ request-action request packet
         *********************************************
         *********************************************
         */
        var requestActionNamespace = "http://xmpp.org/protocol/openlink:01:00:00#request-action";

        var actions = ['AnswerCall', 'ClearConference', 'ClearConnection', 'ClearCall', 'ConferenceCall', 'ConsultationCall', 'StartVoiceDrop', 'StopVoiceDrop', 'HoldCall', 'PrivateCall', 'PublicCall', 'IntercomTransfer', 'JoinCall', 'RetrieveCall', 'TransferCall', 'SingleStepTransfer', 'SendDigits', 'SendDigit', 'AddThirdParty', 'RemoveThirdParty', 'ConnectSpeaker', 'DisconnectSpeaker', 'MergeCall', 'DeflectCall'];

        function RequestActionRequest(interest, action, callId) {

            if (actions.indexOf(action) === -1) {
                throw "'" + action + "' is not a supported action";
            }

            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.interest = interest;
            this.action = action;
            this.callId = callId;
            this.value1 = null;
            this.value2 = null;
            this.isSupervisedVoiceDrop = null;
            return this;
        }

        RequestActionRequest.prototype = new Iq();
        RequestActionRequest.prototype.constructor = RequestActionRequest;

        RequestActionRequest.prototype.withValue1 = function (value1) {
            this.value1 = value1;
            return this;
        };

        RequestActionRequest.prototype.withValue2 = function (value2) {
            this.value2 = value2;
            return this;
        };

        RequestActionRequest.prototype.setSupervised = function (isSupervised) {
            this.isSupervisedVoiceDrop = isSupervised === true;
            return this;
        };

        RequestActionRequest.prototype.toXml = function () {
            if (this.isSupervisedVoiceDrop && 'StartVoiceDrop' !== this.action) {
                throw "A supervised voice drop can only be performed with the 'StartVoiceDrop' request";
            }
            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + requestActionNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<interest>' + xmlEscape(this.interest) + '</interest>' +
                '<action>' + xmlEscape(this.action) + '</action>' +
                '<call>' + xmlEscape(this.callId) + '</call>';
            if (this.value1 !== null) {
                xml += '<value1>' + xmlEscape(this.value1) + '</value1>';
            }
            if (this.value2 !== null) {
                xml += '<value2>' + xmlEscape(this.value2) + '</value2>';
            }
            if (this.isSupervisedVoiceDrop) {
                xml += getFeaturesXML([getFeatureXML("Conference", "true")]);
            }
            xml +=
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        /*
         *********************************************
         *********************************************
         * An IQ subscribe request packet
         *********************************************
         *********************************************
         */
        var pubsubNamespace = "http://jabber.org/protocol/pubsub";

        function SubscribeRequest(nodeId) {
            this.id = getNextId();
            this.to = $.openlink.getPubsubJid();
            this.type = 'set';
            this.userJid = $.openlink.getUserJid();
            this.nodeId = nodeId;
            return this;
        }

        SubscribeRequest.prototype = new Iq();
        SubscribeRequest.prototype.constructor = SubscribeRequest;

        SubscribeRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<pubsub xmlns="' + pubsubNamespace + '">' +
                '<subscribe node="' + xmlEscape(this.nodeId) + '" jid="' + xmlEscape(this.userJid) + '"/>' +
                '</pubsub>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ unsubscribe request packet
         *********************************************
         *********************************************
         */
        function UnsubscribeRequest(nodeId) {
            this.id = getNextId();
            this.to = $.openlink.getPubsubJid();
            this.type = 'set';
            this.userJid = $.openlink.getUserJid();
            this.nodeId = nodeId;
            return this;
        }

        UnsubscribeRequest.prototype = new Iq();
        UnsubscribeRequest.prototype.constructor = UnsubscribeRequest;

        UnsubscribeRequest.prototype.toXml = function () {
            return '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<pubsub xmlns="' + pubsubNamespace + '">' +
                '<unsubscribe node="' + xmlEscape(this.nodeId) + '" jid="' + xmlEscape(this.userJid) + '"/>' +
                '</pubsub>' +
                '</iq>';
        };

        /*
         *********************************************
         *********************************************
         * An IQ manage-voice-message request packet
         *********************************************
         *********************************************
         */
        var manageVoiceMessageNamespace = "http://xmpp.org/protocol/openlink:01:00:00#manage-voice-message";

        function ManageVoiceMessageRequest(profileId, action) {
            this.id = getNextId();
            this.to = $.openlink.getOpenlinkJid();
            this.type = 'set';
            this.profile = profileId;
            this.action = action;
            this.label = null;
            this.features = [];
            return this;
        }

        ManageVoiceMessageRequest.prototype = new Iq();
        ManageVoiceMessageRequest.prototype.constructor = ManageVoiceMessageRequest;

        ManageVoiceMessageRequest.prototype.toXml = function () {

            if (['Create', 'Record', 'Edit', 'Playback', 'Save', 'Archive', 'Delete', 'Query', 'Search'].indexOf(this.action) === -1) {
                throw "The '" + this.action + "' action is not supported";
            }

            if (this.features.length < 1 && this.action !== 'Record') {
                throw "A feature must be supplied with the '" + this.action + "' action";
            }

            if (this.features.length > 1 && ['Record', 'Edit'].indexOf(this.action) > -1) {
                throw "Only one feature can be supplied with the '" + this.action + "' action";
            }

            if (this.label === null && ['Create', 'Record', 'Edit', 'Search'].indexOf(this.action) > -1) {
                throw "The '" + this.action + "' action requires a label";
            }

            var xml = '<iq type="set" id="' + xmlEscape(this.getId()) + '" to="' + xmlEscape(this.getTo()) + '">' +
                '<command xmlns="http://jabber.org/protocol/commands" node="' + manageVoiceMessageNamespace + '" action="execute">' +
                '<iodata xmlns="urn:xmpp:tmp:io-data" type="input">' +
                '<in>' +
                '<profile>' + xmlEscape(this.profile) + '</profile>' +
                '<action>' + xmlEscape(this.action) + '</action>';
            if (this.label !== null) {
                xml += '<label>' + xmlEscape(this.label) + '</label>';
            }
            xml += getFeaturesXML(this.features) +
                '</in>' +
                '</iodata>' +
                '</command>' +
                '</iq>';
            return xml;
        };

        ManageVoiceMessageRequest.prototype.withLabel = function (label) {
            this.label = label;
            return this;
        };

        ManageVoiceMessageRequest.prototype.withFeature = function (featureId) {
            this.features.push(getFeatureXML(featureId));
            return this;
        };

        function parseDateString(dateString) {
            // Note the "+" to convert to a number - converts empty strings to zero.
            if (isString(dateString) && dateString.length >= 7) {
                var year = +dateString.substr(0, 4);
                var month = +dateString.substr(5, 2);
                var day = +dateString.substr(8, 2);
                var hour = +dateString.substr(11, 2);
                var minute = +dateString.substr(14, 2);
                var second = +dateString.substr(17, 2);
                var millisecond = +dateString.substr(20, 3);
                if (isNumber(year) && isNumber(month) && isNumber(day) && isNumber(day) && isNumber(hour) && isNumber(minute) && isNumber(second) && isNumber(millisecond)) {
                    return new Date(year, month - 1, day, hour, minute, second, millisecond);
                }
            }
        }

        function ManageVoiceMessageResult(xml, packetTo, packetFrom, id, packetType, commandElement) {
            this.xml = xml;
            this.childElement = commandElement;
            this.id = id;
            this.type = packetType;
            this.to = packetTo;
            this.from = packetFrom;
            var ioDataElement = getChildElementByElementName(commandElement, "iodata");
            var outElement = getChildElementByElementName(ioDataElement, "out");
            var deviceStatusElement = getChildElementByElementName(outElement, "devicestatus");
            this.profile = getChildElementTextContent(deviceStatusElement, "profile");
            this.features = [];
            var featuresElement = getChildElementByElementName(deviceStatusElement, 'features');
            var featureElements = getChildElements(featuresElement);
            var featuresElementCount = featureElements.length;
            for (var i = 0; i < featuresElementCount; i++) {
                var featureElement = featureElements[i];
                var voiceMessageElement = getChildElementByElementName(featureElement, 'voicemessage');
                this.features.push({
                    id: getAttributeValue(featureElement, "id"),
                    label: getChildElementTextContent(voiceMessageElement, "label"),
                    messageLength: getChildElementNumberContent(voiceMessageElement, "msglen"),
                    creationDate: parseDateString(getChildElementTextContent(voiceMessageElement, "creationdate")),
                    status: getChildElementTextContent(voiceMessageElement, "status"),
                    action: getChildElementTextContent(voiceMessageElement, "action"),
                    extension: getChildElementTextContent(voiceMessageElement, "exten")
                });
            }
        }

        ManageVoiceMessageResult.prototype = new Iq();
        ManageVoiceMessageResult.prototype.constructor = ManageVoiceMessageResult;
        ManageVoiceMessageResult.prototype.getProfileId = function () {
            return this.profile;
        };
        ManageVoiceMessageResult.prototype.getFeatures = function () {
            return this.features;
        };


        /*
         *********************************************
         *********************************************
         * An message packet with a call status message
         *********************************************
         *********************************************
         */
        function CallStatusMessage(xml, childElement, packetTo, packetFrom, id, type, callStatusElements) {
            this.xml = xml;
            this.childElement = childElement;
            this.id = id;
            this.to = packetTo;
            this.from = packetFrom;
            this.type = type;
            this.calls = [];
            var elementCount = callStatusElements.length;
            for (var i = 0; i < elementCount; i++) {
                var callElements = getChildElements(callStatusElements[i]);
                var callElementCount = callElements.length;
                for (var j = 0; j < callElementCount; j++) {
                    var callElement = callElements[j];

                    var callerElement = getChildElementByElementName(callElement, 'caller');
                    var callerNumberElement = getChildElementByElementName(callerElement, 'number');
                    var callerNumber = getChildElementTextContent(callerElement, "number");
                    var callerE164NumberValue = getAttributeValue(callerNumberElement, 'e164');
                    var callerE164 = isString(callerE164NumberValue) ? callerE164NumberValue.split(",") : [];
                    var callerPreferredNumber = callerE164.length === 1 ? callerE164[0] : callerNumber;

                    var calledElement = getChildElementByElementName(callElement, 'called');
                    var calledNumberElement = getChildElementByElementName(calledElement, 'number');
                    var calledNumber = getChildElementTextContent(calledElement, "number");
                    var calledDestination = getAttributeValue(calledNumberElement, "destination");
                    var calledE164NumberValue = getAttributeValue(calledNumberElement, 'e164');
                    var calledE164 = isString(calledE164NumberValue) ? calledE164NumberValue.split(",") : [];
                    var calledPreferredNumber = isString(calledDestination) ? calledDestination : (calledE164.length === 1 ? calledE164[0] : calledNumber);

                    var actionsElement = getChildElementByElementName(callElement, 'actions');
                    var actionElements = getChildElements(actionsElement);
                    var actionCount = actionElements.length;
                    var direction = getChildElementTextContent(callElement, "direction");
                    var actions = [];
                    for (var k = 0; k < actionCount; k++) {
                        actions.push(actionElements[k].tagName);
                    }

                    var featuresElement = getChildElementByElementName(callElement, 'features');
                    var featuresElements = getChildElements(featuresElement);
                    var features = [];
                    for (k = 0; k < featuresElements.length; k++) {
                        var feature = featuresElements[k];
                        var featureType = getFeatureType(getAttributeValue(feature, "type"));
                        features.push({
                            id: getAttributeValue(feature, "id"),
                            type: featureType.properName,
                            isSettable: featureType.isSettable,
                            isCallable: featureType.isCallable,
                            isVoiceMessage: featureType.isVoiceMessage,
                            isGroupIntercom: featureType.isGroupIntercom,
                            label: getAttributeValue(feature, "label"),
                            isEnabled: feature.textContent === "true"
                        });
                    }

                    this.calls.push({
                        id: getChildElementTextContent(callElement, "id"),
                        site: getChildElementTextContent(callElement, "site"),
                        profile: getChildElementTextContent(callElement, "profile"),
                        interest: getChildElementTextContent(callElement, "interest"),
                        changed: getChildElementTextContent(callElement, "changed"),
                        state: getChildElementTextContent(callElement, "state"),
                        direction: direction,
                        isIncoming: direction === 'Incoming',
                        isOutgoing: direction === 'Outgoing',
                        callerNumber: callerNumber,
                        callerE164: callerE164,
                        callerPreferredNumber: callerPreferredNumber,
                        callerName: getChildElementTextContent(callerElement, "name"),
                        calledNumber: calledNumber,
                        calledDestination: calledDestination,
                        calledE164: calledE164,
                        calledPreferredNumber: calledPreferredNumber,
                        calledName: getChildElementTextContent(calledElement, "name"),
                        duration: parseInt(getChildElementTextContent(callElement, "duration")),
                        actions: actions,
                        features: features
                    });
                }
            }
        }

        CallStatusMessage.prototype = new Message();
        CallStatusMessage.prototype.constructor = CallStatusMessage;
        CallStatusMessage.prototype.getCalls = function () {
            return this.calls;
        };

        var log = function (messageToLog) {
            assertConnected();
            var wrapper = "<message from='" + userJid + "' to='" + openlinkJid + "' type='normal'>" +
                "<log xmlns='urn:xmpp:eventlog' timestamp='" + new Date().toISOString() + "'>" +
                "<message></message>" +
                "</log>" +
                "</message>";
            var rootElement = $.parseXML(wrapper).documentElement;
            var logElement = getChildElement(rootElement);
            var messageElement = getChildElement(logElement);
            messageElement.textContent = messageToLog;
            sendPacket(new XMLSerializer().serializeToString(rootElement));
        };

        var commandPacketTypes = [{
            namespace: getProfilesNamespace,
            type: 'result',
            constructor: GetProfilesResult
        }, {
            namespace: getInterestsNamespace,
            type: 'result',
            constructor: GetInterestsResult
        }, {
            namespace: getCallHistoryNamespace,
            type: 'result',
            constructor: GetCallHistoryResult
        }, {
            namespace: getFeaturesNamespace,
            type: 'result',
            constructor: GetFeaturesResult
        }, {
            namespace: manageInterestNamespace,
            type: 'result',
            constructor: ManageInterestsResult
        }, {
            namespace: manageVoiceMessageNamespace,
            type: 'result',
            constructor: ManageVoiceMessageResult
        }];

        // Polyfill startsWith
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function (searchString, position) {
                position = position || 0;
                return this.indexOf(searchString, position) === position;
            };
        }

        /* Deal with the case sensitivity issues of the features */
        var featureList = {
            messagewaiting: {properName: 'MessageWaiting', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            microphonemute: {properName: 'MicrophoneMute', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            speakermute: {properName: 'SpeakerMute', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            speakerchannel: {properName: 'SpeakerChannel', isSettable: true, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            ringerstatus: {properName: 'RingerStatus', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            privacy: {properName: 'Privacy', isSettable: true, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            handset: {properName: 'Handset', isSettable: true, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            donotdisturb: {properName: 'DoNotDisturb', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            microphonegain: {properName: 'MicrophoneGain', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            callforward: {properName: 'CallForward', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            callback: {properName: 'CallBack', isSettable: true, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            conference: {properName: 'Conference', isSettable: true, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            devicekeys: {properName: 'DeviceKeys', isSettable: true, isCallable: false, isVoiceMessage: false, isGroupIntercom: false},
            groupintercom: {properName: 'GroupIntercom', isSettable: false, isCallable: false, isVoiceMessage: false, isGroupIntercom: true},
            speeddial: {properName: 'SpeedDial', isSettable: false, isCallable: true, isVoiceMessage: false, isGroupIntercom: false},
            voicemessage: {properName: 'VoiceMessage', isSettable: false, isCallable: true, isVoiceMessage: true, isGroupIntercom: false},
            voicemessageplaylist: {properName: 'VoiceMessagePlaylist', isSettable: false, isCallable: true, isVoiceMessage: true, isGroupIntercom: false}
        };

        var getFeatureType = function(featureType) {
            var featureTypeKey = String(featureType).toLowerCase();
            if(featureList.hasOwnProperty(featureTypeKey)) {
                return featureList[featureTypeKey];
            } else {
                return {properName: featureType, isSettable: false, isCallable: false, isVoiceMessage: false, isGroupIntercom: false};
            }
        };

        // Return the methods we expose
        return {
            connect: connect,
            disconnect: disconnect,
            getUserJid: getUserJid,
            getOpenlinkJid: getOpenlinkJid,
            getPubsubJid: getPubsubJid,
            send: send,
            stanza: stanzaParser,
            GetProfilesRequest: GetProfilesRequest,
            GetInterestsRequest: GetInterestsRequest,
            ManageInterestsRequest: ManageInterestsRequest,
            GetProfileRequest: GetProfileRequest,
            GetInterestRequest: GetInterestRequest,
            MakeCallRequest: MakeCallRequest,
            MakeIntercomCallRequest: MakeIntercomCallRequest,
            GetCallHistoryRequest: GetCallHistoryRequest,
            GetFeaturesRequest: GetFeaturesRequest,
            QueryFeaturesRequest: QueryFeaturesRequest,
            SetFeatureRequest: SetFeatureRequest,
            RequestActionRequest: RequestActionRequest,
            SubscribeRequest: SubscribeRequest,
            UnsubscribeRequest: UnsubscribeRequest,
            SetPriorityRequest: SetPriorityRequest,
            ManageVoiceMessageRequest: ManageVoiceMessageRequest,
            log: log
        };
    }());
}(jQuery));

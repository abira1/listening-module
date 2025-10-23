/* Copyright © UCLES, 2014 */

/*global ulib, window*/
(function($, qti) {


    // Core
    (function() {
        // setup for the system, onLoad occurs here only
        qti.screen = {};
        qti.themeLoadListener = [];
        qti.mappingLoadListener = [];
        qti.accessibilityImages = "";

        function init() {
            if (arguments.callee.done) {
                return false; // Init must only be called once
            }
            arguments.callee.done = true;

            //$(function() {
            // UA 12/05/2016: added to ensure the event-types below only get merged on document.ready, 
            // after any handlers to be attached to the event-types to be nmerged in have been subscribed,
            // as some of these subscriptions only happen on document.ready.
            // UA 30/09/2016: redundant as init() is now only called after qti.appScriptsLoad or window load
            if (qti.preloadTestContents) {
                qti.mergeEvents("testStart", "itemLoad");
            } else {
                qti.mergeEvents("itemLoad", "newScreenDisplay", "screenChange");
                qti.mergeEvents("itemUnload", "screenUnload");
            }
            //});

            //call all previous setup code here in sequence
            qti._polling(); // 35-polling.js

            //Load functions from the theme js
            qti.themeLoadListener.forEach(function(func) {
                if (typeof(func) !== "function") {
                    throw new Error("Invalid onload argument type");
                }
                func();
            });

            qti._setupItems(); // 20-items.js
            qti._timer(); // 25-timer.js
            if (qti.hasAccessAPI) {
                qti._onResize(); // 08-universalAccess.js
            }
            //Load functions from the mapping js
            qti.mappingLoadListener.forEach(function(func) {
                if (typeof(func) !== "function") {
                    throw new Error("Invalid onload argument type");
                }
                func();
            });

            qti.fireEvent("mappingState");

            // Self initialising functions
            // 80-aria-widgets.js
            // 81-chart-library.js
            return true;
        }

        if (qti.appScriptsLoad) {
            qti.appScriptsLoad = $.Deferred();
            qti.appScriptsLoad.promise().done(init);
        } else {
            window.onload = init;
        }

        // Events System
        // used for surfacing all custom events within qti

        // A private hardcoded list of all events
        var register = {
            "beforeLoadItem": {
                "desc": "beforeLoadItem - Before the item is loaded",
                "funcs": []
            },
            "itemReady": {
                "desc": "itemReady - Currently unused placeholder",
                "funcs": []
            },
            "preloadedItemsReady": {
                "desc": "preloadedItemsReady - Fires when all items are preloaded and prepared. An object is passed containing all content.",
                "funcs": []
            },
            "itemsPreloadedReady": {
                "desc": "itemsPreloadedReady - Fires when all items are preloaded and the active item displayed. An object is passed containing the active item.",
                "funcs": []
            },
            "itemLoad": {
                "desc": "itemLoad - Fires each time an item is loaded - an item is a test screen in this instance. An object is passed to the function with body and head elements.",
                "funcs": []
            },
            "itemUnload": {
                "desc": "itemUnload - Fires when an item is unloaded. Currently unused placeholder",
                "funcs": []
            },
            "toolItemLoad": {
                "desc": "itemLoad - Fires each time a toolbar widget item is loaded. An object is passed to the function with body and head elements.",
                "funcs": []
            },
            "screenUnload": {
                "desc": "itemChange - Fires on switching away from the erstwhile displayed screen; only in preloadTestContents mode - event merged with itemUnload in non-preloadTestContents mode",
                "funcs": []
            },
            "screenChange": {
                "desc": "screenChange - Fires when the displayed screen changes; only in preloadTestContents mode - event merged with itemLoad in non-preloadTestContents mode",
                "funcs": []
            },
            "newScreenDisplay": {
                "desc": "newScreenDisplay - Fires when an item screen is displayed for the first time; only in preloadTestContents mode - event merged with itemLoad in non-preloadTestContents mode",
                "funcs": []
            },
            "time": {
                "desc": "time - Fires on every 5 second divsor of the timer",
                "funcs": []
            },
            "candidate": {
                "desc": "candidate - Fires once when candidate info is recieved from the remote server in json format. This is a mapping function, use with caution",
                "funcs": []
            },
            "responsesDataReady": {
                "desc": "responsesDataReady - Fires when all response variable initialisation data have either been successfully sent or received and set (in the case of test recovery)",
                "funcs": []
            },
            "changeResponseVariable": {
                "desc": "changeResponseVariable - Fires when a response is changed, ie when setValue is called on a responseVariable",
                "funcs": []
            },
            "changeState": {
                "desc": "changeState - Fires when a the answer change but the response variable does not",
                "funcs": []
            },
            "accessChange": {
                "desc": "accessChange - Fires when the accessibility options are changed (atm, this is a click on the accessibility toolbar)",
                "funcs": []
            },
            "preTestXML": {
                "desc": "preTestXML - Fires when the preTestXML is loaded by the server mapping files - required for qti accessibility functions. The xml is it's param.",
                "funcs": []
            },
            "preTestScreenChange": {
                "desc": "preTestScreenChange - Fires when the displayed preTest screen switches.",
                "funcs": []
            },
            "accessControls": {
                "desc": "accessControls - Fires when a set of access controls may be on the page.",
                "funcs": []
            },
            "showCISForm": {
                "desc": "showCISForm - Fires once the Candidate Information Screen is shown",
                "funcs": []
            },
            "instructionsStart": {
                "desc": "instructionsStart - Fires when the instructions XML file is loaded, just before displaying the instructions screen sequence.",
                "funcs": []
            },
            "showInstructions": {
                "desc": "showInstructions - Fires once the instructions page is shown",
                "funcs": []
            },
            "testStart": {
                "desc": "testStart - stage 4 has just been loaded and initialised",
                "funcs": []
            },
            "testEnd": {
                "desc": "testEnd - stage 8 has just been loaded and initialised",
                "funcs": []
            },
            "mappingState": {
                "desc": "mappingState - Fires once when the mapping file is added",
                "funcs": []
            },
            "windowResize": {
                "desc": "windowResize - Fires when the window is resized",
                "funcs": []
            },
            "settingsChange": {
                "desc": "settingsChange - Fires when the an accessibility setting (text or screen size) is changed",
                "funcs": []
            }
        };

        // An index of all the id's used against events, for quick lookups
        var idList = [];

        // MAPPING REGISTER
        var mappingRegister = {
            "ConnectPlus": "This is the RM connect plus mapping file. Responses are posted to the server every 5 seconds, test states are also posted",
            "Preview": "This is CA preview mapping and functions from the file system not a server, so test states are managed automagically"
        };

        function containsId(value) {
            if (idList.indexOf(value) > -1) {
                return true;
            }
            return false;
        }

        function removeValueFromArray(arr, val) {
            //var len = arr.length; not in this case because when you splice the array its length will change!!
            for (var i = 0; i < arr.length; i += 1) {
                if (arr[i] === val) {
                    arr.splice(i, 1);
                }
            }
        }

        function removeValueFromRegister(arr, val) {
            //var len = arr.length; not in this case because when you splice the array its length will change!!
            for (var i = 0; i < arr.length; i += 1) {
                if (arr[i].id === val) {
                    arr.splice(i, 1);
                }
            }
        }
        // FIRE EVENT
        qti.fireEvent = function(eventName, params) {
            if (arguments.length < 1 || arguments.length > 2) {
                throw new Error("Invalid arguments");
            }
            if (typeof register[eventName] !== "object") {
                throw new Error("Unknown event type - events must be registered in qti.js/05-core.js");
            }

            var functionList = register[eventName].funcs;

            functionList.forEach(function(eventItem) {
                eventItem.func(params);
            });
        };

        // SUBSCRIBE TO AN EVENT
        qti.subscribeToEvent = function(eventName, func, desc, id, unsubscribe) {
            if (arguments.length < 4) {
                throw new Error("To subscribe to an event, pass in an event name, the function to be called, a description of that function and an id for the event");
            }
            if (typeof register[eventName] !== "object") {
                throw new Error("Unknown event type - events must be registered in qti.js/90-core.js");
            }
            if (typeof func !== "function") {
                throw new Error("argument[1] must be a function");
            }

            if (unsubscribe) {
                qti.unsubscribeFromEvent(eventName, id);
            }

            if (containsId(id)) {
                throw new Error("Sorry, that Id is already in use");
            }

            var eventRegister = register[eventName];
            eventRegister.funcs.push({
                "id": id,
                "func": func,
                "desc": desc
            });
            idList.push(id);
        };

        // UNSUBSCRIBE FROM AN EVENT
        qti.unsubscribeFromEvent = function(eventName, id) {
            if (arguments.length !== 2) {
                throw new Error("To unsubscribe from an event, pass in the event name and the associated id");
            }
            if (typeof register[eventName] !== "object") {
                throw new Error("Unknown event type");
            }

            var eventFunctions = register[eventName].funcs;
            removeValueFromRegister(eventFunctions, id);
            removeValueFromArray(idList, id);
        };

        // COMBINE REGISTERED EVENT HANDLERS AND BIND TO PRIMARY EVENT TYPE
        qti.mergeEvents = function() {
            var args = Array.prototype.slice.call(arguments),
                i, prEvt, slEvt;
            if (args.length > 1) {
                prEvt = args.shift();
                for (i = 0; i < args.length; i++) {
                    slEvt = args[i];
                    register[prEvt].funcs = register[prEvt].funcs.concat(register[slEvt].funcs);
                }
            }
        };

        // DEBUGGING DETAILS FOR AN EVENT TYPE
        qti.eventInfo = function(eventName) {
            var displayEventDetails = function(eventName) {
                var eventDetails = register[eventName];
                console.log(eventDetails.desc);
                console.log("-----------------------------------------------");
                eventDetails.funcs.forEach(function(subscriber) {
                    console.log(subscriber.id + " --- " + subscriber.desc);
                });
                console.log("===============================================");
                console.log(" ");
            };

            if (arguments.length === 0) {
                for (var key in register) {
                    if (register.hasOwnProperty(key)) {
                        displayEventDetails(key);
                    }
                }
            } else {
                if (typeof register[eventName] !== "object") {
                    throw new Error("Unknown event type");
                }
                displayEventDetails(eventName);
            }

        };

        qti.mappingInfo = function() {
            console.log("Current mapping: " + qti.mappingState);
            console.log(mappingRegister[qti.mappingState]);
            console.log(" ");
        };

        qti.polledCheck = function(test, callback, interval, max) {
            var dfrd = $.Deferred(),
                checkCount = 1,
                checkFn = function() {
                    if ((typeof test === "function" && test()) || (typeof test !== "function" && test)) {
                        callback();
                        dfrd.resolve(checkCount);
                    } else if (checkCount <= max) {
                        setTimeout(checkFn, interval);
                        checkCount++;
                    } else {
                        dfrd.reject(checkCount);
                    }
                };
            checkFn();
            return dfrd.promise();
        };

        qti.computedStyle = function(element, property) {
            var s = false;
            if (element.currentStyle) {
                var p = property.split('-');
                var str = '';
                for (var i = 0; i < p.length - 1; i++) {
                    if (i in p) {
                        str += (i > 0) ? (p[i].substr(0, 1).toUpperCase() + p[i].substr(1)) : p[i];
                    }
                }
                s = element.currentStyle[str];
            } else if (window.getComputedStyle) {
                s = window.getComputedStyle(element, null).getPropertyValue(property);
            }
            return s;
        };

        qti.getFontSize = function(element) {
            var size = qti.computedStyle(element, 'font-size'),
                retval;

            if (size.indexOf('em') > -1) {
                var defFont = qti.computedStyle(document.body, 'font-size');
                if (defFont.indexOf('pt') > -1) {
                    defFont = Math.round(parseInt(defFont, 10) * 96 / 72);
                } else {
                    defFont = parseInt(defFont, 10);
                }
                size = Math.round(defFont * parseFloat(size));
            } else if (size.indexOf('pt') > -1) {
                size = Math.round(parseInt(size, 10) * 96 / 72);
            } else if (size.indexOf('px') > -1) {
                return Math.round(parseFloat(size));
            }

            return parseInt(size, 10);
        };

        qti.insertAtCaret = function(txtarea, text) {
            var scrollPos = txtarea.scrollTop,
                range, front, back,
                strPos = 0,
                br = ((txtarea.selectionStart || txtarea.selectionStart === 0) ?
                    "ff" : (document.selection ? "ie" : false));

            if (br === "ie") {
                txtarea.focus();
                range = document.selection.createRange();
                range.moveStart('character', -txtarea.value.length);
                strPos = range.text.length;
            } else if (br === "ff") {
                txtarea.focus();
                strPos = txtarea.selectionStart;
            }

            front = (txtarea.value).substring(0, strPos);
            back = (txtarea.value).substring(strPos, txtarea.value.length);
            txtarea.value = front + text + back;
            strPos = strPos + text.length;

            if (br === "ie") {
                txtarea.focus();
                range = document.selection.createRange();
                range.moveStart('character', -txtarea.value.length);
                range.moveStart('character', strPos);
                range.moveEnd('character', 0);
                range.select();
            } else if (br === "ff") {
                txtarea.focus();
                txtarea.selectionStart = strPos;
                txtarea.selectionEnd = strPos;
            }

            txtarea.scrollTop = scrollPos;

            return txtarea.value;
        };

        qti.safe_ntts_replace = function(str) {
            var nttsToReplace = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;'
                    //'<': '&amp;lt;',
                    //'>': '&amp;gt;'
                },
                replaceEntity = function(ntt) {
                    return nttsToReplace[ntt] || ntt;
                };

            if ($.isString(str)) {
                return str.replace(/[&<>]/g, replaceEntity);
            } else {
                return str;
            }
        };

        qti.safe_ntts_reverse_replace = function(str) {
            var nttsToReverseReplace = {
                // order significant - longer string patterns must be replaced before their substrings
                '&amp;lt;': '<',
                '&amp;gt;': '>',
                '&amp;': '&'
            };

            $.each(nttsToReverseReplace, function(key, val) {
                var rgx = new RegExp(key, "g");
                str = str.replace(rgx, val);
            });

            return str;
        };

        var checkMappingState = function() {
            if (!qti.mappingState) {
                throw new Error("Unknown mapping state");
            }

            for (var key in mappingRegister) {
                if (mappingRegister.hasOwnProperty(key) && key === qti.mappingState) {
                    return key;
                }
            }

            throw new Error("Unknown mapping value");
        };
        qti.subscribeToEvent("mappingState", checkMappingState, "Check that a mapping state exists", "checkMapExists");

        var SVGPanCount = 0,
            positionSVGInteractions = qti.positionSVGInteractions = function($svgDoc, $svgObj, svgchecks) {
                var svgCtnr, svgTexts, svgObj,
                    svgW = parseFloat($svgDoc.attr('width')),
                    svgH = parseFloat($svgDoc.attr('height')),
                    vBox = $svgDoc.attr('viewBox'),
                    vBoxW, vBoxH, sclX = 1,
                    sclY = 1;

                if (vBox) {
                    //vBoxVals = vBox.split(' ');
                    vBox = vBox.split(' ');
                    vBoxW = parseFloat(vBox[2]);
                    vBoxH = parseFloat(vBox[3]);
                    if (svgW !== vBoxW) {
                        sclX = svgW / vBoxW;
                    }
                    if (svgH !== vBoxH) {
                        sclY = svgH / vBoxH;
                    }
                } else {
                    $svgDoc.attr('viewBox', '0 0 ' + svgW + ' ' + svgH);
                    //vBoxVals = [0, 0, svgW, svgH];
                }

                if ($svgObj) {
                    svgObj = $svgObj[0];
                    if (!svgObj.embedCtnr) {
                        svgObj.embedCtnr = $svgObj.closest('[connect\\:author-class="svg-interactions-container"]');
                        $svgObj.attr('width', svgW);
                        $svgObj.attr('height', svgH);
                    }
                    svgCtnr = svgObj.embedCtnr;
                } else {
                    svgCtnr = $svgDoc.closest('[connect\\:author-class="svg-interactions-container"]');
                }
                svgCtnr.css('width', svgW + 'px').css('height', svgH + 'px');

                svgTexts = $svgDoc.find('text[data-interaction-id],text[class="interaction"],text[responseIdentifier]');
                if (svgTexts.length === 0) {
                    if ($svgObj && ++svgObj.svgchecks < 10) {
                        setTimeout(function() {
                            $svgObj.setSVGStimulusInteractions();
                        }, 50);
                    } else {
                        svgchecks = (svgchecks ? svgchecks + 1 : 1);
                        if (svgchecks < 10) {
                            setTimeout(function() {
                                positionSVGInteractions($svgDoc, null, svgchecks);
                            }, 50);
                        }
                    }
                } else {
                    svgTexts.each(function(i) {
                        var svgTextElm = $(this),
                            tei, svgTxtW, svgTxtH, intrxnId, svgPlaceholderSpan,

                            svgFontSize = 12,
                            setSimpleTextElement = function() {
                                svgTextElm.text('');
                                var svgTxtPosL = parseInt(svgTextElm.attr('x'), 10),
                                    svgTxtPosT = parseInt(svgTextElm.attr('y'), 10),

                                    htmlTeiW = tei.outerWidth(),
                                    htmlTeiH = tei.outerHeight(),
                                    //htmlTxtX = Math.round((svgTxtPosL - (htmlTeiW / 2)) / svgW * 99 * 100) / 100,
                                    //htmlTxtY = Math.round((svgTxtPosT - (svgTxtH / 2)) / svgH * 99 * 100) / 100;
                                    htmlTxtX = Math.round(((sclX * svgTxtPosL) - (htmlTeiW / 2)) / svgW * 10000) / 100,
                                    htmlTxtY = Math.round(((sclY * svgTxtPosT) - (htmlTeiH / 2)) / svgH * 10000) / 100;

                                tei.css({
                                    whiteSpace: 'nowrap',
                                    top: htmlTxtY + '%',
                                    left: htmlTxtX + '%'
                                });
                            },
                            setSpannedTextElement = function() {
                                var teiInput,
                                    svgPlaceholderText = svgPlaceholderSpan.text(),
                                    svgPlaceholderParentX = svgCtnr.position().left,
                                    svgPlaceholderParentY = svgCtnr.position().top,
                                    svgPlaceholderWidth = svgPlaceholderSpan[0].getBoundingClientRect().width || svgPlaceholderSpan[0].getComputedTextLength(),
                                    svgPlaceholderX = svgPlaceholderSpan.position().left - svgPlaceholderParentX,
                                    svgPlaceholderY = svgPlaceholderSpan.position().top - svgPlaceholderParentY;

                                svgPlaceholderSpan.css("visibility", "hidden");

                                tei.css({
                                    whiteSpace: 'nowrap',
                                    top: svgPlaceholderY + 'px',
                                    left: svgPlaceholderX + 'px',
                                    padding: 0,
                                    margin: 0,
                                    fontSize: svgFontSize + "px"
                                });

                                if (svgPlaceholderText.indexOf("text entry") !== -1) {
                                    tei.css('width', svgPlaceholderWidth + "px");
                                } else {
                                    tei.css('min-width', svgPlaceholderWidth + "px");
                                }

                                teiInput = tei.find('input');
                                if (teiInput.length > 0) {
                                    teiInput.css({
                                        width: 100 + '%'
                                    });
                                }

                                teiInput = tei.find('select');
                                if (teiInput.length > 0) {
                                    teiInput.css({
                                        width: svgPlaceholderWidth + "px",
                                        border: "1px solid #C0C0C0",
                                        backgroundColor: "#FFFFFF"
                                    });
                                }
                            };

                        //Get text font size imported with image
                        if (svgTextElm.attr('data-font-size')) {
                            svgFontSize = parseInt(svgTextElm.attr('data-font-size'), 10) - 2;
                        }

                        //This stops the element's dimensions being re-calculated when it is not visible in the view port (client rectangle width and height equal 0)
                        qti.polledCheck(function() {
                            svgTxtW = svgTextElm[0].getBoundingClientRect().width || svgTextElm[0].getComputedTextLength();
                            svgTxtH = svgTextElm[0].getBoundingClientRect().height;
                            return (svgTxtW !== 0 && svgTxtH !== 0);
                        }, function() {
                            intrxnId = parseInt(svgTextElm.attr('data-interaction-id'), 10);
                            if (intrxnId) {
                                tei = svgCtnr.find('span[connect\\:class~="inlineInteraction"]:has([connect\\:responseIdentifier]), [connect\\:identifier]:not(ins)').eq(intrxnId - 1);
                            } else {
                                intrxnId = svgTextElm.attr('responseIdentifier') || svgTextElm.attr('id');
                                tei = svgCtnr.find('span[connect\\:class~="inlineInteraction"]:has([connect\\:responseIdentifier="' + intrxnId + '"]), [connect\\:identifier="' + intrxnId + '"]:not(ins)');
                            }

                            svgPlaceholderSpan = svgTextElm.find('tspan[class="interaction-placeholder"]');
                            if (svgPlaceholderSpan[0]) {
                                setSpannedTextElement();
                            } else {
                                setSimpleTextElement();
                            }
                        }, 50, 10);
                        /*.done(function(checks) {
                            					//console.log('text-element: '+i+' bbox polled check succeeded. Checks: '+checks);
                            				}).fail(function(checks) {
                            					//console.log('text element: '+i+' still not fully rendered, after '+checks+' polled checks!');
                            				});*/
                    });
                }
            };

        $.fn.setSVGStimulusInteractions = function() {
            var $svgObj = this,
                svgObj = $svgObj[0],
                svgDoc = svgObj.getSVGDocument(),
                $svgDoc = $(svgDoc);

            if (!svgObj.svgchecks) {
                svgObj.svgchecks = 0;
            }
            if (svgDoc === null || $svgDoc.find('svg,svg\\:svg').length === 0) {
                if (++svgObj.svgchecks < 10) {
                    setTimeout(function() {
                        $svgObj.setSVGStimulusInteractions();
                    }, 50);
                }
            } else {
                $svgDoc = $svgDoc.find('svg,svg\\:svg');
                positionSVGInteractions($svgDoc, $svgObj);
            }
        };

        var accessibility = function() {
            var accessObj = {};
            var convert = {};

            convert.BY = function(imgData) {
                for (var i = 0; i < imgData.data.length - 4; i += 4) {
                    if (imgData.data[i] < 220 && imgData.data[i + 1] < 220 && imgData.data[i + 2] < 220) {
                        imgData.data[i] = 255;
                        imgData.data[i + 1] = 255;
                        imgData.data[i + 2] = 0;
                    } else {
                        imgData.data[i] = 255 - imgData.data[i];
                        imgData.data[i + 1] = 255 - imgData.data[i + 1];
                        imgData.data[i + 2] = 255 - imgData.data[i + 2];
                    }
                }
            };

            convert.BW = function(imgData) {
                for (var i = 0; i < imgData.data.length - 4; i += 4) {
                    if (imgData.data[i] < 220 && imgData.data[i + 1] < 220 && imgData.data[i + 2] < 220) {
                        imgData.data[i] = 0;
                        imgData.data[i + 1] = 0;
                        imgData.data[i + 2] = 255;
                    } else {
                        imgData.data[i] = 255;
                        imgData.data[i + 1] = 255;
                        imgData.data[i + 2] = 255;
                    }
                }
            };

            convert.BC = function(imgData) {
                for (var i = 0; i < imgData.data.length - 4; i += 4) {
                    if (imgData.data[i] < 220 && imgData.data[i + 1] < 220 && imgData.data[i + 2] < 220) {
                        imgData.data[i] = 0;
                        imgData.data[i + 1] = 0;
                        imgData.data[i + 2] = 255;
                    } else {
                        imgData.data[i] = 255;
                        imgData.data[i + 1] = 255;
                        imgData.data[i + 2] = 192;
                    }
                }
            };

            accessObj.convertImage = function(imageIn, type, callback) {
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var imageObj = new Image();
                imageObj.onload = function() {
                    canvas.width = imageIn.width;
                    canvas.height = imageIn.height;
                    ctx.drawImage(this, 0, 0);
                    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    convert[type](imgData);
                    ctx.putImageData(imgData, 0, 0);
                    callback(canvas.toDataURL("image/png"));
                };
                imageObj.src = imageIn.src;
            };

            return accessObj;
        }();

        var generateSVG = function($svgElmt) {

            var svgElmt = $svgElmt[0],
                siblingSvgImages = $svgElmt.siblings("svg"),
                siblingCount = siblingSvgImages.length,
                embedPNG,

                getImages = function() {
                    var accessImages = $svgElmt.find("image"),
                        newImage, rootImage;
                    if (accessImages.length === 1 && siblingCount === 0) {
                        newImage = new Image();
                        rootImage = $(accessImages[0]);
                        newImage.onload = function() {
                            accessibility.convertImage(newImage, "BC", function(dataURL) {
                                var bcImage = rootImage.clone();
                                //bcImage.attr("id", "svg_4");
                                bcImage.attr("xlink:href", dataURL);
                                bcImage.attr("class", "colour4");
                                rootImage.after(bcImage);
                            });
                            accessibility.convertImage(newImage, "BW", function(dataURL) {
                                var bwImage = rootImage.clone();
                                //bwImage.attr("id", "svg_3");
                                bwImage.attr("xlink:href", dataURL);
                                bwImage.attr("class", "colour3");
                                rootImage.after(bwImage);
                            });
                            accessibility.convertImage(newImage, "BY", function(dataURL) {
                                var byImage = rootImage.clone();
                                //byImage.attr("id", "svg_2");
                                byImage.attr("xlink:href", dataURL);
                                byImage.attr("class", "colour2");
                                rootImage.after(byImage);
                            });
                            newImage = null;
                        };
                        newImage.src = rootImage.attr("xlink:href");
                        rootImage.attr("class", "colour1");
                    }
                },

                isSVGInteraction = $svgElmt.attr("connect:author-class").indexOf("accessible-svg") !== -1;

            if (siblingCount === 0) {
                embedPNG = $svgElmt.find("image");

                if (isSVGInteraction) {
                    $svgElmt.attr("connect:author-class", "accessible-svg");
                    $svgElmt.find('tspan[class="interaction-placeholder"]').css({
                        "visibility": "hidden"
                    });
                } else {
                    $svgElmt.removeAttr("connect:author-class");
                }

                if (embedPNG.length === 0 || isSVGInteraction) {
                    var XMLS = new window.XMLSerializer(),
                        imageSource = XMLS.serializeToString(svgElmt),
                        vBox = svgElmt.getAttribute("viewBox"),
                        vBoxVals = vBox ? vBox.split(' ') : null,
                        sourceWidth = parseFloat(svgElmt.getAttribute("width")),
                        sourceHeight = parseFloat(svgElmt.getAttribute("height")),
                        convertedSource = window.btoa(imageSource),
                        pngSource = 'data:image/svg+xml;base64,' + convertedSource,
                        canvas = document.createElement("canvas"),
                        ctx = canvas.getContext("2d"),
                        imageObj = new Image();

                    imageObj.onload = function() {
                        canvas.width = sourceWidth;
                        canvas.height = sourceHeight;
                        ctx.drawImage(this, 0, 0);

                        var imgData, mImage, mGroup, oldGroup;

                        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        ctx.putImageData(imgData, 0, 0);
                        imageSource = canvas.toDataURL("image/png");
                        mImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
                        //mImage.setAttribute("id", "svg_1");
                        mImage.setAttribute("x", "0");
                        mImage.setAttribute("y", "0");
                        mImage.setAttribute("width", vBoxVals ? parseFloat(vBoxVals[2]) : sourceWidth);
                        mImage.setAttribute("height", vBoxVals ? parseFloat(vBoxVals[3]) : sourceHeight);
                        mImage.setAttribute("class", "colour1");
                        mImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imageSource);

                        mGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        mGroup.appendChild(mImage);
                        //oldGroup = svgElmt.getElementsByTagNameNS("http://www.w3.org/2000/svg","g")[0];
                        //svgElmt.replaceChild(mGroup, oldGroup);
                        $svgElmt.find('>g,>svg\\:g').replaceWith(mGroup);
                        getImages();
                    };
                    imageObj.src = pngSource;
                } else {
                    getImages();
                }
            } else {
                if (isSVGInteraction) {
                    siblingSvgImages.each(function() {
                        var i, textNode, svgImage = $(this),
                            imageClass = svgImage.attr("connect:author-class"),
                            textMaster = svgElmt.getElementsByTagNameNS("http://www.w3.org/2000/svg", "text"),
                            newGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                        for (i = 0; i < textMaster.length; i++) {
                            textNode = textMaster[i].cloneNode(true);
                            newGroup.appendChild(textNode);
                        }
                        this.appendChild(newGroup);
                        if (imageClass.indexOf("colour2") !== -1) {
                            svgImage.find("text").attr("fill", "#FFFF00");
                            svgImage.find("text").attr("stroke", "#FFFF00");
                        } else {
                            svgImage.find("text").attr("fill", "#0000FF");
                            svgImage.find("text").attr("stroke", "#0000FF");
                        }
                    });
                }
            }
        };

        var generatePNGJPG = function(rootImage) {
            var siblingCount = rootImage.siblings("img").length,
                newImage;
            if (siblingCount === 0) {
                newImage = new Image();
                newImage.onload = function() {
                    accessibility.convertImage(newImage, "BC", function(dataURL) {
                        var bcImage = rootImage.clone();
                        rootImage.after(bcImage);
                        bcImage.attr("src", dataURL);
                        bcImage.attr("class", "colour4");
                        bcImage.attr("connect:author-class", "colour4");
                    });
                    accessibility.convertImage(newImage, "BW", function(dataURL) {
                        var bwImage = rootImage.clone();
                        rootImage.after(bwImage);
                        bwImage.attr("src", dataURL);
                        bwImage.attr("class", "colour3");
                        bwImage.attr("connect:author-class", "colour3");
                    });
                    accessibility.convertImage(newImage, "BY", function(dataURL) {
                        var byImage = rootImage.clone();
                        rootImage.after(byImage);
                        byImage.attr("src", dataURL);
                        byImage.attr("class", "colour2");
                        byImage.attr("connect:author-class", "colour2");
                    });
                    newImage = null;
                };
                newImage.src = rootImage.attr("src");
                rootImage.attr("class", "colour1");
            }
        };

        var createAccessibilityImages = qti.createAccessibilityImages = function(docObj) {
            if (docObj) {
                var itemIdentifier = docObj.attr("connect:identifier");
                if (qti.accessibilityImages.indexOf(itemIdentifier) === -1) {
                    qti.accessibilityImages += itemIdentifier;
                    var images = docObj.find('*[connect\\:author-class~="colour1"]');
                    images.each(function() {
                        var image = $(this),
                            imageElement = this.nodeName;
                        if (imageElement.toLowerCase() === "img") {
                            generatePNGJPG(image);
                        }
                        if (imageElement.toLowerCase() === "svg") {
                            generateSVG(image);
                        }
                    });
                }
            }
        };

        //qti.subscribeToEvent("preloadedItemsReady", createAccessibilityImages, "Create Accessibility Images", "CreateAccessibility");
    }());


    /* UI Widgets */
    (function() {
        var flash = qti.flash = function(item) {
            item.animate({
                'background-color': '#ABE5FD'
            }, 2000, function() {
                item.animate({
                    'background-color': '#ABE5FD'
                }, 2000, function() {
                    item.switchClass('blue', 'transparent', 2000);
                });
            });
            item.removeAttr('style');
            item.removeClass('transparent');
        };

        var setupTabs = qti.setupTabs = function(docObj, selectedTab) {
            var tabContent;

            if (docObj) {
                if (docObj.body) {
                    tabContent = docObj.body.find('*[class~="tab"]');
                } else {
                    tabContent = $(docObj).find('*[class~="tab"]');
                }
            } else {
                tabContent = $('*[class~="tab"]:visible');
            }
            if (!selectedTab) {
                selectedTab = 0;
            }
            tabContent.each(function(index, tabset) {
                tabset = $(tabset);
                var tabs = tabset.find('li a'),
                    tabsContainer = tabset.find('li'),
                    tabbed = tabset.parent().find('*[class~="tabbed"] .tabpanel');
                if (tabbed[selectedTab]) {
                    tabbed.removeClass("active");
                    $(tabbed[selectedTab]).addClass("active");
                    if (tabs) {
                        tabsContainer.removeClass("active");
                        $(tabsContainer[selectedTab]).addClass("active");
                        tabs.each(function(index, tab) {
                            tab = $(tab);
                            tab.click(function(event) {
                                tabsContainer.removeClass("active");
                                tab.parent().addClass("active");
                                tabbed.removeClass("active");
                                $($("#" + event.target.href.split("#")[1])[0]).addClass("active");
                                event.preventDefault();
                                return false;
                            });
                        });
                    }
                }
            });
        };
        qti.subscribeToEvent("showInstructions", setupTabs, "Set up tabs on the main instruction page", "setupTabsInstructions");
        if (qti.inContextHelp) {
            qti.subscribeToEvent("itemLoad", setupTabs, "Set up tabs on each question item", "setupTabsItems");
        }
    })();

    (function() {
        // for firefox
        var hasApi = qti.hasAccessAPI = !!window.accessAPI;
        var resizing = false; // flag to denote that a resize is in progress, so not to start another

        var textSizeValue = "t1";
        var screenColourValue = "c1";
        var screenResValue = "s1";
        var content;
        var controls;

        var attachToolbarClickEvent = function(selector, dialogue, requiresAccessAPI, linkType) {
            var attachLinkEvent = function() {
                $(selector).each(function(index, link) {
                    link = $(link);
                    link.click(function(event) {
                        var dialogueTitle = $(this).firstChild().text();
                        if ((requiresAccessAPI && qti.hasAccessAPI) || !requiresAccessAPI) {
                            dialogue.showDialogue(dialogueTitle);
                        }

                        if (!requiresAccessAPI) {
                            event.preventDefault();
                            return false;
                        }
                    });
                });
            };

            qti.subscribeToEvent("testStart", attachLinkEvent, "attach click event to toolbar button link", linkType);
        };

        var scaling = (function() {
            var scaling = {};
            var storedZoomLevel = 1; // The stored value for scaling zoom set by user on accessibility screen

            scaling.getZoomLevel = function() {
                return storedZoomLevel;
            };

            function zoomMultiplier() {
                var w = accessAPI.getScreenResolution().width;
                if (w < 861) {
                    return 1;
                } else if (w < 1050) {
                    return 1.02;
                } else if (w < 1290) {
                    return 1.04;
                }
                return 1.04;
            }

            scaling.getZoomScale = function(zoomLevel) {
                if (zoomLevel) {
                    storedZoomLevel = zoomLevel;
                }

                return storedZoomLevel; //* zoomMultiplier();
            };

            return scaling;
        }());

        var hasColourStyle,
            styleChange = function(num) {
                var head = document.getElementsByTagName("head")[0];
                var url = "css/colour" + num + ".css";

                if (hasColourStyle) {
                    var links = head.getElementsByTagName("link");
                    var len = links.length;
                    var newLen = len - 2;
                    while (newLen < len) {
                        var link = links[newLen];
                        if (link.getAttribute("id") === "colourStyle") {
                            link.setAttribute("href", url);
                            break;
                        }
                        newLen += 1;
                    }
                } else {
                    var newLink = document.createElementNS("http://www.w3.org/1999/xhtml", "link");
                    newLink.setAttribute("href", url);
                    newLink.setAttribute("rel", "stylesheet");
                    newLink.setAttribute("id", "colourStyle");

                    head.appendChild(newLink);
                }

                hasColourStyle = true;
            };

        var accessFeatures = (function() {
            var accessFeatures = {};

            accessFeatures.setTextSize = function(zoomLevel) {
                var zoom = scaling.getZoomScale(zoomLevel);
                accessAPI.zoom(zoom);
                $.later(function() {
                    qti.fireEvent("settingsChange", zoom);
                }); // later because of need to reviewContainersHeight
            };

            accessFeatures.setColour = function(colourScheme) {
                //accessAPI.styles(colourScheme);
                styleChange(colourScheme);
            };

            accessFeatures.setScreenRes = function(screenRes) {
                accessAPI.setScreenResolution(screenRes);
                $.later(function() {
                    qti.fireEvent("settingsChange");
                }); // later because of need to reviewContainersHeight
            };

            return accessFeatures;
        })();

        var applyContentScrolling = function(contentElm, enable) {
                if ((enable || enable === undefined) && (!contentElm.scroller || enable === true)) {
                    if (contentElm.scroller) {
                        contentElm.scroller.destroy();
                    }
                    contentElm.scroller = new IScroll(contentElm, {
                        scrollbars: true,
                        mouseWheel: true,
                        bounce: false,
                        click: true
                        //tap: true,
                    });
                    contentElm.scroller.on('scrollEnd', function() {
                        contentElm.scrollpos = this.y;
                    });
                } else if (enable === false && contentElm.scroller) {
                    //contentElm.scroller.scrollTo(0, 0);
                    contentElm.scroller.destroy();
                    contentElm.scroller = null;
                    $(contentElm).children().removeAttr('style');
                }
            },

            reviewContainersHeight = function(height, scrollContent, scrollCtnrs) {
                var refCtnr = scrollCtnrs;
                scrollCtnrs.parents().each(function() {
                    var $this = $(this);
                    $this.children(':visible').not(refCtnr).not('[class*="iScroll"]').each(function() {
                        var offsetHt = $(this).outerHeight(true);
                        height -= offsetHt;
                    });

                    if (this === scrollContent[0]) {
                        return false;
                    } else {
                        refCtnr = $this;
                    }
                });
                return height;
            },

            updateScrollView = function(scrollContent, height, itemHeight, testItem) {
                var scrollerHt,
                    subCtnrs = scrollContent.find('*[connect\\:class~="scroll-container"]');
                height = reviewContainersHeight(height, scrollContent, subCtnrs);
                if (testItem || itemHeight > qti.mainHeight || subCtnrs.height() > height) {
                    if (qti.orientation === "portrait") {
                        scrollerHt = scrollContent.outerHeight();
                        if (scrollerHt !== height) {
                            if (subCtnrs.length > 1) {
                                subCtnrs.css("height", "auto").each(function() {
                                    applyContentScrolling(this, false);
                                });
                                scrollContent.css("height", (height + "px"));
                                applyContentScrolling(scrollContent[0], true);
                            } else {
                                scrollContent.css("height", "");
                                subCtnrs.css("height", (height + "px"));
                                applyContentScrolling(subCtnrs[0], true);
                            }
                        }
                    } else if (qti.orientation === "landscape") {
                        if (subCtnrs.length > 1) {
                            scrollerHt = subCtnrs.outerHeight();
                            if (scrollerHt !== height) {
                                applyContentScrolling(scrollContent[0], false);
                                scrollContent.css("height", "auto");
                                subCtnrs.css("height", (height + "px"))
                                    .each(function() {
                                        applyContentScrolling(this, true);
                                    });
                            }
                        } else {
                            scrollerHt = scrollContent.outerHeight();
                            if (scrollerHt !== height) {
                                //subCtnrs.css("height", "auto");
                                //scrollContent.css("height", (height + "px"));
                                //applyContentScrolling(scrollContent[0], true);
                                subCtnrs.css("height", (height + "px"));
                                applyContentScrolling(subCtnrs[0], true);
                            }
                        }
                    } else {
                        subCtnrs.css("height", (height + "px"));
                    }
                } else {
                    subCtnrs.css("height", "auto");
                }
            },

            checkScrollContentHeight = function(crntItem) {
                var itemHeight = crntItem.height(),
                    maxScrollHeight, preItemsOffset = 0,
                    mainHeightOffset,
                    scrollContent = crntItem.find('*[connect\\:class~="scroll-content"]');
                if (scrollContent.length > 0) {
                    if (crntItem.is('*[connect\\:class~="itemBody"]')) {
                        crntItem.find('>div').each(function() {
                            var childDiv = $(this);
                            if (!(/scroll-content/.test(childDiv.attr('connect:class')))) {
                                preItemsOffset += childDiv.outerHeight(true);
                            } else {
                                return false;
                            }
                        });
                        maxScrollHeight = qti.mainHeight - (preItemsOffset + 24);
                        /*preItemsOffset = Math.round(scrollContent.position().top);
                        maxScrollHeight = qti.mainHeight - preItemsOffset;*/
                        updateScrollView(scrollContent, maxScrollHeight, itemHeight, crntItem.is('[connect\\:identifier]'));

                        if (qti.setTextareaHeight) {
                            //##### Added additional rule to handle new two column layout #####
                            $('[connect\\:class~="itemBody"] [connect\\:class~="column"][connect\\:class~="scroll-container"]:last-child textarea, ' +
                                '[connect\\:author-class~="genericTwoColumn"] > [connect\\:author-class~="right"]:last-child textarea').css("height", (maxScrollHeight - 60 + "px"));
                            $('[connect\\:class~="itemBody"] [connect\\:class~="scroll-container"]:last-child textarea.targetResponse, ' +
                                '[connect\\:author-class~="genericTwoColumn"] > [connect\\:author-class~="right"]:last-child textarea.targetResponse').css("height", (maxScrollHeight - 102 + "px"));
                        }
                    } else if (crntItem.is('.nontest')) {
                        mainHeightOffset = parseInt(scrollContent.attr('data-heightOffset'), 10);
                        maxScrollHeight = qti.mainHeight - mainHeightOffset;
                        scrollContent.css('max-height', maxScrollHeight + "px");
                    }
                }
            },

            getWindowHeight = function(minusOSK) {
                //var ht;
                if (qti.orientation === 'landscape') {
                    if ('standalone' in navigator && navigator.standalone) {
                        return window.innerHeight;
                    } else {
                        //ht = 672; // empirically determined height of iPad Safari window height in landscape mode
                        if (minusOSK) {
                            return qti.deviceWidth - 352; // minus iPad popup-keyboard height in landscape mode
                        } else {
                            return qti.deviceWidth;
                        }
                    }
                } else if (qti.orientation === 'portrait') {
                    if ('standalone' in navigator && navigator.standalone) {
                        return window.innerHeight;
                    } else {
                        //ht = 928; // empirically determined height of iPad Safari window height in portrait mode
                        if (minusOSK) {
                            return qti.deviceHeight - 264; // minus iPad popup-keyboard height in portrait mode
                        } else {
                            return qti.deviceHeight;
                        }
                    }
                } else {
                    return window.innerHeight; //document.body.clientHeight || $(window).height()
                }
            },

            // setTextSize causes the browser to fire another resize - so we need to avoid that.
            resizeMain = qti.resizeMain = function() {
                var windowHeight = getWindowHeight(),
                    bannerHt = $('div[role="banner"]').outerHeight(),
                    navHt = $('#navigation-bar').outerHeight(true),
                    mainHeight = windowHeight - (bannerHt + navHt),
                    scrollHt,
                    //mainContent = $('div[role="main"]'),
                    currentItem = qti.mainContent.find('*[connect\\:class~="activeItem"]');

                qti.mainContent.css('height', (mainHeight + "px"));
                qti.mainHeight = mainHeight;

                if (currentItem.length > 0) {
                    $('object[width]:visible').removeAttr('width').removeAttr('height');
                    // UA 16/04/2013: above removes dimensions on object, which were added dynamically to make svgs display correctly initially in TestViewer[gecko 3.6],
                    // but now need to be removed because the dimensions cause scrollbars to appear on resizing-down the window
                } else {
                    currentItem = qti.mainContent.find('>*[connect\\:class~="itemBody"]:first, >.nontest');
                }
                if (currentItem.length > 0) {
                    checkScrollContentHeight(currentItem);
                }
            },

            focusObserver = qti.focusObserver = function() {
                var currentItem = $('[role="main"]').find('*[connect\\:class~="activeItem"]'),
                    lastTarget;

                qti.direction = true;
                currentItem.on('focus', '*', function(event) {
                    var posMask;

                    if (lastTarget === undefined) {
                        lastTarget = event.target;
                    } else if (lastTarget !== event.target) {
                        posMask = lastTarget.compareDocumentPosition(event.target);
                        if ((posMask & Node.DOCUMENT_POSITION_FOLLOWING) || (posMask & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                            qti.direction = true;
                        } else if ((posMask && Node.DOCUMENT_POSITION_PRECEDING) || (posMask & Node.DOCUMENT_POSITION_CONTAINS)) {
                            qti.direction = false;
                        }
                        lastTarget = event.target;
                    }
                });
            },

            onResize = qti._onResize = function() {
                if (!resizing) {
                    resizing = true;
                    if (qti.hasAccessAPI) {
                        accessFeatures.setTextSize();
                    }
                    resizeMain();
                }
                qti.fireEvent("windowResize", qti.activeItem);
                resizing = false;
            },

            resetViewport = function(orientation, force_fit) {
                if (force_fit) {
                    if (orientation === "landscape") {
                        $('meta[name="viewport"]')[0].setAttribute("content", "width=device-height, height=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0");
                    } else if (orientation === "portrait") {
                        $('meta[name="viewport"]')[0].setAttribute("content", "width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0");
                    }
                } else {
                    if (orientation === "landscape") {
                        $('meta[name="viewport"]')[0].setAttribute("content", "width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0");
                    } else if (orientation === "portrait") {
                        $('meta[name="viewport"]')[0].setAttribute("content", "width=device-height, height=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0");
                    } else {
                        $('meta[name="viewport"]')[0].setAttribute("content", "initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0");
                    }
                }
            },

            stopScrolling = qti._stopScrolling = function() {
                $('body').css({
                    'overflow': 'hidden'
                });
            },

            checkOrientation = function() {
                if (window.orientation === 90 || window.orientation === -90) {
                    return "landscape";
                } else if (window.orientation === 0 || window.orientation === 180) {
                    return "portrait";
                } else {
                    return null;
                }
            },

            enableScrollerInputs = function(content) {
                content.find('textarea, input[type="text"]')
                    /* .on('tap', function() {
                    	this.focus();
                    }) */
                    .on('focus', function(e) {
                        $('body').removeClass('fixing');
                        qti.activeTextInput = this;
                    })
                    .on('blur', function(e) {
                        qti.activeTextInput = null;
                        $('body').addClass('fixing');
                        setTimeout(function() {
                            if (!qti.activeTextInput) {
                                $('html,body').animate({
                                    scrollTop: '0px'
                                }, 0);
                                $('body').removeClass('fixing');
                            }
                        }, 200);
                    });
            };

        qti.orientation = checkOrientation();
        if (qti.orientation !== undefined && qti.orientation !== null) {
            if (qti.orientation === "landscape") {
                qti.deviceWidth = window.innerHeight;
                qti.deviceHeight = 927 - (668 - window.innerHeight);
            } else if (qti.orientation === "portrait") {
                qti.deviceHeight = window.innerHeight;
                qti.deviceWidth = 668 - (927 - window.innerHeight);
            }

            $(window)
                .on('orientationchange', function(event) {
                    qti.orientation = event.orientation;
                    $('html,body').animate({
                        scrollTop: '0px'
                    }, 0);
                    if (qti.activeTextInput) {
                        $('body').addClass('fixing');

                        setTimeout(function() {
                            resetViewport(event.orientation, true);
                            onResize();
                            $('body').removeClass('fixing');
                            var viewHeight = getWindowHeight(true),
                                offset = Math.round($(qti.activeTextInput).offset().top - (viewHeight / 2) - window.pageYOffset);
                            if (offset > 0) {
                                $('html,body').animate({
                                    scrollTop: (offset + 36) + 'px'
                                }, 250);
                            }
                        }, 400);
                    } else {
                        onResize();
                    }
                })
                .on('resize', $.debounce(200, true, function() {
                    var ortn = checkOrientation();
                    resetViewport(ortn);
                }));
        } else {
            $(window).on('resize', onResize);
        }

        qti.subscribeToEvent("showInstructions", onResize, "Resize the main content area of the instructions dialogue", "resizeInstructions");
        qti.subscribeToEvent("testStart", onResize, "Resize the main content area once the navigation has been restored", "resizeMain");
        qti.subscribeToEvent("testStart", stopScrolling, "Make body non scrollable for main test part", "stopScrolling");
        qti.subscribeToEvent("screenChange", checkScrollContentHeight, "Check the scroll container heights whenever the displayed screen changes", "checkScrollContentHeight");
        qti.subscribeToEvent("screenChange", focusObserver, "Keep track of direction of focus transfer around task content", "focusObserver");

        qti._setupScrollContentContainers = function() {
            var getScrollBarWidth = function() {
                    var inner = document.createElement('p'),
                        w1, w2, outer;
                    inner.style.width = "100%";
                    inner.style.height = "200px";

                    outer = document.createElement('div');
                    outer.style.position = "absolute";
                    outer.style.top = "0px";
                    outer.style.left = "0px";
                    outer.style.visibility = "hidden";
                    outer.style.width = "200px";
                    outer.style.height = "150px";
                    outer.style.overflow = "hidden";
                    outer.appendChild(inner);

                    document.body.appendChild(outer);
                    w1 = inner.offsetWidth;
                    outer.style.overflow = 'scroll';
                    w2 = inner.offsetWidth;
                    if (w1 === w2) {
                        w2 = outer.clientWidth;
                    }
                    document.body.removeChild(outer);

                    return (w1 - w2);
                },
                getAuthorClassName = function(elm, pref) {
                    var name = "",
                        class_rgx = new RegExp(pref + '[^\\s]+');
                    if (elm.is('[connect\\:author-class*="' + pref + '"]')) {
                        name = elm.attr('connect:author-class').match(class_rgx)[0];
                    }
                    return name;
                },
                //render gapmatch and subsequent proportional width container in two columns spatio-optimally
                optimalTwoColRendering = function($scrollCtnr, $gapMatch) {
                    var scrollCtnrHt = $scrollCtnr.height() - 8,
                        $gapsStimulus = $gapMatch.children('[connect\\:class~="gapsStimulus"]'),
                        gapMatchWidth = $gapMatch.outerWidth(),
                        gapsStimulusWidth = $gapsStimulus.outerWidth(),
                        splitDetails = getAuthorClassName($gapMatch, 'split-'),
                        prcntWidthLeft = parseInt(splitDetails.match(/\d{4}/)[0].substr(0, 2), 10),
                        prcntWidthRight = parseInt(splitDetails.match(/\d{4}/)[0].substr(2, 2), 10),
                        scrollbarOffset = getScrollBarWidth() + 32,
                        offsetPrcnt = Math.round((scrollbarOffset / gapMatchWidth * 1000) / 10),
                        //prcntWidth1 = Math.round((gapsStimulusWidth-scrollbarOffset)/gapMatchWidth*1000) / 10,
                        //prcntWidth0 = Math.round(gapsStimulusWidth/gapMatchWidth*1000) / 10,
                        prcntWidthOffsetLeft = prcntWidthLeft - offsetPrcnt;

                    $gapMatch.css({
                        'height': 0,
                        'overflow': 'visible',
                        'position': 'relative'
                    });
                    $gapsStimulus.css({
                        'width': prcntWidthOffsetLeft + '%',
                        'box-sizing': 'border-box',
                        'height': scrollCtnrHt + 'px',
                        'overflowY': 'scroll',
                        'position': 'fixed'
                    });
                    $gapMatch.nextAll('[connect\\:author-class~="container"]').css({
                        'display': 'inline-block',
                        'width': prcntWidthRight + '%',
                        'margin-left': prcntWidthLeft + '%'
                    });
                },
                loadFunc,
                loadItemFunc = function(itemBody) {
                    var itemIdentifier = itemBody.attr('connect:identifier'),
                        itemContent = itemBody.find('>div:last-child'),
                        cols, rows,
                        gapMatches, scrollCtnr, updateGapStimulusHeight;

                    if (itemContent.attr('connect:class') === 'columns') {
                        cols = itemContent.find('*[connect\\:class~="column"]');
                        rows = itemContent.find('*[connect\\:class~="row"]');
                        if (cols.length > 0) {
                            // columns as immediate children
                            cols.each(function(index, column) {
                                $(column).addAttrToken('connect:class', 'scroll-container');
                            });
                        } else if (rows.length === 1) {
                            // row as immediate child
                            if (rows.hasAttrToken('connect:class', 'linkedColumns')) {
                                rows.addAttrToken('connect:class', 'scroll-container');
                            } else {
                                itemContent.find('*[connect\\:class~="row"]> div').each(function(index, row) {
                                    $(row).addAttrToken('connect:class', 'scroll-container');
                                });
                            }
                        } else {
                            // rows as immediate children
                            $(itemContent[0]).wrapInner('<div/>');
                            itemContent.find('>div').addAttrToken('connect:class', 'scroll-container');
                        }
                    } else if (itemContent.find('>*[connect\\:author-class~="genericTwoColumn"]').length > 0) {
                        itemContent.find('>*[connect\\:author-class~="genericTwoColumn"] > *').each(function(index, column) {
                            $(column).addAttrToken('connect:class', 'scroll-container');
                        });
                    } else if (itemContent.attr('connect:class') === 'container') {
                        gapMatches = itemContent.find('>div[connect\\:class~="gapMatchInteraction"]:not([connect\\:author-class~="presentation-ortn-vertical"])');
                        if (gapMatches.length === 1 && itemContent.find('>*').length === 1) {
                            gapMatches.find('>*').each(function(index, section) {
                                $(section).addAttrToken('connect:class', 'scroll-container');
                            });
                        } else {
                            scrollCtnr = itemContent.wrapInner('<div/>').find('>div').addAttrToken('connect:class', 'scroll-container');
                            if (gapMatches.length === 1 && gapMatches.eq(0).nextAll().length > 0 &&
                                gapMatches.eq(0).is('[connect\\:author-class~="presentation-clippedRColHeight"]')) {
                                if (qti.preloadTestContents) {
                                    qti.screens[itemIdentifier].init.push(function() {
                                        optimalTwoColRendering(scrollCtnr, gapMatches.eq(0));
                                    });
                                } else {
                                    optimalTwoColRendering(scrollCtnr, gapMatches.eq(0));
                                }
                                updateGapStimulusHeight = function() {
                                    var scrollCtnrHt = scrollCtnr.height() - 8,
                                        $gapsStimulus = gapMatches.eq(0).children('[connect\\:class~="gapsStimulus"]');
                                    $gapsStimulus.css('height', scrollCtnrHt + 'px');
                                };
                                qti.subscribeToEvent("windowResize", updateGapStimulusHeight, "Update gap stimulus content height", "updateGapStimulusHeight_" + itemIdentifier);
                                qti.subscribeToEvent("screenChange", updateGapStimulusHeight, "Update gap stimulus content height", "updateGapStimulusHeight_onScreenchange_" + itemIdentifier);
                            }
                        }
                    }
                    // below not applied before the above conditionals
                    itemContent.addAttrToken('connect:class', 'scroll-content');

                    if (itemIdentifier && window.IScroll && qti.orientation) {
                        itemContent.addClass('orientation-sensitive-scroll')
                            .find('*[connect\\:class~="scroll-container"]').each(function() {
                                $(this).wrapInner('<div class="scroll"/>');
                                //applyContentScrolling(this);
                            });
                        enableScrollerInputs(itemContent);
                    }
                };

            if (qti.preloadTestContents) {
                loadFunc = function() {
                    $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                        loadItemFunc($(this));
                    });
                };
            } else {
                loadFunc = loadItemFunc;
            }
            qti.subscribeToEvent("itemLoad", loadFunc, "Wrap item(s) main content with scroll-enabling containers", "scrollContentsSetup");
        };

        // Set up the accessibility controls
        (function() {

            // Get Accessibility controls
            (function() {
                function getControls(xml) {
                    content = xml.find('[data-instructionsControls]')[0];
                    controls = xml.find('[data-accessControls]');
                    // This should probably be done in the server mapping file as soon as I get time
                    if (qti.mappingState === "ConnectPlus") {
                        controls.find("#access_screenRes").remove();
                    }
                    controls = controls[0];
                }

                qti.subscribeToEvent("preTestXML", getControls, "get preTestScreen XML holding accessibility controls html for accessibility dialogue", "preTestControls");
            })();

            function showScreen() {
                $('body').removeClass('loading'); // Cambridge English   
                //$('body').addClass('visible'); // ESOL
            }
            qti.subscribeToEvent("preTestXML", showScreen, "", "showScreen");

            var accessDialogue = (function() {
                var dlgSettings, accessDialogue = {},
                    openDialogue = function(dialogueTitle) {
                        if (qti.useBootstrapDialogs) {
                            dlgSettings = {
                                title: dialogueTitle,
                                message: qti.screens.settingsContent,
                                animate: false,
                                className: "help",
                                closeButton: false,
                                buttons: {
                                    main: {
                                        label: "OK",
                                        className: "btn-primary",
                                        callback: function() {}
                                    }
                                }
                            };
                            if (requirejs.defined('bootbox')) {
                                requirejs('bootbox').dialog(dlgSettings);
                            } else {
                                requirejs(["bootbox"], function(bootbox) {
                                    bootbox.dialog(dlgSettings);
                                });
                            }
                        } else {
                            dlgSettings = {
                                title: dialogueTitle, //'Universal access',
                                hasTopClose: true,
                                content: 'If you wish, you can change these settings to make the test easier to read.',
                                controls: controls,
                                img: 'images/main/access.png',
                                imgWidth: 48,
                                imgHeight: 48
                            };
                            $.dialogue(dlgSettings);
                        }
                    };

                accessDialogue.showDialogue = function(dialogueName) {
                    openDialogue(dialogueName);
                    qti.fireEvent("accessControls");
                };

                function accessEventDelegation(e) {
                    var target = $(e.target);
                    var textResize = target.attr("data-textResize");
                    if (textResize && !isNaN(Number(textResize))) {
                        accessFeatures.setTextSize(textResize);
                    }

                    var colourChange = target.attr("data-colourChange");
                    if (colourChange && !isNaN(Number(colourChange))) {
                        accessFeatures.setColour(colourChange);
                    }

                    var screenRes = target.attr("data-screenRes");
                    if (screenRes && !isNaN(Number(screenRes))) {
                        accessFeatures.setScreenRes(screenRes);
                    }
                }

                function checkForControls() {
                    var controlDiv = $("[data-accessControls]");
                    if (controlDiv.length) {
                        controlDiv.unbind("click", accessEventDelegation);
                        controlDiv.bind("click", accessEventDelegation);

                        var controlOuter = $(controlDiv[0]);

                        var textSizeElement = $(controlOuter.find("#" + textSizeValue)[0]);

                        if (textSizeElement) {
                            textSizeElement.attr("checked", "checked");
                        }

                        var screenColourElement = $(controlOuter.find("#" + screenColourValue)[0]);
                        if (screenColourElement) {
                            screenColourElement.attr("checked", "checked");
                        }

                        var screenResElement = $(controlOuter.find("#" + screenResValue)[0]);
                        if (screenResElement) {
                            screenResElement.attr("checked", "checked");
                        }

                    }
                }

                qti.subscribeToEvent("accessControls", checkForControls, "check for accessibility controls", "accessControlsCheck");
                return accessDialogue;
            })();

            attachToolbarClickEvent('[connect\\:class~="accessibilityLink"]', accessDialogue, true, "addAccessLink");
            attachToolbarClickEvent('[connect\\:class~="settingsLink"]', accessDialogue, true, "addSettingsLink");

            (function() {
                // Get Instructions/custom controls
                function getContent(xml) {
                    var ic = xml.find('[data-instructionsControls]');
                    if (ic.length > 0) {
                        content = ic[0];
                        if (qti.videoPlayer && $(content).find('div.video-js-box').length > 0) {
                            qti.videoPlayer.setupVolumeHelper(content);
                        }
                    }
                }
                qti.subscribeToEvent("instructionsStart", getContent, "get XML holding instructions content for instructions dialogue", "instructionsContent");

                // Set relevant instructions controls in place
                function setInstructionControls() {
                    var ic = $('[data-instructionsControls]');
                    if (ic.length > 0) {
                        ic.replaceWith(content);
                        if (qti.hasAccessAPI) {
                            qti.fireEvent("accessControls");
                        }
                    }
                }
                qti.subscribeToEvent("showInstructions", setInstructionControls, "where applicable, set the relevant controls into a placeholder within the instructions content", "setInstructionControls");
            })();

            var helpDialogue = (function() {
                var dlgSettings, helpDialogue = {},
                    openDialogue = function(dialogueTitle) {
                        if (qti.useBootstrapDialogs) {
                            dlgSettings = {
                                title: dialogueTitle,
                                message: content,
                                animate: false,
                                className: "help",
                                closeButton: false,
                                //size: "large",
                                buttons: {
                                    main: {
                                        label: "OK",
                                        className: "btn-primary",
                                        callback: function() {}
                                    }
                                }
                            };
                            if (requirejs.defined('bootbox')) {
                                qti.screens.helpContent = requirejs('bootbox').dialog(dlgSettings);
                            } else {
                                requirejs(["bootbox"], function(bootbox) {
                                    qti.screens.helpContent = bootbox.dialog(dlgSettings);
                                });
                            }
                        } else {
                            dlgSettings = {
                                title: dialogueTitle,
                                hasTopClose: true,
                                content: null,
                                controls: content,
                                img: 'images/main/access.png',
                                imgWidth: 48,
                                imgHeight: 48
                            };
                            $.dialogue(dlgSettings);
                        }
                    };

                helpDialogue.showDialogue = function(dialogueTitle, draggable) {
                    openDialogue(dialogueTitle);
                    if (qti.videoPlayer && $(content).find('div.video-js-box').length > 0) {
                        qti.videoPlayer.pause();
                        qti.videoPlayer.setupVolumeHelper(content);
                    }

                    qti.setupTabs(content, qti.inContextHelp);
                    if (draggable) {
                        if (qti.useBootstrapDialogs) {
                            $('body > div.modal.help > div.modal-dialog:visible').draggable({
                                handle: 'div.modal-header'
                            });
                        } else {
                            $('body > div.dialogue-wrapper:visible').draggable({
                                handle: 'div.title'
                            });
                        }
                    }
                };

                return helpDialogue;
            })();

            var instructionsDialogue = (function() {
                var instructionsDialogue = {};
                var openDialogue = function(dialogueName) {
                    $.dialogue({
                        title: dialogueName,
                        hasTopClose: true,
                        content: null,
                        controls: content,
                        img: 'images/main/instructions.png',
                        imgWidth: 48,
                        imgHeight: 48
                    });
                };

                instructionsDialogue.showDialogue = function(dialogueName) {
                    openDialogue(dialogueName);
                    if (qti.inContextHelp) {
                        qti.setupTabs(content, qti.inContextHelp);
                    } else {
                        qti.setupTabs(content);
                    }
                };

                return instructionsDialogue;
            })();

            var holdingScreenConstructor = qti.holdingScreenConstructor = function() {
                    var dialogue = {};
                    dialogue.showDialogue = function(dialogueTitle, type) {
                        $('div.note:visible').fadeOut(250);
                        if (qti.useBootstrapDialogs) {
                            qti.activeItem.hide();
                            qti.screen.hideTestControls(true);
                            if (dialogue.content) {
                                dialogue.content.show();
                            } else {
                                dialogue.content = qti.screens.holdingPagesContent.find('[data-type="' + type + '"]').clone();
                                qti.mainContent.append(dialogue.content);
                                dialogue.content.find('button.resume-test').on('click', function() {
                                    qti.activeItem.show();
                                    qti.screen.showTestControls(true);
                                    dialogue.content.hide();
                                });
                            }
                        } else {
                            $.dialogue({
                                title: dialogueTitle,
                                hasTopClose: true,
                                hideScreen: true,
                                buttons: {
                                    'Resume test': 'closeDialogue'
                                },
                                content: '<p>Your answers have been stored.</p>' +
                                    '<p>Please note that the clock is still running. The time has not been paused.</p>' +
                                    '<p>If you wish to leave the room, please tell your invigilator.</p>' +
                                    '<p>Click the button below to go back to your test.</p>',
                                img: 'images/main/screen.png',
                                imgWidth: 48,
                                imgHeight: 48
                            });
                        }
                    };

                    return dialogue;
                },
                lockDialogue = holdingScreenConstructor();

            function focusItem(helpItem) {
                if (helpItem.length > 0) {
                    requirejs([
                        "imagesloaded"
                    ], function(imagesLoaded) {
                        var container = $('.preTestInfo div.tabpanel.active');
                        imagesLoaded(container[0], function() {
                            //container.find('.flash').removeClass('flash');
                            var docTop = Math.floor(container.scrollTop()),
                                elemTop = Math.floor(helpItem.offset().top - container.offset().top),
                                scrollMargin = 6;
                            container.animate({
                                scrollTop: elemTop + docTop - scrollMargin
                            }, 1000);
                            //helpItem.addClass('flash');
                            qti.flash(helpItem);
                        });
                    });
                }
            }

            function showHelp() {
                var ri, currRId, currIntrn, refElmt, cc,
                    currentPage = $('[connect\\:class~="itemBody"]:visible'),
                    currNavItem = $('div#navigation-bar a[connect\\:state~="current"]'),
                    intrcnRef = currNavItem.attr('href');
                if (intrcnRef.indexOf('#') > 0) {
                    intrcnRef = intrcnRef.substr(intrcnRef.indexOf('#') + 1);
                } else {
                    intrcnRef = currNavItem.attr('nav');
                    if (intrcnRef) {
                        intrcnRef = intrcnRef.split('|')[0];
                    }
                }

                if (intrcnRef) {
                    currIntrn = currentPage.find('[connect\\:responseIdentifier="' + intrcnRef + '"]');
                    cc = currIntrn.closest('[connect\\:class~="interaction"]').attr('connect:class');
                }

                if (!cc) {
                    if (currentPage.is('[connect\\:identifier^="choice-accordion-stimulus"]') ||
                        currentPage.is('[connect\\:identifier^="choice-accordion-item"]')) {
                        // accordion - single answer
                        focusItem($('#helpAccordionSingle'));
                    } else {
                        return false;
                    }
                } else if (cc.indexOf('choiceInteraction') !== -1) {
                    if (currIntrn.find('input:checkbox').length > 0) {
                        focusItem($('#helpMultiChoice'));
                    } else if (currentPage.find('[connect\\:groupIdentifier^="choice-accordion-interaction"]').length > 0) {
                        // accordion - multiple answers
                        focusItem($('#helpAccordion'));
                    } else if (currIntrn.parents('[connect\\:groupIdentifier^="choice-accordion-interaction"]').length > 0) {
                        // accordion - multiple answers
                        focusItem($('#helpAccordion'));
                    } else if (currIntrn.parents('[connect\\:author-id^="choice-accordion-interaction"]').length > 0) {
                        // accordion - multiple answers
                        focusItem($('#helpAccordion'));
                    } else if (currentPage.find('.horizontalChoice').length > 0) {
                        // horizontal image choice
                        focusItem($('#helpHorizontalImage'));
                    } else if (currIntrn.is('[connect\\:author-class~="presentation-horizontalOptions"]') && currIntrn.find('ul li img').length > 0) {
                        // horizontal image choice
                        focusItem($('#helpHorizontalImage'));
                        /* } else if (currentPage.find('*[connect\\:author-class~="horizontalText"]').length > 0) {
                        	// horizontal text choice
                        	focusItem($('#helpHorizontalText')); */
                    } else if (currIntrn.is('*[connect\\:author-class~="presentation-horizontalPromptOptions"]')) {
                        // horizontal text choice
                        focusItem($('#helpHorizontalText'));
                    } else if (currIntrn.find('input:radio').length > 0) {
                        // choice 2 - simple
                        focusItem($('#helpChoice'));
                    }
                } else if (cc.indexOf('tableMatchInteraction') !== -1) {
                    focusItem($('#helpTableMatch'));
                } else if (cc.indexOf('gapMatchInteraction') !== -1) {
                    if (currentPage.find('*[connect\\:author-class~="gapTable"]').length > 0) {
                        focusItem($('#helpTableGapMatch'));
                    } else if (currentPage.find('*[connect\\:author-class~="cards"]').length > 0) {
                        focusItem($('#helpCardGapMatch'));
                    } else if (currentPage.find('*[connect\\:author-class~="blockGapText"]').length > 0) {
                        focusItem($('#helpBlockGapMatch'));
                    } else {
                        focusItem($('#helpGapMatch'));
                    }
                } else if (cc.indexOf('inlineChoiceInteraction') !== -1) {
                    focusItem($('#helpInlineChoice'));
                } else if (cc.indexOf('textEntryInteraction') !== -1) {
                    if (currentPage.find('input:text').length > 0) {
                        if (currentPage.find('ol.keywordsList').length > 0) {
                            // inline text entry with keywords
                            focusItem($('#helpTextKeywords'));
                        } else {
                            ri = currentPage.find('input:text:first').attr('connect:responseIdentifier');
                            if (currentPage.find('input:text[connect\\:responseIdentifier="' + ri + '"]').length > 1) {
                                // inline text entry multiples
                                focusItem($('#helpTextInlineMultiples'));
                            } else if (currentPage.find('.letters').length > 0) {
                                focusItem($('#helpTextLetters'));
                            } else {
                                // inline text entry
                                focusItem($('#helpTextInline'));
                            }
                        }
                    }
                } else if (cc.indexOf('extendedTextInteraction') !== -1) {
                    focusItem($('#helpTextExtended'));
                }
            }

            // Attach event to instructions button
            (function() {
                function attachLinkEvent() {
                    $('[connect\\:class~="instructionsLink"]').each(function(index, fmLink) {
                        fmLink = $(fmLink);
                        fmLink.click(function(event) {
                            instructionsDialogue.showDialogue("Instructions");
                            event.preventDefault();
                            return false;
                        });
                    });
                    $('[connect\\:class~="helpLink"]').each(function(index, fmLink) {
                        fmLink = $(fmLink);
                        fmLink.click(function(event) {
                            //instructionsDialogue.showDialogue("Help");
                            helpDialogue.showDialogue("Help", true);
                            showHelp();
                            event.preventDefault();
                            return false;
                        });
                    });
                    $('[connect\\:class~="lockLink"]').each(function(index, fmLink) {
                        fmLink = $(fmLink);
                        fmLink.click(function(event) {
                            lockDialogue.showDialogue("Screen hidden", "locked");
                            event.preventDefault();
                            return false;
                        });
                    });
                }

                qti.subscribeToEvent("testStart", attachLinkEvent, "attach click event to the instructions link", "addHelpLink");
            })();
            //attachToolbarClickEvent('[connect\\:class~="instructionsLink"]', helpDialogue, false, "addHelpLink");
        })();
    })();


    (function() {

        // The 'BaseChar' production from the XML 1.0 grammar
        var xmlBaseCharRxF = '[A-Za-z\u00c0-\u00d6' +
            '\u00d8-\u00f6\u00f8-\u00ff\u0100-\u0131\u0134-\u013e' +
            '\u0141-\u0148\u014a-\u017e\u0180-\u01c3\u01cd-\u01f0' +
            '\u01f4-\u01f5\u01fa-\u0217\u0250-\u02a8\u02bb-\u02c1\u0386' +
            '\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03ce\u03d0-\u03d6' +
            '\u03da\u03dc\u03de\u03e0\u03e2-\u03f3\u0401-\u040c' +
            '\u040e-\u044f\u0451-\u045c\u045e-\u0481\u0490-\u04c4' +
            '\u04c7-\u04c8\u04cb-\u04cc\u04d0-\u04eb\u04ee-\u04f5' +
            '\u04f8-\u04f9\u0531-\u0556\u0559\u0561-\u0586\u05d0-\u05ea' +
            '\u05f0-\u05f2\u0621-\u063a\u0641-\u064a\u0671-\u06b7' +
            '\u06ba-\u06be\u06c0-\u06ce\u06d0-\u06d3\u06d5\u06e5-\u06e6' +
            '\u0905-\u0939\u093d\u0958-\u0961\u0985-\u098c\u098f-\u0990' +
            '\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09dc-\u09dd' +
            '\u09df-\u09e1\u09f0-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10' +
            '\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36' +
            '\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8b' +
            '\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3' +
            '\u0ab5-\u0ab9\u0abd\u0ae0\u0b05-\u0b0c\u0b0f-\u0b10' +
            '\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b36-\u0b39\u0b3d' +
            '\u0b5c-\u0b5d\u0b5f-\u0b61\u0b85-\u0b8a\u0b8e-\u0b90' +
            '\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4' +
            '\u0ba8-\u0baa\u0bae-\u0bb5\u0bb7-\u0bb9\u0c05-\u0c0c' +
            '\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39' +
            '\u0c60-\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8' +
            '\u0caa-\u0cb3\u0cb5-\u0cb9\u0cde\u0ce0-\u0ce1\u0d05-\u0d0c' +
            '\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d60-\u0d61' +
            '\u0e01-\u0e2e\u0e30\u0e32-\u0e33\u0e40-\u0e45\u0e81-\u0e82' +
            '\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f' +
            '\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eae\u0eb0' +
            '\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0f40-\u0f47\u0f49-\u0f69' +
            '\u10a0-\u10c5\u10d0-\u10f6\u1100\u1102-\u1103\u1105-\u1107' +
            '\u1109\u110b-\u110c\u110e-\u1112\u113c\u113e\u1140\u114c\u114e' +
            '\u1150\u1154-\u1155\u1159\u115f-\u1161\u1163\u1165\u1167\u1169' +
            '\u116d-\u116e\u1172-\u1173\u1175\u119e\u11a8\u11ab' +
            '\u11ae-\u11af\u11b7-\u11b8\u11ba\u11bc-\u11c2\u11eb\u11f0' +
            '\u11f9\u1e00-\u1e9b\u1ea0-\u1ef9\u1f00-\u1f15\u1f18-\u1f1d' +
            '\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d' +
            '\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4' +
            '\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec' +
            '\u1ff2-\u1ff4\u1ff6-\u1ffc\u2126\u212a-\u212b\u212e' +
            '\u2180-\u2182\u3041-\u3094\u30a1-\u30fa\u3105-\u312c' +
            '\uac00-\ud7a3]';

        // The 'Ideographic' production from the XML 1.0 grammar
        var xmlIdeographicRxF = '[\u4e00-\u9fa5\u3007\u3021-\u3029]';

        // The 'Letter' production from the XML 1.0 grammar
        var xmlLetterRxF = '(?:' + xmlBaseCharRxF + '|' + xmlIdeographicRxF + ')';

        // TODO: Will be the 'CombiningChar' production from the XML 1.0 grammar
        var xmlCombiningCharRxF = '[\u0300-\u0345\u0360-\u0361\u0483-\u0486' +
            '\u0591-\u05a1\u05a3-\u05b9\u05bb-\u05bd\u05bf\u05c1-\u05c2' +
            '\u05c4\u064b-\u0652\u0670\u06d6-\u06dc\u06dd-\u06df' +
            '\u06e0-\u06e4\u06e7-\u06e8\u06ea-\u06ed\u0901-\u0903\u093c' +
            '\u093e-\u094c\u094d\u0951-\u0954\u0962-\u0963\u0981-\u0983' +
            '\u09bc\u09be\u09bf\u09c0-\u09c4\u09c7-\u09c8\u09cb-\u09cd' +
            '\u09d7\u09e2-\u09e3\u0a02\u0a3c\u0a3e\u0a3f\u0a40-\u0a42' +
            '\u0a47-\u0a48\u0a4b-\u0a4d\u0a70-\u0a71\u0a81-\u0a83\u0abc' +
            '\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0b01-\u0b03\u0b3c' +
            '\u0b3e-\u0b43\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57' +
            '\u0b82-\u0b83\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7' +
            '\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d' +
            '\u0c55-\u0c56\u0c82-\u0c83\u0cbe-\u0cc4\u0cc6-\u0cc8' +
            '\u0cca-\u0ccd\u0cd5-\u0cd6\u0d02-\u0d03\u0d3e-\u0d43' +
            '\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0e31\u0e34-\u0e3a' +
            '\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb-\u0ebc\u0ec8-\u0ecd' +
            '\u0f18-\u0f19\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84' +
            '\u0f86-\u0f8b\u0f90-\u0f95\u0f97\u0f99-\u0fad\u0fb1-\u0fb7' +
            '\u0fb9\u20d0-\u20dc\u20e1\u302a-\u302f\u3099\u309a]';

        // The 'Digit' production from the XML 1.0 grammar
        var xmlDigitRxF = '[0-9\u0660-\u0669\u06f0-\u06f9' +
            '\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef' +
            '\u0b66-\u0b6f\u0be7-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef' +
            '\u0d66-\u0d6f\u0e50-\u0e59\u0ed0-\u0ed9\u0f20-\u0f29]';

        // The 'Extender' production from the XML 1.0 grammar
        var xmlExtenderRxF = '[\u00b7\u02d0\u02d1\u0387\u0640\u0e46\u0ec6' +
            '\u3005\u3031-\u3035\u309d-\u309e\u30fc-\u30fe]';

        var identifierRx = new RegExp('^(?:_|' + xmlLetterRxF + ')(?:' +
            xmlLetterRxF + '|[\\-\\._]|' + xmlDigitRxF + '|' +
            xmlCombiningCharRxF + '|' + xmlExtenderRxF + ')*$');

        var isIdentifier = qti.isIdentifier = function(value) {
            if (arguments.length === 1) {
                return Boolean(identifierRx.exec(value));
            } else {
                throw new Error('Invalid argument count');
            }
        };

        var parseIdentifier = qti.parseIdentifier = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            if (isIdentifier(text)) {
                return text;
            } else {
                return undefined;
            }
        };

        var isSimpleIdentifier = qti.isSimpleIdentifier = function(value) {
            if (arguments.length === 1) {
                return isIdentifier(value) && String(value).indexOf('.') === -1;
            } else {
                throw new Error('Invalid argument count');
            }
        };

        var isCompositeIdentifier = qti.isCompositeIdentifier = function(value) {
            if (arguments.length === 1) {
                return isIdentifier(value) &&
                    Boolean(value.match(/^[^\.]+\.[^\.]+$/));
            } else {
                throw new Error('Invalid argument count');
            }
        };

        var createCompositeIdentifier =
            qti.createCompositeIdentifier = function(a, b) {
                if (arguments.length !== 2) {
                    throw new Error('Invalid argument count');
                } else if (!isIdentifier(a) || !isIdentifier(b)) {
                    throw new Error('Invalid identifier');
                }

                return a + '.' + b;
            };

        var parseBoolean = qti.parseBoolean = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            if (text === '1' || text === 'true') {
                return true;
            } else if (text === '0' || text === 'false') {
                return false;
            } else {
                return undefined;
            }
        };

        var INT_MAX = 2147483647;
        var INT_MIN = -2147483648;

        var isInteger = qti.isInteger = function(value) {
            if (arguments.length === 1) {
                return typeof value === 'number' && Math.floor(value) === value &&
                    value >= INT_MIN && value <= INT_MAX;
            } else {
                throw new Error('Invalid argument count');
            }
        };

        var parseInteger = qti.parseInteger = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            if (text.match(/^[\-+]?[0-9]+$/)) {
                var integer = parseInt(text, 10);
                if (qti.isInteger(integer)) {
                    return integer;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        };

        qti.getMaximumInteger = function() {
            if (arguments.length === 0) {
                return INT_MAX;
            } else {
                throw new Error('Invalid argument count');
            }
        };

        qti.getMinimumInteger = function() {
            if (arguments.length === 0) {
                return INT_MIN;
            } else {
                throw new Error('Invalid argument count');
            }
        };

        var parseQTIFloat = qti.parseQTIFloat = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            if (text.match(/^[\-+]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][\-+]?[0-9]+)?$/)) {
                return parseFloat(text);
            } else if (text === 'INF') {
                return Number.POSITIVE_INFINITY;
            } else if (text === '-INF') {
                return Number.NEGATIVE_INFINITY;
            } else if (text === 'NaN') {
                return NaN;
            } else {
                return undefined;
            }
        };

        function Point() {}
        Point.prototype = {
            constructor: undefined
        };

        var isPoint = qti.isPoint = function(value) {
            return value instanceof Point;
        };

        var createPoint = qti.createPoint = function(x, y) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isInteger(x)) {
                throw new Error('Invalid x co-ordinate');
            } else if (!isInteger(y)) {
                throw new Error('Invalid y co-ordinate');
            }

            var point = new Point();

            point.x = x;
            point.y = y;

            point.toString = function() {
                return '(' + x + ',' + y + ')';
            };

            return point;
        };

        var parsePoint = qti.parsePoint = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            var m = /^([\-+]?[0-9]+)\s+([\-+]?[0-9]+)$/.exec(text);
            if (m) {
                return createPoint(parseInt(m[1], 10), parseInt(m[2], 10));
            } else {
                return undefined;
            }
        };

        function Pair() {}
        Pair.prototype = {
            constructor: undefined
        };

        var isPair = qti.isPair = function(value) {
            return value instanceof Pair;
        };

        var createPair = qti.createPair = function(a, b) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isIdentifier(a) || !isIdentifier(b)) {
                throw new Error('Invalid identifier');
            }

            var pair = new Pair();

            pair.getA = function() {
                return a;
            };

            pair.getB = function() {
                return b;
            };

            pair.toString = function() {
                return '(' + a + ',' + b + ')';
            };
        };

        var parsePair = qti.parsePair = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            //var m = /^([^\s]+)\s+([^\s]+)$/.exec(text);
            var m = /^([^\s\:]+)[\s\:]+([^\s\:]+)$/.exec(text);
            if (m) {
                return createPair(m[1], m[2]);
            } else {
                return undefined;
            }
        };

        var isDirectedPair = qti.isDirectedPair = function(value) {
            var key = value.key(),
                val = value.value();
            return $.isDirectedPair(value) && isIdentifier(key) &&
                (isIdentifier(val) || $.isArray(val));
        };

        var createDirectedPair = qti.createDirectedPair = function(key, value) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isIdentifier(key)) {
                throw new Error('Invalid key');
            } else if (!isIdentifier(value)) {
                throw new Error('Invalid value');
            }

            return $.createDirectedPair(key, value);
        };

        var parseDirectedPair = qti.parseDirectedPair = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            //var m = /^([^\s]+)\s+([^\s]+)$/.exec(text);
            var m = /^([^\s\:]+)[\s\:]+([^\s\:]+)$/.exec(text);
            if (m) {
                return createDirectedPair(m[1], m[2]);
            } else {
                return undefined;
            }
        };

        var isDuration = qti.isDuration = $.isNumber;
        var parseDuration = qti.parseDuration = parseQTIFloat;

        var parseURI = qti.parseURI = function(text) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!$.isString(text)) {
                throw new Error('Invalid text');
            }

            text = $.trim(text);
            if ($.isURIString(text)) {
                return $.createURI(text);
            } else {
                return undefined;
            }
        };

        function Crobject() {}

        var isCrobject = qti.isCrobject = function(value) {
            var objtype = Object.keys(value)[0];
            return (value instanceof Crobject) && qti.customResponseElements && qti.customResponseElements[objtype];
        };

        var createCrobject = qti.createCrobject = function() {
            var obj, type, objSchema,
                args = Array.prototype.slice.call(arguments);
            if (args.length !== 2) {
                throw new Error('Invalid argument count');
            } else {
                type = args[0];
            }

            if ((typeof qti.customResponseElements !== "object") || $.isEmptyObject(qti.customResponseElements)) {
                throw new Error('No custom-response input types defined');
            } else if (!qti.customResponseElements[type]) {
                throw new Error('Unknown custom-response input type');
            } else {
                objSchema = qti.customResponseElements[type];
            }

            obj = new Crobject();
            obj[type] = {};
            objSchema.meta.forEach(function(metakey) {
                obj[type][metakey] = args[1][metakey];
            });
            if (objSchema.xmlns) {
                obj[type]["@xmlns"] = objSchema.xmlns;
            }

            obj.toString = function() {
                return JSON.stringify(obj);
            };

            return obj;
        };

        var parseCrobject = qti.parseCrobject = function(json) {
            var obj;
            if (typeof obj === "string") {
                obj = JSON.parse(json);
            } else {
                obj = json;
            }
            if (typeof obj !== "object" || !obj.type || !$.isString(obj.type)) {
                throw new Error('Invalid custom-response object input');
            }
            var objtype = obj.type;
            if (Object.keys(obj).length > 1) {
                return createCrobject(obj.type, obj);
            } else {
                return undefined;
            }
        };

    }());


    (function() {

        /*	var nttsToReplace = {
        		'&': '&amp;',
        		'<': '&amp;lt;',
        		'>': '&amp;gt;'
        	};
    
        	function replaceEntity(ntt) {
        		return nttsToReplace[ntt] || ntt;
        	}
    
        	function safe_ntts_replace(str) {
        		if ($.isString(str)) {
        			return str.replace(/[&<>]/g, replaceEntity);
        		}else{
        			return str;
        		}
        	}
        */
        var valueElement,
            directedPairDelimiter = ":",
            matchAnswerLabel = qti.matchAnswerLabel || "Gap",
            safe_ntts_replace = qti.safe_ntts_replace;

        if (qti.directedPairDelimiter) {
            directedPairDelimiter = qti.directedPairDelimiter;
        }

        function createValueElement(singleVal) {
            var el = $.el("", valueElement);
            el.append(singleVal);
            return el;
        }

        //String functions
        function testString(singleVal) {
            if (singleVal === undefined || $.isString(singleVal)) {
                return true;
            }
        }

        function serializeString(elem, singleVal) {
            if (singleVal === undefined) {
                return elem;
            }
            singleVal = safe_ntts_replace(singleVal);
            var val = createValueElement(singleVal);
            return elem.append(val);
        }

        // Identifier functions
        function testIdentifier(singleVal) {
            if (singleVal === undefined || qti.isIdentifier(singleVal)) {
                return true;
            }
        }

        function serializeIdentifier(elem, responseVal) {
            if (responseVal === undefined) {
                return elem;
            } else if ($.isArray(responseVal)) {
                responseVal = responseVal.join(',');
            }
            var val = createValueElement(responseVal);
            return elem.append(val);
        }

        // Directed pairs
        function testDirectedPair(singleVal) {
            if (singleVal === undefined || qti.isDirectedPair(singleVal)) {
                return true;
            }
        }

        function serializeDirectedPair(elem, singleVal) {
            if (singleVal === undefined) {
                return elem;
            }
            var val = singleVal.key() + directedPairDelimiter + singleVal.value();
            return elem.append(createValueElement(val));
        }

        // 06/03/2013 - added in order to generate single value-element with comma-separated directedPair values
        // 02/06/2015 - updated to pad the serialised directedPair response data (for multi-cardinality match interactions),
        //			  with blank values for any non-answered question elements
        // 26/08/2015 - updated to use the maxChoices property of relevant responseVariable to produce the required response format,
        //			  rather than the set of question navigation elements, which can be generated as split or combined,
        //			  depending on business-unit's test requirements
        // 26/02/2016 - updated again to use more resilient call to qti.getVariable(), and thus prevent serialization errors on test-end.
        function serializeDirectedPairs(elem, multiVal) {
            if (multiVal === undefined) {
                return elem;
            }

            var a = 0,
                matchedKeys = 0,
                key,
                answersMap = {},
                answerKeys = [],
                vals = [],
                rspId = elem.attr('responseIdentifier'),
                itemId = elem.attr('itemIdentifier'),
                rspVar = qti.getVariable(rspId, itemId),
                maxAnswers = rspVar && rspVar.getMaxChoices();

            multiVal.ulibEach(function(val) {
                //vals.push( val.key() + directedPairDelimiter + val.value() );
                answersMap[val.key()] = val.value();
            });

            if (maxAnswers && maxAnswers > 0) {
                answerKeys = Array(maxAnswers).map(function() {
                    return matchAnswerLabel + (++a);
                });
            } else {
                do {
                    key = matchAnswerLabel + (++a);
                    answerKeys.push(key);
                    if (answersMap[key]) {
                        matchedKeys++;
                    }
                } while (matchedKeys < multiVal.length);
            }

            answerKeys.forEach(function(key) {
                if (answersMap[key]) {
                    vals.push(key + directedPairDelimiter + answersMap[key]);
                } else {
                    vals.push(key + directedPairDelimiter);
                }
            });

            return elem.append(createValueElement(vals.join(',')));
        }

        // Points
        function testPoint(singleVal) {
            if (singleVal === undefined || qti.isPoint(singleVal)) {
                return true;
            }
        }

        function serializePoint(elem, singleVal) {
            if (singleVal === undefined) {
                return elem;
            }
            var val = singleVal.x + " " + singleVal.y;
            return elem.append(createValueElement(val));
        }

        function serializePoints(elem, multiVal) {
            var idx, val, retval = "";
            if (multiVal === undefined) {
                return elem;
            }

            if ($.isArray(multiVal)) {
                for (idx = 0; idx < multiVal.length; idx += 1) {
                    val = multiVal[idx];
                    //retval += (idx === 0 ? '' : ',') + val.x + ' ' + val.y;
                    //retval += (retval ? "," : "") + (val ? val.x + ' ' + val.y : "");
                    retval += (idx === 0 ? '' : ',') + (val ? val.x + ' ' + val.y : "");
                }
            } else {
                retval += (multiVal.x + ' ' + multiVal.y);
            }

            return elem.append(createValueElement(retval));
        }

        // Crobjects
        function testCrobject(singleVal) {
            if (singleVal === undefined || qti.isCrobject(singleVal)) {
                return true;
            }
        }

        function serializeCrobjects(elem, multiVal) {
            var valStr = "";
            multiVal.forEach(function(obj) {
                var xmlText = JXON.jsToString(obj);
                valStr += xmlText;
            });
            return elem.append(createValueElement(valStr));
        }

        // Floats
        function testFloat(singleVal) {
            if (singleVal === undefined || $.isNumber(singleVal)) {
                return true;
            }
        }

        var serializeFloat = serializeString;

        // Base Types
        var baseTypes = {
            "string": {
                "test": testString,
                "serializer": serializeString
            },
            "identifier": {
                "test": testIdentifier,
                "serializer": serializeIdentifier
            },
            "directedPair": {
                "test": testDirectedPair,
                "serializer": serializeDirectedPairs
            },
            "point": {
                "test": testPoint,
                "serializer": serializePoints
            },
            "crobject": {
                "test": testCrobject,
                "serializer": serializeCrobjects
            },
            "float": {
                "test": testFloat,
                "serializer": serializeFloat
            }
        };

        // Cardinality Routines
        function cardinalitySingle(baseType, valueObj, XMLItemVariable) {
            if (!baseTypes[baseType].test(valueObj)) {
                throw new Error("Value type does not match basetype");
            }

            return baseTypes[baseType].serializer(XMLItemVariable, valueObj);
        }

        function cardinalityMultiple(baseType, valueObj, XMLItemVariable) {
            // With multiple cardinality, the value obj should be an array of values of type baseType
            if (valueObj !== undefined && !$.isArray(valueObj)) {
                throw new Error("Value does not match cardinality");
            }

            if (valueObj === undefined) {
                return XMLItemVariable;
            }

            valueObj.ulibEach(function(val) {
                if (!baseTypes[baseType].test(val)) {
                    throw new Error("Value type does not match basetype");
                }

                //XMLItemVariable = baseTypes[baseType].serializer(XMLItemVariable, val);
            });
            //return XMLItemVariable;
            return baseTypes[baseType].serializer(XMLItemVariable, valueObj);
        }

        function serializeJS(jsPrimitive) {
            if (!jsPrimitive) { // i.e. if the value is empty, null or undefinied
                return "";
            }

            switch (typeof jsPrimitive) {
                // just return the object itself since its default .toString()
                case 'number':
                case 'boolean':
                    return jsPrimitive;

                case 'function':
                    throw new Error("Functions cannot be serialized!");

                case 'string':
                    return '"' + safe_ntts_replace(jsPrimitive) + '"';

                case 'object':
                    var str;
                    if ($.isArray(jsPrimitive)) {
                        str = '[';
                        var i, len = jsPrimitive.length;
                        for (i = 0; i < len - 1; i++) {
                            str += serializeJS(jsPrimitive[i]) + ',';
                        }
                        str += serializeJS(jsPrimitive[i]) + ']';
                    } else if ($.isHash(jsPrimitive)) {
                        str = '{';
                        jsPrimitive.ulibEach(function(pair) {
                            str += pair.key() + ':' + serializeJS(pair.value()) + ',';
                        });
                        str = str.replace(/\,$/, '') + '}';
                    } else {
                        throw new Error("Incorrect object type presented for serialization");
                    }
                    return str;

                default:
                    return 'Serializer Reaching Default';
            }

            return "Serialize Issue";
        }

        function typeofPrim(prim) {
            if (!prim) {
                return "null";
            }
            var obj = {};
            var type = obj.toString.call(prim).split(" ")[1];
            type = type.substring(0, type.length - 1);
            return type;
        }


        function createStateElement(state) {
            var stateValue = serializeJS(state);
            if (!stateValue) {
                return null;
            }
            var stateElem = $.el("", "state");
            stateElem.append(stateValue);
            return stateElem;
        }


        // All values can be their type or undefined - hence they have their own test functions
        var createSerializedXMLResults = qti.createSerializedXMLResults = function(id, baseType, cardinality, state, valueObj) {
            if (arguments.length !== 5) {
                throw new Error("Invalid argument count");
            }

            var XMLItem, XMLItemVariable,
                idArray = id.split(/\./),
                XMLItemVariableAttributes = {
                    "baseType": baseType,
                    "cardinality": cardinality,
                    "itemIdentifier": idArray[0],
                    "responseIdentifier": idArray[1]
                },
                cardinalities = {
                    "single": {
                        "func": cardinalitySingle
                    },
                    "ordered": {
                        "func": cardinalityMultiple
                    },
                    "multiple": {
                        "func": cardinalityMultiple
                    }
                };

            if (!cardinalities[cardinality]) {
                throw new Error("Unknown cardinality");
            }

            if (!baseTypes[baseType]) {
                throw new Error("Unknown Base Type");
            }

            if (idArray[0] === 'candidateInformation') {
                if (cardinality === "multiple") {
                    valueObj = valueObj.join(",");
                    cardinality = "single";
                }
                valueElement = "response-value";
                XMLItem = $.el("", "candidateInformationResponse");
            } else {
                valueElement = "value";
                XMLItem = $.el("", "response", XMLItemVariableAttributes);
            }
            XMLItemVariable = cardinalities[cardinality].func(baseType, valueObj, XMLItem);

            // Make state Element and append it to the parent of the value element
            var stateElem = createStateElement(state);
            if (stateElem) {
                XMLItemVariable.append(stateElem);
            }
            return (XMLItemVariable);
        };

    }());

    // QTI Results deserialisation
    (function() {
        /*	var nttsToReverseReplace = {
        		// order significant - longer string patterns must be replaced before their substrings
        		'&amp;lt;': '<',
        		'&amp;gt;': '>',
        		'&amp;': '&'
        	};
    
    
        	function safe_ntts_reverse_replace(str) {
        		$.each(nttsToReverseReplace, function(key, val) {
        			var rgx = new RegExp(key, "g");
        			str = str.replace(rgx, val);
        		});
        		return str;
        	}
        */
        var safe_ntts_reverse_replace = qti.safe_ntts_reverse_replace;

        function deSerializeJS(stateString, stringPosition) {
            // ss = the whole state string
            var num = stringPosition;
            var ss = stateString;
            var len = ss.length;
            var val = ""; // value to be returned
            var c; // current character being parsed

            function getNextChar() {
                num = num + 1;
                c = ss.charAt(num);
            }

            function ignoreTrash() {
                while (c.match(/(\s|,|\:)/)) {
                    getNextChar();
                }
            }

            // PARSING FUNCTIONS
            // Parse String
            function parseString() {
                var escaping = false;
                var s = "";
                getNextChar();

                while (c !== '"' || escaping) {
                    escaping = (c === '\\' && !escaping) ? true : false;
                    s += c;
                    getNextChar();
                }
                getNextChar(); // To push past the closing "
                ignoreTrash();
                return safe_ntts_reverse_replace(s); // 21/03/2013 sanitisation added to handle hazardous html entities
            }

            // Parse Bool
            function parseBoolean() {
                var s = "";
                while (c !== "e") {
                    s += c;
                    getNextChar();
                }
                s += "e";
                return Boolean(s);
            }

            // Parse Array
            function parseArray() {
                var a = [];
                getNextChar();

                while (c !== "]") {
                    ignoreTrash();
                    var value = parse();
                    a.push(value);
                    if (typeof value !== "string" && typeof value !== "number") {
                        getNextChar();
                    }
                }

                return a;
            }

            // Parsing Numbers
            function parseNumber() {
                var s = "";
                while (c.match(/[0-9]/)) {
                    s += c;
                    getNextChar();
                }

                return Number(s);
            }

            // Parsing Objects
            function parseObject() {
                var obj = $.createHash();
                getNextChar();

                while (c !== "}") {
                    ignoreTrash();
                    if (c !== '"') {
                        throw new Error("Incorrect Key value");
                    }
                    var key = parseString();

                    var value = parse();
                    obj.set(key, value);
                    if (typeof value !== "string" && typeof value !== "number") {
                        getNextChar();
                    }
                }

                return obj;
            }

            // Determine how to parse the string and what to do with the remainder
            function parse() {
                ignoreTrash();

                if (c === '"') {
                    val = parseString();
                } else if (c === '[') {
                    val = parseArray();
                } else if (c.match(/t|f/i)) {
                    val = parseBoolean();
                } else if (c.match(/[0-9]/)) {
                    val = parseNumber();
                } else if (c === '{') {
                    val = parseObject();
                }

                return val;
            }

            if (len > num) {
                getNextChar();
                val = parse();
            }

            return val;
        }

        var deserializeXML = qti.deserializeXML = function(xml) {
            /*+ For test, when working directly on the js object, there is no root doc
             *  so item does not exist
             *  This probably won't be necessary in the real world, but for now it helps with no test server */
            var item = xml.find('response');
            if (item.length === 0) {
                item = xml;
            }

            var baseType = item.attr("baseType");
            var cardinality = item.attr("cardinality");
            var identifier = item.attr("itemIdentifier") + "." + item.attr("responseIdentifier");
            var valueElm = item.find('value');
            var stateString = item.find('state').text();
            var state = (stateString) ? deSerializeJS(stateString, -1) : undefined;
            var qtiValue;

            // Construction functions

            // STRINGS
            function constructString(val) {
                return safe_ntts_reverse_replace(val.text());
            }

            // IDENTIFIERS
            function constructIdentifier(val) {
                return val.text().split(',');
            }

            // Directed Pairs
            function constructDirectedPair(val) {
                var str;
                if (typeof val === "string") {
                    str = val;
                } else if (val.text) {
                    str = val.text();
                } else {
                    return;
                }
                return qti.parseDirectedPair(str);
            }
            // 06/03/2013 - added to handle the single value-element, comma-separated formating of directedPair values
            // 02/06/2015 - updated to read response data string (for multi-cardinality match interactions),
            //			  create directedPair objects for 'Gap#' elements with valid identifier values,
            //			  and skip any 'Gap#' elements with an empty identifier value.
            // 02/03/2016 - updated from 'constructDirectedPairs' to 'parseDelimitedValues', so as to apply to multiple basetypes
            function parseDelimitedValues(valElm, delim, parseFn) {
                var valArray = [],
                    vals = valElm.text();
                if (vals) {
                    vals = vals.split(delim);
                    vals.forEach(function(valstr) {
                        //var rspElmt = qti.parseDirectedPair(valstr);
                        var rspElmt = parseFn(valstr);
                        if (rspElmt) {
                            valArray.push(rspElmt);
                        }
                    });
                }
                return valArray;
            }

            // POINTS
            function constructPoint(val) {
                var str;
                if (typeof val === "string") {
                    str = val;
                } else if (val.text) {
                    str = val.text();
                } else {
                    return;
                }
                if (str === "") {
                    return undefined;
                } else {
                    return qti.parsePoint(str);
                }
            }

            // FLOATS
            function constructFloat(val) {
                return Number(val.text());
            }

            // CROBJECTS
            function constructCrobjects(valElm) {
                var valArray = [],
                    rspElmts = valElm.children();
                if (rspElmts.length > 0) {
                    rspElmts.each(function(i, elmt) {
                        var xmlText = JXON.xmlToString(elmt),
                            obj = JXON.stringToJs(xmlText),
                            type, rspElmt;
                        if (obj) {
                            type = Object.keys(obj)[0];
                            rspElmt = qti.createCrobject(type, obj[type]);
                            valArray.push(rspElmt);
                        }
                    });
                }
                return valArray;
            }

            // Base Types
            var baseTypes = {
                "string": {
                    "deSerializer": constructString
                },
                "identifier": {
                    "deSerializer": constructIdentifier
                },
                "directedPair": {
                    "deSerializer": constructDirectedPair
                },
                "point": {
                    "deSerializer": constructPoint
                },
                "float": {
                    "deSerializer": constructFloat
                },
                "crobject": {
                    "deSerializer": constructCrobjects
                }
            };

            if (cardinality === "single") {
                if (valueElm.length > 0) {
                    qtiValue = baseTypes[baseType].deSerializer(valueElm);
                    if ($.isArray(qtiValue)) {
                        qtiValue = qtiValue[0];
                    }
                }
            } else if (cardinality === "multiple" || cardinality === "ordered") {
                /* var valueArray = [];
                valueElm.each(function(i, v) {
                	var currentValue = baseTypes[baseType].deSerializer($(v));
                	valueArray.push(currentValue);
                });
                qtiValue = valueArray; */
                if (valueElm.length > 0) {
                    if (baseType === "directedPair" || baseType === "point") {
                        qtiValue = parseDelimitedValues(valueElm, ',', baseTypes[baseType].deSerializer);
                    } else {
                        qtiValue = baseTypes[baseType].deSerializer(valueElm);
                    }
                }
            }

            var json = {
                id: identifier,
                baseType: baseType,
                cardinality: cardinality,
                state: state,
                value: qtiValue
            };

            return json;
        };
    }());

    (function() {
        function Item() {}
        Item.prototype = {
            constructor: undefined
        };

        var ready = false;

        var itemList = [];
        var itemGroups = qti.itemGroups = {};
        var itemIdentifierHash = $.createHash();
        var currentItem;
        var currentAIndex = 0;
        var subInteractionAIndex = -1;
        var currentItemAIndex = {};
        var assessmentItemRefElements;
        var computedStyle = qti.computedStyle;
        var isItem = qti.isItem = function(value) {
            return value instanceof Item;
        };
        var screens = qti.screens = {};

        function assertReady() {
            if (!ready) {
                throw new Error('Not yet ready; wait for itemsReady');
            }
        }

        var getItems = qti.getItems = function() {
            assertReady();
            return $.createIterator(itemList);
        };

        var getFirstItem = qti.getFirstItem = function() {
            assertReady();
            return itemList[0];
        };

        var getLastItem = qti.getLastItem = function() {
            assertReady();
            return itemList[itemList.length - 1];
        };

        var getPreviousItem = qti.getPreviousItem = function() {
            assertReady();
            return currentItem && currentItem.getPreviousItem();
        };

        var getCurrentItem = qti.getCurrentItem = function() {
            assertReady();
            return currentItem;
        };

        var getNextItem = qti.getNextItem = function() {
            assertReady();
            return currentItem && currentItem.getNextItem();
        };

        var getItemWithIdentifier =
            qti.getItemWithIdentifier = function(identifier) {
                assertReady();
                if (arguments.length !== 1) {
                    throw new Error('Invalid argument count');
                } else if (!qti.isSimpleIdentifier(identifier)) {
                    throw new Error('Invalid item identifier');
                }
                return itemIdentifierHash.get(identifier);
            };

        var checkCompositeInteractionStatus =
            qti.checkCompositeInteractionStatus = function(itemId, rspId, aElm) {
                var subIntId, rspVar, rspObj, baseType, keys, qnElm,
                    navstr = aElm.attr('nav');

                if (navstr) {
                    rspVar = qti.getVariable(rspId, itemId);
                    baseType = rspVar.getBaseType();
                    rspObj = rspVar.getValue();
                    if (rspObj) {
                        if (baseType === 'string') {
                            qnElm = qti.activeItem && qti.activeItem.find('span.questionNumber[data-nav="' + navstr + '"]');
                            return (qnElm && qnElm.next('input').val() !== '') ? true : false;
                        } else if (baseType === 'identifier') {
                            qnElm = qti.activeItem && qti.activeItem.find('span.questionNumber[data-nav="' + navstr + '"]');
                            return (!qnElm || qnElm.attr('data-interaction-identifier') === '') ? false : true;
                        } else if (baseType === 'directedPair') {
                            subIntId = (navstr.indexOf(rspId) !== -1) && navstr.slice(rspId.length + 1);
                            if (subIntId) {
                                keys = rspObj.toHash().keys();
                                if (keys.indexOf(subIntId) !== -1 || keys.indexOf('Gap' + subIntId) !== -1) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                qnElm = qti.activeItem && qti.activeItem.find(
                                    '[connect\\:responseIdentifier="' + rspId + '"] span.questionNumber[data-nav="' + navstr + '"]');
                                return (!qnElm || qnElm.attr('data-interaction-identifier') === '') ? false : true;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

        function checkResponseStatuses(item, itemInteractions, aElement) {
            var itemIdentifier = item.getIdentifier(),
                responseStatuses = itemInteractions.map(function(rId) {
                    return qti.responseStatus(itemIdentifier, rId);
                }),
                attempted = responseStatuses.filter(function(s) {
                    return s === 'completed' || s === 'attempted';
                }).length !== 0,
                completed = (responseStatuses.filter(function(s) {
                        return s === 'completed';
                    }).length === responseStatuses.length ||
                    ((itemInteractions.length > 1 && responseStatuses.filter(function(s) {
                            return s === '';
                        }).length === 0) &&
                        (itemInteractions.map(function(rId) {
                            var rspVar = qti.getVariable(rId, itemIdentifier),
                                maxChoices = rspVar && rspVar.getMaxChoices();
                            return maxChoices && maxChoices > 1;
                        }).length === 0)
                    ));

            item.setCompleted(completed, aElement);
            item.setAttempted(completed || attempted);
        }

        function checkResponseStatus(item, aElement) {
            var interactions,
                navRef = aElement.attr('nav'),
                check = function($a) {
                    var itemIdentifier = item.getIdentifier(),
                        responseIdentifier = $a.href().getFragment(),
                        responseStatus = qti.responseStatus(itemIdentifier, responseIdentifier),
                        subItemEntered;
                    if (ready && aElement.is('.subInteraction')) {
                        subItemEntered = qti.checkCompositeInteractionStatus(itemIdentifier, responseIdentifier, $a);
                    }
                    item.setCompleted(responseStatus === "completed", $a, subItemEntered);
                    item.setAttempted(responseStatus === "completed" || responseStatus === "attempted", $a, subItemEntered);
                };

            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isItem(item)) {
                throw new Error('Invalid item');
            }

            if (aElement.is('.subInteraction')) {
                aElement.parent().find('a.subInteraction').each(function(index, el) {
                    check($(el));
                });
            } else if (navRef) {
                interactions = navRef.split('|');
                checkResponseStatuses(item, interactions, aElement);
            } else {
                check(aElement);
            }
        }

        var setupItems = qti._setupItems = function() {
            var mainContent = qti.mainContent = $('[role~="main"]'),
                previousButtons = $('a[connect\\:function~="previous"]'),
                nextButtons = $('a[connect\\:function~="next"]'),
                markForReviewCheckbox = $('input[type="checkbox"][connect\\:function~="mark-for-review"]')
                .change(function(event) {
                    getCurrentItem().setMarkedForReview($(this).checked());
                }),
                nav = $('#navigation-bar'),
                navViewControls = nav.find('.views a'),
                reviewSettings = $.createHash();

            if (navViewControls.length > 0) {
                navViewControls.click(function(e) {
                    e.preventDefault();
                    nav.toggleClass('minimised maximised');
                    qti._onResize();
                    $(this).focus();
                });
            }

            var changeItem, //selectedItem,
                scrollToItem = qti.scrollToItem = function(container, fItem, scrollToPos) {
                    var docTop, docBottom, elemTop, elemBottom, itemIshidden, scrollMargin = 12,
                        visibleInteractions = fItem.filter(':visible');
                    if (visibleInteractions.length > 0 && container.length) {
                        if (!scrollToPos) {
                            docTop = Math.floor(container.scrollTop());
                            docBottom = Math.floor(container.height()); //Math.floor(docTop + container.height()) - docTop,
                            elemTop = Math.floor(visibleInteractions.offset().top - container.offset().top);
                            elemBottom = Math.floor(elemTop + visibleInteractions.outerHeight());
                            itemIshidden = (elemTop < 0) || (docBottom < elemBottom);

                            if (visibleInteractions.is('dt')) {
                                scrollMargin += 30;
                            }
                            if (itemIshidden) {
                                scrollToPos = elemTop + docTop;
                            }
                        }

                        if (scrollToPos) {
                            container.animate({
                                scrollTop: scrollToPos - scrollMargin
                            }, 1000);
                        }
                    }
                };

            function findInteractionAnchor(elm) {
                var interaction, col, anc, span;
                if (elm.is('td')) {
                    interaction = elm.parents('[connect\\:responseIdentifier]');
                    if (interaction.is('[connect\\:author-class~="transposeView"]')) {
                        col = elm.parent().find('td').index(elm);
                        anc = interaction.find('thead tr th:eq(' + col + ')');
                    } else {
                        anc = elm.parent().children(':first');
                    }
                    if (anc.is('[nav]')) {
                        return anc;
                    } else {
                        return null;
                    }
                } else if (elm.is('input:checkbox') || elm.is('input:radio')) {
                    var val = elm.val();
                    interaction = elm.parents('[connect\\:responseIdentifier]');
                    if (interaction.is('.ui-accordion-content')) {
                        interaction = interaction.prev('h3[connect\\:responseIdentifier]');
                    }
                    span = interaction.find('span[data-interaction-identifier="' + val + '"]');
                    if (span.length === 0) {
                        span = interaction.find('span[data-interaction-identifier=""]').first();
                    }
                    if (span.length === 0) {
                        span = interaction.find('span.questionNumber');
                    }
                    return span;
                } else if (elm.is('[nav]')) {
                    return elm;
                } else {
                    return null;
                }
            }

            function highlightSelection(ancElement) {
                var currentFocus = mainContent.find('.inFocus');
                if (currentFocus.find(ancElement).length > 0) {
                    return;
                }
                currentFocus.removeClass('inFocus').find('input[type="text"]:focus').blur();
                if (ancElement.is('td,th')) {
                    if (ancElement.parents('[connect\\:responseIdentifier]').is('[connect\\:author-class~="transposeView"]')) {
                        var table = ancElement.parents('table'),
                            col = ancElement.parent().find('td,th').index(ancElement);
                        table.find('tr').each(function() {
                            $(this).find('td:eq(' + col + ')').addClass('inFocus');
                        });
                    } else {
                        ancElement.parent().find('td').addClass('inFocus');
                    }
                } else if (ancElement.is('.ui-accordion-header, [connect\\:class~="ChoiceInteraction"], [connect\\:author-class~=presentation-horizontalPromptOptions]>span.questionNumber')) {
                    ancElement.closest('[connect\\:responseIdentifier]').addClass('inFocus');
                } else {
                    ancElement.addClass('inFocus');
                    if (ancElement.is('.lettersContainer') && ancElement.has(':focus').length === 0) {
                        ancElement.find('span.dash:first').focus();
                    } else if (ancElement.is('.maths-entry')) {
                        ancElement.find('span.math').focus();
                    } else {
                        ancElement.find('input:text').eq(0).focus();
                    }
                }
            }

            var questionFocusHandler = qti.questionFocusHandler = function(event) {
                event.stopPropagation();
                var intrcn = $(this),
                    interactions = qti.activeItem.find('*[connect\\:class~="interaction"], *[connect\\:class~="interaction"] td, *[nav], *[data-nav], .interaction, .maths-entry'),
                    navref = intrcn.closest('[connect\\:responseIdentifier]').attr('connect:responseIdentifier'), // due to sub interactions
                    itemref = intrcn.closest('div[connect\\:identifier]').attr('connect:identifier'), // div used to target topmost itemBody container, but not full-proof
                    targetInteractions, index, subInts, ctnrSlctr, activeHighlight, focusTarget, leftHolder, dataNav;
                if (!navref) {
                    navref = intrcn.children('input,select,textarea').attr('connect:responseIdentifier');
                }
                if (navref && itemref) {
                    if (itemGroups[itemref]) {
                        itemref = itemGroups[itemref][navref];
                    }

                    if (intrcn.is('input.interaction')) {
                        targetInteractions = intrcn.filter('[connect\\:responseIdentifier="' + navref + '"],:has([connect\\:responseIdentifier="' + navref + '"])').parent()
                            .map(function() {
                                if (qti.activeItem.has(this).length > 0) {
                                    return this;
                                }
                            });
                        dataNav = targetInteractions.find('*[data-nav]').attr('data-nav');
                    } else if (intrcn.parents('[connect\\:responseIdentifier]').length > 0) {
                        targetInteractions = findInteractionAnchor(intrcn);
                        if (targetInteractions === undefined || targetInteractions === null) {
                            return;
                        }
                        index = qti.activeItem.find('*[connect\\:responseIdentifier="' + navref + '"] *[nav], *[connect\\:responseIdentifier="' + navref + '"] *[data-nav]').index(targetInteractions);
                    } else {
                        targetInteractions = interactions.filter('[connect\\:responseIdentifier="' + navref + '"],:has([connect\\:responseIdentifier="' + navref + '"])')
                            .map(function() {
                                if (qti.activeItem.has(this).length > 0) {
                                    return this;
                                }
                            });
                    }
                    subInts = targetInteractions.find('[nav]');
                    if (subInts.length > 1) {
                        return;
                    }
                    if (!targetInteractions.hasClass('inFocus')) {
                        //if (targetInteractions.closest('.ui-accordion').length === 0) {
                        //}
                        if (targetInteractions.is('*[connect\\:class~="gap"]') && targetInteractions.closest('*[connect\\:author-class~="presentation-clippedRColHeight"]').length) {
                            ctnrSlctr = '[connect\\:author-class~="left"]';
                        } else {
                            ctnrSlctr = '[connect\\:class~="scroll-container"]';
                        }
                        scrollToItem(targetInteractions.closest(ctnrSlctr), targetInteractions);
                        highlightSelection(targetInteractions);
                        qti.highlightNavItem(navref, itemref, index, dataNav);

                        // related keywords
                        focusTarget = (targetInteractions.is('[connect\\:responseIdentifier]')) ?
                            targetInteractions.attr('connect:responseIdentifier') :
                            (targetInteractions.is('[connect\\:identifier]')) ?
                            navref + '-' + targetInteractions.attr('connect:identifier') :
                            '';

                        $('em[connect\\:author-class~="' + focusTarget + ' highlight"]').addClass('inFocus');
                        // also where element with responseIdentifier is inside targetInteraction eg textEntryInteraction
                        /*$('em[connect\\:author-class~="' + targetInteractions.find('[connect\\:responseIdentifier]').attr('connect:responseIdentifier') + ' highlight"]')
                        	.addClass('inFocus');*/
                        $('em[connect\\:author-class~="highlight"]')
                            .filter('em[connect\\:author-class~="' + targetInteractions.find('[connect\\:responseIdentifier]').attr('connect:responseIdentifier') + '"]')
                            .addClass('inFocus');

                        qti.activeItem.find('div.separateStimulus *[data-interaction-identifier]').eq(index).addClass('inFocus');
                        //activeHighlight = qti.activeItem.find('em[connect\\:author-class~="' +
                        //	targetInteractions.find('[connect\\:responseIdentifier]').attr('connect:responseIdentifier') + '"]');
                        activeHighlight = qti.activeItem.find('em[connect\\:author-class~="' + navref + '"]');
                        if (activeHighlight.length) {
                            leftHolder = activeHighlight.closest('[connect\\:author-class="left"]');
                            leftHolder.scrollTop(activeHighlight.position().top - leftHolder.offset().top);
                        }
                    }
                }
            };

            function setupQuestionsFocus( /*aIndexElement*/ ) {
                var $els;
                if (qti.touchDeviceSupport) {
                    $els = $('[connect\\:class~="interaction"] :input, ' +
                        '[connect\\:class~="interaction"] td, ' +
                        '[connect\\:class="choiceInteraction"] span[nav], ' +
                        '[connect\\:class~="itemBody"] [nav], ' +
                        '.interaction');
                    $els.bind('touchstart focus', questionFocusHandler);
                } else {
                    $els = $('[connect\\:class~="interaction"], ' +
                        '[connect\\:class~="interaction"] :input, ' +
                        '[connect\\:class~="interaction"] td, ' +
                        '[connect\\:class="choiceInteraction"] span[nav], ' +
                        '[connect\\:class~="itemBody"] [nav], ' +
                        '.interaction');
                    $els.bind('click focus', questionFocusHandler);
                }
            }

            function activeInteractionFocus(rspId) {
                var targetQuestion, targetInteraction;

                if (rspId) {
                    if (subInteractionAIndex !== -1) {
                        targetQuestion = qti.activeItem.find('[connect\\:responseIdentifier="' + rspId + '"] span.questionNumber:eq(' + subInteractionAIndex + ')');
                        if (targetQuestion.length === 0) {
                            targetInteraction = qti.activeItem.find('*[connect\\:responseIdentifier="' + rspId + '"] *[nav]:eq(' + subInteractionAIndex + ')');
                        } else {
                            targetInteraction = targetQuestion.parent();
                        }
                    } else {
                        targetQuestion = qti.activeItem.find('span.questionNumber:eq(' + currentAIndex + ')');
                        targetInteraction = targetQuestion.parent();
                    }
                } else {
                    targetQuestion = qti.activeItem.find('span.questionNumber:first');
                    if (targetQuestion.is('[connect\\:responseIdentifier]')) {
                        rspId = targetQuestion.attr('connect:responseIdentifier');
                    } else {
                        targetInteraction = targetQuestion.parent();
                    }
                }

                if (!targetInteraction || targetInteraction.length === 0 ||
                    !targetInteraction.is('[connect\\:class~="interaction"],[connect\\:responseIdentifier],[connect\\:identifier],.interaction')) {
                    if (rspId) {
                        targetInteraction = qti.activeItem.find('[connect\\:responseIdentifier="' + rspId + '"]');
                    } else {
                        targetInteraction = qti.activeItem.find('[connect\\:responseIdentifier]:first');
                    }
                    targetInteraction = targetInteraction.closest('[connect\\:class~="interaction"],.interaction');
                } else if (targetInteraction.find('dt[class~="interaction"] a').length > 0) {
                    targetInteraction = targetInteraction.find('dt[class~="interaction"] a');
                }


                if (targetInteraction.is('[class*="ui-droppable"]') || !targetInteraction.is('[class*="ui-"]')) {
                    targetInteraction.triggerHandler('focus');
                } else {
                    targetInteraction.click();
                }
            }

            function switchNavigableItem(item, aIndexElement, navref) {
                var navAElements, previousItem, nextItem,
                    identifier = item.getIdentifier();

                if (isItem(currentItem)) {
                    currentItem.getAElement().removeAttrToken('connect:state', 'current');
                }

                currentItem = item;

                if (aIndexElement && aIndexElement.length) {
                    aIndexElement.addAttrToken('connect:state', 'current');
                    currentAIndex = currentItem.getAElement().index(aIndexElement);
                    if (navref) {
                        navAElements = currentItem.getAElement().filter('[href$="' + navref + '"]');
                        if (navAElements.length > 1) {
                            subInteractionAIndex = navAElements.index(aIndexElement);
                        } else {
                            subInteractionAIndex = -1;
                        }
                    }
                } else {
                    $(currentItem.getAElement()[0]).addAttrToken('connect:state', 'current');
                    currentAIndex = 0;
                }

                currentItemAIndex[identifier] = currentAIndex;

                previousItem = currentItem.getPreviousItem();
                previousButtons.href(previousItem && previousItem.getURI());

                nextItem = currentItem.getNextItem();
                nextButtons.href(nextItem && nextItem.getURI());

                markForReviewCheckbox.checked(currentItem.isMarkedForReview());
                if ($.mobile) {
                    markForReviewCheckbox.checkboxradio('refresh');
                }

                return identifier;
            }

            qti.highlightNavItem = function(navref, itemref, index, dataNav) {
                var item, aElement = (dataNav ? $('#navigation-bar a[href$="' + navref + '"][nav$="' + dataNav + '"]') :
                    $('#navigation-bar a[href$="' + navref + '"]'));

                if (aElement.length === 0) { // 23/04/2014: || aElement.is('.subInteraction')
                    aElement = $('#navigation-bar li[connect\\:identifier=' + itemref + ']>a');
                }
                if (aElement.length > 1) {
                    if (index === undefined) {
                        if (subInteractionAIndex !== -1) {
                            index = subInteractionAIndex;
                        } else if (aElement.is('.subInteraction')) {
                            index = subInteractionAIndex = 0;
                        } else {
                            index = currentAIndex; // 14/05/2014: Should never get here as currentAIndex shouldn't apply to subInteractions
                        }
                    }
                    aElement = $(aElement[index]);
                }

                if (aElement.is(':not([connect\\:state~="current"])')) {
                    item = qti.getItemWithIdentifier(itemref);
                    switchNavigableItem(item, aElement, navref);
                } else if (aElement.href() !== undefined && aElement.href().getFragment() && aElement.is(':not([href$="' + navref + '"])')) {
                    item = qti.getItemWithIdentifier(itemref);
                    aElement = $('#navigation-bar a[href$="' + navref + '"]');
                    aElement = (index > aElement.length) ? aElement.last() : aElement.first();
                    switchNavigableItem(item, aElement, navref);
                }
            };

            var displayItem = qti.displayItem = function(itemBody) {
                    var screenId;
                    mainContent.find('>[connect\\:class~="activeItem"]').removeAttrToken('connect:class', 'activeItem').hide();
                    if (itemBody && typeof itemBody !== "object") {
                        screenId = itemBody;
                        qti.activeItem = mainContent.find('>*[connect\\:identifier="' + itemBody + '"]');
                        if (qti.activeItem.length === 0) {
                            qti.activeItem = mainContent.find('>*[connect\\:groupIdentifier~="' + itemBody + '"]');
                            screenId = qti.activeItem.attr('connect:identifier');
                        }
                    } else if (itemBody) {
                        screenId = itemBody.attr('connect:identifier');
                        qti.activeItem = itemBody;
                    } else if (qti.activeItem.length > 0) {
                        // when no element is passed into this function - as is the case in the call from resuming a test from the pause state
                        screenId = qti.activeItem.attr('connect:identifier');
                    } else {
                        throw new Error("Invalid itemBody or activeItem");
                    }
                    qti.activeItem.addAttrToken('connect:class', 'activeItem').show();

                    if (qti.preloadTestContents) {
                        qti.fireEvent("screenChange", qti.activeItem);
                        if (!screens[screenId].ready) {
                            qti.fireEvent("newScreenDisplay", qti.activeItem);
                            screens[screenId].ready = true;
                        }
                    }
                },
                updateResourceRefs = function() {
                    var $this = $(this),
                        oldObj, newObj;
                    if ($this.is('[src]')) {
                        $this.attr('src', 'test-content/' + $this.attr('src'));
                    } else if ($this.is('[href]')) {
                        $this.attr('href', 'test-content/' + $this.attr('href'));
                    } else if ($this.is('object[data]')) {
                        //$this.attr('data', 'test-content/'+$this.attr('data'));
                        //$this[0].data = 'test-content/'+$this.attr('data');
                        /* More involved code required below, as Firefox/Gecko won't allow any of the 
                        above more straightforward approaches to updating the data attribute on an object.*/
                        oldObj = $this[0];
                        newObj = oldObj.cloneNode(true);
                        newObj.data = 'test-content/' + $this.attr('data');
                        oldObj.parentNode.replaceChild(newObj, oldObj);
                    }
                };

            if (qti.preloadTestContents) {
                changeItem = qti.changeItem = function(item, aIndexElement) {
                    var changeView, targetItem,
                        targetRef = aIndexElement.href().getFragment(),
                        idfr = aIndexElement.attr('connect:nav-group');

                    if (!idfr) {
                        idfr = aIndexElement.parent().attr('connect:identifier');
                    }

                    if (!(qti.activeItem.attr('connect:identifier') === idfr ||
                            qti.activeItem.find('[connect\\:groupIdentifier~=" + idfr + "]').length > 0)) {
                        changeView = true;
                    }

                    if (changeView) {
                        qti.fireEvent("screenUnload", qti.activeItem);
                    }

                    if (!targetRef) {
                        targetRef = aIndexElement.attr('nav');
                        if (targetRef) {
                            targetRef = targetRef.split('|')[0];
                        }
                    }
                    switchNavigableItem(item, aIndexElement, targetRef);
                    if (changeView) {
                        displayItem(idfr);
                    }

                    if (targetRef) {
                        activeInteractionFocus(targetRef);
                    }
                };

                qti.loadTestItems = function(callback) {
                    var itemsXML = {},
                        getItemXML = function(item) {
                            var itemURI = item.getURI(),
                                identifier = item.getIdentifier(),
                                dfrd = $.Deferred();
                            itemsXML[identifier] = null;

                            var onItemRcvd = function(itemDocument) {
                                    var itemBody = itemDocument.find('*[connect\\:class~="itemBody"]');
                                    itemsXML[identifier] = itemBody;
                                    dfrd.resolve();
                                },
                                onError = function() {
                                    dfrd.reject();
                                    throw new Error('Failed to load item (%o)', arguments);
                                    // TODO: Global error handler?
                                };

                            $.getXML(itemURI, onItemRcvd, onError);

                            return dfrd.promise();
                        },
                        dfrdSet = $.map(itemList, getItemXML);

                    $.when.apply($, dfrdSet).done(function() {
                        var itemBody, identifier, groupItem,
                            item = qti.getFirstItem(),
                            loader = mainContent.children(),
                            external_stimuli = [],
                            extStiPromises = [],
                            stimulus_rsc = {},
                            fixed_stimulus_contexts = 'div[connect\\:class="positionObjectStage"]',
                            handleStimulus = function() {
                                var $stimulusCtnr = $(this),
                                    $imgObjs, contentDiv,
                                    urls = [],
                                    rsc_attribs = {},
                                    promises = [],
                                    prmse,
                                    url = $stimulusCtnr.attr('data-source'),
                                    idfr = $stimulusCtnr.attr('connect:author-id'),
                                    loadContent = function(url, dataType) {
                                        if (!stimulus_rsc[url]) {
                                            stimulus_rsc[url] = {};
                                            stimulus_rsc[url].dfrd = $.Deferred();
                                        }
                                        return $.get(url, function(content) {
                                            if (dataType === "xml") {
                                                var $content = $(document.importNode(content.documentElement, true)),
                                                    initW, initH, vBox;
                                                content = $content;
                                                if (rsc_attribs[url].author_class) {
                                                    $content.attrNS('connect:author-class', rsc_attribs[url].author_class);
                                                }
                                                if (rsc_attribs[url].width) {
                                                    initW = parseFloat($content.attr('width'));
                                                    $content.attrNS('width', rsc_attribs[url].width);
                                                }
                                                if (rsc_attribs[url].height) {
                                                    initH = parseFloat($content.attr('height'));
                                                    $content.attrNS('height', rsc_attribs[url].height);
                                                }
                                                if ((initW && (initW !== rsc_attribs[url].width)) &&
                                                    (initH && (initH !== rsc_attribs[url].height))) {
                                                    vBox = $content.attr('viewBox');
                                                    if (vBox) {
                                                        vBox = vBox.split(' ');
                                                        $content.attr('viewBox', vBox[0] + ' ' + vBox[1] + ' ' + initW + ' ' + initH);
                                                    } else {
                                                        $content.attr('viewBox', '0 0 ' + initW + ' ' + initH);
                                                    }
                                                    //$content.attrNS('viewBox', '0 0 '+initW+' '+initH);
                                                }
                                            }
                                            rsc_attribs[url].content = stimulus_rsc[url].content = content;
                                            stimulus_rsc[url].dfrd.resolve();
                                        }, dataType);
                                    };
                                if (url) {
                                    idfr = url;
                                    urls.push(url);
                                    rsc_attribs[url] = {};
                                } else {
                                    $imgObjs = $stimulusCtnr.find('object[type="image/svg+xml"]')
                                        .add($stimulusCtnr.find('img[src$=".svg"]'))
                                        .add($stimulusCtnr.find('img[src$=".SVG"]'));

                                    $imgObjs.each(function(i) {
                                        var $obj = $(this),
                                            url = $obj.attr('data') || $obj.attr('src');
                                        if (url) {
                                            if (!idfr && i === 0) {
                                                // use the URL of the first object as basis for an identifier for the SVG-image-set container
                                                idfr = url + ($imgObjs.length > 1 ? "_" + qti.makeRandomStr() : "");
                                                $stimulusCtnr.attrNS('connect:author-id', idfr);
                                            }
                                            urls.push(url);
                                            rsc_attribs[url] = {};
                                            //#### Concatenated class onto "accessible-svg" so that accessibility images can be added #####
                                            if ($obj.is('[connect\\:author-class~="accessible-svg"]') ||
                                                $obj.parents('[connect\\:author-class="svg-interactions-container"]').length > 0) {
                                                if ($imgObjs.length === 1 && !$obj.attr('connect:author-class')) {
                                                    $obj.attr('connect:author-class', 'colour1');
                                                }
                                                rsc_attribs[url].author_class = ($obj.is('[connect\\:author-class~="accessible-svg"]') ? "" : "accessible-svg ");
                                                rsc_attribs[url].author_class += $obj.attr('connect:author-class');
                                            } else {
                                                rsc_attribs[url].author_class = $obj.attr('connect:author-class');
                                            }
                                            rsc_attribs[url].width = $obj.attr('width');
                                            rsc_attribs[url].height = $obj.attr('height');
                                            //$obj.remove();
                                        }
                                    });
                                }

                                contentDiv = $('<div class="async-stimulus"/>');
                                if (idfr && external_stimuli.indexOf(idfr) === -1) {
                                    urls.forEach(function(url) {
                                        var dataType = (/\.html$/.test(url) || /\.htm$/.test(url)) ? 'html' : 'xml',
                                            promise = loadContent(url, dataType).done(function() {
                                                contentDiv.append(rsc_attribs[url].content);
                                            });
                                        promises.push(promise);
                                    });

                                    extStiPromises = extStiPromises.concat(promises);
                                    external_stimuli.push(idfr);
                                    contentDiv.hide().attr('id', idfr).appendTo(mainContent);
                                } else if (stimulus_rsc[idfr]) {
                                    prmse = stimulus_rsc[idfr].dfrd.promise();
                                    prmse.done(function() {
                                        contentDiv.append(stimulus_rsc[idfr].content);
                                    });
                                    promises.push(prmse);
                                }
                                $.when.apply($, promises).done(function() {
                                    $stimulusCtnr.empty();
                                    if ($stimulusCtnr.closest(fixed_stimulus_contexts).length) {
                                        $stimulusCtnr.removeAttrToken('connect:author-class', "async-stimulus").append(contentDiv.clone().children());
                                    }
                                });
                            },
                            finalSetup = function() {
                                loader.remove();
                                switchNavigableItem(item);
                                if (callback && typeof callback === "function") {
                                    callback();
                                }
                                qti.displayItem(qti.activeItem);
                                setupQuestionsFocus();
                                activeInteractionFocus();
                                qti.fireEvent("preloadedItemsReady", qti.activeItem);
                            };

                        for (identifier in itemsXML) {
                            if (itemsXML.hasOwnProperty(identifier)) {
                                itemBody = itemsXML[identifier];
                                itemBody.find('[src!=""], [href!=""], object[data!=""]').each(updateResourceRefs);
                                itemBody.find('div.external-stimulus, *[connect\\:author-class~="async-stimulus"]').each(handleStimulus);
                                itemBody.hide().attrNS('connect:identifier', identifier);
                                mainContent.append(itemBody);
                            }
                        }

                        //qti.fireEvent("itemsPreloaded", mainContent);

                        qti.setupQuestionChoicePresentations();
                        if (item.group) {
                            groupItem = mainContent.find('[connect\\:groupIdentifier~="' + item.group + '"]');
                            if (groupItem.length === 0) {
                                groupItem = mainContent.find('[connect\\:identifier="' + item.group + '"]');
                            }
                            qti.activeItem = groupItem;
                        } else {
                            qti.activeItem = mainContent.find('*[connect\\:class~="itemBody"]:not(.nontest):first');
                        }

                        if (extStiPromises.length > 0) {
                            $.when.apply($, extStiPromises).done(function() {
                                qti.setupSharedStimuli();
                                finalSetup();
                            });
                        } else {
                            finalSetup();
                        }
                    });
                };
            } else {
                changeItem = qti.changeItem = function(item, aIndexElement, callback) {
                    assertReady();
                    if (arguments.length > 3 || arguments.length === 0) {
                        throw new Error('Invalid argument count');
                    } else if (!isItem(item)) {
                        throw new Error('Invalid item');
                    } else if (getItemWithIdentifier(item.getIdentifier()) !== item) {
                        throw new Error('Invalid item');
                    }

                    qti.fireEvent("itemUnload", currentItem);
                    qti.fireEvent("beforeLoadItem", item);

                    var targetRef = (aIndexElement ? aIndexElement.href().getFragment() : undefined),
                        identifier = switchNavigableItem(item, aIndexElement, targetRef),

                        onItemLoaded = function(itemDocument) {
                            var itemBody = itemDocument.find('*[connect\\:class~="itemBody"]'),
                                itemHead = itemDocument.find('head');

                            itemBody.addAttrToken('connect:class', "activeItem");
                            itemBody.attrNS('connect:identifier', identifier);
                            itemBody.find('[src!=""], [href!=""], object[data!=""]').each(updateResourceRefs);

                            mainContent.find('>[connect\\:class~="itemBody"]').remove();
                            mainContent.append(itemBody);
                            qti.doGroupPresentationCheck(itemBody);
                            qti.activeItem = itemBody;

                            if (callback && typeof callback === "function") {
                                callback();
                            }
                            qti.fireEvent("itemLoad", itemBody);
                            setupQuestionsFocus();
                            activeInteractionFocus(targetRef);
                        },
                        onError = function() {
                            throw new Error('Failed to load item (%o)', arguments);
                            // TODO: Global error handler?
                        },

                        itemURI = item.getURI();

                    $.getXML(itemURI, onItemLoaded, onError);
                };
            }

            var initialiseScreen = function(itemBody) {
                var screenId = itemBody.attr('connect:identifier'),
                    funcs, i; //$inlineSVGs,
                if (qti.screens[screenId]) {
                    funcs = qti.screens[screenId].init;
                    for (i = 0; i < funcs.length; i++) {
                        funcs[i]();
                    }
                }

                // UA 16/04/2013: dimension attributes set dynamically on any SVG objects
                // to make them display initially with the right size in the TestViewer[gecko 3.6]
                itemBody.find('object[type="image/svg+xml"]').each(function() {
                    var $this = $(this),
                        objW, topOffset;
                    if ($this.closest('[connect\\:author-class="svg-interactions-container"]').length > 0) {
                        $this.setSVGStimulusInteractions();
                    } else if ($this.closest('[connect\\:class*="Interaction"],[connect\\:class*="Stage"]').length === 0) {
                        objW = $this.closest('div').outerWidth(); //$this.parent().outerWidth();
                        topOffset = $this.position().top; //prevAll().outerHeight();
                        $this.attr('width', objW).attr('height', (qti.mainHeight - (topOffset + 150))); // 150 = navigation bar++ offset
                    }
                });

                itemBody.find('*[connect\\:author-class="svg-interactions-container"] svg[connect\\:author-class~="colour1"]').each(function() {
                    var $this = $(this);
                    //if (itemBody.find('*[connect\\:author-class~="overlayContainer"]').length > 0) {
                    if ($this.closest('[connect\\:author-class="svg-interactions-container"]')
                        .find('*[connect\\:author-class~="overlayContainer"]').length > 0) {
                        qti.fillForeignObjects($this);
                    }
                    qti.positionSVGInteractions($this);
                });

                /* $inlineSVGs = itemBody.find('span[connect\\:author-class~="inlineImage"]').filter(function(){
    				// inlineImage not within a '.interaction'
    				if ( $(this).parents('*[connect\\:class~="interaction"]').length ){
    					return false;
    				} else if (	$(this).find('svg').length ) {
    					return true;
    				} else {
    					return false;
    				}
    			});
    
    			$inlineSVGs.each(function(){
    				var $this = $(this), elemWidth, $elem;
    
    				$elem = $this.parents().filter(function() {
    					return $(this).css("width") ? true : false;
    				}).first();
    
    				elemWidth = $elem.width();
    				$this.css("width", elemWidth);
    				$this.find("svg").attr('width', elemWidth).css({'max-width':'none'});
    			}); */

                if (itemBody.find('math').length > 0) {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, itemBody[0]]);
                    MathJax.Hub.Queue(["checkMathItems", ME.activeDoc, itemBody]);
                }
            };
            qti.subscribeToEvent("newScreenDisplay", initialiseScreen, "Setup screen/UI handlers bound to the event of displaying the screen for the first time", "initialiseScreen");
            qti.subscribeToEvent("newScreenDisplay", qti.createAccessibilityImages, "Create Accessibility Images", "CreateAccessibility"); // UA 03/02/2016 - must be after initialiseScreen

            function findTestPart(question) {
                var pTitle = '';
                pTitle = question.parentNode.parentNode.parentNode;
                pTitle = $(pTitle).find('>span').text().trim().replace(':', '');
                return pTitle;
            }

            var pageIdentifier = document.createElement("div");
            pageIdentifier.id = "pageIdentifier";
            var partP = pageIdentifier.appendChild(document.createElement("p"));
            var partText = partP.appendChild(document.createTextNode(""));
            var pageP = pageIdentifier.appendChild(document.createElement("p"));
            var pageText = pageP.appendChild(document.createTextNode(""));
            // add speech bubble style
            var arrowS = pageIdentifier.appendChild(document.createElement("span"));
            var arrow = arrowS.appendChild(document.createTextNode(""));

            var isMaximised = /maximised/;

            function makeLinkHighlighter(link, currentPageTitle) {
                return function(event) {
                    if (isMaximised.test(nav.attr("class"))) {
                        return;
                    }
                    var currentNode = link;
                    var offsetLeft = 0;
                    var offsetTop = 0;
                    while (!!currentNode && currentNode.nodeType !== currentNode.DOCUMENT_NODE) {
                        offsetLeft += currentNode.offsetLeft;
                        offsetTop += currentNode.offsetTop;
                        currentNode = currentNode.offsetParent;
                    }
                    var linkCentre = offsetLeft + (link.offsetWidth / 2);

                    partText.nodeValue = findTestPart(link);
                    pageText.nodeValue = currentPageTitle;
                    pageIdentifier.style.bottom = "9999px";
                    document.body.appendChild(pageIdentifier);
                    pageIdentifier.style.bottom = document.documentElement.offsetHeight - (offsetTop - 0) + "px";
                    pageIdentifier.style.left = Math.max(linkCentre - (pageIdentifier.offsetWidth / 2), 0) + "px";
                    arrowS.style.left = Math.min(linkCentre, (pageIdentifier.offsetWidth / 2)) + "px";
                };
            }

            function makeLinkLowlighter(link) {
                return function(event) {
                    if (isMaximised.test(nav.attr("class"))) {
                        return;
                    }
                    document.body.removeChild(pageIdentifier);
                };
            }

            previousButtons.click(function(event) {
                event.preventDefault();
                var pItem = getPreviousItem();
                var aElement = pItem.getAElement();
                if (pItem !== currentItem) {
                    changeItem(pItem, $(aElement[(aElement.length) - 1]));
                } else {
                    changeItem(pItem, $(aElement[currentAIndex - 1]));
                }
            });

            nextButtons.click(function(event) {
                event.preventDefault();
                var nItem = getNextItem();
                var aElement = nItem.getAElement();
                if (nItem !== currentItem) {
                    changeItem(nItem, $(aElement[0]));
                } else {
                    changeItem(nItem, $(aElement[currentAIndex + 1]));
                }
            });

            assessmentItemRefElements =
                $('[connect\\:class~=testPart] [connect\\:class~="assessmentItemRef"]');
            var previousItem;
            assessmentItemRefElements.each(function(index, assessmentItemRefElement) {
                assessmentItemRefElement = $(assessmentItemRefElement);
                var identifier = assessmentItemRefElement.attr(
                    'connect:identifier');
                var aElement = assessmentItemRefElement.find('a');
                var uri = aElement.href();
                var itemPreviousItem = previousItem;
                var item = new Item();
                currentItemAIndex[identifier] = 0;

                if (!qti.isSimpleIdentifier(identifier)) {
                    throw new Error('Item with invalid identifier');
                }

                if (itemIdentifierHash.has(identifier)) {
                    throw new Error('Item with duplicate identifier');
                }

                item.getPreviousItem = function() {
                    if (currentAIndex > 0) {
                        return item;
                    } else {
                        return itemPreviousItem;
                    }
                };

                item.getIdentifier = function() {
                    return identifier;
                };

                item.getURI = function() {
                    return uri;
                };

                item.getNextItem = function() {
                    if (currentAIndex < item.getAElement().length - 1) {
                        return item;
                    } else {
                        return undefined;
                    }
                };

                item.getAssessmentItemRefElement = function() {
                    return assessmentItemRefElement;
                };

                item.getAElement = function() {
                    return aElement;
                };

                if (previousItem !== undefined) {
                    previousItem.getNextItem = function() {
                        if (currentAIndex === itemPreviousItem.getAElement().length - 1) {
                            return item;
                        } else {
                            return itemPreviousItem;
                        }
                    };
                }

                item.isAttempted = function() {
                    return aElement.hasAttrToken('connect:state', 'attempted');
                };

                item.setAttempted = function(attempted, aElm, subItemAttempted) {
                    if (!aElm) {
                        aElm = $(aElement[currentItemAIndex[identifier]]);
                    }
                    if (subItemAttempted || (attempted && (subItemAttempted || subItemAttempted === undefined))) {
                        aElm.addAttrToken('connect:state', 'attempted');
                    } else {
                        aElm.removeAttrToken('connect:state', 'attempted');
                    }
                };

                item.setCompleted = function(completed, aElm, subItemCompleted) {
                    if (!aElm) {
                        aElm = $(aElement[currentItemAIndex[identifier]]);
                    }
                    if (subItemCompleted || (completed && (subItemCompleted || subItemCompleted === undefined))) {
                        aElm.addAttrToken('connect:state', 'completed');
                    } else {
                        aElm.removeAttrToken('connect:state', 'completed');
                    }
                };

                item.isMarkedForReview = function() {
                    return $(aElement[currentItemAIndex[identifier]]).hasAttrToken('connect:state', 'marked-for-review');
                };

                item.setMarkedForReview = function(markedForReview) {
                    if (markedForReview) {
                        $(aElement[currentItemAIndex[identifier]]).addAttrToken('connect:state', 'marked-for-review');
                    } else {
                        $(aElement[currentItemAIndex[identifier]]).removeAttrToken('connect:state', 'marked-for-review');
                    }
                };

                itemList.push(item);
                itemIdentifierHash.set(identifier, item);

                previousItem = item;

                reviewSettings.set(identifier, false);

                aElement.each(function(index, aIndexElement) {
                    aIndexElement = $(aIndexElement);
                    var targetRef = aIndexElement.href().getFragment(),
                        group, itemIds, intrcnIds, navRef;

                    if (targetRef) {
                        //checkResponseStatus(item, aIndexElement);
                        qti.addAttemptListener(targetRef, function() {
                            checkResponseStatus(item, aIndexElement);
                        });

                        group = aIndexElement.attr('connect:nav-group');
                        if (group) {
                            item.group = group;
                            if (!itemGroups[group]) {
                                itemGroups[group] = {};
                                itemIds = itemGroups[group].items = [identifier];
                                intrcnIds = itemGroups[group].interactions = [targetRef];
                                itemGroups[group][identifier] = [targetRef];
                                screens[group] = {
                                    ready: false,
                                    init: []
                                };
                                if (!screens[identifier]) {
                                    screens[identifier] = {
                                        ready: false,
                                        init: []
                                    };
                                }
                            } else {
                                itemIds = itemGroups[group].items;
                                if (itemIds.indexOf(identifier) === -1) {
                                    itemIds.push(identifier);
                                }
                                intrcnIds = itemGroups[group].interactions;
                                if (intrcnIds.indexOf(targetRef) === -1) {
                                    intrcnIds.push(targetRef);
                                    if (!itemGroups[group][identifier]) {
                                        itemGroups[group][identifier] = [];
                                    }
                                    itemGroups[group][identifier].push(targetRef);
                                }
                            }
                            itemGroups[group][targetRef] = identifier;
                            //itemGroups[group].push({'interaction': targetRef, 'itemIdentifier': identifier});
                        } else {
                            if (!screens[identifier]) {
                                screens[identifier] = {
                                    ready: false,
                                    init: []
                                };
                            }
                        }
                    } else {
                        navRef = aIndexElement.attr('nav');
                        if (navRef) {
                            intrcnIds = navRef.split('|');
                            intrcnIds.forEach(function(intrcnId) {
                                qti.addAttemptListener(intrcnId, function() {
                                    checkResponseStatus(item, aIndexElement);
                                });
                            });
                        }

                        if (!screens[identifier]) {
                            screens[identifier] = {
                                ready: false,
                                init: []
                            };
                        }
                    }

                    aIndexElement.click(function(event) {
                        changeItem(item, aIndexElement);
                        event.preventDefault();
                    });

                    if (navViewControls.length > 0) {
                        var aItems = aIndexElement.closest('ul').find('li[connect\\:class="assessmentItemRef"] a'),
                            currentPageTitle = (aItems.length > 1) ? aIndexElement.text().trim() : '',
                            linkHighlighter = makeLinkHighlighter(aIndexElement[0], currentPageTitle),
                            linkLowlighter = makeLinkLowlighter(aIndexElement);

                        aIndexElement.mouseover(linkHighlighter);
                        aIndexElement.focus(linkHighlighter);
                        aIndexElement.mouseout(linkLowlighter);
                        aIndexElement.blur(linkLowlighter);
                    }
                });
            });

            $('[connect\\:class~="floatingTool"] a[href!=""][href!="#"]').each(function(i, toolLink) {
                var toolClose, toolWindowLeft, toolWindowTop, frontToolWindow,
                    toolWindowVisible = false;

                toolLink = $(toolLink);
                var toolWindow = $.ulib.div();
                $(document.body).append(toolWindow);

                toolWindow.addAttrToken('connect:class', 'floatingToolContainer');
                toolWindow.css('position', 'absolute');

                toolWindowLeft = i * 16;
                toolWindowTop = i * 16;

                toolWindow.css('top', toolWindowTop + 'px');
                toolWindow.css('left', toolWindowLeft + 'px');

                toolWindow.css('zIndex', 100);
                toolWindow.css({
                    'visibility': 'hidden',
                    'display': 'none'
                });

                var callBackDown = function() {
                    var iFrame = toolWindow.find("iframe").not("#advancedCalculator");
                    if (iFrame) {
                        iFrame.css("visibility", "hidden");
                        iFrame.parent().css("opacity", "0.7");
                    }
                };

                var callBackUp = function() {
                    var iFrame = toolWindow.find("iframe");
                    if (iFrame) {
                        iFrame.css("visibility", "");
                        iFrame.parent().css("opacity", "");
                    }
                };

                function layoutCalculator() {
                    var main = $('[role="main"]')[0],
                        calc = toolWindow.find('*[connect\\:class~="calculator"]');

                    calc.parent().css('border', 0);

                    toolWindowTop = main.offsetTop + main.offsetHeight - calc[0].offsetHeight - toolWindow[0].offsetHeight - 5;
                    toolWindowLeft = main.offsetLeft + main.offsetWidth - calc[0].offsetWidth - toolWindow[0].offsetWidth - 10;

                    toolWindow.css('top', toolWindowTop + 'px');
                    toolWindow.css('left', toolWindowLeft + 'px');
                }

                function layoutInformation() {
                    var main = $('[role="main"]')[0],
                        info = toolWindow.find('*[connect\\:class~="information"]'),
                        swfObject = info.find('object'),
                        h = swfObject.attr('height'),
                        w = swfObject.attr('width'),
                        twh, tww;


                    info.css('width', w + 'px');
                    info.css('height', h + 'px');

                    twh = computedStyle(toolWindow[0], 'height');
                    twh = parseInt(twh.substring(0, twh.indexOf('px')), 10);
                    tww = computedStyle(toolWindow[0], 'width');
                    tww = parseInt(tww.substring(0, tww.indexOf('px')), 10);

                    toolWindowTop = (main.offsetHeight - twh) * 0.4; // near 'golden' proportion
                    toolWindowLeft = (main.offsetWidth - tww) * 0.5; // center horizontally

                    toolWindow.css('top', toolWindowTop + 'px');
                    toolWindow.css('left', toolWindowLeft + 'px');
                }

                function bringToFront() {
                    if (frontToolWindow) {
                        frontToolWindow.css('zIndex', 100);
                    }
                    toolWindow.css('zIndex', 200);
                    frontToolWindow = toolWindow;
                }

                function toggleVisibility(toolLink) {
                    var calcword = 'calculator',
                        infoword = 'information',
                        identifier;

                    toolLink = $(toolLink);

                    //if (!toolWindowVisible) {
                    if (toolWindow.is(':hidden')) {
                        identifier = toolLink.attr("connect:identifier");
                        if (toolLink.text().toLowerCase() === calcword || (identifier && identifier.toLowerCase() === calcword)) {
                            //layoutCalculator();
                        } else if (toolLink.text().toLowerCase() === infoword || (identifier && identifier.toLowerCase() === infoword)) {
                            layoutInformation();
                        }

                        toolWindow.css({
                            'visibility': 'visible',
                            'display': 'block'
                        });
                        bringToFront();
                        toolWindowVisible = true;
                    } else {
                        toolWindow.css({
                            'visibility': 'hidden',
                            'display': 'none'
                        });
                        toolWindowVisible = false;
                    }
                }

                function loadDragCapability() {
                    var dragBar = toolWindow.find('*[connect\\:class~="bar"]');
                    var isMouseOverDragBar = false;

                    dragBar.mousedown(function(event) {
                        isMouseOverDragBar = true;
                    });

                    dragBar.mouseup(function(event) {
                        isMouseOverDragBar = false;
                    });

                    var permitDrag = function() {
                        if (dragBar.length) {
                            return isMouseOverDragBar;
                        } else {
                            return true;
                        }
                    };

                    $.mouseTrack(toolWindow[0], 0, 1, 1,
                        function(object, direction, magnitude, mouseX, mouseY) {
                            if (permitDrag()) {
                                if (direction === 'x') {
                                    toolWindowLeft += magnitude;
                                    toolWindow.css('left', toolWindowLeft + 'px');
                                } else if (direction === 'y') {
                                    toolWindowTop -= magnitude;
                                    toolWindow.css('top', toolWindowTop + 'px');
                                }
                            }
                        }, callBackUp, callBackDown
                    );
                }

                toolWindow.mousedown(function(event) {
                    bringToFront();
                });

                function onToolLoaded(toolDocument) {
                    var toolBody = toolDocument.find('*[connect\\:class~="itemBody"]');
                    var toolHead = toolDocument.find('head');
                    toolWindow.append(toolBody);

                    if (!toolClose) {
                        toolClose = toolWindow.find('*[class~="close"]');

                        if (toolClose.length > 0) {
                            toolClose.on('click', function() {
                                toolWindow.css({
                                    'visibility': 'hidden',
                                    'display': 'none'
                                });
                                toolWindowVisible = false;
                            });
                        }
                    }

                    loadDragCapability();
                    var params = {
                        "body": toolBody,
                        "head": toolHead
                    };
                    qti.fireEvent("toolItemLoad", params);
                }

                function onToolError() {
                    // TODO global error handler?
                    throw new Error('Failed to load item (%o)', arguments);
                }

                toolLink.click(function(event) {
                    toggleVisibility(this);
                    event.preventDefault();
                });

                $.getXML(toolLink.href().toString(), onToolLoaded, onToolError);
            });

            ready = true;

            //Load external one-off code
            qti.fireEvent("itemReady");

            //Hack to stop images and links being dragged.
            //To allow exceptions, add code to this event handler
            document.getElementsByTagName("body")[0].addEventListener("mousedown", function(event) {

                if (event.target.nodeName.toLowerCase() === "a") {
                    event.preventDefault();
                } else if (event.target.nodeName.toLowerCase() === "img") {

                    var imgParent = event.target.parentNode;

                    while (imgParent) {
                        if (imgParent.nodeName.toLowerCase() === "div") {
                            var connectNS = "http://connect.ucles.org.uk/ns/ConnectDeliveryEngine";
                            if (imgParent.getAttributeNS(connectNS, "class") === "positionObjectStage block") {
                                break;
                            }
                        }

                        if (imgParent.nodeName.toLowerCase() === "del") {
                            event.preventDefault();
                            break;
                        }

                        if (imgParent.nodeName.toLowerCase() === "body") {
                            event.preventDefault();
                            break;
                        }
                        imgParent = imgParent.parentNode;
                    }
                } else {

                    var elementParent = event.target.parentNode;

                    while (elementParent) {
                        if (elementParent.nodeName.toLowerCase() === "a") {
                            event.preventDefault();
                            break;
                        }

                        if (elementParent.nodeName.toLowerCase() === "body") {
                            break;
                        }
                        elementParent = elementParent.parentNode;
                    }
                }
            }, true);
        };

    }());

    (function() {
        function setupAccordionGroupByItem(group) {
            var tmplRef = qti.itemGroups[group].items[0],
                groupItem = $(qti.mainContent.find('[connect\\:identifier="' + tmplRef + '"]')[0].cloneNode(true));
            groupItem.attrNS('connect:identifier', group);
            //groupItem.attrNS('connect:groupIdentifier', group);
            qti.mainContent.append(groupItem);

            var questionsPanel = groupItem.find('*[connect\\:author-class~="genericTwoColumn"]> div[connect\\:author-class~="left"]'),
                interactionPanel = groupItem.find('*[connect\\:author-class~="genericTwoColumn"]> div[connect\\:author-class~="right"]');
            if (questionsPanel.length === 0) {
                questionsPanel = groupItem.find('*[connect\\:class~="row"]> div:first-child');
                interactionPanel = groupItem.find('*[connect\\:class~="row"]> div:last-child');
                if (questionsPanel.length === 0) {
                    questionsPanel = groupItem.find('*[connect\\:class~="column"]:first-child *[connect\\:class~="container"]');
                    interactionPanel = groupItem.find('*[connect\\:class~="column"]:last-child *[connect\\:class~="container"]');
                }
            }
            questionsPanel.empty().append('<div></div>');
            questionsPanel = questionsPanel.children(':first').addAttrToken('connect:class', 'questionChoice').addAttrToken('connect:class', 'action');
            interactionPanel.wrapInner('<div></div>');
            interactionPanel = interactionPanel.children(':first').addAttrToken('connect:class', 'question');

            var targetResponse = interactionPanel.find('[connect\\:responseIdentifier]:first').addClass('targetResponse'),
                wdgtHeader, wdgtContent, interaction, aElement,
                i, qn, itemId, rspId, srcItem, materialContent,
                rspVar, rspVal, itemId_init, rspId_init, qn_init, qlabel_init,
                updateWidgetContent = function(i, content) {
                    content = content.cloneNode(true);
                    $(content).removeAttr('connect:class');
                    wdgtContent.append(content);
                };
            for (i = 0; i < qti.itemGroups[group].items.length; i++) {
                itemId = qti.itemGroups[group].items[i];
                rspId = qti.itemGroups[group][itemId][0]; //first one for now but the logic needs to be made more robust
                srcItem = qti.mainContent.find('[connect\\:identifier="' + itemId + '"]');
                materialContent = srcItem.find('*[connect\\:author-class~="genericTwoColumn"]> div[connect\\:author-class~="left"]');
                if (materialContent.length === 0) {
                    materialContent = srcItem.find('*[connect\\:class~="row"]> div:first-child');
                    if (materialContent.length === 0) {
                        materialContent = srcItem.find('*[connect\\:class~="column"]:first-child *[connect\\:class~="container"]');
                    }
                }
                aElement = $('#navigation-bar a[href$="' + rspId + '"]');
                wdgtHeader = $.ulib.h3();
                wdgtContent = $.ulib.div();

                wdgtHeader.attrNS('connect:responseIdentifier', rspId).attrNS('connect:identifier', itemId).addClass('interaction');
                qn = $.trim(aElement.find('.question-number').text());
                wdgtHeader.text("Question " + qn);
                wdgtHeader.prepend('<input type="radio" name="selectedQuestion" id="selQn' + qn + '" value="' + qn + '" />');
                wdgtHeader.prepend('<label for="selQn' + qn + '" name="selectedQuestionLabel"><span>choose this question</span></label>');

                materialContent.each(updateWidgetContent);

                questionsPanel.append(wdgtHeader);
                questionsPanel.append(wdgtContent);

                rspVar = qti.getVariable(rspId, itemId);
                rspVal = rspVar.getValue();
                if (rspVal) {
                    itemId_init = itemId;
                    rspId_init = rspId;
                    qn_init = qn;
                    qlabel_init = wdgtHeader.find('label');
                }
            }

            if (itemId_init && rspId_init) {
                targetResponse.attrNS('connect:responseIdentifier', rspId_init).parent().attrNS('connect:identifier', itemId_init);
                interactionPanel.prepend('<p class="accdChoiceMessage info">You are answering question ' + qn_init + '.</p>');
                qlabel_init.addClass('answering');
            } else {
                targetResponse.attr({
                        disabled: 'true'
                    }) //, style: 'background:#f0f0f0;'
                    .attrNS('connect:responseIdentifier', null)
                    .parent().attrNS('connect:identifier', tmplRef);
                interactionPanel.prepend('<p class="accdChoiceMessage info">You have not selected a question.</p>');
            }
        }

        function setupAccordionGroupByInteraction(group) {
            var tmplRef = qti.itemGroups[group].items[0],
                groupItem = qti.mainContent.find('[connect\\:identifier="' + tmplRef + '"]'),
                interactionPanel = groupItem.find('*[connect\\:author-class~="accordionChoice"][connect\\:author-id=' + group + ']'), //stimulusPanel;
                i, itemId, rspId, srcPanel, interactionContent, wdgtHeader, hdrContent, qns, qn, prompt,
                buildQuestionSpans = function(qns) {
                    var spans = '';

                    qns.each(function(index) {
                        var $this = $(this),
                            txt = $this.text(),
                            //##### Leave space before range en-dash #####
                            span = '<span class="questionNumber" data-interaction-identifier="" data-nav="' +
                            $this.attr("data-nav") + '"' +
                            ((index > 0 && index < qns.length - 1) ? ' style="display:none">' : '>') +
                            ((index < qns.length - 1) ? txt + ' –' : txt) + '</span>';

                        spans += span;
                    });
                    return spans;
                };

            if (interactionPanel.length === 0) {
                //stimulusPanel = groupItem.find('*[connect\\:class~="row"]> div:first-child');
                interactionPanel = groupItem.find('*[connect\\:class~="row"]> div:last-child');
                if (interactionPanel.length === 0) {
                    //stimulusPanel = groupItem.find('*[connect\\:class~="column"]:first-child [connect\\:class~="container"]');
                    interactionPanel = groupItem.find('*[connect\\:class~="column"]:last-child *[connect\\:class~="container"]');
                }
            }

            if (groupItem.attr('connect:groupIdentifier') === undefined) {
                groupItem.attrNS('connect:groupIdentifier', group);
            } else {
                groupItem.attrNS('connect:groupIdentifier', groupItem.attr('connect:groupIdentifier') + ' ' + group);
            }

            srcPanel = interactionPanel.clone();

            interactionPanel.empty().addAttrToken('connect:class', 'question');
            interactionPanel.append(srcPanel.find('.caption').clone());
            interactionPanel.append('<div></div>');
            interactionPanel = interactionPanel.children(':last').addAttrToken('connect:class', 'questionChoice');

            for (i = 0; i < qti.itemGroups[group].interactions.length; i++) {
                rspId = qti.itemGroups[group].interactions[i];
                itemId = qti.itemGroups[group][rspId];
                interactionContent = srcPanel.find('[connect\\:responseIdentifier="' + rspId + '"]').clone();

                wdgtHeader = $.ulib.h3();
                wdgtHeader.attrNS('connect:responseIdentifier', rspId).addClass('interaction').attr('tabindex', '0');

                qns = interactionContent.find('.questionNumber');
                qn = interactionContent.find('.questionNumber').remove().text();

                prompt = interactionContent.find('[connect\\:class="prompt"]').remove().html();
                if (interactionContent.is('[connect\\:hasPrompt="true"]')) {
                    //prompt = qti.safe_ntts_replace(prompt);
                    if (qns.length > 1) {
                        hdrContent = buildQuestionSpans(qns) + '<p class="prompt">' + prompt + '</p>';
                    } else {
                        hdrContent = '<span class="questionNumber">' + qn + '</span>' +
                            '<p class="prompt">' + prompt + '</p>';
                    }
                } else {
                    hdrContent = 'Question ' + qn;
                }
                wdgtHeader.append(hdrContent);

                interactionPanel.append(wdgtHeader);
                interactionPanel.append(interactionContent);
            }
        }

        function applyGroupPresentation(group, typeSet) {
            var config = group.split('-'),
                type, typefound = false;
            if (config[0] === "choice") {
                type = config[0] + '-';
                if (config[1] === "accordion") {
                    type += config[1] + '-';
                    if (config[2] === "stimulus" || config[2] === "items") {
                        setupAccordionGroupByItem(group);
                    } else if (config[2] === "interaction") {
                        setupAccordionGroupByInteraction(group);
                    }
                    type += config[2];
                    typefound = (typeSet.indexOf(type) !== -1);
                }
            }
            return typefound;
        }

        var doAccordionPresentation = function(slctdPanel) {
            $('[connect\\:class~="questionChoice"]').each(function() {
                var content = $(this),
                    firstActivated = false;
                content.accordion({
                    heightStyle: "content",
                    icons: null,
                    collapsible: true,
                    active: (slctdPanel !== undefined ? (typeof slctdPanel === "number" ? slctdPanel : 0) : false),
                    activate: function(event, ui) {
                        if (!firstActivated) {
                            $(this).accordion("option", "collapsible", false);
                            firstActivated = true;
                        }
                        var container = ui.newHeader.closest('[connect\\:class~="scroll-container"]'),
                            docTop = Math.floor(container.scrollTop()),
                            docBottom = Math.floor(container.height()),
                            elemTop = Math.floor(ui.newHeader.offset().top - container.offset().top),
                            elemBottom = Math.floor(elemTop + ui.newHeader.outerHeight() + ui.newPanel.outerHeight()),
                            itemIshidden = (elemTop < 0) || (docBottom < elemBottom);
                        if (itemIshidden) {
                            qti.scrollToItem(container, ui.newHeader, (elemTop + docTop));
                        } else if (docBottom < elemBottom) {
                            qti.scrollToItem(container, ui.newPanel, (elemBottom + docTop));
                        }
                    }
                });

                content.find('label[name="selectedQuestionLabel"]').click(function(event) {
                    event.stopPropagation();
                    var responseVariable, crntVal,
                        panelHdr = $(this).parent().click(),
                        taskContainer = content.closest('[connect\\:class~="columns"],[connect\\:author-class~="genericTwoColumn"]'),
                        targetResponse = taskContainer.find('.targetResponse'),
                        itemIdentifier = targetResponse.closest('[connect\\:identifier]').attr('connect:identifier'),
                        responseIdentifier = targetResponse.attr('connect:responseIdentifier'),
                        input = $('#' + $(this).attr('for')),
                        message = taskContainer.find('.accdChoiceMessage');

                    message.text('You are answering question ' + input.val());
                    qti.flash(message);

                    if (responseIdentifier) {
                        responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                        crntVal = targetResponse.value();
                        responseVariable.setValue(undefined);
                        responseVariable.setState(undefined);
                    } else {
                        taskContainer.find('div.textarea').attr('contenteditable', true);
                        targetResponse.add(taskContainer.find('div.textarea')).removeAttr('disabled');
                        //targetResponse.removeAttr('style');
                    }

                    responseIdentifier = panelHdr.attr('connect:responseIdentifier');
                    itemIdentifier = panelHdr.attr('connect:identifier');
                    responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                    if (crntVal === "") {
                        responseVariable.setValue(undefined);
                    } else if (crntVal !== undefined) {
                        responseVariable.setValue(crntVal);
                    }
                    targetResponse.parent().attrNS('connect:identifier', itemIdentifier);
                    targetResponse.attrNS('connect:responseIdentifier', responseIdentifier);
                    qti.setupExtTextInteraction(targetResponse);
                    $('label[name="selectedQuestionLabel"]').removeClass('answering');
                    $(this).addClass('answering');
                });
            });
        };

        var doReplicatedInputSetup = function() {
            var rspIds = [],
                replInputs = $('[connect\\:class~="textEntryProxy"] input')
                .each(function() {
                    var rspId = $(this).attr('connect:responseIdentifier');
                    if (rspIds.indexOf(rspId) === -1) {
                        rspIds.push(rspId);
                    }
                });
            $.each(rspIds, function(i, rspId) {
                var inputSet = replInputs.filter('[connect\\:responseIdentifier="' + rspId + '"]'),
                    itemBody = inputSet.closest('[connect\\:identifier]'),
                    tei = itemBody.find('*[connect\\:class~="textEntryInteraction"] *[connect\\:responseIdentifier="' + rspId + '"]'),
                    itemId = itemBody.attr('connect:identifier'),
                    rspVar = qti.getVariable(rspId, itemId);
                inputSet.val(rspVar.getValue())
                    .bind('keyup', function() {
                        var crntVal = $(this).val();
                        inputSet.not(this).val(crntVal);
                        //tei.val(crntVal).blur();
                        tei.val(crntVal);
                        tei[0].updateValue();
                    }).attr('size', tei.attr('size'));
                tei.parent().hide();
            });
        };

        qti.setupCustomHorizontalStackedBarChart = function(chartContent, itemId) {
            var HSBChartTmpl = {
                    'container': '<div class="graph-content container"/>',
                    'chart': '<div class="hsb-chart"><div class="graphs"/></div>',
                    'graph': '<div class="graph"/>',
                    'series-label': '<span class="series-label"/>',
                    'region': '<div><div class="region-label"></div></div>',
                    'separator': '<div class="separator" title=""/>',
                    'xAxis': '<div class="xAxis"/>',
                    'scale': '<div class="scale"/>',
                    'tick': '<div class="tick"><span class="tick-label"><span class="tick-label-text"></span></span></div>',
                    'xAxis-label': '<p class="xAxis-label"/>',
                    'legend-container': '<div class="legend"><ul class="container"/></div>',
                    'legend-item': '<li><span class="pattern"></span><span class="label"></span></li>'
                },
                axisMin = 0,
                axisMax = 100,
                axisInterval = 1,
                chartData = chartContent.find('table'),
                chart, chartArea, graphs, xAxis, xAxisLabel, scale, tick, tickVal, legend;

            chartContent.wrap(HSBChartTmpl.container);
            chartArea = chartContent.parent();
            chartArea.append(HSBChartTmpl.chart);
            chart = chartArea.children('.hsb-chart');
            chart.append(HSBChartTmpl.xAxis);
            chart.append(HSBChartTmpl['legend-container']);

            xAxis = chart.children('.xAxis');
            xAxis.append(HSBChartTmpl.scale);
            scale = xAxis.children('.scale');
            for (tickVal = axisMin; tickVal <= axisMax; tickVal += axisInterval) {
                tick = $(HSBChartTmpl.tick);
                tick.css('left', tickVal + '%');
                if (tickVal % 5 === 0) {
                    tick.find('.tick-label-text').text(tickVal);
                } else {
                    tick.css('border-color', '#bbb');
                }
                scale.append(tick);
            }
            xAxisLabel = chartData.find('caption').text();
            if (xAxisLabel) {
                xAxis.append(HSBChartTmpl['xAxis-label']);
                xAxis.children('.xAxis-label').text(xAxisLabel);
            }

            chartData.find('td input[connect\\:responseIdentifier]').each(function() {
                var rsp = $(this),
                    rspId = rsp.attr('connect:responseIdentifier'),
                    rspVar = qti.getVariable(rspId, itemId),
                    rspVal = rspVar.getValue();
                //rspVal = rsp.val();
                rsp.closest('tr').children('[connect\\:author-class~="response"]').text(rspVal);
            });

            var legendSet = false,
                chartWidth, separatorWidth, activeSeparator,
                responseRegions, responseSeparators, responseScaleFactor,
                valuesController = function(v) {
                    var arr = v;

                    return function(val, sepIdx) {
                        // this only handles a chart of three sections
                        var retval;

                        val = Math.round(val * responseScaleFactor);
                        if (sepIdx === 0) {
                            arr[0] = val;
                            arr[1] = (axisMax - val - arr[2]);
                            retval = [arr[0], arr[1]];
                        } else if (sepIdx === 1) {
                            arr[1] = val;
                            arr[2] = (axisMax - val - arr[0]);
                            retval = [arr[1], arr[2]];
                        } else {
                            throw new Error("unexpected argument value");
                        }

                        return retval;
                    };
                },
                valsArray = [],
                getComputedVals,
                alternateRounding = function(val, index) {
                    return (index % 2) ? Math.ceil(val) : Math.floor(val);
                };

            graphs = chart.children('.graphs');
            legend = chart.find('.legend ul');
            chartData.find('thead th[connect\\:author-class~="data"]').each(function() {
                var $this = $(this),
                    gtitle = $this.text(),
                    gref = $this.data('graph'),
                    data = [],
                    totalVal = 0,
                    scaleFactor,
                    trgtGraph, seriesLabel, regions, separators, availableWidth;

                trgtGraph = $(HSBChartTmpl.graph).addClass(gref);
                graphs.append(trgtGraph);
                seriesLabel = $(HSBChartTmpl['series-label']);
                seriesLabel.text(gtitle);
                trgtGraph.append(seriesLabel);

                chartData.find('tbody tr').each(function(i) {
                    var $this = $(this),
                        region, separator, legendItem,
                        label = $this.children(':first').text(),
                        regionId = 'region-' + (i + 1),
                        datum = $this.children('[connect\\:author-class~="' + gref + '"]').text(),
                        rspElmtId = $this.find('input').attr('connect:responseIdentifier'),
                        rspElmtSel = 'input[connect\\:responseIdentifier="' + rspElmtId + '"]',
                        rspTxtSel = 'tr.' + regionId + ' [connect\\:author-class~="response"]';
                    $this.addClass(regionId);

                    if (datum) {
                        datum = parseInt(datum, 10);
                        data.push(datum);
                        totalVal += datum;
                    }
                    if (i > 0) {
                        separator = $(HSBChartTmpl.separator);
                        trgtGraph.append(separator);
                    }
                    region = $(HSBChartTmpl.region);
                    region.addClass(regionId)
                        .data('rspelmt', rspElmtSel)
                        .data('rsptext', rspTxtSel)
                        .find('.region-label').text(label);
                    trgtGraph.append(region);
                    if (!legendSet) {
                        legendItem = $(HSBChartTmpl['legend-item']);
                        legendItem.find('.pattern').addClass(regionId);
                        legendItem.find('.label').text(label);
                        legend.append(legendItem);
                    }
                });

                regions = trgtGraph.children('div[class^="region-"]');
                separators = trgtGraph.children('.separator');
                if (!chartWidth) {
                    chartWidth = trgtGraph.width();
                    separatorWidth = separators.eq(0).outerWidth();
                    legendSet = true;
                }
                availableWidth = chartWidth - (separators.length * separatorWidth);

                if (totalVal) {
                    scaleFactor = totalVal / availableWidth;
                } else {
                    scaleFactor = (axisMax - axisMin) / availableWidth;
                }

                if ($this.is('[connect\\:author-class~="response"]')) {
                    trgtGraph.addClass('response');
                    responseRegions = regions;
                    responseSeparators = separators;
                    responseScaleFactor = scaleFactor;
                }

                regions.each(function(index) {
                    var region = $(this),
                        regionWidth;
                    if (data[index] !== undefined) {
                        regionWidth = data[index] / scaleFactor;
                    } else {
                        regionWidth = availableWidth / regions.length;
                    }
                    regionWidth = alternateRounding(regionWidth, index);
                    region.css('width', regionWidth);
                });
            });

            responseSeparators.each(function(separatorId) {
                var separator = $(this),
                    limitReached = false,
                    leftLimitReached = false,
                    rightLimitReached = false,
                    prevRegion = separator.prev(),
                    nextRegion = separator.next(),
                    prevRegionIndex = responseRegions.index(prevRegion),
                    nextRegionIndex = responseRegions.index(nextRegion),
                    prevRegionWidth = prevRegion.outerWidth(),
                    nextRegionWidth = nextRegion.outerWidth(),
                    jointWidth = prevRegionWidth + nextRegionWidth,
                    prevRegionValue = alternateRounding(prevRegionWidth * responseScaleFactor, prevRegionIndex),
                    nextRegionValue = alternateRounding(nextRegionWidth * responseScaleFactor, nextRegionIndex),
                    prevRegionResponseValue = $(prevRegion.data('rspelmt')),
                    nextRegionResponseValue = $(nextRegion.data('rspelmt')),
                    prevRegionResponseLabel = $(prevRegion.data('rsptext')),
                    nextRegionResponseLabel = $(nextRegion.data('rsptext')),
                    prVal = prevRegionResponseValue.val(),
                    nrVal = nextRegionResponseValue.val();

                if (!prVal) {
                    prevRegionResponseValue.val(prevRegionValue);
                    prevRegionResponseLabel.text(prevRegionValue);
                }
                if (!nrVal) {
                    nextRegionResponseValue.val(nextRegionValue);
                    nextRegionResponseLabel.text(nextRegionValue);
                }

                valsArray[separatorId] = Number(prVal);
                valsArray[separatorId + 1] = Number(nrVal);
                ulib.mouseTrack(this, 0, chartWidth / axisMax, 0, function(object, direction, magnitude, mouseX, mouseY) {
                    var computedVals;


                    if (direction === "x") {
                        if (activeSeparator !== separatorId) {
                            activeSeparator = separatorId;
                            prevRegionWidth = prevRegion.outerWidth();
                            nextRegionWidth = nextRegion.outerWidth();
                            jointWidth = prevRegionWidth + nextRegionWidth;
                        }

                        var movement = prevRegionWidth + magnitude;

                        if (movement > 0 && movement < jointWidth) {
                            prevRegionWidth += magnitude;
                            nextRegionWidth = jointWidth - prevRegionWidth;
                            limitReached = false;
                            leftLimitReached = false;
                            rightLimitReached = false;
                        } else if (movement <= 0 && activeSeparator === 0) {
                            prevRegionWidth = 0;
                            nextRegionWidth = jointWidth - separatorWidth;
                            leftLimitReached = true;
                        } else if (movement >= jointWidth && activeSeparator === (responseSeparators.length - 1)) {
                            prevRegionWidth = jointWidth - separatorWidth;
                            nextRegionWidth = 0;
                            rightLimitReached = true;
                        } else if (movement <= 0) {
                            prevRegionWidth = 0;
                            nextRegionWidth = jointWidth;
                            leftLimitReached = true;
                        } else if (movement >= jointWidth) {
                            prevRegionWidth = jointWidth;
                            nextRegionWidth = 0;
                            rightLimitReached = true;
                        } else {
                            // can't see why we'd ever get here but just in case...
                            limitReached = true;
                        }

                        if (!limitReached) {
                            prevRegion.css('width', prevRegionWidth);
                            nextRegion.css('width', nextRegionWidth);
                            computedVals = getComputedVals(prevRegionWidth, separatorId);
                            prevRegionValue = computedVals[0];
                            nextRegionValue = computedVals[1];
                            prevRegionResponseLabel.text(prevRegionValue);
                            nextRegionResponseLabel.text(nextRegionValue);
                            prevRegionResponseValue.val(prevRegionValue);
                            nextRegionResponseValue.val(nextRegionValue);
                            prevRegionResponseValue[0].updateValue();
                            nextRegionResponseValue[0].updateValue();

                            if (leftLimitReached || rightLimitReached) {
                                limitReached = true;
                            }
                        }
                    }
                });

                getComputedVals = valuesController(valsArray);
            });
        };

        qti.doGroupPresentationCheck = function(itemBody) {
            //var ancElm = $('[role="navigation"] a[connect\\:state~="current"]'),
            var possibleTypes = ['choice-accordion-interaction'],
                accordionExists = false,
                groups = []; //crnt_group, rspId;
            $.each(possibleTypes, function(i, gtype) {
                itemBody.find('[connect\\:author-id^="' + gtype + '"], [nav^="' + gtype + '"]').each(function() {
                    var $this = $(this),
                        grpId = $this.attr('connect:author-id') || $this.attr('nav');
                    if (groups.indexOf(grpId) === -1) {
                        groups.push(grpId);
                    }
                });
            });

            if (groups.length > 0) {
                $.each(groups, function(i, group) {
                    if (applyGroupPresentation(group, possibleTypes)) {
                        accordionExists = true;
                    }
                });
                /* crnt_group = ancElm.attr('connect:nav-group');
                if (crnt_group) {
                	rspId = ancElm.href().getFragment();
                	doAccordionPresentation('[connect\\:responseIdentifier="'+rspId+'"]');
                } else */
                if (accordionExists) {
                    doAccordionPresentation();
                }
            }
        };

        qti.fillForeignObjects = function($svg) {
            var $gElmts = $svg.find('g[data-container-id], svg\\:g[data-container-id]'),
                $svgCtnr = $svg.closest('div[connect\\:author-class="svg-interactions-container"]'),
                $overlays = $svgCtnr.find('*[connect\\:author-class~="overlayContainer"]'),
                $maskingSvg = $svg.clone().empty().removeAttr('connect:author-class')
                .css({
                    position: 'absolute',
                    zIndex: '10',
                    top: '0px',
                    left: '0px'
                });

            $svgCtnr.append($maskingSvg);
            $gElmts.each(function(idx, el) {
                var $grp = $(el),
                    gId = parseInt($grp.attr('data-container-id'), 10),
                    overlay = $overlays[gId - 1],
                    $rect = $grp.find('rect,svg\\:rect'),
                    rw = $rect.attr('width'),
                    rh = $rect.attr('height'),
                    rx = $rect.attr('x'),
                    ry = $rect.attr('y'),

                    $fo = $('<foreignObject xmlns="http://www.w3.org/2000/svg"></foreignObject>')
                    .attr('style', "overflow:visible;")
                    .attr('x', rx).attr('y', ry).attr('width', rw).attr('height', rh)
                    .append(overlay);

                $grp.remove();
                $maskingSvg.append($fo);
            });
        };

        qti.setupQuestionChoicePresentations = function() {
            var group, config, accordionExists = false,
                possibleTypes = ['choice-accordion-items', 'choice-accordion-stimulus', 'choice-accordion-interaction'];
            for (group in qti.itemGroups) {
                if (qti.itemGroups.hasOwnProperty(group)) {
                    if (applyGroupPresentation(group, possibleTypes)) {
                        accordionExists = true;
                    }
                }
            }

            if (accordionExists) {
                qti.subscribeToEvent("testStart", doAccordionPresentation, "Setup choice of questions using accordion widget", "setupAccordion");
            }
            if ($('[connect\\:class~="textEntryProxy"]').length > 0) {
                qti.subscribeToEvent("testStart", doReplicatedInputSetup, "Setup text-entry inputs for questions with replicated responses", "setupReplicatedInputs");
            }
        };

        qti.setupSharedStimuli = function() {
            var loadItemFunc = function(itemObj) {
                    var stimulus = itemObj.find('div.external-stimulus').add(itemObj.find('*[connect\\:author-class~="async-stimulus"]'));
                    if (stimulus.length > 0) {
                        stimulus.each(function() {
                            var $stimulusCtnr = $(this),
                                stimulusId = $stimulusCtnr.attr('data-source') || $stimulusCtnr.attr('connect:author-id');
                            $('div[id="' + stimulusId + '"]').children().appendTo($stimulusCtnr);
                        });
                    }
                },
                unloadItemFunc = function(itemObj) {
                    var stimulus = itemObj.find('div.external-stimulus').add(itemObj.find('*[connect\\:author-class~="async-stimulus"]'));
                    if (stimulus.length > 0) {
                        stimulus.each(function() {
                            var $stimulusCtnr = $(this),
                                stimulusId = $stimulusCtnr.attr('data-source') || $stimulusCtnr.attr('connect:author-id');
                            $stimulusCtnr.children().appendTo('div[id="' + stimulusId + '"]');
                        });
                    }
                };

            qti.subscribeToEvent("screenChange", loadItemFunc, "Move shared stimulus content from hidden container to the active item screen", "sharedStimulusLoad");
            qti.subscribeToEvent("screenUnload", unloadItemFunc, "Move shared stimulus content from the active item screen back to its hidden container", "sharedStimulusUnload");
        };
    }());

    (function() {
        // These values are defaults only and can be overwritten by theme specific values in 30-timer.js
        qti.timerMarkup = {};
        var timer = qti._timer = function() {
            var showActual = false;
            var roundedTime = 0;
            var actualTime = "0:00";
            var newTestTimer;
            var timerSeconds;
            var timerMinutes;
            var oldStamp;
            var newStamp;
            var loopCount = 0;

            var start = qti.timerStart = function(time) {
                var timeLimit = parseInt(time, 10);
                var timeDisplay = qti.timerMarkup.display;
                var timeDisplayValue = qti.timerMarkup.displayValue;
                var timeDisplayText = qti.timerMarkup.displayText;

                roundedTime = Math.ceil(timeLimit / 60);
                actualTime = roundedTime + ":00";
                //Set for accessibility
                timeDisplay.attr("title", actualTime + " left");
                timeDisplayValue.text(roundedTime);

                oldStamp = new Date().getTime();

                newTestTimer = setInterval(function() {
                    loopCount++;
                    timeLimit--;
                    timerMinutes = Math.floor(timeLimit / 60);
                    timerSeconds = Math.round(((timeLimit / 60) - timerMinutes) * 60);

                    var totalSeconds = (timerMinutes * 60) + timerSeconds,
                        t;
                    mapping.timer = totalSeconds;

                    if (timerMinutes < 10) {
                        timerMinutes = "0" + timerMinutes;
                    }

                    if (timerSeconds < 10) {
                        timerSeconds = "0" + timerSeconds;
                    }

                    if (timeLimit / 60 === Math.ceil(timeLimit / 60)) {
                        roundedTime = timeLimit / 60;
                        if (!showActual) {
                            timeDisplayValue.text(roundedTime);
                        }
                    }

                    if (((timerMinutes === '01' && timerSeconds === '00') || (timerMinutes === '00')) && timeDisplayText.text().indexOf('minutes') !== -1) {
                        timeDisplayText.text('minute left');
                    }

                    actualTime = timerMinutes + ":" + timerSeconds;

                    if (showActual) {
                        timeDisplayText.text(" left");
                        timeDisplayValue.text(actualTime);
                    } else {
                        timeDisplay.attr("title", actualTime + " left");
                    }

                    // Fire timer events
                    if (qti.isInteger(timeLimit / 5)) {
                        newStamp = new Date().getTime();
                        timeLimit = timeLimit + loopCount -
                            (Math.round((newStamp - oldStamp) / 1000));
                        oldStamp = newStamp;
                        loopCount = 0;
                        t = timeLimit / 60;
                        //Fire timer event every 5 second interval
                        qti.fireEvent("time", t);
                    }
                }, 1000);

                $('#timer').hover(function(event) { //mouseenter
                    showActual = true;
                    timeDisplay.attr("title", undefined);
                    timeDisplayText.text(" left");
                    timeDisplayValue.text(actualTime);
                    event.preventDefault();
                }, function(event) { //mouseleave
                    var mins = (timerMinutes < 1) ? " minute" : " minutes";
                    showActual = false;
                    timeDisplayText.text(mins + " left");
                    timeDisplayValue.text(roundedTime);
                    event.preventDefault();
                });
            };

            qti.timerPause = function() {
                clearInterval(newTestTimer);
            };

            qti.timerResume = function() {
                var secs = (timerMinutes * 60) + timerSeconds;
                start(secs);
            };
        };

        qti.hms2sec = function(hms) {
            var secs = 0,
                tmArr = hms.split(":");
            if (tmArr.length === 3) {
                secs += (parseInt(tmArr[0], 10) * 3600);
                secs += (parseInt(tmArr[1], 10) * 60);
                secs += parseInt(tmArr[2], 10);
            } else if (tmArr.length === 2) {
                secs += (parseInt(tmArr[0], 10) * 60);
                secs += parseInt(tmArr[1], 10);
            } else if (tmArr.length === 1) {
                secs += parseInt(tmArr[0], 10);
            }
            return secs;
        };
    })();

    (function() {
        function QTIVariable() {}
        QTIVariable.prototype = {
            constructor: undefined
        };

        var isQTIVariable = qti.isQTIVariable = function(value) {
            return value instanceof QTIVariable;
        };

        function QTIResponseVariable() {}
        QTIResponseVariable.prototype = new QTIVariable();

        var isQTIResponseVariable = qti.isQTIResponseVariable = function(value) {
            return value instanceof QTIResponseVariable;
        };

        function QTIParameterVariable() {}
        QTIParameterVariable.prototype = new QTIVariable();

        var isQTIParameterVariable =
            qti.isQTIParameterVariable = function(value) {
                return value instanceof QTIParameterVariable;
            };

        var ready = false;
        var variableList = [];
        var variableHash = $.createHash();
        var attemptHash = {};

        var addAttemptListener = qti.addAttemptListener = function(identifier, callback) {
            if (qti.isSimpleIdentifier(identifier)) {
                if (!attemptHash[identifier]) {
                    attemptHash[identifier] = $.createHash();
                }
                attemptHash[identifier].set(identifier, callback);
            } else {
                throw new Error('Invalid variable identifier');
            }
        };

        var getVariables = qti.getVariables = function() {
            if (ready) {
                return $.createIterator(variableList);
            } else {
                throw new Error('Not yet ready; wait for ' +
                    'VariableDeclarationsLoaded');
            }
        };

        var getVariable = qti.getVariable = function(identifier, itemIdentifier) {
            if (ready) {
                if (qti.isSimpleIdentifier(identifier)) {
                    var currentItem = qti.getCurrentItem();
                    if (!itemIdentifier) {
                        itemIdentifier = currentItem.getIdentifier();
                    }
                    identifier = qti.createCompositeIdentifier(
                        itemIdentifier, identifier);
                } else if (!qti.isCompositeIdentifier(identifier)) {
                    throw new Error('Invalid variable identifier');
                }

                return variableHash.get(identifier);
            } else {
                throw new Error('Not yet ready; wait for ' +
                    'VariableDeclarationsLoaded');
            }
        };

        var responseStatus = qti.responseStatus = function(itemIdentifier, responseIdentifier) {
            var foundResponses = 0,
                allResponses = 0,
                maxChoices = 0,
                maxResponses = 0,

                processResponse = function(response) {
                    var defaultValue = response.getDefaultValue(),
                        value = response.getValue(),
                        responseId, intrnsSlctr, els, connectDefaultValue;

                    if ($.isArray(value)) {
                        if (value.length === 0) {
                            value = undefined;
                        }
                    }

                    maxChoices = response.getMaxChoices();
                    if (maxChoices && maxChoices !== 0 && $.isArray(value)) {
                        if (value.length > 0) {
                            maxResponses = value.length;
                        }
                    }

                    if (value !== undefined) {
                        responseId = response.getIdentifier().slice(itemIdentifier.length + 1);

                        intrnsSlctr = '*[connect\\:responseIdentifier="' + responseId + '"]';
                        els = qti.activeItem ? qti.activeItem.find(intrnsSlctr) : $(intrnsSlctr);
                        if (els.length !== 0) {
                            connectDefaultValue = els.attr('connect:defaultValue');
                            if (connectDefaultValue !== undefined) {
                                if (value.toString() !== connectDefaultValue) {
                                    foundResponses = foundResponses + 1;
                                }
                            } else if (value !== defaultValue) {
                                foundResponses = foundResponses + 1;
                            }
                        } else if (value !== defaultValue) { // can never happen?
                            foundResponses = foundResponses + 1;
                        }
                    }
                    allResponses = allResponses + 1;
                };

            if (ready) {
                if (qti.isSimpleIdentifier(itemIdentifier)) {
                    if (!responseIdentifier) { // in what situation would this happen?
                        $.ulibEach(variableHash, function(responseVar) {
                            if (responseVar.key().indexOf(itemIdentifier + ".") === 0) {
                                processResponse(responseVar.value());
                            }
                        });
                    } else {
                        processResponse(variableHash.get(itemIdentifier + '.' + responseIdentifier));
                    }

                    if (maxChoices && maxChoices !== 0) {
                        allResponses = maxChoices;
                    }

                    if (maxResponses > 0) {
                        foundResponses = maxResponses;
                    }

                    if (foundResponses > 0 && (foundResponses === allResponses)) {
                        return "completed";
                    } else if (allResponses > 0 && foundResponses > 0) {
                        return "attempted";
                    } else {
                        return "";
                    }
                } else {
                    throw new Error('Invalid variable identifier');
                }
            } else {
                throw new Error('Not yet ready; wait for ' +
                    'VariableDeclarationsLoaded');
            }
        };

        function identifierFromXML(valueElement) {
            var identifier = qti.parseIdentifier(valueElement.text().trim());
            if (identifier === undefined) {
                throw new Error('Invalid identifier value');
            }
            return identifier;
        }

        function booleanFromXML(valueElement) {
            var value = qti.parseBoolean(valueElement.text().trim());
            if (value === undefined) {
                throw new Error('Invalid boolean value');
            }
            return value;
        }

        function integerFromXML(valueElement) {
            var integer = qti.parseInteger(valueElement.text().trim());
            if (integer === undefined) {
                throw new Error('Invalid integer value');
            }
            return integer;
        }

        function floatFromXML(valueElement) {
            var value = qti.parseQTIFloat(valueElement.text().trim());
            if (value === undefined) {
                throw new Error('Invalid floating point value');
            }
            return value;
        }

        function stringFromXML(valueElement) {
            return valueElement.text(); // do NOT trim!
        }

        function pointFromXML(valueElement) {
            var point = qti.parsePoint(valueElement.text().trim());
            if (point === undefined) {
                throw new Error('Invalid point value');
            }
            return point;
        }

        function pairFromXML(valueElement) {
            var pair = qti.parsePair(valueElement.text().trim());
            if (pair === undefined) {
                throw new Error('Invalid pair value');
            }
            return pair;
        }

        function directedPairFromXML(valueElement) {
            var directedPair = qti.parseDirectedPair(valueElement.text().trim());
            if (directedPair === undefined) {
                throw new Error('Invalid directed pair value');
            }
            return directedPair;
        }

        var durationFromXML = floatFromXML;

        function uriFromXML(valueElement) {
            var valueText = valueElement.text().trim();
            return $.createURI(valueText);
        }

        function crobjectFromXML(valueElement) {
            var valueText = valueElement.text().trim();
            return JXON.stringToJs(valueText);
        }

        var valueFromXMLFunctions = {
            "identifier": identifierFromXML,
            "boolean": booleanFromXML,
            "integer": integerFromXML,
            "float": floatFromXML,
            "string": stringFromXML,
            "point": pointFromXML,
            "pair": pairFromXML,
            "directedPair": directedPairFromXML,
            "duration": durationFromXML,
            "uri": uriFromXML,
            "crobject": crobjectFromXML
        };

        function valueFromXML(valueElements, baseType, cardinality) {
            var f = valueFromXMLFunctions[baseType];
            if (!$.isFunction(f)) {
                throw new Error('Invalid or unsupported base type');
            }

            if (cardinality === 'single') {
                if (valueElements.length === 0) {
                    return undefined;
                } else if (valueElements.length === 1) {
                    return f(valueElements);
                } else {
                    throw new Error('Single cardinality variable with ' +
                        'multiple values');
                }
            } else if (cardinality === 'multiple' || cardinality === 'ordered') {
                if (valueElements.length === 0) {
                    return undefined;
                } else {
                    return $.createArray(valueElements.map(function(index, valueElement) {
                        return f($(valueElement));
                    }));
                }
            } else {
                throw new Error('Invalid or unsupported cardinality');
            }
        }

        var isCompatibleValueFunctions = {
            'identifier': qti.isIdentifier,
            'boolean': $.isBoolean,
            'integer': qti.isInteger,
            'float': $.isNumber,
            'string': $.isString,
            'point': qti.isPoint,
            'pair': qti.isPair,
            'directedPair': qti.isDirectedPair,
            'duration': qti.isDuration,
            'uri': qti.isURI,
            "crobject": qti.isCrobject
        };

        function isCompatibleValue(cardinality, baseType, value) {
            var f = isCompatibleValueFunctions[baseType];

            if (!$.isFunction(f)) {
                throw new Error('Invalid base type');
            }

            if (cardinality === 'single') {
                return value === undefined || f(value);
            } else if (cardinality === 'multiple' || cardinality === 'ordered') {
                if ($.isCollection(value)) {
                    if (cardinality === 'ordered' && baseType === 'point') {
                        return $.every(value, function(val) {
                            return f(val) || val === undefined;
                        });
                    } else {
                        return $.every(value, f);
                    }
                } else {
                    return value === undefined || f(value);
                }
            } else {
                throw new Error('Invalid cardinality');
            }
        }

        function canonicalizeValue(cardinality, baseType, value) {
            if (isCompatibleValue(cardinality, baseType, value)) {
                if (cardinality === 'single') {
                    return value;
                } else {
                    if (value === undefined) {
                        return undefined;
                    } else if ($.isArray(value)) {
                        return value;
                    } else if ($.isCollection(value)) {
                        return $.createArray(value);
                    } else {
                        return [value];
                    }
                }
            } else {
                throw new Error('Incompatible value');
            }
        }

        var isResponseState = qti.isResponseState = function(value) {
            if (value === undefined || value === null ||
                $.isBoolean(value) || $.isNumber(value) ||
                $.isString(value)) {
                return true;
            } else if ($.isArrayLike(value)) {
                return $.every(value, isResponseState);
            } else if ($.isHash(value)) {
                return $.every(value, function(valueItem) {
                    return isResponseState(valueItem.value());
                });
            } else {
                return false;
            }
        };

        function initializeVariable(variable, identifier, cardinality,
            baseType, defaultValue, maxChoices) {
            var value = defaultValue;

            if (maxChoices === "undefined") {
                maxChoices = 0;
            }

            variable.getIdentifier = function() {
                if (arguments.length === 0) {
                    return identifier;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.getCardinality = function() {
                if (arguments.length === 0) {
                    return cardinality;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.getBaseType = function() {
                if (arguments.length === 0) {
                    return baseType;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.getDefaultValue = function() {
                if (arguments.length === 0) {
                    return defaultValue;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.getValue = function() {
                if (arguments.length === 0) {
                    return value;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.getMaxChoices = function() {
                if (arguments.length === 0) {
                    return maxChoices;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.isCompatibleValue = function(value) {
                if (arguments.length === 1) {
                    return isCompatibleValue(cardinality, baseType, value);
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            variable.setValue = function(newValue) {
                if (arguments.length !== 1) {
                    throw new Error('Invalid argument count');
                }

                value = canonicalizeValue(cardinality, baseType, newValue);
            };

            return variable;
        }

        function createResponseVariable(identifier, cardinality,
            baseType, defaultValue, maxChoices) {
            var responseVariable = new QTIResponseVariable(),
                responseIdentifier = identifier.substr(identifier.indexOf(".") + 1),
                state = undefined,
                superSetValue;

            initializeVariable(responseVariable, identifier, cardinality,
                baseType, defaultValue, maxChoices);

            superSetValue = responseVariable.setValue;
            responseVariable.setValue = function(newValue) {
                var listeners;
                superSetValue.apply(responseVariable, arguments);
                listeners = attemptHash[responseIdentifier];
                if (listeners) {
                    listeners.ulibEach(function(listener) {
                        listener = listener.value();
                        listener();
                    });
                } else {
                    console.log("No attempt listeners for " + responseIdentifier);
                }

                qti.fireEvent("changeResponseVariable", responseVariable);
            };

            responseVariable.getState = function() {
                if (arguments.length === 0) {
                    return state;
                } else {
                    throw new Error('Invalid argument count');
                }
            };

            responseVariable.setState = function(newState) {
                if (arguments.length > 1) {
                    throw new Error('Invalid argument count');
                } else if (!isResponseState(newState)) {
                    throw new Error('Invalid response state');
                }
                qti.fireEvent("changeState", responseVariable);
                state = newState;
            };

            return responseVariable;
        }

        function createParameterVariable(identifier, cardinality,
            baseType, defaultValue, maxChoices) {
            var parameterVariable = new QTIParameterVariable();
            initializeVariable(parameterVariable, identifier, cardinality,
                baseType, defaultValue, maxChoices);
            return parameterVariable;
        }

        function onVariableDeclarationsLoaded(variableDeclarationsXML) {
            var itemElements = variableDeclarationsXML.find('item');
            itemElements.each(function(index, itemElement) {
                itemElement = $(itemElement);
                var itemIdentifier = itemElement.attr('identifier');
                if (!qti.isSimpleIdentifier(itemIdentifier)) {
                    throw new Error('Invalid item identifier');
                }

                var variableDeclarationElements =
                    itemElement.find('>qti\\:responseDeclaration, >p\\:parameterDeclaration');
                variableDeclarationElements.each(function(index,
                    variableDeclarationElement) {
                    variableDeclarationElement = $(variableDeclarationElement);
                    var localIdentifier =
                        variableDeclarationElement.attr('identifier').trim();
                    var cardinality =
                        variableDeclarationElement.attr('cardinality').trim();
                    var maxChoices = 0;
                    if (variableDeclarationElement.attr('connect:maxChoices')) {
                        maxChoices = parseInt(variableDeclarationElement.attr('connect:maxChoices').trim(), 10);
                    }
                    var baseType =
                        variableDeclarationElement.attr('baseType').trim();
                    var defaultValueElements = variableDeclarationElement.find(
                        '>qti\\:defaultValue>qti\\:value');
                    var defaultValue = valueFromXML(
                        defaultValueElements, baseType, cardinality);

                    if (!qti.isSimpleIdentifier(localIdentifier)) {
                        throw new Error('Invalid variable identifier');
                    }

                    var identifier = qti.createCompositeIdentifier(
                        itemIdentifier, localIdentifier);

                    var variable;
                    if (variableDeclarationElement.localName() ===
                        'responseDeclaration') {
                        variable = createResponseVariable(
                            identifier, cardinality, baseType,
                            defaultValue, maxChoices);
                    } else {
                        variable = createParameterVariable(
                            identifier, cardinality, baseType,
                            defaultValue, maxChoices);
                    }
                    variableList.push(variable);
                    variableHash.set(identifier, variable);
                });
            });

            ready = true;
        }

        $.getXML('variable-declarations.xml', onVariableDeclarationsLoaded);

        qti.setupCustomFormResponses = function(form, attachSequenceNumber) {
            var formElementsList = [],
                formId = form.attr('id'),
                formElements = form.find('input:not([type="button"]):not([type="submit"]), select, textarea');
            formElements.each(function() {
                var formElement = $(this),
                    type = formElement.attr('type'),
                    fldName = formElement.attr('name'),
                    identifier = formId + '.' + fldName;
                if (fldName && formElementsList.indexOf(identifier) === -1) {
                    var variable,
                        cardinality = "single",
                        maxChoices = 0,
                        baseType = "string",
                        defaultValue = "",
                        defaultValueElements = formElement;

                    if (type === "checkbox") {
                        cardinality = "multiple";
                        defaultValue = [];
                    }

                    variable = createResponseVariable(
                        identifier, cardinality, baseType,
                        defaultValue, maxChoices);

                    if (attachSequenceNumber) {
                        variable.sequenceNumber = formElement.closest('[data-sequence-number]').data('sequence-number');
                    }

                    variableList.push(variable);
                    variableHash.set(identifier, variable);
                    formElementsList.push(identifier);
                }
            });
        };

        qti.getCustomFormVariable = function(identifier) {
            return variableHash.get(identifier);
        };
    }());

    (function() {
        var itemRulesetMap = $.createHash();

        function onParameterProcessingXMLLoaded(parameterProcessingXML) {
            var itemElements = parameterProcessingXML.find('item');
            itemElements.each(function(index, itemElement) {
                itemElement = $(itemElement);

                var itemIdentifier = itemElement.attr('identifier').trim();
                var itemRulesArray = [];

                var spvElements = itemElement.find('p\\:setParameterValue');
                spvElements.each(function(index, spvElement) {
                    spvElement = $(spvElement);
                    var parameterIdentifier = spvElement.attr('identifier').trim();
                    parameterIdentifier = qti.createCompositeIdentifier(
                        itemIdentifier, parameterIdentifier);
                    var variableElements = spvElement.find('qti\\:variable');
                    variableElements.each(function(index, variableElement) {
                        variableElement = $(variableElement);
                        var variableIdentifier =
                            variableElement.attr('identifier').trim();
                        itemRulesArray.push(function() {
                            var parameter = qti.getVariable(parameterIdentifier);
                            var variable = qti.getVariable(variableIdentifier);
                            parameter.setValue(variable.getValue());
                        });
                    });
                });

                function itemRuleset() {
                    itemRulesArray.forEach(function(f) {
                        f();
                    });
                }
                itemRulesetMap.set(itemIdentifier, itemRuleset);
            });
        }

        $.getXML('parameter-processing.xml', onParameterProcessingXMLLoaded);

        function onBeforeLoadItem(item) {
            var itemIdentifier = item.getIdentifier();
            var itemRuleset = itemRulesetMap.get(itemIdentifier);
            if ($.isFunction(itemRuleset)) {
                itemRuleset();
            }
        }

        qti.subscribeToEvent("beforeLoadItem", onBeforeLoadItem, "Parameter processing", "param");
    }());

    (function() {

        var cssApplier, store = qti.store = {},
            ranges, rangesOrder, savedRanges = {},
            savedNotes = {},
            notesOptions = {},
            insertAtCaret = qti.insertAtCaret,
            screen = {},
            screenId,

            makeRandomStr = qti.makeRandomStr = function(len) {
                var text = "",
                    i,
                    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (i = 0; i < (len || 5); i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }

                return text;
            };

        screen.notes = {};
        screen.textAreaSelection = null;
        screen.mainSelector = '[role~="main"]';
        //screen.mainSelector = '[role~="main"] [connect\\:class~="columns"] [connect\\:class~="row"]';

        qti.updateScreenStore = function() {
            screenId = qti.getCurrentItem().getIdentifier();
            if (!store[screenId]) {
                store[screenId] = {};
            }
        };

        function extractText($note) {
            var htxt = $note.find('.edit .highlightText').html().replace(/<br[^\>]+>/gi, '\n'),
                mtxt = $note.find('.edit .mainText').html().replace(/<br[^\>]+>/gi, '\n'),
                txt = '"' + $.trim(htxt) + '"\n';
            if (mtxt) {
                txt += $.trim(mtxt) + '\n';
            }
            return txt;
        }

        /*function insertAtCaret(txtarea, text) {
    		var range;
    		var scrollPos = txtarea.scrollTop;
    		var strPos = 0;
    		var br = ((txtarea.selectionStart || txtarea.selectionStart === '0') ?
    			"ff" : (document.selection ? "ie" : false ) );
    		if (br === "ie") {
    			txtarea.focus();
    			range = document.selection.createRange();
    			range.moveStart ('character', -txtarea.value.length);
    			strPos = range.text.length;
    		}
    		else if (br === "ff") {
    			strPos = txtarea.selectionStart;
    		}
    
    		var front = (txtarea.value).substring(0,strPos);
    		var back = (txtarea.value).substring(strPos,txtarea.value.length);
    		txtarea.value=front+text+back;
    		strPos = strPos + text.length;
    		if (br === "ie") {
    			txtarea.focus();
    			range = document.selection.createRange();
    			range.moveStart ('character', -txtarea.value.length);
    			range.moveStart ('character', strPos);
    			range.moveEnd ('character', 0);
    			range.select();
    		}
    		else if (br === "ff") {
    			txtarea.selectionStart = strPos;
    			txtarea.selectionEnd = strPos;
    			txtarea.focus();
    		}
    		txtarea.scrollTop = scrollPos;
    	}*/

        function newNote(txt, pos) {
            var note = new Note(notesOptions);
            note.id = ++highestId;
            if (pos) {
                note.left = pos.left + "px";
                note.top = pos.top + "px";
            } else {
                note.left = '80%';
                note.top = '60px';
            }
            note.zIndex = ++highestZ;

            if (txt && notesOptions.highlightText) {
                note.hText = txt;
                //note.onNoteClick();
            }
            /* var $note = $(note.note);
            $('<a class="styledButton noPointer" href="#">save to notepad</a>')
            	.appendTo($note.find('.ftr'))
            	.click(function() {
            		var text, notepad = $('[role~="main"] textarea:last');
            		if (notepad.length > 0) {
            			text = extractText($note);
            			if (notepad.val() !== "") {
            				text = "\n\n" + text;
            			}
            			insertAtCaret(notepad.get(0), text);
            		}
            		return false;
            	}); */

            return note;
        }

        function checkValidSelection(sel) {
            var range = sel.getRangeAt(0);
            if (($(range.startContainer.parentNode).closest('#highlightable-content').length > 0) &&
                ($(range.endContainer.parentNode).closest('#highlightable-content').length > 0)) {
                return true;
            } else {
                return false;
            }
        }

        function checkSelection(opt) {
            screen.sel = rangy.getSelection();
            var selContent = screen.sel.toHtml(),
                isHighlighted = $(screen.crntTarget).is('.ylw-hglted'),
                containsIntrxn;
            if (/</.test(selContent)) {
                if (/^</.test(selContent)) {
                    containsIntrxn = ($(selContent).find('[connect\\:responseIdentifier],[connect\\:identifier]').length > 0);
                } else {
                    containsIntrxn = ($($.parseHTML(selContent)).find('[connect\\:responseIdentifier],[connect\\:identifier]').length > 0);
                }
            }
            if ((screen.sel.isCollapsed && !isHighlighted) || containsIntrxn) {
                return false;
            }
            if (screen.sel.rangeCount === 0 || screen.sel.isCollapsed) {
                opt.items.highlight.disabled = true;
                if (isHighlighted) {
                    opt.items.note.disabled = false;
                    opt.items.clear.disabled = false;
                    if (qti.clearAllNotes) {
                        opt.items.clearAll.disabled = false;
                    }
                } else {
                    opt.items.note.disabled = true;
                    opt.items.clear.disabled = true;
                    if (qti.clearAllNotes) {
                        opt.items.clearAll.disabled = true;
                    }
                }
            } else {
                if (checkValidSelection(screen.sel)) {
                    opt.items.highlight.disabled = false;
                    opt.items.note.disabled = false;
                } else {
                    opt.items.highlight.disabled = true;
                    opt.items.note.disabled = true;
                }
                opt.items.clear.disabled = true;
                if (qti.clearAllNotes) {
                    opt.items.clearAll.disabled = true;
                }
            }
            if ((opt.items.highlight.disabled && opt.items.note.disabled && opt.items.clear.disabled) || (qti.clearAllNotes && (opt.items.highlight.disabled && opt.items.note.disabled && opt.items.clear.disabled && opt.items.clearAll.disabled))) {
                //opt.$trigger.contextMenu("hide");
                opt.$menu.addClass('hidden');
            } else {
                opt.$menu.removeClass('hidden');
            }
        }

        function checkRangeOverlap(focalRange, testRange) {
            var extremetiesOK = focalRange.compareBoundaryPoints(Range.END_TO_START, testRange) === -1;
            var overlapAreaOK = focalRange.compareBoundaryPoints(Range.START_TO_END, testRange) === 1;
            return extremetiesOK && overlapAreaOK;
        }

        function checkHighlightedRanges(selRange) {
            var key, crntRange, startInRange, endInRange, check = false;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    crntRange = ranges[key];
                    if (checkRangeOverlap(selRange, crntRange)) {
                        check = {
                            overlap: key
                        };
                        startInRange = crntRange.isPointInRange(selRange.startContainer, selRange.startOffset);
                        endInRange = crntRange.isPointInRange(selRange.endContainer, selRange.endOffset);
                        if (!startInRange || !endInRange) {
                            if (startInRange) {
                                //crntRange.setEnd(selRange.endContainer, selRange.endOffset);
                                selRange.setStart(crntRange.startContainer, crntRange.startOffset);
                            }
                            if (endInRange) {
                                //crntRange.setStart(selRange.startContainer, selRange.startOffset);
                                selRange.setEnd(crntRange.endContainer, crntRange.endOffset);
                            }
                            //crntRange = selRange;
                            delete ranges[key];
                            if (screen.notes[key]) {
                                delete screen.notes[key];
                            }
                            check.update = true;
                        } else {
                            selRange = crntRange;
                            check.update = false;
                        }
                    }
                }
            }
            return check;
        }

        function checkRangesOrdering(crntkey) {
            //var range = ranges[crntkey], trgtRange, key, newkey;
            var focalRange = ranges[crntkey],
                reordered = false,
                trgtRange, key, pos, focalpos;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key) && key !== crntkey) {
                    trgtRange = ranges[key];
                    pos = rangesOrder.indexOf(key);
                    if ((!focalpos || (focalpos > pos)) &&
                        (trgtRange.startContainer.parentNode.parentNode === focalRange.startContainer.parentNode.parentNode ||
                            trgtRange.startContainer.parentNode.parentNode === focalRange.endContainer.parentNode.parentNode) &&
                        focalRange.compareBoundaryPoints(Range.START_TO_END, trgtRange) === -1) {
                        rangesOrder.splice(pos, 0, crntkey);
                        focalpos = pos;
                        reordered = true;
                    }
                }
            }
            if (!reordered) {
                rangesOrder.push(crntkey);
            }
        }

        function rangeIntersectsNode(range, node) {
            var nodeRange = node.ownerDocument.createRange();
            try {
                nodeRange.selectNode(node);
            } catch (e) {
                nodeRange.selectNodeContents(node);
            }
            return checkRangeOverlap(range, nodeRange);
        }

        function getContextualRange1(testRange) {
            var key, trgtRng;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    trgtRng = ranges[key];
                    if (trgtRng.isPointInRange(testRange.startContainer, testRange.startOffset)) {
                        //var x = 1;
                        return key;
                    }
                }
            }
            return false;
        }

        function getContextualRange(node) {
            var key, trgtRng;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    trgtRng = ranges[key];
                    if (rangeIntersectsNode(trgtRng, node)) {
                        return key;
                    }
                }
            }
            return false;
        }

        function highlightSelection(action, opt) {
            var str, $note, key = makeRandomStr(),
                range, rangeCheck, rkey;
            if (screen.sel.rangeCount === 0 || screen.sel.isCollapsed) {
                //range = rangy.getSelection().getRangeAt(0);
                rkey = getContextualRange(screen.crntTarget);
                range = ranges[rkey];
            } else {
                range = screen.sel.getRangeAt(0);
            }

            rangeCheck = checkHighlightedRanges(range);
            if (rangeCheck) {
                if (rangeCheck.update) {
                    cssApplier.applyToRange(range);
                    ranges[rangeCheck.overlap] = range;
                    checkRangesOrdering(rangeCheck.overlap);
                }

                if (action === "note") {
                    str = range.toString();
                    if (screen.notes[rangeCheck.overlap]) {
                        $note = $(screen.notes[rangeCheck.overlap].note);
                        if (rangeCheck.update) {
                            $note.find('.highlightText').text(str);
                        }
                        $note.fadeIn();
                    } else {
                        screen.notes[rangeCheck.overlap] = newNote(str, opt.$menu.offset());
                    }
                }
            } else {
                cssApplier.applyToRange(range);
                ranges[key] = range;
                checkRangesOrdering(key);

                if (action === "note") {
                    str = range.toString();
                    screen.notes[key] = newNote(str, opt.$menu.offset());
                }
            }
            screen.sel.collapseToEnd();
        }

        function clearHighlight() {
            var key, pos;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    var trgtRng = ranges[key],
                        $wrpElmt = $(trgtRng.startContainer).parent();
                    if (rangeIntersectsNode(trgtRng, screen.crntTarget)) {
                        $wrpElmt.find('span.notesIcon').remove();
                        cssApplier.undoToRange(trgtRng);
                        if (screen.notes[key]) {
                            $(screen.notes[key].note).remove();
                            delete screen.notes[key];
                        }
                        delete ranges[key];
                        pos = rangesOrder.indexOf(key);
                        rangesOrder.splice(pos, 1);
                        break;
                    }
                }
            }
        }

        function clearAllHighlight() {
            var key, pos;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    var trgtRng = ranges[key],
                        $wrpElmt = $(trgtRng.startContainer).parent();
                    if ($wrpElmt.closest('[connect\\:class~="activeItem"]').length > 0) {
                        $wrpElmt.find('span.notesIcon').remove();
                        cssApplier.undoToRange(trgtRng);
                        if (screen.notes[key]) {
                            $(screen.notes[key].note).remove();
                            delete screen.notes[key];
                        }
                        delete ranges[key];
                        pos = rangesOrder.indexOf(key);
                        rangesOrder.splice(pos, 1);
                    }
                }
            }
        }

        function getTextAreaSelection(e) {
            //Mozilla and DOM 3.0
            if ('selectionStart' in e) {
                var l = e.selectionEnd - e.selectionStart;
                return {
                    start: e.selectionStart,
                    end: e.selectionEnd,
                    length: l,
                    text: e.value.substr(e.selectionStart, l)
                };
            }
            //IE
            else if (document.selection) {
                e.focus();
                var r = document.selection.createRange();
                var tr = e.createTextRange();
                var tr2 = tr.duplicate();
                tr2.moveToBookmark(r.getBookmark());
                tr.setEndPoint('EndToStart', tr2);
                if (r === null || tr === null) {
                    return {
                        start: e.value.length,
                        end: e.value.length,
                        length: 0,
                        text: ''
                    };
                }
                var text_part = r.text.replace(/[\r\n]/g, '.'); //for some reason IE doesn't always count the \n and \r in the length
                var text_whole = e.value.replace(/[\r\n]/g, '.');
                var the_start = text_whole.indexOf(text_part, tr.text.length);
                return {
                    start: the_start,
                    end: the_start + text_part.length,
                    length: text_part.length,
                    text: r.text
                };
            }
            //Browser not supported
            else {
                return {
                    start: e.value.length,
                    end: e.value.length,
                    length: 0,
                    text: ''
                };
            }
        }

        function getEquivRangeKey(trgtRng) {
            var key, range;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    range = ranges[key];
                    if (rangeIntersectsNode(range, trgtRng.startContainer)) {
                        return key;
                    }
                }
            }
            return key;
        }

        function applyHighlighting(range) {
            if (range) {
                cssApplier.applyToRange(range);
            } else {
                var i, trgtRng, key, rangeCount = 0,
                    sel = rangy.getSelection();
                sel.removeAllRanges();
                for (key in ranges) {
                    if (ranges.hasOwnProperty(key)) {
                        range = ranges[key];
                        sel.addRange(range);
                        rangeCount++;
                    }
                }
                cssApplier.applyToSelection();
                sel = rangy.getSelection();
                for (i = 0; i < rangeCount; i++) {
                    trgtRng = sel.getRangeAt(i);
                    key = getEquivRangeKey(trgtRng);
                    ranges[key] = trgtRng;
                }
                sel.collapseToEnd();
            }
        }

        function removeHighlighting(range) {
            if (range) {
                cssApplier.undoToRange(range);
            } else {
                var i, key;
                for (i = 0; i < rangesOrder.length; i++) {
                    key = rangesOrder[i];
                    range = ranges[key];
                    cssApplier.undoToRange(range);
                }
            }
        }

        function checkCurrentRanges() {
            var key, r = 0;
            for (key in ranges) {
                if (ranges.hasOwnProperty(key)) {
                    r++;
                }
            }
            return r;
        }

        var saveTextNotes = qti.saveTextNotes = function() {
            var notepad = $('[role~="main"] textarea:last');
            savedNotes[screenId] = notepad.val();
        };

        var restoreTextNotes = qti.restoreTextNotes = function() {
            if (savedNotes[screenId] !== undefined) {
                var notepad = $('[role~="main"] textarea:last');
                notepad.val(savedNotes[screenId]);
            }
        };

        var saveCurrentRanges = qti.saveCurrentRanges = function() {
            if (checkCurrentRanges() > 0) {
                var key, crntRange, srlzdObj;
                savedRanges[screenId] = {};
                removeHighlighting();
                for (key in ranges) {
                    if (ranges.hasOwnProperty(key)) {
                        crntRange = ranges[key];
                        srlzdObj = rangy.serializeRange(crntRange, false, $('#highlightable-content')[0]);
                        savedRanges[screenId][key] = srlzdObj;
                    }
                }
            }
        };

        var restoreSavedRanges = qti.restoreSavedRanges = function() {
            if (savedRanges[screenId]) {
                ranges = screen[screenId].ranges;
                rangesOrder = store[screenId].rangesOrder;
                var key, crntRange, srlzdObj, restored = false;
                for (key in savedRanges[screenId]) {
                    if (savedRanges[screenId].hasOwnProperty(key)) {
                        srlzdObj = savedRanges[screenId][key];
                        crntRange = rangy.deserializeRange(srlzdObj, $('#highlightable-content')[0]);
                        ranges[key] = crntRange;
                        delete savedRanges[screenId][key];
                        restored = true;
                    }
                }
                if (restored) {
                    applyHighlighting();
                }
            } else {
                screen[screenId] = {};
                ranges = screen[screenId].ranges = {};
                rangesOrder = store[screenId].rangesOrder = [];
            }
        };

        function setupRubricHandler() {
            var rubric = $('[connect\\:class~="rubricBlock"]'),
                rubricState,
                rubricToggle = rubric.find('a[connect\\:class="contentToggle"]');
            if (rubricToggle.length > 0) {
                rubric.children(':has(a[connect\\:class="contentToggle"])').addClass('trigger');
                if (store[screenId].rubricState) {
                    rubricState = store[screenId].rubricState;
                } else {
                    rubricState = store[screenId].rubricState = "collapse";
                }
                rubricToggle.click(function(event) {
                    if (rubricState === "expand") {
                        rubric.children(':not(.trigger)').show();
                        rubricState = "collapse";
                    } else {
                        rubric.children(':not(.trigger)').hide();
                        rubricState = "expand";
                    }
                    rubricToggle.find('span[connect\\:class~="toggle"]').toggle();
                    store[screenId].rubricState = rubricState;

                    qti.fireEvent("rubricResize");
                    event.preventDefault();
                    return false;
                });
                if (rubricState === "expand") {
                    rubricState = "collapse";
                    rubricToggle.click();
                }
            }
        }

        function setupEditActions() {
            $('.editActions a').click(function(event) {
                var trgtTbox = $(this).closest('[connect\\:class="panelTitleBlock"]').next('textarea');
                screen.textAreaSelection = getTextAreaSelection(trgtTbox[0]);
                if ($(this).is('.copy')) {
                    screen.clipboard = screen.textAreaSelection.text;
                } else if ($(this).is('.paste')) {
                    var txt = screen.clipboard,
                        rsp, rspId;
                    insertAtCaret(trgtTbox[0], txt);
                    trgtTbox.change();
                    rspId = trgtTbox.attr('connect:responseIdentifier');
                    if (rspId) {
                        rsp = qti.getVariable(rspId);
                        rsp.setValue(trgtTbox.val());
                    }
                }
                event.preventDefault();
                return false;
            });
        }

        qti._setupTextHighlighting = function(options) {
            rangy.init();
            cssApplier = rangy.createCssClassApplier("ylw-hglted", true);

            qti.subscribeToEvent("screenChange", function() {
                $('div.note:visible').fadeOut(250);
            }, "hide any visible hover notes on screen change", "hideNotesOnScreenChange");

            $('[role~="main"]').on('mousedown', function(event) {
                screen.crntTarget = event.target;
            }).on('mouseup', '.ylw-hglted', function(event) {
                if (event.which === 1) { // only for left mouse button usage
                    var rkey = getContextualRange(event.target);
                    if (rkey && screen.notes[rkey]) {
                        $(screen.notes[rkey].note).fadeIn();
                    }
                }
            }).on('mouseover', '.ylw-hglted', function(event) {
                var htext = event.target,
                    rkey = getContextualRange(htext),
                    $noteIndctr = $(htext).find('span.notesIcon');
                if (rkey && screen.notes[rkey]) {
                    if ($noteIndctr.length === 0) {
                        $(htext).prepend('<span class="notesIcon"></span>');
                    } else {
                        $noteIndctr.show();
                    }
                }
            }).on('mouseleave', '.ylw-hglted', function(event) {
                var htext = event.target,
                    rkey = getContextualRange(htext);
                if (rkey && screen.notes[rkey]) {
                    $(htext).find('span.notesIcon').hide();
                }
            }).on('mouseout', '.notesIcon', function(event) {
                $(this).hide();
            });

            var checkEditMenuOptions, editContextMenu;
            if (qti.useClipboard) {
                checkEditMenuOptions = function(opt) {
                    if (document.queryCommandEnabled('copy')) {
                        opt.items.copy.disabled = false;
                    } else {
                        opt.items.copy.disabled = true;
                    }
                    if (document.queryCommandEnabled('paste')) {
                        opt.items.paste.disabled = false;
                    } else {
                        opt.items.paste.disabled = true;
                    }
                };

                editContextMenu = function(action, opt) {
                    if (action === 'copy') {
                        document.execCommand('copy');
                    } else if (action === 'paste') {
                        document.execCommand('paste');
                    }
                };
            } else {
                checkEditMenuOptions = function(opt) {
                    screen.sel = rangy.getSelection();
                    //if (screen.sel.rangeCount === 0 || screen.sel.isCollapsed) {
                    screen.textAreaSelection = getTextAreaSelection(this[0]);
                    if (screen.textAreaSelection.text === "") {
                        this.mousedown();
                        //screen.sel.collapseToEnd();
                        opt.items.copy.disabled = true;
                    } else {
                        opt.items.copy.disabled = false;
                    }
                    if (screen.clipboard) {
                        opt.items.paste.disabled = false;
                    } else {
                        opt.items.paste.disabled = true;
                    }
                };

                editContextMenu = function(action, opt) {
                    if (action === "copy") {
                        screen.clipboard = screen.textAreaSelection.text;
                    } else if (action === "paste") {
                        var txt = screen.clipboard;
                        insertAtCaret(opt.$trigger[0], txt);
                        //$(opt.$trigger[0]).keypress();
                        //$(opt.$trigger[0]).focus();
                    }
                };

                /* function selectionCleanup(opt) {
                	//screen.selText = null;
                } */
            }

            $.contextMenu({
                selector: '#highlightable-content',
                items: {
                    highlight: {
                        name: "Highlight",
                        icon: "highlight",
                        callback: highlightSelection
                    },
                    note: {
                        name: "Notes",
                        icon: "edit",
                        callback: highlightSelection
                    },
                    clear: {
                        name: "Clear",
                        icon: "clear",
                        disabled: true,
                        callback: clearHighlight,
                        title: "Clears this highlighting"
                    },
                    clearAll: {
                        name: "Clear all",
                        icon: "clearAll",
                        disabled: true,
                        callback: clearAllHighlight,
                        title: "Clears all highlighting on this page"
                    }
                    //save: {name: "Save", icon: "save", callback: $.noop}
                },
                events: {
                    show: checkSelection
                },
                zIndex: 400
            });
            $.contextMenu({
                selector: '[role~="main"] div.textarea,span.input,span.wordCount',
                items: {
                    copy: {
                        name: "Copy",
                        icon: "copy",
                        callback: editContextMenu
                    },
                    paste: {
                        name: "Paste",
                        icon: "paste",
                        callback: editContextMenu
                    }
                    //clear: {name: "Clear", icon: "clear", disabled: true, callback: clearHighlight}
                    //save: {name: "Save", icon: "save", callback: $.noop}
                },
                events: {
                    show: checkEditMenuOptions
                    //hide: selectionCleanup
                },
                zIndex: 400
            });
            $('#highlightable-content :input').on('contextmenu', function(event) {
                event.preventDefault();
                return false;
            });

            notesOptions.highlightText = true;
            if (options) {
                if (options.noteHtext === false) {
                    notesOptions.highlightText = false;
                }
            }
        };

        var loadItemFunc = function(itemObj) {
                if (document.getElementById('hbutton')) {
                    $('[connect\\:class~="itemBody"] em').addClass('keyword');
                    var hbuttontext = 'Turn keyword highlighting ON';
                    $('#hbutton').html(hbuttontext)
                        .toggle(function() {
                            $(this).html('Turn keyword highlighting OFF').addClass('highlighton');
                            $('em.keyword').addClass('highlight');
                        }, function() {
                            $(this).html(hbuttontext).removeClass('highlighton');
                            $('em.keyword').removeClass('highlight');
                        });
                }
            },

            setupFormattedContent = function(itemObj) {
                itemObj.find('span[connect\\:author-class="fraction"],span[connect\\:author-class="ma-numbers"]').each(function() {
                    var $this = $(this),
                        tpW, tpH, btW,
                        parts = $this.html().split("/");
                    if (parts.length === 2) {
                        $this.html('<span class="top">' + parts[0] + '</span><span class="bottom">' + parts[1] + '</span>');
                        tpW = $this.children('.top').width();
                        tpH = $this.children('.top').height();
                        btW = $this.children('.bottom').width();
                        $this.css('width', (Math.round(Math.max(tpW, btW) / tpH * 100) / 100) + 'em');
                    }
                });
            };

        qti.subscribeToEvent("itemLoad", loadItemFunc, "Iterates through the text interactions on an item and adds key events, blur and focus functions", "itemUtilities");
        qti.subscribeToEvent("newScreenDisplay", setupFormattedContent, "Setup formatting for any special contents such as fractions", "setupFormattedContent");
    })();


    (function() {
        var pollingList = [];
        var pollingTimer;
        var addToPollingList = qti.addToPollingList = function(func) {
            if (arguments.length !== 1) {
                throw new Error("Unexpected number of arguments");
            }
            if (typeof(func) !== "function") {
                throw new Error("Unexpected argument type");
            }

            pollingList.push(func);
        };

        var polling = qti._polling = function() {
            pollingTimer = setInterval(function() {
                pollingList.forEach(function(func) {
                    func();
                });
            }, 5000);
            pollingList.forEach(function(func) {
                func();
            });
        };

    }());


    (function() {
        qti._setupAudio = function() {
            if ($('#audio-content').length > 0) {
                var ap, hideAudioControl,
                    $audioContent = $('#audio-content'),
                    $audioControl = $('#audio-control'),
                    $slider = $('#slider'),
                    $amount = $('#amount');

                $slider.slider({
                    range: "max",
                    value: 50,
                    min: 0,
                    max: 100,
                    slide: function(event, ui) {
                        $amount.val(ui.value);
                        qti.audioPlayer.jPlayer("volume", ui.value / 100);
                    }
                });
                $amount.val($slider.slider("value"));

                ap = $audioContent.jPlayer({
                    supplied: "oga",
                    preload: "auto",
                    loop: true
                });
                hideAudioControl = function() {
                    $audioControl.hide();
                    ap.jPlayer("stop");
                };

                qti.subscribeToEvent("testEnd", hideAudioControl, "hide the audio control", "hideAudioControl", true);

                return ap;
            }
        };

        var getFileElements = qti.getFileElements = function(data) {
            data = data.replace(/^\s|\s$/g, "");

            var m;
            if (/\.\w+$/.test(data)) {
                m = data.match(/([^\/\\]+)\.(\w+)$/);
                if (m) {
                    return {
                        filename: m[1],
                        ext: m[2]
                    };
                } else {
                    return {
                        filename: "no file name",
                        ext: null
                    };
                }
            } else {
                m = data.match(/([^\/\\]+)$/);
                if (m) {
                    return {
                        filename: m[1],
                        ext: null
                    };
                } else {
                    return {
                        filename: "no file name",
                        ext: null
                    };
                }
            }
        };

        var loadAudioClip = qti.loadAudioClip = function(src, title) {
            //var src = link.attr('href'),
            var fl = qti.getFileElements(src);
            $('audio source[src*="' + fl.ext + '"]').attr('src', src);
            qti.audioPlayer.audio.src = src;
            //$('div.audio-content strong.clip').text(title);
        };

        var audioClipHandler = qti.audioClipHandler = function(event) {
            var src = $(this).attr('href');
            if (!(new RegExp(src)).test(qti.audioPlayer.audio.src)) {
                loadAudioClip(src, $(this).text());
            }
            qti.audioPlayer.audio.play();
            event.preventDefault();
        };
    })();

    (function() {
        qti._setupVideo = function() {
            if ($('video').length > 0) {
                qti.videoPlayer = VideoJS.setup("video-player", {
                    controlsBelow: true,
                    controlsHiding: false
                });
                qti.videoPlayer.setupVolumeHelper = function(content) {
                    var volCtrl = $(content).find('div.vjs-volume-control');
                    qti.videoPlayer.activateElement(volCtrl[0], "volumeScrubber");
                    qti.videoPlayer.activateElement(volCtrl[0].children[0], "volumeDisplay");
                    volCtrl.click(function() {
                        qti.videoPlayer.playVolumeClip();
                    });
                };
                qti.videoPlayer.playVolumeClip = function() {
                    if (qti.videoPlayer.paused()) {
                        qti.videoPlayer.play();
                    }
                    if (qti.videoPlayer.playTimer) {
                        clearTimeout(qti.videoPlayer.playTimer);
                    }
                    qti.videoPlayer.playTimer = setTimeout(function() {
                        qti.videoPlayer.pause();
                    }, 4000);
                };

                var loadItemFunc = function(itemObj) {
                        if ($('div.video-item').length > 0) {
                            var drtn, tms, leftpos, vm, vms,
                                vmh = document.querySelector('div.vmarkers-holder');
                            if (vmh && !document.querySelector('div.video-js-box div.vmarkers-holder')) {
                                document.querySelector('div.video-js-box').appendChild(vmh);
                                drtn = qti.hms2sec($('div.vmarkers-holder').attr('total-duration'));

                                vms = document.querySelectorAll('div.vmarker');
                                for (var i = 0; i < vms.length; i++) {
                                    vm = vms[i];
                                    tms = qti.hms2sec($(vm).find('span.time').text());
                                    leftpos = (tms / drtn * 100).toFixed(2) + "%";
                                    $(vm).css('left', leftpos);
                                }
                            }

                            var src = $('div.video-item').attr('data-source');
                            if (!(new RegExp(src)).test(qti.videoPlayer.video.src)) {
                                $('video source').attr('src', src);
                                qti.videoPlayer.video.src = src;
                                qti.videoPlayer.forceTheSource();
                            }
                            $('div.video-content').css('visibility', 'visible');
                            qti.videoPlayer.play();
                        }
                    },
                    unloadItemFunc = function(itemObj) {
                        if ($('div.video-item').length > 0) {
                            qti.videoPlayer.pause();
                            $('div.video-content').css('visibility', 'hidden');
                        }
                    };

                qti.subscribeToEvent("itemLoad", loadItemFunc, "Add VideoJS to video tags in the loaded item, once the DOM is ready", "videoJsSetup");
                qti.subscribeToEvent("itemUnload", unloadItemFunc, "Tear down video player objects on unloading an item to free up memory", "videoJsUnset");

                return true;
            } else {
                return false;
            }
        };
    })();

    (function() {
        var getSizeSpan;
        (function() {
            var sizeSpan;
            getSizeSpan = function() {
                if (sizeSpan) {
                    return sizeSpan;
                } else {
                    sizeSpan = $.ulib.span();
                    sizeSpan.attr("connect:class", "textEntryInteraction inlineInteraction");
                    sizeSpan.css({
                        position: 'absolute',
                        visibility: 'hidden',
                        left: '-100000px',
                        whiteSpace: 'pre'
                    });
                    $(document.body).append(sizeSpan);
                    return sizeSpan;
                }
            };
        }());

        var loadItemFunc = function(itemBody) {
                var itemIdentifier = itemBody.attr('connect:identifier'),
                    textEntryGroups = itemBody.find('div[connect\\:author-class~="container"][connect\\:author-class~="inlineTextEntry"]')
                    .add(itemBody.find('div[connect\\:author-class="svg-interactions-container"]:has([connect\\:class~="textEntryInteraction"])')),
                    textInteractions, sizeSpan = getSizeSpan(),
                    tabCounter = 5;

                function lengthOfStringPx(string) {
                    var padding, pf; // padding factor - the amount to multiply the padding
                    if (string === undefined) {
                        string = '';
                        pf = 1;
                    } else {
                        pf = Math.ceil(string.length / 3.5);
                    }
                    padding = new Array(pf + 1).join('\u2005');
                    sizeSpan.text(string + padding);
                    return sizeSpan[0].clientWidth;
                }

                var setupTextInteraction = function(textInteraction) {
                        var responseIdentifier = textInteraction.attr('connect:responseIdentifier');
                        if (!responseIdentifier) {
                            return;
                        }
                        var expectedLength = textInteraction.attr('connect:expectedLength') ? qti.parseInteger(textInteraction.attr('connect:expectedLength')) : 50,
                            placeholderText = textInteraction.attr('placeholder'),
                            parentContainer = textInteraction.parent().parent(),
                            parentDivContainer = textInteraction.closest('div, td'),
                            parentWidth = parentContainer[0].clientWidth,
                            keywordEntry = textInteraction.is('.keyword'),
                            expandable = textInteraction.is('[connect\\:author-class~="presentation-expandable"],[nav~="expandable"]'),
                            wordCounter = textInteraction.closest('[connect\\:class="container"]').find('.wordCount .value'),

                            emptyWidthPx = (function() {
                                var placeholderLengthPx = lengthOfStringPx(placeholderText);
                                var expectedLengthText = '';
                                var i;

                                for (i = 0; i < expectedLength; ++i) {
                                    expectedLengthText += 'o';
                                }
                                var expectedLengthPx = lengthOfStringPx(expectedLengthText);

                                if (placeholderLengthPx > expectedLengthPx) {
                                    return (placeholderLengthPx > parentWidth) ? parentWidth : placeholderLengthPx;
                                } else {
                                    // 21/03/2012: second test condition added to cater for preloadTestContents true mode, 
                                    expectedLengthPx = (expectedLengthPx > parentWidth && parentWidth > 0) ? parentWidth : expectedLengthPx;
                                    return expectedLengthPx;
                                }
                            }()),

                            responseVariable = qti.getVariable(responseIdentifier, itemIdentifier),
                            cardinality = responseVariable.getCardinality(),
                            baseType = responseVariable.getBaseType(),
                            valueText = responseVariable.getState(),
                            value = responseVariable.getValue();

                        // If there is a default value and the candidate has not yet
                        // attempted this interaction, there will be no state. Handle
                        // this by setting up the initial state according to the default
                        // value.
                        if (valueText === undefined) {
                            if (value === undefined) {
                                valueText = '';
                            } else {
                                valueText = value;
                            }
                        } else {
                            // 29/11/2013: this basic conditional override is a workaround applied in dealing with the reloaded text truncation issue
                            // observed when double-quote (") characters are present within the extended text reloaded from a crash/restored session
                            // It is required because the valueText taken from the RESPONSE-STATE, which goes through a JS-deserialization operation
                            // that is aimed at recreating a state-object from a serialized string (necessary for particular responses-value types),
                            // but which has the undesired/unintended effect of truncating strings which contain certain characters including double-quotes.
                            // Thus this work around serves to ensure that for extendedTextEntry interactions, the initial reloaded text is taken from
                            // the restored RESPONSE-VALUE (which does undergo deserialization) rather than the RESPONSE-STATE.
                            // See Serialization%20Documentation.html in the QTI Engine Repository docs folder.
                            valueText = value;
                        }

                        function resizeInteraction() {
                            var lPx;

                            parentWidth = parentDivContainer[0].clientWidth;

                            if (valueText === '') {
                                lPx = (parentWidth > emptyWidthPx || parentWidth === 0) ? emptyWidthPx : parentWidth;
                            } else {
                                lPx = lengthOfStringPx(valueText);
                                lPx = (lPx >= (parentWidth - 34)) ? (parentWidth - 36) : ((lPx > emptyWidthPx) ? lPx : emptyWidthPx);
                            }

                            textInteraction.css('width', lPx.toString() + 'px');
                            textInteraction[0].scrollLeft = 0;
                        }

                        if (expandable) {
                            if (qti.preloadTestContents) {
                                qti.screens[itemIdentifier].init.push(function() {
                                    resizeInteraction();
                                });
                            } else {
                                resizeInteraction();
                            }
                        }

                        function parseString(value) {
                            return $.normalizeWhitespace(value);
                        }

                        var valueParsers = $.createHash(
                            'string', parseString,
                            'integer', qti.parseInteger,
                            'float', qti.parseQTIFloat);

                        if (cardinality !== "single") {
                            throw new Error('Invalid cardinality');
                        }

                        if (!valueParsers.has(baseType)) {
                            throw new Error('Invalid baseType');
                        }

                        var parseValue = valueParsers.get(baseType);

                        var updateValue = textInteraction[0].updateValue = $.debounce(250, function() {
                            valueText = textInteraction.value();
                            value = parseValue(valueText);
                            if (wordCounter.length > 0) {
                                qti.updateWordCount(valueText, wordCounter);
                            }

                            responseVariable.setState(valueText);

                            if (valueText === '') {
                                // The candidate has deliberately removed their
                                // response.
                                responseVariable.setValue(undefined);
                            } else if (value !== undefined) {
                                // Otherwise, only overwrite the previous response
                                // value if the current response is valid.
                                responseVariable.setValue(value);
                            }

                            textInteraction.parent().removeClass("bardo");
                        });

                        textInteraction.keypress(function(event) {
                            if (keywordEntry && event.charCode === 32) {
                                return false;
                            }
                            // Hack to prevent Firefox from scrolling the text field
                            if (event.charCode) {
                                valueText += String.fromCharCode(event.charCode);
                                //resizeInteraction();
                            }

                            if (expandable) {
                                valueText = textInteraction.value();
                                resizeInteraction();
                            }

                            updateValue();
                        });

                        function onBlur() {
                            textInteraction.parent().addClass("bardo");
                            updateValue();
                            if (valueText === '' && placeholderText) {
                                textInteraction.addAttrToken('connect:state', 'placeholder');
                                textInteraction.value(placeholderText);
                            }
                        }

                        textInteraction.blur(onBlur);

                        if (!qti.preloadTestContents) {
                            // to prevent the browser freezing up while setting up potentially several 
                            // textEntryInteractions on testStart in the preloadTestContents mode
                            onBlur();
                        }

                        textInteraction.focus(function() {
                            if (textInteraction.value() !== valueText) {
                                textInteraction.value(valueText);
                            }
                            textInteraction.removeAttrToken('connect:state', 'placeholder');
                        });

                        //qti.subscribeToEvent("windowResize", resizeInteraction, "textEntryInteractions", "resizeInteraction-" + responseIdentifier, true);

                        return responseVariable;
                    },

                    setupInteractionSet = function(textInteractions, textEntriesContainer) {
                        var withKeywordsList, distinctLetters;
                        if (textEntriesContainer) {
                            if (textEntriesContainer.parents('div[connect\\:author-class~="container"]:first').find('ol.keywordsList').length > 0) {
                                withKeywordsList = true;
                                /* } else if (textEntriesContainer.is('[connect\\:author-class~="presentation-letters"]')) {
                                	distinctLetters = true; */
                            }
                        } else if (textInteractions.eq(0).parents('div[connect\\:author-class~="container"]:first').find('ol.keywordsList').length > 0) {
                            withKeywordsList = true;
                        }

                        // Delay updating the value of each text interaction until after
                        // their sizes have been set, because setting an input’s value
                        // triggers an immediate redraw in Firefox(!!!).
                        textInteractions.each(function(index, textInteraction) {
                            //textInteraction = $(textInteraction);
                            textInteraction = $(textInteraction).find('input');
                            var responseIdentifier = textInteraction.attr('connect:responseIdentifier'),
                                questionNumber = textInteraction.prev('.questionNumber').text(),
                                withKeywordsList_i = textInteraction.is('[nav$="_keyword"]'),
                                distinctLetters_i = textInteraction.is('[connect\\:author-class~="presentation-letters"],[nav$="_letters"]'),
                                mathsEntry_i = textInteraction.is('[connect\\:author-class~="presentation-maths"]');

                            if (withKeywordsList || withKeywordsList_i) {
                                $('<li class="interaction"><span class="questionNumber">' + questionNumber + '</span><span>' + textInteraction.attr('placeholder') + '</span></li>')
                                    .attrNS('connect:responseIdentifier', responseIdentifier)
                                    .appendTo(itemBody.find('.keywordsList'));
                                textInteraction.removeAttr('placeholder');
                                textInteraction.addClass('keyword');
                            }

                            var responseVariable = setupTextInteraction(textInteraction);

                            if ((distinctLetters || distinctLetters_i) && qti.preloadTestContents) {
                                textInteraction.closest('table').addClass('letters');
                                qti.screens[itemIdentifier].init.push(function() {
                                    setupLetterWidget(textInteraction);
                                });
                            }
                            if (responseVariable) {
                                var savedResponse = responseVariable.getState();
                                if (!savedResponse) {
                                    savedResponse = responseVariable.getValue();
                                }
                                textInteraction.value(savedResponse);
                                if (savedResponse) {
                                    textInteraction.parent().addClass('attempted');
                                } else {
                                    textInteraction.parent().removeClass('attempted');
                                }
                            }
                            if (mathsEntry_i) {
                                setupMathsEntry(textInteraction);
                            }
                        });
                    };

                if (textEntryGroups.length > 0) {
                    textEntryGroups.each(function() {
                        var textEntryGroup = $(this);
                        textInteractions = textEntryGroup.find('*[connect\\:class~="textEntryInteraction"]');
                        setupInteractionSet(textInteractions, textEntryGroup);
                    });
                    textInteractions = itemBody.find('*[connect\\:class~="textEntryInteraction"]').filter(function() {
                        return $(this).closest(textEntryGroups).length ? false : true;
                    });
                    if (textInteractions.length) {
                        setupInteractionSet(textInteractions);
                    }
                } else {
                    //***** Legacy test items *****
                    textInteractions = itemBody.find('*[connect\\:class~="textEntryInteraction"]');
                    if (itemBody.find('input[type="text"]').is('[nav*="textEntryGroup"]')) {
                        textInteractions.closest('div').addClass('textEntryGroup');
                    }
                    setupInteractionSet(textInteractions);
                }

                function keyType(keynum) {
                    var keychar = String.fromCharCode(keynum),
                        //charcheck = /[a-zA-Z0-9]/; // ALPHA NUMERIC
                        charcheck = /[a-zA-Z]/; // ALPHA ONLY
                    return charcheck.test(keychar);
                }

                function updateLetersValue(textInteraction, cell, pHolder) {
                    var string = cell.closest('.lettersContainer').find('span').text();
                    if ($.trim(string) === pHolder) {
                        textInteraction.val("");
                    } else {
                        textInteraction.val(string);
                    }
                    textInteraction[0].updateValue();
                }

                function setupLetterWidget(textInteraction) {
                    var letters = parseInt(textInteraction.attr('size'), 10),
                        initial = textInteraction.attr('placeholder'),
                        lettersContainer, letterInputs, letter, key,
                        keys = [8, 9, 32, 37, 39, 46, 35, 36]; // backspace, tab, space, left arrow, right arrow, delete, end, home

                    textInteraction.hide();
                    lettersContainer = $('<div class="lettersContainer interaction"/>');
                    lettersContainer.attrNS('connect:responseIdentifier', textInteraction.attr('connect:responseIdentifier'));
                    textInteraction.after(lettersContainer);

                    for (var l = 1; l <= letters; ++l) {
                        if (l === 1) {
                            lettersContainer.append('<span>' + initial + '</span>');
                        } else {
                            tabCounter++;
                            lettersContainer.append('<span tabindex="' + tabCounter + '" class="dash"> </span>');
                        }
                    }

                    lettersContainer.bind('click focus', qti.questionFocusHandler);

                    letterInputs = $(lettersContainer).find('span.dash');

                    // force focusing & nav change on tab etc.
                    letterInputs.focus(function() {
                        lettersContainer.click();
                    });

                    letterInputs.keydown(function(e) {
                        key = e.which;

                        if ((!keyType(key)) && (keys.indexOf(key)) === -1) {
                            e.preventDefault();
                            return false;
                        } else {
                            letter = $(this);
                            switch (key) {
                                case keys[0]: // backspace
                                    e.preventDefault();
                                    letter.text(" ").prev('.dash').focus();
                                    updateLetersValue(textInteraction, letter, initial);
                                    break;
                                case keys[1]: // tab
                                    break;
                                case keys[3]: // left
                                    letter.prev('.dash').focus();
                                    break;
                                case keys[4]: // right
                                    letter.next('.dash').focus();
                                    break;
                                case keys[5]: // delete
                                    letter.text(" ");
                                    updateLetersValue(textInteraction, letter, initial);
                                    break;
                                case keys[6]: // end
                                    letterInputs.last().focus();
                                    e.preventDefault();
                                    break;
                                case keys[7]: // home
                                    letterInputs.first().focus();
                                    e.preventDefault();
                                    break;
                                default: // all letters & space
                                    letter.text(String.fromCharCode(key).toLowerCase());
                                    letter.next('.dash').focus();
                                    updateLetersValue(textInteraction, letter, initial);
                                    break;
                            }
                        }
                    });
                }

                function setupMathsEntry(textInteraction) {
                    var rspId = textInteraction.attr('connect:responseIdentifier'),
                        rspVal = textInteraction.value(),
                        teiComp = textInteraction.parent(),
                        $mathEntry = $('<span class="maths-entry"></span>');

                    $mathEntry.attrNS('connect:responseIdentifier', rspId);
                    if (rspVal) {
                        $mathEntry.html(rspVal.replace(/\\"/g, '"'));
                    } else {
                        $mathEntry.html(ME.pmmlModel.emptyXML);
                    }

                    teiComp.on('maths-entry-selected', function(e, pmmlText) {
                        qti.highlightNavItem(rspId, itemIdentifier);
                    }).on('mathml-update', function(e, pmmlText) {
                        e.stopPropagation();
                        textInteraction.val(pmmlText)[0].updateValue();
                    }).hide().before($mathEntry);
                }

                var customCharts = itemBody.find('div[connect\\:author-class~="chart-data"]');
                if (customCharts.length > 0) {
                    if (qti.preloadTestContents) {
                        qti.screens[itemIdentifier].init.push(function() {
                            customCharts.each(function() {
                                qti.setupCustomHorizontalStackedBarChart($(this), itemIdentifier);
                            });
                        });
                    } else {
                        customCharts.each(function() {
                            qti.setupCustomHorizontalStackedBarChart($(this), itemIdentifier);
                        });
                    }
                }
            },

            updateWordCount = qti.updateWordCount = function(contents, wordCounter) {
                var wc = 0,
                    txt = $.normalizeWhitespace(contents);

                if (txt !== "") {
                    wc = txt.split(' ').length;
                }

                wordCounter.text(wc);
            },

            loadFunc = function(item) {
                if (qti.preloadTestContents) {
                    $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                        loadItemFunc($(this));
                    });
                } else {
                    loadItemFunc(item);
                }
            },

            testStartFunc = function() {
                var setTEI_State = function(rspVar) {
                    var rspId = rspVar.getIdentifier().split('.')[1],
                        tei = $('span[connect\\:class~="textEntryInteraction"]:has([connect\\:responseIdentifier="' + rspId + '"])'),
                        rspVal = rspVar.getValue();
                    if (rspVal === undefined) {
                        tei.removeClass('attempted');
                    } else {
                        tei.addClass('attempted');
                    }
                };
                qti.subscribeToEvent("changeResponseVariable", setTEI_State, "set text entry interaction state", "setTEI_State");
            };

        qti.subscribeToEvent("itemLoad", loadFunc, "Iterates through the text interactions on an item and adds key events, blur and focus functions", "textInteractions");
        qti.subscribeToEvent("testStart", testStartFunc, "setup the set-textEntryInteraction-state listener", "setup_setTEI_State_handling");
    })();

    (function() {

        var getSizeSpan;

        (function() {
            var sizeSpan;
            getSizeSpan = function() {
                if (sizeSpan) {
                    return sizeSpan;
                } else {
                    sizeSpan = $.ulib.span();
                    sizeSpan.css({
                        position: 'absolute',
                        visibility: 'hidden',
                        left: '-100000px',
                        whiteSpace: 'pre'
                    });
                    $(document.body).append(sizeSpan);
                    return sizeSpan;
                }
            };
        }());

        var parser = new DOMParser(),
            serializer = new XMLSerializer(),
            loadItemFunc = function(itemBody) {
                var itemIdentifier = itemBody.attr('connect:identifier');
                var itemInteractions = itemBody.find('*[connect\\:class~="extendedTextInteraction"]');
                if (qti.itemGroups[itemIdentifier]) {
                    itemIdentifier = qti.itemGroups[itemIdentifier].items[0];
                }

                var textInteractions,
                    setupExtTextInteraction = qti.setupExtTextInteraction = function(textInteraction, rspId, itemId) {
                        var intervalId;
                        var responseIdentifier = rspId || textInteraction.attr('connect:responseIdentifier');
                        if (!responseIdentifier) {
                            return;
                        }

                        function setDefaultSize() {
                            var sizeSpan = getSizeSpan();
                            sizeSpan.text("o");
                            var defaultLength = parseInt(textInteraction.attr('connect:expectedLength'), 10);
                            var characterWidth = Math.round(parseInt(textInteraction[0].clientWidth, 10) /
                                parseInt(sizeSpan[0].clientWidth, 10));
                            textInteraction[0].rows = Math.round(defaultLength / characterWidth);
                        }

                        // Handled in the XSLT
                        // setDefaultSize();

                        var identifier = itemId || textInteraction.parent().attr('connect:identifier');
                        if (identifier) {
                            itemIdentifier = identifier;
                        }
                        var responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                        var cardinality = responseVariable.getCardinality();
                        var baseType = responseVariable.getBaseType();
                        var valueText = responseVariable.getState();
                        var previousValueText; // used to compare with valueText to detect change
                        var value = responseVariable.getValue();

                        // If there is a default value and the candidate has not yet
                        // attempted this interaction, there will be no state. Handle
                        // this by setting up the initial state according to the default
                        // value.
                        if (valueText === undefined) {
                            if (value === undefined) {
                                valueText = '';
                            } else if ($.isArray(value)) {
                                valueText = value[0];
                            } else {
                                valueText = value;
                            }
                        } else if (value !== undefined) {
                            // 29/11/2013: this basic conditional override is a workaround applied in dealing with the reloaded text truncation issue
                            // observed when double-quote (") characters are present within the extended text reloaded from a crash/restored session
                            // It is required because the valueText taken from the RESPONSE-STATE, which goes through a JS-deserialization operation
                            // that is aimed at recreating a state-object from a serialized string (necessary for particular responses-value types),
                            // but which has the undesired/unintended effect of truncating strings which contain certain characters including double-quotes.
                            // Thus this work around serves to ensure that for extendedTextEntry interactions, the initial reloaded text is taken from
                            // the restored RESPONSE-VALUE (which does undergo deserialization) rather than the RESPONSE-STATE.
                            // See Serialization%20Documentation.html in the QTI Engine Repository docs folder.
                            valueText = value;
                        }

                        function parseString(value) {
                            return value;
                        }

                        var valueParsers = $.createHash(
                            'string', parseString,
                            'integer', qti.parseInteger,
                            'float', qti.parseQTIFloat);

                        if (cardinality !== "single" && cardinality !== "multiple") {
                            throw new Error('Invalid cardinality');
                        }

                        if (!valueParsers.has(baseType)) {
                            throw new Error('Invalid baseType');
                        }

                        textInteraction.text(valueText);

                        var parseValue = valueParsers.get(baseType);

                        var wordCounter = textInteraction.parent().find('.wordCount .value');

                        var onFocusOrBlur = function(event) {
                            valueText = textInteraction.value();

                            if (valueText !== previousValueText) {
                                previousValueText = valueText;
                                value = parseValue(valueText);
                                responseVariable.setState(valueText);

                                if (valueText === '') {
                                    // The candidate has deliberately removed their
                                    // response.
                                    responseVariable.setValue(undefined);
                                } else if (value !== undefined) {
                                    // Otherwise, only overwrite the previous response
                                    // value if the current response is valid.
                                    responseVariable.setValue(value);
                                }
                            }

                            if (wordCounter.length > 0) {
                                qti.updateWordCount(valueText, wordCounter);
                            }
                        };

                        textInteraction[0].onfocus = function() {
                            if (intervalId === undefined) {
                                intervalId = setInterval(onFocusOrBlur, 500);
                            }
                        };

                        textInteraction[0].onblur = function() {
                            intervalId = clearInterval(intervalId);
                            onFocusOrBlur();
                        };

                        textInteraction.off('change').on('change', onFocusOrBlur);
                        onFocusOrBlur();
                    };

                itemInteractions.each(function(index, itemInteraction) {
                    itemInteraction = $(itemInteraction);
                    var textInteraction = itemInteraction.find("textarea"),
                        styles, stylesCtnr;
                    setupExtTextInteraction(textInteraction);

                    if (window.tinymce && itemInteraction.is('[connect\\:author-class~="presentation-rte"]')) {
                        if (window.ME && !ME.mathJaxStyles) {
                            styles = $('style[type="text/css"]', document.head).clone();
                            stylesCtnr = $('<div/>').append(styles);
                            ME.mathJaxStyles = stylesCtnr[0].innerHTML;
                        }
                        qti.screens[itemIdentifier].init.push(function() {
                            setupExtendedTextRTE(itemInteraction, textInteraction);
                        });
                    }
                });
            },

            setupExtendedTextRTE = function(itemInteraction, textInteraction) {
                var proxyTextareaElm = textInteraction.clone(),
                    contents = proxyTextareaElm.val(),
                    settings = {
                        forced_root_block: false,
                        plugins: [
                            "advlist contextmenu charmap code fullscreen lists table visualblocks wordcount"
                        ],
                        menubar: false,
                        statusbar: (itemInteraction.children('span.wordCount').length ? true : false),
                        toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | table", //+ (ME ? " mathsentry" : ""),
                        content_css: ((window.ME ? "js/maths-entry/maths-edit.rte.css, " : "") + "css/item.css"),
                        content_js: (window.ME ? "js/jquery.js,js/maths-entry/maths-edit.rte.js" : null),
                        valid_elements: "*[*]",
                        table_default_styles: {
                            border: '1px solid #333',
                            borderCollapse: 'collapse'
                        },
                        setup: function(editor) {
                            var ediWin, ediDoc, ediDocBody,
                                tmpCtnr = $('<div></div>'),
                                tmpDoc,
                                getTidyContents = function(contents) {
                                    contents = contents || ediDocBody.innerHTML;
                                    if (contents) {
                                        contents = contents.replace('<br data-mce-bogus="1">', '');
                                        tmpDoc = parser.parseFromString(contents, 'text/html');
                                        contents = serializer.serializeToString(tmpDoc);
                                        contents = contents.replace('<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>', '');
                                        contents = contents.replace('</body></html>', '');
                                        contents = contents.trim();
                                        tmpCtnr.html(contents)
                                            .find('.maths-expression').each(function() {
                                                var $this = $(this),
                                                    mathJaxNode = $this.find('script[type="math/mml"],script[type="mce-math/mml"]')[0];
                                                if (mathJaxNode) {
                                                    $this.replaceWith(mathJaxNode.innerHTML.replace(/&amp;/g, '&'));
                                                }
                                            });
                                        contents = tmpCtnr.html();
                                    }

                                    return contents;
                                };

                            editor.on('init', function() {
                                ediWin = editor.getWin();
                                ediDoc = editor.getDoc();
                                ediDocBody = editor.getBody();
                                if (window.ME) {
                                    $(ediDoc.head).append(ME.mathJaxStyles);
                                }

                                $(ediDoc).on('click', function() {
                                    editor.focus();
                                    $(editor.getContainer()).click();
                                });
                            });

                            editor.on('keydown', $.debounce(300, function(e) {
                                if (window.ME) {
                                    textInteraction.html(getTidyContents());
                                } else {
                                    //editor.save();
                                    var txt = getTidyContents(editor.getContent());
                                    textInteraction.val(txt);
                                }
                                textInteraction.change();
                            }));

                            /*if (ME) {
                            	editor.addButton('mathsentry', {
                            		icon: 'maths',
                            		tooltip: 'Maths editor',
                            		onclick: function() {
                            			ME.Panel.open();
                            		}
                            	});
                            }*/
                        }
                    };

                textInteraction.hide();
                itemInteraction.append(proxyTextareaElm);
                delete proxyTextareaElm[0].onfocus;
                delete proxyTextareaElm[0].onblur;
                proxyTextareaElm.off().removeAttr('connect:responseIdentifier');

                if (contents) {
                    if (window.ME) {
                        ME.utils.processMathMLContents(contents).done(function(contents) {
                            proxyTextareaElm.val(contents).tinymce(settings);
                        });
                    } else {
                        proxyTextareaElm.val(contents).tinymce(settings);
                    }
                } else {
                    proxyTextareaElm.tinymce(settings);
                }
            };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Iterates through the extended text interactions on an item and adds key events, blur and focus functions", "extTextInteractions");
    })();

    (function() {
        var getSizeSpan;
        (function() {
            var sizeSpan;
            getSizeSpan = function() {
                if (sizeSpan) {
                    return sizeSpan;
                } else {
                    sizeSpan = $.ulib.span();
                    sizeSpan.css({
                        position: 'absolute',
                        visibility: 'hidden',
                        left: '-100000px',
                        whiteSpace: 'pre'
                    });
                    $(document.body).append(sizeSpan);
                    return sizeSpan;
                }
            };
        }());

        var loadItemFunc = function(itemBody) {
            //var itemBody = itemObj.body;
            var itemIdentifier = itemBody.attr('connect:identifier');
            var sizeSpan = getSizeSpan();

            //********** Flags To Control Operation **********

            //Delete the drag node associated with the dropped
            //insert node
            var toDelete = true;

            //Place the dropped insert node at a specific coordinate
            //position in the drop target
            var exactPosition = false;

            //Replace existing dropped insert node with newly dropped
            //insert node
            var replaceDropped = true;

            //************************************************

            //Define drag and drop targets 
            var dragTargetClass = "gapChoice";
            var dropTargetClass = "gap";
            var dragContainerClass = '*[connect\\:class~="gapChoicesContainer"]';
            var tabClass = '*[connect\\:class~="associableChoice"]';
            var interactions = itemBody.find('*[connect\\:class~="gapMatchInteraction"]');
            interactions.each(function() {
                var interaction = $(this),
                    hasInlineGaps = interaction.is('[connect\\:author-class~="inlineGapText"]'),
                    //var gapChoiceItems = interaction.find('ul>[connect\\:class~="gapChoice"]');
                    gapsize = 75,
                    width = 16,

                    //Locate drag and drop targets
                    dragItems = interaction.find('*[connect\\:class~="' + dragTargetClass + '"]'),
                    dropItems = interaction.find('*[connect\\:class~="' + dropTargetClass + '"]'),

                    //Locate the drag target container. This container holds the
                    //drag targets. Drag targets removed from drop targets are placed
                    //back into this container automatically
                    dragContainer = interaction.find(dragContainerClass);

                //ARIA - role attribute
                dragContainer.attr("role", "listbox");

                // Create default string to fill drop targets (gaps)
                sizeSpan.text("\u00a0");

                dragItems.each(function() {
                    sizeSpan.text($(this).text());
                    var thisLength = Math.round(parseInt(sizeSpan[0].clientWidth, 10));
                    if (width <= thisLength) {
                        width = thisLength;
                    }
                });

                if (interaction.is('[connect\\:author-class~="presentation-gapsize-xs"]')) {
                    gapsize = 24; //15;
                } else if (interaction.is('[connect\\:author-class~="presentation-gapsize-sm"]')) {
                    gapsize = 48; //40;
                } else if (interaction.is('[connect\\:author-class~="presentation-gapsize-lg"]')) {
                    gapsize = 135;
                }

                // sets max field width of drop areas
                if (width > gapsize) {
                    width = gapsize;
                }

                //Response handling
                var responseIdentifier = interaction.attr('connect:responseIdentifier');
                var responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                var cardinality = responseVariable.getCardinality();
                var baseType = responseVariable.getBaseType();

                var valueParsers = $.createHash('directedPair', qti.parseDirectedPair);

                if (cardinality !== "single" && cardinality !== "multiple") {
                    throw new Error('Invalid cardinality');
                }

                if (cardinality === "single" && dropItems.length > 1) {
                    throw new Error('Invalid cardinality');
                }

                if (!valueParsers.has(baseType)) {
                    throw new Error('Invalid baseType');
                }

                var value;
                if (responseVariable.getValue() !== undefined) {
                    value = $.createHash(responseVariable.getValue());
                } else {
                    value = $.createHash();
                }

                //This holds the dragObject of the item being dragged whether
                //by mouse or keyboard
                var globalDataObject;

                //Manage pseudo tab list and focus for accessibility 
                var tabList = $(tabClass);
                var focusIndex = 0;
                var tabIndex = 0;

                tabList.each(function(index, tabItem) {
                    $(tabItem).attrNS("connect:tabindex", tabIndex);
                    $(tabItem).attr("tabindex", 0);
                    tabIndex++;
                });

                function focus(event) {
                    var item = $(event.target);
                    focusIndex = parseInt(item.attr("connect:tabindex"), 10);
                    //ARIA - selected attribute
                    item.attr("aria-selected", "true");
                }

                function blur(event) {
                    var item = $(event.target);
                    //ARIA - selected attribute
                    item.attr("aria-selected", "false");
                }

                //Group match - supports choice "matchGroup" and "identifier" attributes
                function isMatching(dragItem, dropItem) {
                    var dragGroups = dragItem.attr("connect:matchGroup");
                    var dragIdentifier = dragItem.attr("connect:identifier");
                    var dropGroups = dropItem.attr("connect:matchGroup");
                    var dropIdentifier = dropItem.attr("connect:identifier");
                    var checkDrag = new RegExp("\\b" + dragIdentifier + "\\b");
                    var checkDrop = new RegExp("\\b" + dropIdentifier + "\\b");

                    if (((dragGroups === undefined) || (dragGroups === null) || (dragGroups === "")) &&
                        ((dropGroups === undefined) || (dropGroups === null) || (dropGroups === ""))) {
                        return true;
                    } else if (((dragGroups === undefined) || (dragGroups === null) || (dragGroups === "")) &&
                        checkDrag.test(dropGroups)) {
                        return true;
                    } else if (((dropGroups === undefined) || (dropGroups === null) || (dropGroups === "")) &&
                        checkDrop.test(dragGroups)) {
                        return true;
                    } else if (checkDrop.test(dragGroups) &&
                        checkDrag.test(dropGroups)) {
                        return true;
                    } else {
                        return false;
                    }
                }

                dropItems.attr('nav', responseIdentifier);

                //Shuffle - supports gapMatchInteraction "shuffle" and choice "fixed" attributes
                (function() {
                    var doShuffle = dragContainer.attr("connect:shuffle") === "true";

                    if (doShuffle) {
                        var gapChoicesCopy = [];
                        var selectedOption;

                        dragItems.each(function(index, gapChoice) {
                            gapChoice = $(gapChoice);
                            //Only add option to shuffle list if not "fixed"
                            if (gapChoice.attr("connect:fixed") !== "true") {
                                gapChoicesCopy.push(gapChoice[0].cloneNode(true));
                            }
                        });

                        dragItems.each(function(index, gapChoice) {
                            gapChoice = $(gapChoice);
                            //Only move option if not "fixed"
                            if (gapChoice.attr("connect:fixed") !== "true") {
                                selectedOption = Math.floor(Math.random() * gapChoicesCopy.length);
                                dragContainer[0].replaceChild(gapChoicesCopy[selectedOption], gapChoice[0]);
                                gapChoicesCopy.splice(selectedOption, 1);
                            }
                        });

                        //Recreate collection using new order
                        dragItems = interaction.find("*[connect\\:class~='" + dragTargetClass + "']");
                    }
                })();

                //Ensure that the interaction remains visible by forcing
                //the parent window or element to scroll
                $.dragScroll(interaction[0]);

                //Drag and Drop 
                //Please note that we use the following terminology to 
                //idenify components of the Drag & Drop mechanism. The
                //dragged "object" is called the drag target. The "object"
                //on which a drag target can be dropped is called the drop
                //target.

                //Drag targets are made up of two parts - the drag node and
                //the insert node. The drag node is the original element set
                //to be draggable. The insert node is a copy of the drag node
                //and is the actual element that gets dropped at the drop
                //target. Insert nodes are created when the Drag & Drop
                //mechanism is initialized.

                //Object elements can cause problems for the Drag & Drop
                //mechanism as they are difficult to select with the mouse.
                //To avoid this problem, if an object element is used as a
                //drag or drop target, the Drag & Drop mechanism creates 
                //accompanying "div" elements. These are placed over the
                //object elements.

                (function() {

                    //Array used to track drag nodes and their respective insert
                    //nodes. This is needed by the "drop and replace" mechanism
                    //where a newly dropped insert node forces a previously
                    //dropped insert node to be removed and its associated drag
                    //node returned to the drag container
                    var dragObjects = [];
                    // UA 13/09/2012: Array used by jQuery UI to track and reference drop targets
                    var dropObjects = [];

                    //Can drop take place
                    function canDrop(dragTarget, dropTarget) {
                        return isMatching(dragTarget, dropTarget);
                    }

                    //Temporary effect to show drop targets
                    function showDestination(mode, insertNode) {
                        if (mode) {
                            dropItems.each(function(index, dropItem) {
                                dropItem = $(dropItem);
                                if (canDrop(insertNode, dropItem)) {
                                    dropItem.attrNS("connect:availableTarget", "true");
                                }
                            });
                        } else {
                            dropItems.each(function(index, dropItem) {
                                dropItem = $(dropItem);
                                if (canDrop(insertNode, dropItem)) {
                                    dropItem.attrNS("connect:availableTarget", "false");
                                }
                            });
                        }
                    }

                    function fixObjects(parentObject, objectElements, isDrop) {
                        if (typeof isDrop === "undefined") {
                            isDrop = false;
                        }

                        var divNode;
                        var newNode;
                        var isSwf = new RegExp("\\b\\.swf\\b");

                        //Create a document fragment and use this to build
                        //the new node layout ("object" and "div")
                        var docFragment = document.createDocumentFragment();

                        //Create an accompanying "div" node for each object. Set the 
                        //"height" and "width" styles on this "div" using the "height" 
                        //and "width" attributes taken from the "object" node
                        objectElements.each(function(index, objectElement) {
                            objectElement = $(objectElement);
                            divNode = $.ulib.div();

                            if (isDrop) {
                                var elementClass = objectElement.attr("connect:class");
                                objectElement.removeAttr("connect:class");
                                divNode.attrNS("connect:class", elementClass);
                            }

                            divNode.css({
                                height: objectElement.attr("height") + "px",
                                width: objectElement.attr("width") + "px"
                            });

                            //Append the "div" and "object" to the document fragment
                            //and in turn, append the fragment to the drag node 
                            docFragment.appendChild(divNode[0]);
                            docFragment.appendChild(objectElement[0]);

                            parentObject.append(docFragment);

                            if (isDrop) {
                                for (var i = 0; i < parentObject[0].childNodes.length - 2; i++) {
                                    parentObject.append(parentObject.firstChild());
                                }
                            }

                            //Attach a "param" node to all ".swf" nodes. This "param" 
                            //node value is used to control transparency
                            if (isSwf.test(objectElement.attr("data"))) {
                                newNode = $.param();
                                newNode.attr("name", "wmode");
                                newNode.attr("value", "transparent");
                                objectElement.append(newNode);
                                //Force transparency to take effect by removing and
                                //re-attaching the object "data" source
                                objectElement.copyAttributes(objectElement);
                            }
                        });

                        if (isDrop) {
                            return divNode;
                        }
                    }

                    //Get drag node associated with a given insert node
                    function getDragNode(insertNode) {
                        var dragNode;
                        dragObjects.forEach(function(dragObject) {
                            if (dragObject.insertNode[0] === insertNode[0]) {
                                dragNode = dragObject.dragNode[0];
                            }
                        });
                        return dragNode;
                    }

                    //Get drag object associated with a given drag node
                    function checkDragObject(dragNode) {
                        var localDragObject;
                        dragObjects.forEach(function(dragObject) {
                            if (dragObject.dragNode[0] === dragNode[0]) {
                                localDragObject = dragObject;
                            }
                        });
                        return localDragObject;
                    }

                    function getDragObject(item) {
                        var dragObject = checkDragObject(item);

                        if (!dragObject) {
                            var deleteNode;
                            var insertNode;
                            var dragData = {};
                            dragObject = {};

                            fixObjects(item, $("object", item));
                            insertNode = item.copyNode("ins", false);
                            insertNode.attrNS("connect:class", item.attr("connect:class"));
                            insertNode.attrNS("connect:matchMax", item.attr("connect:matchMax"));
                            insertNode.attrNS("connect:identifier", item.attr("connect:identifier"));
                            insertNode.attr("draggable", item.attr("draggable"));

                            dragObject.createData = function(event) {
                                var draggedItem;

                                if (insertNode.parent().length > 0) {
                                    draggedItem = insertNode[0];
                                } else {
                                    draggedItem = item[0];
                                }

                                dragData.toDelete = toDelete;
                                dragData.floating = false;
                                dragData.exactPosition = exactPosition;
                                dragData.replaceDropped = replaceDropped;
                                dragData.mouseOffset = {
                                    x: 0,
                                    y: 0
                                };

                                if (typeof event !== 'undefined') {
                                    var eCoords = $.getCoordinates(event, draggedItem);

                                    dragData.mouseOffset = {
                                        x: eCoords.mouseX - eCoords.x1,
                                        y: eCoords.mouseY - eCoords.y1
                                    };
                                    //Needed to effect drag/drop but globalDataObject now carries
                                    //dragged object information
                                    event.dataTransfer.mozSetDataAt("dragData", dragData, 0);
                                }
                                //Assign dragObject to the globalDataObject. The globalDataObject
                                //represents the drabObject actually being dragged by the mouse
                                //or keyboard
                                globalDataObject = dragObject;
                            };

                            dragObject.doDrag = function() {
                                deleteNode = null;

                                if (item.contents().length !== 0) {
                                    var firstChild = item.firstChild();
                                    if (firstChild.localName() === "del") {
                                        deleteNode = firstChild;
                                    }
                                }

                                if (!deleteNode) {
                                    deleteNode = $.ulib.del();
                                    item.append(deleteNode);

                                    while (item.contents().length > 1) {
                                        deleteNode.append(item.firstChild());
                                    }

                                    item.attr("draggable", "false");
                                    //ARIA - grabbed attribute
                                    item.attr("aria-grabbed", "true"); //.css({display: 'none'})
                                    item.draggable('disable').hide();
                                }
                            };

                            dragObject.undoDrag = function(switchElm) {
                                while (deleteNode.contents().length > 0) {
                                    item.append(deleteNode.firstChild());
                                }

                                deleteNode.remove();
                                item.attr("draggable", "true");
                                //ARIA - grabbed attribute
                                item.attr("aria-grabbed", "false"); //.removeAttr('style');
                                item.draggable('enable').show();

                                if (insertNode.parent().length > 0) {
                                    var dragParent = insertNode.parent(),
                                        gapIdentifier = dragParent.attr("connect:identifier");
                                    insertNode.remove();
                                    //Remove response value
                                    value.remove(gapIdentifier);
                                    if (value.size() !== 0) {
                                        responseVariable.setValue(value);
                                    } else {
                                        responseVariable.setValue(undefined);
                                    }
                                    //##### Default not set on [gap] #####
                                    if (dragParent.css("min-width") === "0px" || hasInlineGaps ||
                                        dragParent.closest('[connect\\:author-class~="overlayContainer"]').length) {
                                        dragParent.css("padding", "0 " + width + "px");
                                    } else {
                                        dragParent.css("padding", "0px");
                                        //dragParent.css("left", insertNode.css("left"));
                                        dragParent.css("margin-left", "0");
                                    }
                                }

                                globalDataObject = null;
                            };

                            dragObject.insertNode = insertNode;
                            dragObject.dragNode = item;
                            dragObject.dragData = dragData;

                            dragObjects.push(dragObject);
                        }

                        return dragObject;
                    }

                    //Get drop object associated with a given drop node
                    function getDropObject(dropNode) {
                        var localDropObject;
                        dropObjects.forEach(function(dropObject) {
                            if (dropObject.dropNode[0] === dropNode[0]) {
                                localDropObject = dropObject;
                            }
                        });
                        return localDropObject;
                    }

                    var isDragItem = new RegExp("\\b" + dragTargetClass + "\\b");

                    dragItems.each(function(index, dragItem) {
                        dragItem = $(dragItem);
                        //ARIA - role attribute
                        dragItem.attr("role", "option");
                        var dragObject = getDragObject(dragItem);

                        function dragStart(event) {
                            showDestination(true, dragObject.insertNode);
                            if (globalDataObject && globalDataObject.dragData.toDelete) {
                                showDestination(false, globalDataObject.insertNode);
                                globalDataObject.undoDrag();
                            }
                            dragObject.createData(event);
                        }

                        function dragEnd(event) {
                            showDestination(false, dragObject.insertNode);

                            //Only delete drag nodes marked to be deleted
                            if (toDelete) {
                                dragObject.doDrag();

                                //If drag was unsuccessful
                                if (event.dataTransfer.dropEffect === "none") {
                                    dragObject.undoDrag();
                                    dragItem[0].focus();
                                }
                            }
                        }

                        function keyDown(event) {
                            var keyCode = event.keyCode;

                            //if (keyCode === 32) {
                            if (keyCode === 13) {
                                if (!globalDataObject) {
                                    showDestination(true, dragObject.insertNode);
                                    dragObject.createData();
                                    if (toDelete) {
                                        dragObject.doDrag();
                                    }
                                } else {
                                    showDestination(false, globalDataObject.insertNode);
                                    if (globalDataObject !== dragObject) {
                                        globalDataObject.undoDrag();
                                        showDestination(true, dragObject.insertNode);
                                        dragObject.createData();
                                        if (toDelete) {
                                            dragObject.doDrag();
                                        }
                                    } else {
                                        globalDataObject.undoDrag();
                                    }
                                }

                                event.preventDefault();
                            }
                        }

                        //Attach event handlers to drag node and insert node
                        dragItem.dragstart(dragStart);
                        dragItem.dragend(dragEnd);
                        dragItem.attr("draggable", "true");
                        //ARIA - grabbed attribute
                        dragItem.attr("aria-grabbed", "false");
                        dragItem.focus(focus);
                        dragItem.blur(blur);
                        dragItem.keydown(keyDown);

                        dragObject.insertNode.dragstart(dragStart);
                        dragObject.insertNode.dragend(dragEnd);
                        dragObject.insertNode.attr("draggable", "true");
                        //ARIA - grabbed attribute
                        dragObject.insertNode.attr("aria-grabbed", "false");
                        dragObject.insertNode.focus(focus);
                        dragObject.insertNode.blur(blur);

                        $makeDraggable(dragItem);
                    });

                    dropItems.each(function(index, dropItem) {
                        dropItem = $(dropItem);

                        //Set the default width of the drop container
                        dropItem.css("padding", "0 " + width + "px").css('min-width', (2 * width) + "px");

                        //Used to store the globalDataObject locally when drag item is dropped
                        var localDataObject,
                            dragId, dragItem, dragObject,
                            gapIdentifier = dropItem.attr("connect:identifier");

                        //Make "object" elements selectable
                        if (dropItem.localName() === "object") {
                            var objectElements = [];
                            objectElements.push(dropItem[0]);
                            dropItem = fixObjects(dropItem.parent(), objectElements, true);
                        }

                        function dragStop(event) {
                            //Make sure mouse is over drop target and not a dropped node
                            function inBounds() {
                                var eCoords = $.getCoordinates(event, dropItem[0]);

                                if ((eCoords.mouseX < eCoords.x1) || (eCoords.mouseX > eCoords.x2) ||
                                    (eCoords.mouseY < eCoords.y1) || (eCoords.mouseY > eCoords.y2)) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }

                            if (inBounds()) {
                                //Check for null object - happens if different object type is dropped
                                if (globalDataObject.insertNode) {
                                    //Can the DragTarget be dropped here?
                                    if (canDrop(globalDataObject.insertNode, dropItem)) {
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        function drop(event) {
                            if (globalDataObject === null) {
                                return;
                            }
                            var dragData = globalDataObject.dragData;
                            localDataObject = globalDataObject;
                            globalDataObject = null;

                            var draggedItem = localDataObject.insertNode;
                            var draggedPosition = dragData.mouseOffset;

                            function setPosition() {
                                var eCoords = $.getCoordinates(event, dropItem[0]);
                                var xOffset = eCoords.mouseX - eCoords.x1 - draggedPosition.x + "px";
                                var yOffset = eCoords.mouseY - eCoords.y1 - draggedPosition.y + "px";

                                return {
                                    top: yOffset,
                                    left: xOffset
                                };
                            }

                            //Check for null object - happens if different object type is dropped
                            if (draggedItem) {
                                if (isDragItem.test(draggedItem.attr("connect:class"))) {
                                    dropItem.css("padding", "0px");

                                    if (event) {
                                        draggedPosition = setPosition();
                                    }

                                    if (!dragData.floating && !dragData.toDelete) {
                                        draggedItem = draggedItem.copyNode("ins", true);

                                        draggedItem.dragstart(function(event) {
                                            showDestination(true, draggedItem);
                                            globalDataObject = localDataObject;
                                            globalDataObject.dragData.floating = true;
                                            globalDataObject.insertNode = draggedItem;
                                            event.dataTransfer.mozSetDataAt("dragData", globalDataObject, 0);
                                        });

                                        draggedItem.dragend(function(event) {
                                            showDestination(false, draggedItem);
                                            //If drag was unsuccessful
                                            if (event.dataTransfer.dropEffect === "none") {
                                                draggedItem.remove();
                                            }
                                        });
                                    }

                                    //Set the exact coordinate drop position of drag target
                                    if (dragData.exactPosition) {
                                        draggedItem.css(draggedPosition);
                                    }

                                    if (dropItem.children().length !== 0) {
                                        if (dragData.toDelete ||
                                            dropItem.firstChild()[0].nodeType !== 1) {
                                            //Replace insert node where appropriate
                                            if (dragData.replaceDropped) {
                                                //Recover drag node related to dragged "ins" node
                                                var relatedDragItem = getDragNode(dropItem.firstChild());
                                                if (relatedDragItem) {
                                                    relatedDragItem = $(relatedDragItem);
                                                    var replaceNode = relatedDragItem.firstChild();
                                                    while (replaceNode.contents().length !== 0) { // 07/09/2012: jQuery 'contents' replaces the former ulib 'children' function
                                                        relatedDragItem.append(replaceNode.firstChild());
                                                    }
                                                    replaceNode.remove();
                                                    relatedDragItem.attr("draggable", "true");
                                                    //ARIA - grabbed attribute
                                                    relatedDragItem.attr("aria-grabbed", "false");
                                                    relatedDragItem.draggable('enable').show();
                                                }
                                                if (dropItem.firstChild()[0].nodeType !== 1 || !dropItem.firstChild().is('.questionNumber')) {
                                                    dropItem.firstChild().remove();
                                                }
                                            }
                                        }
                                    }
                                    var dragParent = draggedItem.parent();
                                    //##### Centre dragged item when using [gap] #####
                                    dropItem.prepend(draggedItem);
                                    if (dropItem.css("min-width") !== "0px" && !hasInlineGaps) {
                                        var dropOffset = Math.round(dropItem.outerWidth() / 2);
                                        //	var dropLeft = dropItem.position().left;
                                        var dragOffset = Math.round(draggedItem.outerWidth() / 2);
                                        //	draggedItem.css("left", dropItem.css("left"));
                                        //if (dragOffset > dropOffset && dropItem.parent('foreignobject').length === 0) {
                                        if (dragOffset > dropOffset) {
                                            dropItem.css("margin-left", ((dropOffset - dragOffset) * 1.3) + "px"); // 1.7 is a fudge factor that seems to work.
                                        } else {
                                            dropItem.css("margin-left", 0);
                                        }
                                        //} else {
                                        //dropItem.prepend(draggedItem); // 07/09/2012: changed from 'append' to 'prepend' to address the presence of the question number element
                                    }
                                    //Save response value
                                    value.set(gapIdentifier, draggedItem.attr("connect:identifier"));
                                    if (value.size() !== 0) {
                                        responseVariable.setValue(value);
                                    } else {
                                        responseVariable.setValue(undefined);
                                    }
                                    if (dragParent.length > 0) {
                                        dragParent.css("padding", "0 " + width + "px");
                                        //Remove response value
                                        value.remove(dragParent.attr("connect:identifier"));
                                        if (value.size() !== 0) {
                                            responseVariable.setValue(value);
                                        } else {
                                            responseVariable.setValue(undefined);
                                        }
                                    }
                                    dropItem[0].focus();

                                    //Locate all object nodes and then detach and re-attach the "data"
                                    //attributes to force the DOM to update properly. Without this,
                                    //the link between the object and its data source is lost
                                    var objectList = $("object", draggedItem[0]);
                                    objectList.each(function(index, objectElement) {
                                        objectElement = $(objectElement);
                                        objectElement.copyAttributes(objectElement);
                                    });
                                    if (event) {
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        function keyDown(event) {
                            var keyCode = event.keyCode;

                            //if (keyCode === 32) {
                            if (keyCode === 13) {
                                if (globalDataObject) {
                                    drop(event);
                                    showDestination(false, localDataObject.insertNode);
                                } else {
                                    if (localDataObject) {
                                        showDestination(true, localDataObject.insertNode);
                                        localDataObject.doDrag();
                                        globalDataObject = localDataObject;
                                        localDataObject = null;
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        //Load existing responses
                        if (value.size() !== 0) {
                            dragId = value.get(gapIdentifier);
                            if (dragId) {
                                dragItem = interaction.find('*[connect\\:identifier="' + dragId + '"]');
                                dragObject = getDragObject(dragItem);
                                dragObject.createData();
                                if (toDelete) {
                                    dragObject.doDrag();
                                }
                                globalDataObject = dragObject;
                                drop();
                                dropItem.css("padding", "0px").addClass('attempted');
                            }
                        }

                        dropItem.dragenter(dragStop);
                        dropItem.dragover(dragStop);
                        dropItem.drop(drop);
                        dropItem.focus(focus);
                        dropItem.blur(blur);
                        dropItem.keydown(keyDown);

                        var dropObject = {};
                        dropObject.drop = drop;
                        dropObject.dropNode = dropItem;
                        dropObjects.push(dropObject);
                    });

                    // jQuery UI powered drag-n-drop handlers
                    function $makeDraggable(elm, options) {
                        var l, t, txt = elm.text().substr(0, 16).trim() + '...',
                            tmpSpan = $('<span/>').addClass('gapTextDragger').text(txt);

                        sizeSpan.text(txt);
                        l = Math.round(parseInt(sizeSpan[0].clientWidth, 10)) / 2;
                        t = elm.is('ins') ? ((elm.children().length > 0) ? 10 : 0) : 0;

                        var settings = {
                            revert: 'invalid',
                            cursor: 'move',
                            cursorAt: {
                                top: t,
                                left: l
                            },
                            helper: function(event) {
                                return tmpSpan;
                            },
                            start: function(event, ui) {
                                var $this = $(this),
                                    dragNode, dragObject;
                                if ($this.is('ins')) {
                                    dragNode = $(getDragNode($this));
                                } else {
                                    dragNode = $this;
                                }
                                dragObject = getDragObject(dragNode);
                                dragObject.createData();
                            },
                            stop: function(event, ui) {
                                var $this = $(this),
                                    dragNode, dragObject;
                                if ($this.is('ins')) {
                                    dragNode = $(getDragNode($this));
                                    dragObject = getDragObject(dragNode);
                                    if ($this.is('.over-droppable')) {
                                        $this.removeClass('over-droppable');
                                    } else {
                                        dragObject.undoDrag();
                                    }
                                }
                            },
                            appendTo: '[connect\\:class~="gapMatchInteraction"][connect\\:responseIdentifier="' + responseIdentifier + '"] [connect\\:class~="gapChoices"]',
                            zIndex: 100
                        };
                        if (options) {
                            $.extend(settings, options);
                        }
                        elm.draggable(settings);
                    }
                    /*dragItems.each(function() {
                    	$makeDraggable($(this));
                    });*/
                    dropItems.droppable({
                        hoverClass: 'availableTarget',
                        accept: '[connect\\:responseIdentifier="' + responseIdentifier + '"] [connect\\:class~="gapText"], [connect\\:responseIdentifier="' + responseIdentifier + '"] [connect\\:class~="gapImg"]',
                        over: function(event, ui) {
                            ui.draggable.addClass('over-droppable');
                        },
                        out: function(event, ui) {
                            ui.draggable.removeClass('over-droppable');
                        },
                        drop: function(event, ui) {
                            var dropObject = getDropObject($(this)),
                                dragObject, dragNode;
                            if (ui.draggable.is('ins')) {
                                if (this === ui.draggable.parent()[0]) {
                                    return false;
                                } else {
                                    ui.draggable.parent().css('margin-left', 0); // UA 17/05/2016: to restore previous drop element to its initial size
                                }
                                dragNode = $(getDragNode(ui.draggable));
                            } else {
                                dragNode = ui.draggable;
                            }
                            dragObject = getDragObject(dragNode);
                            if (toDelete) {
                                dragObject.doDrag();
                            }
                            dropObject.drop();
                            if (!ui.draggable.is('ins')) {
                                $makeDraggable(dragObject.insertNode, {
                                    revert: false
                                });
                            }
                            dropObject.dropNode.addClass('attempted'); //.css("padding", "0px")
                        }
                    });
                })();

                interaction.keydown(function(event) {
                    var keyCode = event.keyCode,
                        $tl, fIdx;

                    $tl = $(tabList).filter(function(idx) {
                        return $(this).closest('[connect\\:class~="itemBody"]').is('[connect\\:class~="activeItem"]');
                    });
                    fIdx = $tl.index(tabList[focusIndex]);

                    if (keyCode === 39 || keyCode === 40) {
                        do {
                            fIdx += 1;
                            if (fIdx === $tl.length) {
                                fIdx = 0;
                            }
                        } while ($($tl[fIdx]).is('.ui-draggable-disabled'));
                        $tl[fIdx].focus();
                        event.preventDefault();
                    } else if (keyCode === 37 || keyCode === 38) {
                        do {
                            fIdx -= 1;
                            if (fIdx === -1) {
                                fIdx = $tl.length - 1;
                            }
                        } while ($($tl[fIdx]).is('.ui-draggable-disabled'));
                        $tl[fIdx].focus();
                        event.preventDefault();
                    }
                });
            });
        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Adds gap match interaction functionality", "gapMatchInteractions");

        function diffArray(a, b) {
            var i, seen = [],
                diff = [];
            for (i = 0; i < b.length; i++) {
                seen[b[i]] = true;
            }
            for (i = 0; i < a.length; i++) {
                if (!seen[a[i]]) {
                    diff.push(a[i]);
                }
            }
            return diff;
        }

        var manageInteractionHeight = function(item) {
            if (item) {
                var $scrollContainer = item.find('div[connect\\:class~="scroll-container"]'),
                    $gapMatches = item.find('div[connect\\:class~="gapMatchInteraction"][connect\\:author-class~="svgBackground"]:not([connect\\:author-class~="presentation-ortn-vertical"])');

                $gapMatches.each(function() {
                    /* Changes to fix XCTB-617 
                    	Added else condition to handle default situation not to add extra height*/
                    var $stim = $(this).find('div[connect\\:class~="gapsStimulus"]'),
                        $stimHeight = $stim.height(),
                        $scrollContainerHeight = $scrollContainer.height();

                    if ($stimHeight > $scrollContainer.height()) {
                        $stim.css('height', $scrollContainer.height() + 'px');
                    } else {
                        $stim.css('height', 'auto');
                    }
                    /*********/
                });
            }
        };

        var testStartFunc = function() {
            var savedRspVal,
                setGMI_State = function(rspVar) {
                    var rspId = rspVar.getIdentifier().split('.')[1],
                        gapId,
                        rspVal, nvals, keys, svkeys,
                        gmi = $('[connect\\:responseIdentifier="' + rspId + '"]');

                    if (gmi.is('[connect\\:class~="gapMatchInteraction"]')) {
                        rspVal = rspVar.getValue();
                        if (rspVal) {
                            rspVal = rspVal.toHash();
                            nvals = rspVal.values().length;
                        } else {
                            nvals = 0;
                        }

                        if (!savedRspVal || nvals > savedRspVal.values().length) {
                            if (rspVal) {
                                gapId = rspVal.keys()[nvals - 1];
                                gmi.find('*[connect\\:identifier~="' + gapId + '"]').addClass('attempted');
                            }
                        } else if (savedRspVal) {
                            gapId = (rspVal) ? diffArray(savedRspVal.keys(), rspVal.keys())[0] : savedRspVal.keys();
                            gmi.find('*[connect\\:identifier~="' + gapId + '"]').removeClass('attempted');
                        }

                        if (rspVal) {
                            savedRspVal = $.extend({}, rspVal); // clone the rspVal object
                        } else {
                            savedRspVal = undefined;
                        }
                    }
                };
            qti.subscribeToEvent("changeResponseVariable", setGMI_State, "set gap match interaction state", "setGMI_State");
        };

        qti.subscribeToEvent("testStart", testStartFunc, "setup the set-gapMatchInteraction-state listener", "setup_setGMI_State_handling");
        if (!qti.dontAllowGapImageScroll) {
            qti.subscribeToEvent("newScreenDisplay", manageInteractionHeight, "change stimulus height to fit to screen", "update_interaction_height_newScreen");
            qti.subscribeToEvent("windowResize", manageInteractionHeight, "change stimulus height to fit to screen", "update_interaction_height_resize");
            qti.subscribeToEvent("screenChange", manageInteractionHeight, "change stimulus height to fit to screen", "update_interaction_height_screenChange");
        }


    })();

    (function() {

        var loadItemFunc = function(itemBody) {
            //var itemBody = itemObj.body, 
            var itemIdentifier = itemBody.attr('connect:identifier'),
                inlineChoiceInteractions,
                inlineChoiceGroups = itemBody.find('div[connect\\:author-class~="container"][connect\\:author-class~="inlineChoice"]'),

                setupInteractionSet = function(inlineChoiceInteractions, inlineChoicesContainer) {
                    var inHorizontalWidgetContainer, uniformWidthInteractions, maxWidth = 0;
                    if (inlineChoicesContainer) {
                        if (inlineChoicesContainer.is('[connect\\:author-class~="presentation-horizontalPopup"]')) {
                            inHorizontalWidgetContainer = true;
                        } else if (inlineChoicesContainer.is('[connect\\:author-class~="presentation-uniformWidth"]')) {
                            uniformWidthInteractions = true;
                        }
                    }

                    inlineChoiceInteractions.each(function(index, inlineChoiceInteraction) {
                        inlineChoiceInteraction = $(inlineChoiceInteraction).find('select');

                        var responseIdentifier = inlineChoiceInteraction.attr('connect:responseIdentifier'),
                            responseVariable = qti.getVariable(responseIdentifier, itemIdentifier),
                            placeholderElement = inlineChoiceInteraction.find('*[connect\\:class~="placeholder"]'),
                            placeholderText = placeholderElement.text(),
                            interactionWidth,
                            value = responseVariable.getValue();

                        if (value !== undefined) {
                            inlineChoiceInteraction.value(value);
                            inlineChoiceInteraction.parent().addClass('attempted');
                        } else {
                            inlineChoiceInteraction.parent().removeClass('attempted');
                        }

                        inlineChoiceInteraction.change(function() {
                            // redundant?  - PFC
                            value = inlineChoiceInteraction.value();
                            if (value === "" || value === undefined) {
                                responseVariable.setValue(undefined);
                            } else {
                                responseVariable.setValue(value);
                            }
                        });

                        inlineChoiceInteraction.focus(function() {
                            // redundant?  - PFC
                            placeholderElement.text('');
                            inlineChoiceInteraction.removeAttrToken(
                                'connect:state', 'placeholder');
                        });

                        function onBlur() {
                            value = inlineChoiceInteraction.value();
                            if (value === "" || value === undefined) {
                                inlineChoiceInteraction.addAttrToken(
                                    'connect:state', 'placeholder');
                            } else {
                                inlineChoiceInteraction.removeAttrToken(
                                    'connect:state', 'placeholder');
                            }
                            placeholderElement.text(placeholderText);
                        }

                        onBlur();
                        inlineChoiceInteraction.blur(onBlur);

                        if (inHorizontalWidgetContainer || inlineChoiceInteraction.is('[nav~="inlineChoiceGroup"]')) {
                            //inlineChoiceInteraction.parents('div').is('[connect\\:author-class~="inlineChoice"]')) {
                            if (qti.preloadTestContents) {
                                qti.screens[itemIdentifier].init.push(function() {
                                    setupFloatingWidget(inlineChoiceInteraction, responseVariable);
                                });
                            } else {
                                setupFloatingWidget(inlineChoiceInteraction, responseVariable);
                            }
                        } else if (uniformWidthInteractions) {
                            interactionWidth = inlineChoiceInteraction.outerWidth();
                            if (interactionWidth > maxWidth) {
                                maxWidth = interactionWidth;
                            }
                        } else if (inlineChoiceInteraction.is('[connect\\:author-class~="presentation-customDropDown"]')) {
                            if (qti.preloadTestContents) {
                                qti.screens[itemIdentifier].init.push(function() {
                                    setupCustomDropDownWidget(inlineChoiceInteraction, responseVariable);
                                });
                            }
                        }
                    });

                    if (uniformWidthInteractions) {
                        inlineChoiceInteractions.find('select').css('width', maxWidth);
                    }
                };

            if (inlineChoiceGroups.length > 0) {
                inlineChoiceGroups.each(function() {
                    var inlineChoiceGroup = $(this);
                    inlineChoiceInteractions = inlineChoiceGroup.find('*[connect\\:class~="inlineChoiceInteraction"]');
                    setupInteractionSet(inlineChoiceInteractions, inlineChoiceGroup);
                });
                inlineChoiceInteractions = itemBody.find('*[connect\\:class~="inlineChoiceInteraction"]').filter(function() {
                    return $(this).closest(inlineChoiceGroups).length ? false : true;
                });
                if (inlineChoiceInteractions.length) {
                    setupInteractionSet(inlineChoiceInteractions);
                }
            } else {
                //***** Legacy test items *****
                inlineChoiceInteractions = itemBody.find('*[connect\\:class~="inlineChoiceInteraction"]');
                if (itemBody.find('select').is('[nav~="inlineChoiceGroup"]')) {
                    //***** Horizontal-popup-options mode *****
                    inlineChoiceInteractions.closest('div').addClass('inlineChoiceGroup');
                }
                setupInteractionSet(inlineChoiceInteractions);
            }

            function setupFloatingWidget(inlineChoiceInteraction, responseVariable) {
                var selectedVal = inlineChoiceInteraction.val(),
                    selectedText = selectedVal ? inlineChoiceInteraction.children('[value="' + selectedVal + '"]').text() : '&#160;',
                    options = inlineChoiceInteraction.find('option'),
                    optionsList, optionsWidth = 0,
                    optionsNo = 0,
                    totalWidth,
                    responseRef = inlineChoiceInteraction.attr('connect:responseIdentifier'),
                    inlineChoiceDL = $('<dl id="' + responseRef + '-list" class="inlineChoice"></dl>');

                inlineChoiceInteraction.hide();
                inlineChoiceInteraction.after(inlineChoiceDL);
                $('<dt class="interaction" title="click to choose"><a href="#">' + selectedText + '</a></dt>')
                    .appendTo(inlineChoiceDL).attrNS('connect:responseIdentifier', responseRef);
                $('<dd><ul></ul></dd>').appendTo(inlineChoiceDL);
                optionsList = inlineChoiceDL.find('ul');
                options.each(function() {
                    var opt = $(this),
                        listItem;
                    if (opt.text()) {
                        listItem = '<li><a href="#">' + opt.text() + ' <span class="value">' + opt.val() + '</span></a></li>';
                    } else {
                        listItem = '<li><a href="#" class="clear" title="clear text">&#160;<span>clear text</span><span class="value">' + opt.val() + '</span></a></li>';
                    }
                    optionsList.append(listItem);
                    optionsWidth += $('li:nth(' + optionsNo + ')', optionsList).width();
                    optionsNo++;
                });

                totalWidth = optionsWidth + (optionsNo * 20) + 10;
                $('dd ul', inlineChoiceDL).width(totalWidth);

                function changeOption(e) {
                    e.preventDefault();
                    var dl = $(this).closest('dl'),
                        text = $(this).html(),
                        value = $(this).find('span.value').text(), //.html(),
                        source = dl.prev();
                    $('dt a', dl).html(text);
                    $('dd ul', dl).hide();
                    source.val(value);
                    if (!value) {
                        responseVariable.setValue(undefined);
                    } else {
                        responseVariable.setValue(value);
                    }
                }

                $('dd ul li a', inlineChoiceDL).click(changeOption);
                $('dl.inlineChoice dd ul').hide();

                function checkListPosition(currentList) {
                    if (currentList.is(':visible')) {
                        var container = currentList.closest('[connect\\:class~="scroll-container"]'),
                            containerOffset = container.offset(),
                            listOffset = currentList.offset(),
                            listLeft = listOffset.left,
                            leftSpace = listLeft - containerOffset.left,
                            rightSpace = (containerOffset.left + container.outerWidth()) - (listOffset.left + currentList.outerWidth()) - 20; // leave 20px for possible scrollbar

                        if (leftSpace < 0) {
                            currentList.css('left', 0);
                        } else if (rightSpace < 0) {
                            rightSpace = listLeft + rightSpace;
                            currentList.offset({
                                left: rightSpace
                            });
                        }
                    }
                }

                /* this click functionality manages to trigger focus 
                 *	but by default rather than design - needs further investigation
                 */
                $('dt', inlineChoiceDL).click(function(event) {
                    event.preventDefault();
                    itemBody.find('dl.inlineChoice dd ul').not(optionsList).hide();
                    optionsList.toggle();
                    checkListPosition(optionsList);
                });

                $('dt a', inlineChoiceDL).focus(function(event) {
                    var $dt;
                    event.preventDefault();
                    $dt = $(this).parent();
                    $dt.trigger("click");
                    $dt.next().find('a.clear').trigger('focus');
                });
            }

            function setupCustomDropDownWidget(inlineChoiceInteraction, responseVariable) {
                var parentHolderHeightLoad, parentHolderHeightChange,
                    selectedVal = inlineChoiceInteraction.val(),
                    selectedText = selectedVal ? inlineChoiceInteraction.children('[value="' + selectedVal + '"]').text() : '&#160;',
                    options = inlineChoiceInteraction.find('option'),
                    optionsList, /*optionsWidth = 0, optionsNo = 0,*/ totalWidth,
                    responseRef = inlineChoiceInteraction.attr('connect:responseIdentifier'),
                    inlineChoiceDL = $('<dl id="' + responseRef + '-list" class="inlineChoice customDropDown"></dl>');

                inlineChoiceInteraction.hide();
                inlineChoiceInteraction.after(inlineChoiceDL);
                $('<dt title="click to choose" class="interaction btn btn-default dropdown-toggle" type="button" data-toggle="dropdown"><a href="#">' + selectedText + '</a><span class="caret"></span></dt>')
                    .appendTo(inlineChoiceDL).attrNS('connect:responseIdentifier', responseRef);
                $('<dd><ul class="dropdown-menu"></ul></dd>').appendTo(inlineChoiceDL);
                optionsList = inlineChoiceDL.find('ul');
                options.each(function() {
                    var opt = $(this),
                        listItem;
                    if (opt.text()) {
                        listItem = '<li><a href="#">' + opt.text() + ' <span class="value">' + opt.val() + '</span></a></li>';
                    } else {
                        //listItem = '<li><a href="#" class="clear" title="clear text">&#160;<span>clear text</span><span class="value">' + opt.val() + '</span></a></li>';
                        listItem = '<li><a href="#" class="clear" title="clear text"></a></li>';
                    }
                    optionsList.append(listItem);
                    //optionsWidth += $('li:nth(' + optionsNo + ')', optionsList).width();
                    //optionsNo++;
                });

                //totalWidth = optionsWidth + (optionsNo * 20) + 20;
                //$('dd ul', inlineChoiceDL).width(totalWidth);
                $('dl dt', inlineChoiceDL).width(optionsList.width() - 22);

                function changeOption(e) {
                    e.preventDefault();
                    var dl = $(this).closest('dl'),
                        text = $(this).html(),
                        value = $(this).find('span.value').text(), //.html(),
                        source = dl.prev();
                    $('dt a', dl).html(text);
                    $('dd ul', dl).hide();
                    source.val(value);
                    if (!value) {
                        responseVariable.setValue(undefined);
                    } else {
                        responseVariable.setValue(value);
                    }
                }

                $('dd ul li a', inlineChoiceDL).click(changeOption);
                $('dl.inlineChoice dd ul').hide();

                function checkListPosition(currentList) {
                    if (currentList.is(':visible')) {
                        var container = currentList.closest('[connect\\:class~="scroll-container"]'),
                            containerOffset = container.offset(),
                            listOffset = currentList.offset(),
                            listLeft = listOffset.left,
                            leftSpace = listLeft - containerOffset.left,
                            rightSpace = (containerOffset.left + container.outerWidth()) - (listOffset.left + currentList.outerWidth()) - 20; // leave 20px for possible scrollbar

                        if (leftSpace < 0) {
                            currentList.css('left', 0);
                        } else if (rightSpace < 0) {
                            rightSpace = listLeft + rightSpace;
                            currentList.offset({
                                left: rightSpace
                            });
                        }
                        parentHolderHeightChange = container[0].scrollHeight;
                        if (parentHolderHeightLoad < parentHolderHeightChange) {
                            currentList.parents('span').removeClass("dropdown").addClass("dropup");
                        }

                    } else {
                        currentList.parents('span').removeClass("dropup").addClass("dropdown");
                    }
                }

                /* this click functionality manages to trigger focus 
                 *	but by default rather than design - needs further investigation
                 */
                $('dt', inlineChoiceDL).click(function(event) {
                    parentHolderHeightLoad = $($(this).parents('div[connect\\:class="scroll-container"]:visible'))[0].scrollHeight;
                    event.preventDefault();
                    itemBody.find('dl.inlineChoice dd ul').not(optionsList).hide();

                    optionsList.toggle();

                    checkListPosition(optionsList);
                });

                $('dt a', inlineChoiceDL).focus(function(event) {
                    var $dt;
                    event.preventDefault();
                    $dt = $(this).parent();
                    $dt.trigger("click");
                    $dt.next().find('a.clear').trigger('focus');
                });
            }

        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }

            $(document).bind('click', function(e) {
                var clicked = $(e.target);
                if (!clicked.parents().hasClass("inlineChoice")) {
                    $('dl.inlineChoice dd ul').hide();
                }
            });
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Inline choice iteractions", "inlineChoiceInt");

        var testStartFunc = function() {
            var setICI_State = function(rspVar) {
                var rspId = rspVar.getIdentifier().split('.')[1],
                    ici = $('span[connect\\:class~="inlineChoiceInteraction"]:has([connect\\:responseIdentifier="' + rspId + '"])'),
                    rspVal = rspVar.getValue();
                if (rspVal === undefined) {
                    ici.removeClass('attempted');
                } else {
                    ici.addClass('attempted');
                }
            };
            qti.subscribeToEvent("changeResponseVariable", setICI_State, "set inline choice interaction state", "setICI_State");
        };

        qti.subscribeToEvent("testStart", testStartFunc, "setup the set-inlineChoiceInteraction-state listener", "setup_setICI_State_handling");
    })();

    (function() {

        var loadItemFunc = function(itemBody) {
            //var itemBody = itemObj.body,
            var itemIdentifier = itemBody.attr('connect:identifier'),
                choiceInteractions = itemBody.find('*[connect\\:class~="choiceInteraction"]'),
                twoColChoiceContainer, timerId,
                styleImageIfExists = function(input, selected) {
                    $(input).parent().find('img').each(function() {
                        if (selected) {
                            $(this).addClass("selected");
                        } else {
                            $(this).removeClass("selected");
                        }
                    });
                };

            /*        //##### Removed explicit reference to itemBody as this was masking the global reference #####
            		ensureSameChoiceHeight = function() {
            			var choiceInteractions = itemBody.find('*[connect\\:author-class~="twoColChoice"] *[connect\\:class~="choiceInteraction"]')
            										.add(itemBody.find('*[connect\\:class~="twoColChoice"] *[connect\\:class~="choiceInteraction"]')),
            				chlength = choiceInteractions.length,
            				idx, $left, $right, lheight, rheight, newheight, includeMargins = true;
    
            			if (chlength === 0) {
            				return;
            			}
    
            			// recalculate and reset height of ALL choice interactions for twoColChoices
            			// recalculated when settingsChange event fires so margins included first and then set to 0
            			for (idx = 0; idx < chlength; idx += 1) {
            				// clear the element's height first
            				$(choiceInteractions[idx]).css({'height': ''});
    
            				$left = $(choiceInteractions[idx]);
            				lheight = $left.outerHeight(includeMargins);
    
            				if (idx < chlength - 1) {
            					// for pairs reset the height of both to that of taller
            					$right = $(choiceInteractions[++idx]);
            					rheight = $right.outerHeight(includeMargins);
            					newheight = lheight;
            					if (newheight < rheight) {
            						newheight =  rheight;
            					}
            					$left.css({'height': newheight+'px', 'margin-top': 0, 'margin-bottom': 0});
            					$right.css({'height': newheight+'px', 'margin-top': 0, 'margin-bottom': 0});
            				} else {
            					// odd one at the end. reset height to itself
            					$left.css({'height': lheight+'px', 'margin-top': 0, 'margin-bottom': 0});
            				}
            			}
            		},
                    
                    //##### Check to make sure that the item is ready before resizing choice through the settings change event #####
            		ensureSameChoiceHeightEvent = function() {
            			if (timerId !== undefined) {
            				clearTimeout(timerId);
            			}
            			if (qti.preloadTestContents) {
            				if (!qti.screens[itemIdentifier].ready) {
            					timerId = setTimeout(ensureSameChoiceHeightEvent, 10);
            				} else {
            					ensureSameChoiceHeight();
            				}
            			} 
            		};
            */

            choiceInteractions.each(function(index, choiceInteraction) {
                choiceInteraction = $(choiceInteraction);
                var inputs = choiceInteraction.find('input'),
                    responseIdentifier = choiceInteraction.attr('connect:responseIdentifier'),
                    responseVariable = qti.getVariable(responseIdentifier, itemIdentifier),
                    maxChoices = qti.parseInteger(choiceInteraction.attr('connect:maxChoices')),
                    isGrouped = ((choiceInteraction.closest('[connect\\:author-id^="choice-accordion-interaction"]').length > 0 ||
                        choiceInteraction.is('[nav^="choice-accordion-interaction"]')) ? true : false),
                    qns = (isGrouped ? choiceInteraction.parent().find('h3[connect\\:responseIdentifier="' +
                            responseIdentifier + '"] span.questionNumber[data-nav]') :
                        choiceInteraction.find('span.questionNumber[data-nav]')),

                    qnsCount = qns.length,
                    isMultiNav = qnsCount > 0 && maxChoices > 1,
                    imageCount = 0,
                    imagePerLine = 3,
                    imagePadding = 1,
                    imageWidth = (100 / imagePerLine) - (imagePadding * imagePerLine),
                    isHorizontalImage, value,
                    cardinality = responseVariable.getCardinality();

                if (cardinality === 'single') {
                    if (maxChoices !== 1) {
                        throw new Error('Invalid cardinality');
                    }
                } else if (cardinality !== 'multiple') {
                    throw new Error('Invalid cardinality');
                }

                if (responseVariable.getBaseType() !== 'identifier') {
                    throw new Error('Invalid base type');
                }

                value = responseVariable.getValue();
                if (value !== undefined) {
                    inputs.value(value);
                }

                inputs.each(function() {
                    var $this = $(this),
                        $imgs = $this.parent().find('img');
                    if ($imgs.length) {
                        imageCount += $imgs.length;
                        $this.hide();
                    }
                });

                inputs.keydown(function(event) {
                    if (event.keyCode === 13) {
                        $(this).trigger('click');
                    }
                });

                if (imageCount > 0) {
                    if (choiceInteraction.is('[connect\\:author-class~="presentation-horizontalOptions"]')) {
                        isHorizontalImage = true;
                    } else if (choiceInteraction.is('div[nav*="imageHorizontal"]')) {
                        isHorizontalImage = true;
                        choiceInteraction.attrNS('connect:author-class', 'presentation-horizontalOptions');
                    }
                    if (isHorizontalImage) {
                        inputs.each(function(index) {
                            $(this).parent().parent().width(imageWidth + '%');
                            $(this).parent().parent().css('padding', imagePadding + '%');
                        });
                    }
                } else if (choiceInteraction.is('[connect\\:author-class="horizontalText"]')) {
                    choiceInteraction.attrNS('connect:author-class', 'presentation-horizontalPromptOptions');
                }

                if (maxChoices === 1) {
                    // Inputs are radio buttons.
                    inputs.each(function(index, input) {
                        input._connect_wasChecked = input.checked;
                        if (input.checked) {
                            styleImageIfExists(input, true);
                        }
                    });
                    inputs.click(function(event) {
                        // Clicking on a radio button that is checked causes
                        // it to become unchecked.
                        var clickedInput = this;
                        if (this._connect_wasChecked) {
                            event.preventDefault();
                            clickedInput.checked = clickedInput._connect_wasChecked = false;

                            styleImageIfExists(clickedInput, false);

                            // Delightful hack for Webkit
                            $.later(function() {
                                clickedInput.checked = clickedInput._connect_wasChecked = false;
                            });
                        } else {
                            inputs.each(function(index, input) {
                                input._connect_wasChecked = false;
                                styleImageIfExists(input, false);
                            });
                            clickedInput._connect_wasChecked = true;
                            clickedInput.checked = true;
                            styleImageIfExists(clickedInput, true);
                        }
                    });
                } else if (maxChoices > 1) {

                    if (isMultiNav && !isGrouped) { //NB: accordion/grouped multinavs question spans catered for in 23-itemGroups
                        qns.each(function(index) {
                            var $this = $(this),
                                txt = $this.text();

                            $this.attr('data-interaction-identifier', '');
                            if (index < qnsCount - 1) {
                                //##### Leave space before range en-dash #####
                                $this.text(txt + ' –');
                            }
                            if (index > 0 && index < qns.length - 1) {
                                $this.attr("style", "display:none");
                            }
                        });
                    }

                    inputs.each(function(index, input) {
                        if (input.checked) {
                            styleImageIfExists(input, true);
                        }

                        if (isMultiNav) {
                            $(input).click(function() {
                                var $i = $(this),
                                    val = $i.val(),
                                    chckd = $i.is(':checked'),
                                    currAElem = qti.getCurrentItem().getAElement().parent().find('*[connect\\:state~="current"]'),
                                    currentNavVal = qti.getCurrentItem().getAElement().parent().find('*[connect\\:state~="current"]').attr('nav'),
                                    qn = qns.parent().find('[data-nav="' + currentNavVal + '"]'),
                                    qndii = qn.attr('data-interaction-identifier');

                                if (chckd) {
                                    if (qndii === '') {
                                        qn.attr('data-interaction-identifier', val);
                                    } else {
                                        qn = qns.parent().find('span.questionNumber[data-interaction-identifier=""]').first();
                                        qn.attr('data-interaction-identifier', val);
                                    }
                                } else {
                                    if (qndii === val) {
                                        qn.attr('data-interaction-identifier', '');
                                    } else {
                                        qn = qns.parent().find('span.questionNumber[data-interaction-identifier="' + val + '"]').first();
                                        qn.attr('data-interaction-identifier', '');
                                    }
                                }
                            });
                        }
                    });

                    // Inputs are checkboxes but are subject to a maximum number
                    // of checked items. Prevent the candidate from selecting more
                    // than the maximum number of choices.
                    var checkedCount = $.reduce(inputs, 0, function(count, input) {
                        if (input.checked) {
                            return count + 1;
                        } else {
                            return count;
                        }
                    });

                    inputs.click(function(event) {
                        if (this.checked) {
                            if (checkedCount >= maxChoices) {
                                event.preventDefault();
                                this.checked = false;
                                styleImageIfExists(this, false);
                            } else {
                                ++checkedCount;
                                styleImageIfExists(this, true);
                            }
                        } else {
                            --checkedCount;
                            styleImageIfExists(this, false);
                        }
                    });
                }

                inputs.click(function() {
                    responseVariable.setValue(inputs.value());
                });
            });

            /*		twoColChoiceContainer = choiceInteractions.closest('[connect\\:author-class~="twoColChoice"], [connect\\:class~="twoColChoice"]');
                    if (twoColChoiceContainer.length > 0) {
            			twoColChoiceContainer.addClass('clearfix');
                        if (qti.preloadTestContents) {
                            qti.screens[itemIdentifier].init.push(function() {
                                ensureSameChoiceHeightEvent();
                            });
                        } else {
                            ensureSameChoiceHeightEvent();
                        }
                        //##### Changed function called by this event handler to allow item ready test to be run #####
                        qti.subscribeToEvent("settingsChange", ensureSameChoiceHeightEvent, "Make choices the same height", itemIdentifier+"2colChoices_heightSet_settingsChange");
                    }
            */
        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Adds functionality for choice interactions", "choiceInteractions");
    })();

    (function() {

        function isPointInPoly(poly, pt) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
                if (
                    ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) &&
                    (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                ) {
                    c = !c;
                }
            }
            return c;
        }

        function isPointInCircle(circ, pt) {
            return Math.pow(pt.x - circ.x, 2) + Math.pow(pt.y - circ.y, 2) <= Math.pow(circ.r, 2);
        }

        function setupAreasDisplay(ctnr, areas) {
            var svgContainer = d3.select(ctnr).append("svg")
                .attr("class", "areasDisplay")
                .attr("width", "100%")
                .attr("height", "100%"),

                circles = svgContainer.selectAll("circle")
                .data(areas)
                .enter()
                .append("circle").filter(function(d, i) {
                    return d.shape === "circle";
                }),

                circleAttributes = circles
                .attr("cx", function(d) {
                    return d.coords.split(',')[0];
                })
                .attr("cy", function(d) {
                    return d.coords.split(',')[1];
                })
                .attr("r", function(d) {
                    return d.coords.split(',')[2];
                })
                .attr("stroke", "green")
                .attr("stroke-width", 1)
                .attr("fill", "none");
        }

        var poStageCount = 0,
            checkAreaMapping = function(objAttrs, areaData) {
                var coords = areaData.coords.split(','),
                    point, shapeObj, i;
                if (objAttrs.centerPoint) {
                    point = {
                        x: objAttrs.centerX,
                        y: objAttrs.centerY
                    };
                } else {
                    point = {
                        x: objAttrs.left,
                        y: objAttrs.top
                    };
                }
                if (areaData.shape === "circle") {
                    shapeObj = {
                        x: coords[0],
                        y: coords[1],
                        r: coords[2]
                    };
                    return isPointInCircle(shapeObj, point);
                } else {
                    if (areaData.shape === "rect") {
                        shapeObj = [{
                                x: coords[0],
                                y: coords[1]
                            },
                            {
                                x: coords[2],
                                y: coords[1]
                            },
                            {
                                x: coords[2],
                                y: coords[3]
                            },
                            {
                                x: coords[3],
                                y: coords[3]
                            }
                        ];
                    } else if (areaData.shape === "poly") {
                        shapeObj = [];
                        for (i = 0; i < coords.length; i += 2) {
                            shapeObj.push({
                                x: coords[i],
                                y: coords[i + 1]
                            });
                        }
                    }
                    return isPointInPoly(shapeObj, point);
                }
            },

            loadItemFunc = function(itemBody) {
                //var itemBody = itemObj.body;
                var itemIdentifier = itemBody.attr('connect:identifier'),

                    //********** Flags To Control Operation **********

                    //Delete the drag node associated with the dropped insert node
                    //toDelete = true,

                    //Place the dropped insert node at a specific coordinate
                    //position in the drop target
                    exactPosition = true,

                    //Replace existing dropped insert node with newly dropped
                    //insert node
                    replaceDropped = false,

                    //************************************************

                    // Define drag and drop targets classes/selectors
                    dragTargetClass = "positionObjectInteraction",
                    dropTargetClass = "positionObjectDrop",
                    dragContainerSelector = "ul",
                    tabClass = '*[connect\\:class~="positionObjectInteraction"]',

                    interactionStages = itemBody.find('*[connect\\:class~="positionObjectStage"]');

                interactionStages.each(function(index, interactionStage) {
                    //Locate drag and drop targets
                    var $interactionStage = $(interactionStage),
                        dropItems = $interactionStage.find('*[connect\\:class~="' + dropTargetClass + '"]'),
                        dragItems = $interactionStage.find('*[connect\\:class~="' + dragTargetClass + '"]'),

                        totalMaxChoices = parseInt($interactionStage.attr('connect:maxChoices'), 10),

                        //Position Objects - Area Mapping data view mode variables
                        poasMode = false,
                        poasTable,

                        //Locate the drag target container. This container holds the
                        //drag targets. Drag targets removed from drop targets are placed
                        //back into this container automatically
                        dragContainer = $(dragContainerSelector, interactionStage),

                        //This holds the dragObject of the item being dragged whether
                        //by mouse or keyboard
                        globalDataObject,

                        //Global drop handler
                        globalDropHandler,

                        //Setup keyboard handling values and events
                        focusIndex = 0,
                        arrowCursor = false,
                        floatCursor = 0,
                        responseValue,
                        floatIndex,
                        multiIndex,
                        localResponseObject,
                        multipleCardinalityInteractions = {},

                        //Setup pseudo tab list and focus for accessibility
                        tabIndex = 0,
                        tabList = $(tabClass, interactionStage);

                    //ARIA - role attribute
                    dragContainer.attr('role', 'listbox');

                    tabList.each(function(index, tabItem) {
                        $(tabItem).attrNS('connect:tabindex', tabIndex);
                        $(tabItem).attr('tabindex', 0);
                        tabIndex++;
                    });

                    if (!$interactionStage.attr('id')) {
                        $interactionStage.attr('id', "poStage" + (++poStageCount));
                    }
                    if (!totalMaxChoices) {
                        totalMaxChoices = 0;
                        dragItems.each(function() {
                            totalMaxChoices += parseInt($(this).attr('connect:maxChoices'), 10);
                        });
                        $interactionStage.attrNS('connect:maxChoices', totalMaxChoices);
                    }

                    if ($interactionStage.find('div.positionObjectsDataView').length > 0) {
                        poasMode = true;
                        poasTable = $interactionStage.find('div.positionObjectsDataView table');
                    }

                    function focus(event) {
                        var item = $(event.target);
                        focusIndex = parseInt(item.attr('connect:tabindex'), 10);
                        //ARIA - selected attribute
                        item.attr('aria-selected', "true");
                        //Clear these settings if the focus changes
                        arrowCursor = false;
                        floatCursor = 0;
                    }

                    function blur(event) {
                        var item = $(event.target);
                        //ARIA - selected attribute
                        item.attr('aria-selected', "false");
                    }

                    function numDroppedItems() {
                        return $interactionStage.find('*[connect\\:class~="' + dropTargetClass + '"] > ins').length;
                    }

                    //Max Choices - supports "Stage" maxChoices attributes
                    function notMaxChoice(dragItem, dropItem) {
                        if (dropItem.parent().length) {
                            var maxChoices = parseInt(dropItem.parent().attr("connect:maxChoices"), 10);

                            if (!isNaN(maxChoices)) {
                                /*This additional filter was added to "droppedItems" because, when more than one P Obj interaction was 
                                 * used in a test,because of pre-loading the test now, the exisitng selector picks up "dropped items" from 
                                 * previously answered questions in the same test and this fails the "maxChoices" comparison and
                                 * prevents successive questions in the test to be answered as the maxlimit is incorrectly reached.
                                 * Hence a comparison is done between response identifiers to select/count the dropped items. This ensures
                                 * only dropped items from current question are counted against "maxChoices".  - Vijay*/
                                var droppedItems = $interactionStage.find('*[connect\\:class~="' + dropTargetClass + '"] > ins').filter(function(index) {
                                    var a = $(this).attr('connect:responseIdentifier'); /*drop identifier*/
                                    var b = $(dragItem).attr('connect:responseIdentifier'); /*drag identifier*/
                                    return a.substr(0, a.length - 1) === b.substr(0, b.length - 1);
                                });
                                /*var found;
    
                            droppedItems.each(function(index, droppedItem) {
                                if ($(droppedItem).attr("connect:responseIdentifier") === $(dragItem).attr("connect:responseIdentifier")) {
                                    found = true;
                                }
                            });
    
                            if (found) {
                                return true;
                            }*/

                                if (droppedItems.length < maxChoices) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }

                    //Ensure that the interaction remains visible by forcing
                    //the parent window or element to scroll
                    $.dragScroll(interactionStage);

                    //Drag and Drop
                    //Please note that we use the following terminology to
                    //idenify components of the Drag & Drop mechanism. The
                    //dragged "object" is called the drag target. The "object"
                    //on which a drag target can be dropped is called the drop
                    //target.

                    //Drag targets are made up of two parts - the drag node and
                    //the insert node. The drag node is the original element set
                    //to be draggable. The insert node is a copy of the drag node
                    //and is the actual element that gets dropped at the drop
                    //target. Insert nodes are created when the Drag & Drop
                    //mechanism is initialized.

                    //Object elements can cause problems for the Drag & Drop
                    //mechanism as they are difficult to select with the mouse.
                    //To avoid this problem, if an object element is used as a
                    //drag or drop target, the Drag & Drop mechanism creates
                    //accompanying "div" elements. These are placed over the
                    //object elements.

                    (function() {

                        //Array used to track drag nodes and their respective insert
                        //nodes. This is needed by the "drop and replace" mechanism
                        //where a newly dropped insert node forces a previously
                        //dropped insert node to be removed and its associated drag
                        //node returned to the drag container
                        var dragObjects = [],
                            // UA 05/06/2014: Array used by jQuery UI to track and reference drop targets
                            dropObjects = [],
                            // UA 13/06/2014: y-offset position variable for initially laying out drag items
                            dragItemTopOffset = 0;

                        // UA 20/11/2014: Position the drag items
                        // UA 26/01/2016: Updated to cater for possibly not yet loaded images
                        // UA 24/02/2016: Updated - using imagesLoaded library
                        function layoutDragItems() {
                            requirejs([
                                "imagesloaded"
                            ], function(imagesLoaded) {
                                imagesLoaded(dragContainer[0], function() {
                                    dragItems.each(function(i) {
                                        var dragItem = $(this),
                                            imageElm = dragItem.find('img,object,svg'),
                                            imageHeight = imageElm.height() || imageElm.outerHeight();

                                        //margin: 0,
                                        //position: 'absolute',
                                        dragItem.css({
                                            top: dragItemTopOffset,
                                            left: 0
                                        });
                                        dragItemTopOffset += parseInt(imageHeight, 10) + 12;
                                    });
                                });
                            });
                        }

                        //Can drop take place
                        function canDrop(dragTarget, dropTarget) {
                            return notMaxChoice(dragTarget, dropTarget);
                        }

                        //Temporary effect to show drop targets
                        function showDestination(mode, insertNode) {
                            if (mode) {
                                dropItems.each(function(index, dropItem) {
                                    dropItem = $(dropItem);
                                    if (canDrop(insertNode, dropItem)) {
                                        dropItem.attrNS('connect:availableTarget', "true");
                                    }
                                });
                            } else {
                                dropItems.each(function(index, dropItem) {
                                    dropItem = $(dropItem);
                                    if (canDrop(insertNode, dropItem)) {
                                        dropItem.attrNS('connect:availableTarget', "false");
                                    }
                                });
                            }
                        }

                        //Temporary effect to show float items
                        function showFloat(mode, dragObject) {
                            if (dragObject.floatingItems.length !== 0) {
                                if (mode) {
                                    dragObject.floatingItems[floatCursor].item.attrNS('connect:currentFloat', "true");
                                } else {
                                    dragObject.floatingItems[floatCursor].item.attrNS('connect:currentFloat', "false");
                                }
                            }
                        }

                        //Create and save multiple cardinality array
                        function saveMultipleResponse(responseObject) {
                            var responseArray = [],
                                pois = responseObject.multiItems || responseObject.floatingItems;
                            pois.forEach(function(interaction) {
                                responseArray.push(interaction.position);
                            });
                            responseObject.responseData.responseVariable.setValue(responseArray);
                        }

                        function fixObjects(parentObject, objectElements, isDrop) {
                            if (typeof isDrop === "undefined") {
                                isDrop = false;
                            }

                            var divNode;
                            var newNode;
                            var isSwf = new RegExp("\\b\\.swf\\b");

                            //Create a document fragment and use this to build
                            //the new node layout ("object" and "div")
                            var docFragment = document.createDocumentFragment();

                            //Create an accompanying "div" node for each object. Set the
                            //"height" and "width" styles on this "div" using the "height"
                            //and "width" attributes taken from the "object" node
                            objectElements.each(function(index, objectElement) {
                                objectElement = $(objectElement);
                                divNode = $.ulib.div();

                                if (isDrop) {
                                    var elementClass = objectElement.attr('connect:class');
                                    objectElement.removeAttr('connect:class');
                                    divNode.attrNS('connect:class', elementClass);
                                }

                                divNode.css({
                                    height: objectElement.attr('height') + "px",
                                    width: objectElement.attr('width') + "px"
                                });

                                //Append the "div" and "object" to the document fragment
                                //and in turn, append the fragment to the drag node
                                docFragment.appendChild(divNode[0]);
                                docFragment.appendChild(objectElement[0]);
                                parentObject.append(docFragment);

                                if (isDrop) {
                                    for (var i = 0; i < parentObject[0].childNodes.length - 2; i++) {
                                        parentObject.append(parentObject.firstChild());
                                    }
                                }

                                //Attach a "param" node to all ".swf" nodes. This "param"
                                //node value is used to control transparency
                                if (isSwf.test(objectElement.attr('data'))) {
                                    newNode = $.param();
                                    newNode.attr('name', 'wmode');
                                    newNode.attr('value', 'transparent');
                                    objectElement.append(newNode);
                                    //Force transparency to take effect by removing and
                                    //re-attaching the object "data" source
                                    objectElement.copyAttributes(objectElement);
                                }
                            });

                            if (isDrop) {
                                return divNode;
                            }
                        }

                        //Get drag node associated with a given insert node
                        function getDragNode(insertNode) {
                            var dragNode;
                            dragObjects.forEach(function(dragObject) {
                                if (dragObject.insertNode[0] === insertNode[0]) {
                                    dragNode = dragObject.dragNode;
                                }
                            });
                            return dragNode;
                        }

                        //Get drag object associated with a given drag node
                        function checkDragObject(dragNode) {
                            var localDragObject;
                            dragObjects.forEach(function(dragObject) {
                                if (dragObject.dragNode[0] === dragNode[0]) {
                                    localDragObject = dragObject;
                                }
                            });
                            return localDragObject;
                        }

                        //Get the index of a floating item associated with a given drag object
                        function getFloatItem(dragObject, floatItem) {
                            var dragIndex = -1,
                                dragCount = 0;
                            dragObject.floatingItems.forEach(function(value) {
                                if (value.item === floatItem) {
                                    dragIndex = dragCount;
                                }
                                dragCount++;
                            });
                            return dragIndex;
                        }

                        //Get the index of a multiple-cardinality item associated with a given drag object
                        function getMultiItem(dragObject, multiItem) {
                            var dragIndex = -1,
                                dragCount = 0;
                            dragObject.multiItems.forEach(function(value) {
                                if (value.item === multiItem) {
                                    dragIndex = dragCount;
                                }
                                dragCount++;
                            });
                            return dragIndex;
                        }

                        function removeFloatItem(parentDragObject, floatItem) {
                            floatIndex = getFloatItem(parentDragObject, floatItem);
                            if (floatIndex !== -1) {
                                parentDragObject.floatingItems[floatIndex].item.remove();
                                parentDragObject.floatingItems.splice(floatIndex, 1);
                                saveMultipleResponse(parentDragObject);
                                floatCursor = 0;
                            }
                        }

                        function makeDragObject(item) {
                            var dragObject = {},
                                deleteNode,
                                floatingItems = [],
                                dragData = {},
                                responseData = {},
                                insertNode = item.copyNode('ins', false),

                                //Response handling
                                responseIdentifier = item.attr('connect:responseIdentifier') || item.parent().attr('connect:responseIdentifier'),
                                responseVariable = qti.getVariable(responseIdentifier, itemIdentifier),
                                baseType = responseVariable.getBaseType(),
                                cardinality = responseVariable.getCardinality(),
                                valueParsers = $.createHash('point', qti.parsePoint);

                            if (cardinality !== "single" && cardinality !== "multiple" && cardinality !== "ordered") {
                                throw new Error('Invalid cardinality');
                            }

                            if (!valueParsers.has(baseType)) {
                                throw new Error('Invalid baseType');
                            }

                            //responseData.id = responseIdentifier;
                            responseData.id = responseVariable.getIdentifier();
                            responseData.cardinality = cardinality;
                            responseData.responseVariable = responseVariable;
                            responseData.value = function() {
                                return responseVariable.getValue();
                            };
                            responseData.parseValue = valueParsers.get(baseType);

                            fixObjects(item, $('object', item));
                            insertNode.attrNS('connect:class', item.attr('connect:class'));
                            insertNode.attrNS('connect:maxChoices', item.attr('connect:maxChoices'));
                            insertNode.attrNS('connect:responseIdentifier', responseIdentifier);
                            insertNode.attr('draggable', item.attr('draggable'));

                            dragObject.createData = function(localToDelete, event) {
                                var draggedItem;

                                /*jQuery returns an empty array and hence the if condition has to modified
                                 * else it would always be true*/
                                /*if (insertNode.parent()) {*/
                                if (insertNode.parent().length > 0) {
                                    draggedItem = insertNode[0];
                                } else {
                                    draggedItem = item[0];
                                }

                                dragData.toDelete = localToDelete;
                                dragData.floating = false;
                                dragData.exactPosition = exactPosition;
                                dragData.replaceDropped = replaceDropped;
                                dragData.mouseOffset = {
                                    x: 0,
                                    y: 0
                                };

                                if (typeof event !== 'undefined') {
                                    var eCoords = $.getCoordinates(event, draggedItem);

                                    dragData.mouseOffset = {
                                        x: eCoords.mouseX - eCoords.x1,
                                        y: eCoords.mouseY - eCoords.y1
                                    };
                                    if (event.dataTransfer && event.dataTransfer.mozSetDataAt) {
                                        //Needed to effect drag/drop but globalDataObject now carries
                                        //dragged object information
                                        event.dataTransfer.mozSetDataAt('dragData', dragData, 0);
                                    }
                                }

                                //Assign dragObject to the globalDataObject. The globalDataObject
                                //represents the drabObject actually being dragged by the mouse
                                //or keyboard
                                globalDataObject = dragObject;
                            };

                            dragObject.doDrag = function() {
                                deleteNode = null;

                                if (item.contents().length !== 0) {
                                    var firstChild = item.firstChild();
                                    if (firstChild.localName() === "del") {
                                        deleteNode = firstChild;
                                    }
                                }

                                if (!deleteNode) {
                                    deleteNode = $.ulib.del();
                                    item.append(deleteNode);

                                    while (item.contents().length > 1) {
                                        deleteNode.append(item.firstChild());
                                    }

                                    item.attr('draggable', "false");
                                    //ARIA - grabbed attribute
                                    item.attr('aria-grabbed', "true");
                                }
                            };

                            dragObject.undoDrag = function() {
                                if (deleteNode) {
                                    while (deleteNode.contents().length > 0) {
                                        item.append(deleteNode.firstChild());
                                    }
                                    deleteNode.remove();
                                }

                                item.attr('draggable', "true");
                                //ARIA - grabbed attribute
                                item.attr('aria-grabbed', "false");

                                /*jQuery returns an empty array and hence the if condition has to modified
                                 * else it would always be true*/
                                /*if (insertNode.parent()) {*/
                                if (insertNode.parent().length > 0) {
                                    var dragParent = insertNode.parent();
                                    if (this.multiItems) {
                                        multiIndex = getMultiItem(this, insertNode);
                                        if (multiIndex !== -1) {
                                            this.multiItems[multiIndex].position = undefined;
                                        }
                                        saveMultipleResponse(this);
                                    } else {
                                        responseValue = responseData.parseValue("");
                                        responseVariable.setValue(responseValue);
                                    }
                                    insertNode.remove();
                                }
                                globalDataObject = null;
                            };

                            dragObject.insertNode = insertNode;
                            dragObject.dragNode = item;
                            dragObject.floatingItems = floatingItems;
                            dragObject.dragData = dragData;
                            dragObject.responseData = responseData;
                            dragObjects.push(dragObject);

                            return dragObject;
                        }

                        function getDragObject(item) {
                            var dragObject = checkDragObject(item);

                            if (!dragObject) {
                                dragObject = makeDragObject(item);
                            }
                            return dragObject;
                        }

                        //Get drop object associated with a given drop node
                        function getDropObject(dropNode) {
                            var localDropObject;
                            dropObjects.forEach(function(dropObject) {
                                if (dropObject.dropNode[0] === dropNode[0]) {
                                    localDropObject = dropObject;
                                }
                            });
                            return localDropObject;
                        }

                        var isDragItem = new RegExp("\\b" + dragTargetClass + "\\b");

                        dropItems.each(function(index, dropItem) {
                            dropItem = $(dropItem);

                            //Used to store the globalDataObject locally when drag item is dropped
                            var localDataObject;

                            var gapIdentifier = dropItem.attr('connect:identifier');

                            //Make "object" elements selectable
                            //if (dropItem.localName() === "object") { ####Temporary fix####
                            /* if (dropItem[0].nodeName === "object") {
    						//var objectElements = [];
    						//objectElements.push(dropItem[0]);
    						//dropItem = fixObjects(dropItem.parent(), objectElements, true);
    						dropItem = fixObjects(dropItem.parent(), dropItem, true);
    						dropItems[index] = dropItem[0];
                        } */

                            function dragStop(event) {
                                //Make sure mouse is over drop target and not a dropped node
                                function inBounds() {
                                    var eCoords = $.getCoordinates(event, dropItem[0]);

                                    if ((eCoords.mouseX < eCoords.x1) || (eCoords.mouseX > eCoords.x2) ||
                                        (eCoords.mouseY < eCoords.y1) || (eCoords.mouseY > eCoords.y2)) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }

                                if (inBounds()) {
                                    //Check for null object - happens if different object type is dropped
                                    if (globalDataObject.insertNode) {
                                        //Can the DragTarget be dropped here?
                                        if (canDrop(globalDataObject.insertNode, dropItem)) {
                                            event.preventDefault();
                                        }
                                    }
                                }
                            }

                            var drop = function(event, dropPosition) {
                                var dragData = globalDataObject.dragData,
                                    floatDataObject;
                                localDataObject = globalDataObject;
                                globalDataObject = null;

                                var draggedItem = localDataObject.insertNode;
                                var draggedPosition = dragData.mouseOffset;
                                var insertWidth = Math.round(parseInt($('img,object,svg', draggedItem).attr('width'), 10));

                                function setPosition() {
                                    var eCoords = $.getCoordinates(event, dropItem[0]),
                                        xOffset, yOffset;

                                    if (eCoords.mouseX !== 0 && eCoords.mouseY !== 0) {
                                        xOffset = eCoords.mouseX - eCoords.x1 - draggedPosition.x;
                                        yOffset = eCoords.mouseY - eCoords.y1 - draggedPosition.y;
                                    } else {
                                        xOffset = Math.round((parseInt(dropItem[0].clientWidth, 10) / 2) - (insertWidth / 2));
                                        yOffset = Math.round(parseInt(dropItem[0].clientHeight, 10) / 2);
                                    }

                                    return {
                                        top: yOffset,
                                        left: xOffset
                                    };
                                }

                                //Check for null object - happens if different object type is dropped
                                if (draggedItem) {
                                    if (isDragItem.test(draggedItem.attr('connect:class'))) {
                                        //If no event, then manually setting previous response values.
                                        //Here, the mouseoffset value contains the actual point information
                                        if (event) {
                                            if (dropPosition) {
                                                draggedPosition = {
                                                    top: Math.round(dropPosition.top), // UA 25/07/2014: because in some browsers (Chrome) this will be a floating point value
                                                    left: Math.round(dropPosition.left) // ditto
                                                };
                                            } else {
                                                draggedPosition = setPosition();
                                            }
                                        } else {
                                            draggedPosition = {
                                                top: draggedPosition.y,
                                                left: draggedPosition.x
                                            };
                                        }

                                        if (!dragData.floating && !dragData.toDelete) {
                                            //var draggedParent = draggedItem;
                                            draggedItem = draggedItem.copyNode('ins', true);
                                            floatDataObject = getDragObject(draggedItem);
                                            floatDataObject.insertNode = draggedItem;
                                            floatDataObject.parent = localDataObject;

                                            //Store reference to floating item and position
                                            responseValue = localDataObject.responseData.parseValue(draggedPosition.left + " " + draggedPosition.top);
                                            localDataObject.floatingItems.push({
                                                item: draggedItem,
                                                position: responseValue
                                            });

                                            draggedItem.dragstart(function(event) {
                                                floatCursor = getFloatItem(floatDataObject.parent, draggedItem);
                                                showFloat(false, floatDataObject.parent);
                                                showDestination(true, draggedItem);
                                                floatDataObject.createData(false, event);
                                                floatDataObject.dragData.floating = true;
                                                globalDataObject = floatDataObject;
                                                if (event && event.dataTransfer && event.dataTransfer.mozSetDataAt) {
                                                    event.dataTransfer.mozSetDataAt('dragData', globalDataObject, 0);
                                                }
                                            });

                                            draggedItem.dragend(function(event) {
                                                showDestination(false, draggedItem);
                                                //If drag was unsuccessful
                                                if (event && event.dataTransfer && event.dataTransfer.dropEffect === "none") {
                                                    floatIndex = getFloatItem(floatDataObject.parent, draggedItem);
                                                    if (floatIndex !== -1) {
                                                        localResponseObject = floatDataObject.parent;
                                                        localResponseObject.floatingItems.splice(floatIndex, 1);
                                                        saveMultipleResponse(localResponseObject);
                                                        floatCursor = 0;
                                                    }
                                                    draggedItem.remove();
                                                }
                                            });
                                            /*} else if (dragData.action === "add" && localDataObject.multiItems) {
                                                //Store reference to multiple-cardinality item and position
                                                responseValue = localDataObject.responseData.parseValue(draggedPosition.left + " " + draggedPosition.top);
                                                localDataObject.multiItems.push({item:draggedItem, position: responseValue});*/
                                        }

                                        //Set the exact coordinate drop position of drag target
                                        if (dragData.exactPosition) {
                                            draggedItem.css({
                                                top: draggedPosition.top,
                                                left: draggedPosition.left
                                            });
                                        }

                                        //Save response value
                                        responseValue = localDataObject.responseData.parseValue(draggedPosition.left + " " + draggedPosition.top);

                                        if (responseValue !== undefined) {
                                            if (localDataObject.responseData.cardinality === "single") {
                                                localDataObject.responseData.responseVariable.setValue(responseValue);
                                            } else {
                                                localResponseObject = localDataObject;
                                                if (localResponseObject.parent) {
                                                    localResponseObject = localResponseObject.parent;
                                                    floatIndex = getFloatItem(localResponseObject, draggedItem);
                                                    if (floatIndex !== -1) {
                                                        localResponseObject.floatingItems[floatIndex].position = responseValue;
                                                    }
                                                } else if (localResponseObject.multiItems) { //dragData.action === "update" && 
                                                    multiIndex = getMultiItem(localResponseObject, draggedItem);
                                                    if (multiIndex !== -1) {
                                                        localResponseObject.multiItems[multiIndex].position = responseValue;
                                                    }
                                                }
                                                saveMultipleResponse(localResponseObject);
                                            }
                                        }

                                        if (dropItem.children().length !== 0) {
                                            if (dragData.toDelete ||
                                                dropItem.firstChild()[0].nodeType !== 1) {
                                                //Replace insert node where appropriate
                                                if (dragData.replaceDropped) {
                                                    //Recover drag node related to dragged "ins" node
                                                    var relatedDragItem = getDragNode(dropItem.firstChild());
                                                    if (relatedDragItem) {
                                                        //relatedDragItem = $(relatedDragItem);
                                                        var replaceNode = relatedDragItem.firstChild();
                                                        while (replaceNode.children().length !== 0) {
                                                            relatedDragItem.append(replaceNode.firstChild());
                                                        }
                                                        replaceNode.remove();
                                                        relatedDragItem.attr('draggable', "true");
                                                        //ARIA - grabbed attribute
                                                        relatedDragItem.attr('aria-grabbed', "false");
                                                    }
                                                    dropItem.firstChild().remove();
                                                }
                                            }
                                        }
                                        dropItem.append(draggedItem);
                                        dropItem[0].focus();

                                        //Locate all object nodes and then detach and re-attach the "data"
                                        //attributes to force the DOM to update properly. Without this,
                                        //the link between the object and its data source is lost
                                        var objectList = $('object', draggedItem[0]);
                                        objectList.each(function(index, objectElement) {
                                            objectElement = $(objectElement);
                                            objectElement.copyAttributes(objectElement);
                                        });
                                        if (event) {
                                            event.preventDefault();
                                        }
                                    }
                                }

                                return floatDataObject;
                            };

                            globalDropHandler = drop;

                            dropItem.dragenter(dragStop);
                            dropItem.dragover(dragStop);
                            dropItem.drop(drop);
                            dropItem.focus(focus);
                            dropItem.blur(blur);

                            var dropObject = {},
                                targetResponseId, currentAreaMapping;
                            dropObject.drop = drop;
                            dropObject.dropNode = dropItem;
                            dropObjects.push(dropObject);

                            if (poasMode) {
                                dropObject.areaMappings = dropItem.data('area-mappings');
                                if (dropObject.areaMappings) {
                                    targetResponseId = dragItems.eq(0).attr('connect:responseIdentifier');
                                    currentAreaMapping = dropObject.areaMappings[targetResponseId];
                                    setupAreasDisplay(dropItem[0], currentAreaMapping.areas);
                                }
                            }
                        });

                        dragItems.each(function(index, dragItem) {
                            dragItem = $(dragItem);

                            //ARIA - role attribute
                            dragItem.attr('role', 'option');
                            var dragObject = getDragObject(dragItem),
                                id = dragObject.responseData.id,

                                //Override delete setting for each drag item
                                toDeleteLocal = parseInt(dragItem.attr('connect:maxChoices'), 10) === 1,

                                //Load existing response
                                loadedResponses = dragObject.responseData.value();
                            if (loadedResponses !== undefined) {
                                if ($.isArray(loadedResponses)) {
                                    loadedResponses.ulibEach(function(loadedResponse) {
                                        dragObject.createData(toDeleteLocal);
                                        dragObject.insertNode.attr('draggable', "true");
                                        //ARIA - grabbed attribute
                                        dragObject.insertNode.attr('aria-grabbed', "false");
                                        dragObject.dragData.mouseOffset.x = loadedResponse.x;
                                        dragObject.dragData.mouseOffset.y = loadedResponse.y;
                                        globalDropHandler();
                                    });
                                } else {
                                    dragObject.createData(toDeleteLocal);
                                    dragObject.dragData.mouseOffset.x = loadedResponses.x;
                                    dragObject.dragData.mouseOffset.y = loadedResponses.y;
                                    if (toDeleteLocal) {
                                        dragObject.doDrag();
                                    }
                                    globalDropHandler();
                                }
                            }

                            if (dragObject.responseData.cardinality === "ordered") {
                                if (!multipleCardinalityInteractions[id]) {
                                    multipleCardinalityInteractions[id] = {
                                        "dragNodes": 0
                                    };
                                }
                                multipleCardinalityInteractions[id].dragNodes++;
                            }

                            function dragStart(event) {
                                showDestination(true, dragObject.insertNode);
                                if (globalDataObject && globalDataObject.dragData.toDelete) {
                                    showDestination(false, globalDataObject.insertNode);
                                    globalDataObject.undoDrag();
                                }
                                dragObject.createData(toDeleteLocal, event);
                            }

                            function dragEnd(event) {
                                showDestination(false, dragObject.insertNode);

                                //Only delete drag nodes marked to be deleted
                                if (toDeleteLocal) {
                                    dragObject.doDrag();

                                    //If drag was unsuccessful
                                    if (event && event.dataTransfer && event.dataTransfer.dropEffect === "none") {
                                        dragObject.undoDrag();
                                        dragItem[0].focus();
                                    }
                                }
                            }

                            function keyDown(event) {
                                var keyCode = event.keyCode;
                                var shiftKey = event.shiftKey;

                                //Select/deselect the drag object
                                if (keyCode === 32) {
                                    if (!dragObject.insertNode.parent()) {
                                        if (!arrowCursor) {
                                            dragObject.createData(toDeleteLocal);
                                            if (toDeleteLocal) {
                                                dragObject.doDrag();
                                            }
                                            globalDropHandler(event);
                                            arrowCursor = true;

                                            if (dragObject.floatingItems.length > 0) {
                                                floatCursor = dragObject.floatingItems.length - 1;
                                                showFloat(true, dragObject);
                                            }
                                        } else {
                                            if (dragObject.floatingItems.length > 0) {
                                                showFloat(false, dragObject);
                                                floatCursor = 0;
                                            }
                                            arrowCursor = false;
                                        }
                                    } else {
                                        if (arrowCursor) {
                                            arrowCursor = false;
                                        } else {
                                            arrowCursor = true;
                                        }
                                    }

                                    event.preventDefault();
                                }

                                //Remove the selected drag object
                                if (keyCode === 46) {
                                    if (dragObject.floatingItems.length === 0) {
                                        dragObject.undoDrag();
                                        arrowCursor = false;
                                    } else {
                                        dragObject.floatingItems[floatCursor].item.remove();
                                        dragObject.floatingItems.splice(floatCursor, 1);
                                        localResponseObject = dragObject;
                                        saveMultipleResponse(localResponseObject);
                                        if (dragObject.floatingItems.length > 0) {
                                            floatCursor = 0;
                                            showFloat(true, dragObject);
                                        } else {
                                            arrowCursor = false;
                                        }
                                    }

                                    event.preventDefault();
                                }

                                //Tab between floating items
                                if (keyCode === 9 && arrowCursor) {
                                    showFloat(false, dragObject);
                                    if (!shiftKey) {
                                        floatCursor++;
                                        if (floatCursor === dragObject.floatingItems.length) {
                                            floatCursor = 0;
                                        }
                                    } else {
                                        floatCursor--;
                                        if (floatCursor < 0) {
                                            floatCursor = dragObject.floatingItems.length - 1;
                                        }
                                    }
                                    showFloat(true, dragObject);
                                    event.preventDefault();
                                }

                                //Move the drag object using the arrow keys
                                if (arrowCursor) {
                                    var localKeyCode = event.keyCode;
                                    var currentX;
                                    var currentY;
                                    var sLength;
                                    var keyObject;

                                    if (dragObject.floatingItems.length === 0) {
                                        keyObject = dragObject.insertNode;
                                    } else {
                                        keyObject = dragObject.floatingItems[floatCursor].item;
                                    }

                                    var getX = function() {
                                        var localX = keyObject[0].style.left;
                                        sLength = localX.length;
                                        return parseInt(localX.substring(0, sLength - 2), 10);
                                    };

                                    var getY = function() {
                                        var localY = keyObject[0].style.top;
                                        sLength = localY.length;
                                        return parseInt(localY.substring(0, sLength - 2), 10);
                                    };

                                    currentX = getX();
                                    currentY = getY();

                                    if (localKeyCode === 37) {
                                        currentX = getX() - 1;
                                        keyObject.css({
                                            left: currentX + "px"
                                        });
                                        event.preventDefault();
                                    }

                                    if (localKeyCode === 38) {
                                        currentY = getY() - 1;
                                        keyObject.css({
                                            top: currentY + "px"
                                        });
                                        event.preventDefault();
                                    }

                                    if (localKeyCode === 39) {
                                        currentX = getX() + 1;
                                        keyObject.css({
                                            left: currentX + "px"
                                        });
                                        event.preventDefault();
                                    }

                                    if (localKeyCode === 40) {
                                        currentY = getY() + 1;
                                        keyObject.css({
                                            top: currentY + "px"
                                        });
                                        event.preventDefault();
                                    }

                                    //Save response value
                                    responseValue = dragObject.responseData.parseValue(currentX + " " + currentY);

                                    if (responseValue !== undefined) {
                                        if (dragObject.responseData.cardinality === "single") {
                                            dragObject.responseData.responseVariable.setValue(responseValue);
                                        } else {
                                            localResponseObject = dragObject;
                                            floatIndex = getFloatItem(localResponseObject, keyObject);
                                            if (floatIndex !== -1) {
                                                localResponseObject.floatingItems[floatIndex].position = responseValue;
                                            }
                                            saveMultipleResponse(localResponseObject);
                                        }
                                    }
                                }
                            }

                            //Attach event handlers to drag node and insert node
                            dragItem.dragstart(dragStart); //.on('dragstart', dragStart)
                            dragItem.dragend(dragEnd); //.on('dragend', dragEnd)
                            dragItem.attr('draggable', "true");
                            //ARIA - grabbed attribute
                            dragItem.attr('aria-grabbed', "false");
                            dragItem.focus(focus);
                            dragItem.blur(blur);
                            dragItem.keydown(keyDown);

                            dragObject.insertNode.dragstart(dragStart); //.on('dragstart', dragStart)
                            dragObject.insertNode.dragend(dragEnd); //.on('dragend', dragEnd)
                            dragObject.insertNode.attr('draggable', "true");
                            //ARIA - grabbed attribute
                            dragObject.insertNode.attr('aria-grabbed', "false");
                            dragObject.insertNode.focus(focus);
                            dragObject.insertNode.blur(blur);
                        });

                        function updateResponsesTable(dropItem, droppedNode, remove) {
                            var rowCount = 0;
                            dropItem.find('ins').each(function(index, ins) {
                                var $dn = $(ins),
                                    posStr,
                                    uid = $dn.attr('data-uid'),
                                    row = poasTable.find('tbody tr[data-uid="' + uid + '"]');
                                if (row.length === 0) {
                                    row = poasTable.find('tbody tr.template').clone();
                                    row.attr('data-uid', uid);
                                    row.children('.responseObject').text(++rowCount);
                                    row.removeClass('template').appendTo(poasTable.find('tbody'));
                                } else if (remove) {
                                    if (ins === droppedNode[0]) {
                                        row.remove();
                                    } else {
                                        row.children('.responseObject').text(++rowCount);
                                    }
                                    return true;
                                } else {
                                    rowCount++;
                                }
                                if (ins === droppedNode[0]) {
                                    posStr = '(' + (ins.spatial.centerPoint ? ins.spatial.centerX + ', ' + Math.round(ins.spatial.centerY) : ins.spatial.left + ', ' + Math.round(ins.spatial.top)) + ')';
                                    row.children('.position').text(posStr);
                                }
                                row.children('.mappedArea').text($dn.attr('data-area'));
                                row.children('.value').text($dn.attr('data-value'));
                            });
                        }

                        // jQuery UI powered drag-n-drop handlers
                        function $makeDraggable(elm, toDelete, options) {
                            var settings = {
                                revert: "invalid",
                                cursor: "move",
                                helper: "clone",
                                opacity: 0.5,
                                cancel: 'div[connect\\:class~="positionObjectStage"]:not(#' + $interactionStage.attr('id') + ') .ui-draggable, ' +
                                    'div#' + $interactionStage.attr('id') + '[connect\\:class~="positionObjectStage"] .ui-draggable:has(del)',
                                start: function(event, ui) {
                                    var $this = $(this),
                                        dragNode, dragObject, action;
                                    if ($this.is('ins')) {
                                        dragNode = getDragNode($this);
                                        $this.addClass('over-droppable');
                                        action = "update";
                                    } else {
                                        dragNode = $this;
                                        action = "add";
                                    }
                                    dragObject = getDragObject(dragNode);
                                    dragObject.createData(toDelete, event);
                                    if (!toDelete && dragObject.parent) {
                                        dragObject.dragData.floating = true;
                                    }
                                    //dragObject.dragData.action = action;
                                    //dragNode.dragstart(event);
                                },
                                stop: function(event, ui) {
                                    var $this = $(this),
                                        dragNode, dragObject,
                                        dropContainer, dropObject, areasDisplay, uid, targetResponseId, currentAreaMapping;
                                    if ($this.is('ins')) {
                                        dragNode = getDragNode($this);
                                        /* dragNode.dragend(event); */
                                        dragObject = getDragObject(dragNode);
                                        if ($this.is('.over-droppable')) {
                                            $this.removeClass('over-droppable');
                                        } else {
                                            if (poasMode) {
                                                dropContainer = $this.parent();
                                                updateResponsesTable(dropContainer, $this, true);

                                                dropObject = getDropObject(dropContainer);
                                                if (dropObject && dropObject.areaMappings) {
                                                    areasDisplay = dropContainer.find('svg[class="areasDisplay"]');
                                                    areasDisplay.find('line').remove();
                                                    uid = $this.attr('data-uid');
                                                    targetResponseId = $this.attr('connect:responseIdentifier');
                                                    currentAreaMapping = dropObject.areaMappings[targetResponseId];
                                                    currentAreaMapping.areas.forEach(function(area, index) {
                                                        if (area.currentObject && area.currentObject === uid) {
                                                            area.currentObject = null;
                                                        }
                                                    });
                                                }
                                            }
                                            if (dragObject.parent) {
                                                if (numDroppedItems() === totalMaxChoices) {
                                                    dragObject.parent.undoDrag();
                                                }
                                                removeFloatItem(dragObject.parent, dragNode);
                                            } else {
                                                dragObject.undoDrag();
                                            }
                                        }
                                    }
                                },
                                appendTo: interactionStage,
                                zIndex: 100
                            };
                            if (options) {
                                $.extend(settings, options);
                            }
                            elm.draggable(settings);
                        }
                        dragItems.each(function() {
                            var $this = $(this),
                                dragObject = getDragObject($this),
                                id = dragObject.responseData.id,
                                toDeleteLocal = parseInt($this.attr('connect:maxChoices'), 10) === 1;
                            $makeDraggable($this, toDeleteLocal);

                            if (multipleCardinalityInteractions[id] && multipleCardinalityInteractions[id].dragNodes > 1) {
                                if (!multipleCardinalityInteractions[id].multiItems) {
                                    multipleCardinalityInteractions[id].multiItems = [];
                                }
                                multipleCardinalityInteractions[id].multiItems.push({
                                    item: dragObject.insertNode,
                                    position: undefined
                                });
                                dragObject.multiItems = multipleCardinalityInteractions[id].multiItems;
                            }
                        });
                        dropItems.droppable({
                            hoverClass: "availableTarget",
                            accept: function(draggable) {
                                return $interactionStage.has(draggable).length > 0;
                            },
                            over: function(event, ui) {
                                ui.draggable.addClass('over-droppable');
                            },
                            out: function(event, ui) {
                                ui.draggable.removeClass('over-droppable');
                            },
                            drop: function(event, ui) {
                                var $this = $(this),
                                    dropObject = getDropObject($this),
                                    totalDropped, dragObject, dragNode, floatObject,
                                    droppedNode, centerPoint, spatialAttrs, areasDisplay, uid, targetResponseId, currentAreaMapping;

                                if (ui.draggable.is('ins')) {
                                    dragNode = getDragNode(ui.draggable);
                                } else {
                                    totalDropped = numDroppedItems() + 1;
                                    dragNode = ui.draggable;
                                }
                                dragObject = getDragObject(dragNode);
                                if (dragObject.dragData.toDelete || (totalDropped && (totalDropped === totalMaxChoices))) {
                                    dragObject.doDrag();
                                }

                                floatObject = dropObject.drop(event, ui.position);

                                if (ui.draggable.is('ins')) {
                                    droppedNode = dragNode;
                                    if (dragObject.parent) {
                                        dragNode = dragObject.parent.dragNode;
                                    }
                                } else {
                                    if (floatObject) {
                                        droppedNode = floatObject.insertNode;
                                        $makeDraggable(droppedNode, floatObject.dragData.toDelete, {
                                            revert: false
                                        });
                                    } else {
                                        droppedNode = dragObject.insertNode;
                                        $makeDraggable(droppedNode, dragObject.dragData.toDelete, {
                                            revert: false
                                        });
                                    }
                                }

                                if (poasMode) {
                                    if (dropObject.areaMappings) {
                                        centerPoint = dragNode.attr('connect:centerPoint');
                                        spatialAttrs = {
                                            top: ui.position.top,
                                            left: ui.position.left,
                                            width: ui.draggable.width(),
                                            height: ui.draggable.height(),
                                            centerX: ui.position.left + (ui.draggable.width() / 2),
                                            centerY: ui.position.top + (ui.draggable.height() / 2),
                                            centerPoint: (centerPoint === "centre" ? true : false)
                                        };

                                        areasDisplay = $this.find('svg[class="areasDisplay"]');
                                        areasDisplay.find('line').remove();
                                        d3.select(areasDisplay[0]).append('line').attr({
                                            "x1": 0,
                                            "y1": spatialAttrs.centerY,
                                            "x2": $this.width(),
                                            "y2": spatialAttrs.centerY,
                                            "stroke": "blue",
                                            "stroke-width": 1
                                        });
                                        d3.select(areasDisplay[0]).append('line').attr({
                                            "x1": spatialAttrs.centerX,
                                            "y1": 0,
                                            "x2": spatialAttrs.centerX,
                                            "y2": $this.height(),
                                            "stroke": "blue",
                                            "stroke-width": 1
                                        });

                                        droppedNode[0].spatial = spatialAttrs;
                                        uid = droppedNode.attr('data-uid');
                                        if (!uid) {
                                            uid = 'dn-' + new Date().getTime();
                                            droppedNode.attr({
                                                'data-uid': uid,
                                                'data-area': '',
                                                'data-value': ''
                                            });
                                        } else {
                                            droppedNode.attr({
                                                'data-area': '',
                                                'data-value': ''
                                            });
                                        }
                                        targetResponseId = droppedNode.attr('connect:responseIdentifier');
                                        currentAreaMapping = dropObject.areaMappings[targetResponseId];
                                        currentAreaMapping.areas.forEach(function(area, index) {
                                            if (!currentAreaMapping.multiple && (!area.currentObject || area.currentObject === uid)) {
                                                if (checkAreaMapping(spatialAttrs, area)) {
                                                    droppedNode.attr('data-area', (index + 1) + " (" + area.coords + ")");
                                                    droppedNode.attr('data-value', area.mappedValue);
                                                    area.currentObject = uid;
                                                } else {
                                                    area.currentObject = null;
                                                }
                                            }
                                        });
                                    }
                                    updateResponsesTable($this, droppedNode);
                                }
                            }
                        });

                        if (qti.preloadTestContents) {
                            qti.screens[itemIdentifier].init.push(function() {
                                layoutDragItems();
                            });
                        } else {
                            layoutDragItems();
                        }
                    })();

                    $interactionStage.keydown(function(event) {
                        var keyCode = event.keyCode;

                        if (!arrowCursor) {
                            if ((keyCode === 39 || keyCode === 40)) {
                                focusIndex++;
                                if (focusIndex === tabList.length) {
                                    focusIndex = 0;
                                }

                                tabList[focusIndex].focus();
                                event.preventDefault();
                            }

                            if ((keyCode === 37 || keyCode === 38)) {
                                focusIndex--;
                                if (focusIndex === -1) {
                                    focusIndex = tabList.length - 1;
                                }

                                tabList[focusIndex].focus();
                                event.preventDefault();
                            }
                        }
                    });

                    //Set focus on first choice
                    //focusIndex = 0; <-- UA 05/06/2014: already initialised above
                    tabList[focusIndex].focus();
                });
            };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Position Object iteractions", "positionObjectInt");
    })();

    (function() {

        var getSizeSpan;
        (function() {
            var sizeSpan;
            getSizeSpan = function() {
                if (sizeSpan) {
                    return sizeSpan;
                } else {
                    sizeSpan = $.ulib.span();
                    sizeSpan.css({
                        position: 'absolute',
                        visibility: 'hidden',
                        left: '-100000px',
                        whiteSpace: 'pre'
                    });
                    $(document.body).append(sizeSpan);
                    return sizeSpan;
                }
            };
        }());

        var loadItemFunc = function(itemBody) {
            //var itemBody = itemObj.body;
            var sizeSpan = getSizeSpan();
            var itemIdentifier = itemBody.attr('connect:identifier');

            //********** Flags To Control Operation **********

            //Delete the drag node associated with the dropped
            //insert node
            var toDelete = true;

            //Place the dropped insert node at a specific coordinate
            //position in the drop target
            var exactPosition = false;

            //Replace existing dropped insert node with newly dropped
            //insert node
            var replaceDropped = true;

            //************************************************

            //Define drag and drop targets 
            var dragTargetClass = "gapImg";
            var dropTargetClass = "associableHotspot";
            var dragContainerClass = "ul";
            var tabClass = "*[connect\\:class~='associableChoice']";

            //Locate drag and drop targets
            var dropItems = itemBody.find("*[connect\\:class~='" + dropTargetClass + "']");
            var dragItems = itemBody.find("*[connect\\:class~='" + dragTargetClass + "']");
            var interactions = itemBody.find("*[connect\\:class~='graphicGapMatchInteraction']");

            interactions.each(function(index, interaction) {
                interaction = $(interaction);

                //Locate the drag target container. This container holds the
                //drag targets. Drag targets removed from drop targets are placed
                //back into this container automatically
                var dragContainer = interaction.find(dragContainerClass);
                //ARIA - role attribute
                dragContainer.attr("role", "listbox");

                //Response handling
                var responseIdentifier = interaction.attr('connect:responseIdentifier');
                var responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                var cardinality = responseVariable.getCardinality();
                var baseType = responseVariable.getBaseType();

                var valueParsers = $.createHash(
                    'directedPair', qti.parseDirectedPair);

                if (cardinality !== "single" && cardinality !== "multiple") {
                    throw new Error('Invalid cardinality');
                }

                if (cardinality === "single" && dropItems.length > 1) {
                    throw new Error('Invalid cardinality');
                }

                if (!valueParsers.has(baseType)) {
                    throw new Error('Invalid baseType');
                }

                var value;
                if (responseVariable.getValue() !== undefined) {
                    value = $.createHash(responseVariable.getValue());
                } else {
                    value = $.createHash();
                }

                //This holds the dragObject of the item being dragged whether
                //by mouse or keyboard
                var globalDataObject;

                //Manage pseudo tab list and focus for accessibility           
                var tabList = $(tabClass);
                var focusIndex = 0;
                var tabIndex = 0;

                tabList.each(function(index, tabItem) {
                    $(tabItem).attr("connect:tabindex", tabIndex);
                    $(tabItem).attr("tabindex", 0);
                    tabIndex++;
                });

                function focus(event) {
                    var item = $(event.target);
                    focusIndex = parseInt(item.attr("connect:tabindex"), 10);
                    //ARIA - selected attribute
                    item.attr("aria-selected", "true");
                }

                function blur(event) {
                    var item = $(event.target);
                    //ARIA - selected attribute
                    item.attr("aria-selected", "false");
                }

                //Set size of Hot Spots
                dropItems.each(function(index, hotSpot) {
                    hotSpot = $(hotSpot);

                    var hotSpotShape = hotSpot.attr("connect:shape");

                    if (hotSpotShape === "rect") {

                        var hotSpotCoords = hotSpot.attr("connect:coords");

                        if (hotSpotCoords) {

                            hotSpotCoords = hotSpot.attr("connect:coords").split(" ");

                            if (hotSpotCoords.length === 4) {

                                var x1Coord = parseInt(hotSpotCoords[0], 10);
                                var y1Coord = parseInt(hotSpotCoords[1], 10);
                                var x2Coord = parseInt(hotSpotCoords[2], 10);
                                var y2Coord = parseInt(hotSpotCoords[3], 10);

                                var hotSpotWidth = Math.abs(x2Coord - x1Coord);
                                var hotSpotHeight = Math.abs(y2Coord - y1Coord);

                                hotSpot.css({
                                    left: x1Coord + "px",
                                    top: y1Coord + "px",
                                    width: hotSpotWidth + "px",
                                    height: hotSpotHeight + "px"
                                });

                            }
                        }
                    }
                });

                //Group match - supports choice "matchGroup" and "identifier" attributes
                function isMatching(dragItem, dropItem) {

                    var dragGroups = dragItem.attr("connect:matchGroup");
                    var dragIdentifier = dragItem.attr("connect:identifier");
                    var dropGroups = dropItem.attr("connect:matchGroup");
                    var dropIdentifier = dropItem.attr("connect:identifier");
                    var checkDrag = new RegExp("\\b" + dragIdentifier + "\\b");
                    var checkDrop = new RegExp("\\b" + dropIdentifier + "\\b");

                    if (((dragGroups === null) || (dragGroups === "")) &&
                        ((dropGroups === null) || (dropGroups === ""))) {
                        return true;
                    } else if (((dragGroups === null) || (dragGroups === "")) &&
                        checkDrag.test(dropGroups)) {
                        return true;
                    } else if (((dropGroups === null) || (dropGroups === "")) &&
                        checkDrop.test(dragGroups)) {
                        return true;
                    } else if (checkDrop.test(dragGroups) &&
                        checkDrag.test(dropGroups)) {
                        return true;
                    } else {
                        return false;
                    }
                }

                //Shuffle - supports gapMatchInteraction "shuffle" and choice "fixed" attributes
                (function() {

                    var doShuffle = dragContainer.attr("connect:shuffle") === "true";

                    if (doShuffle) {
                        var gapChoicesCopy = [];
                        var selectedOption;

                        dragItems.each(function(index, gapChoice) {
                            gapChoice = $(gapChoice);
                            //Only add option to shuffle list if not "fixed"
                            if (gapChoice.attr("connect:fixed") !== "true") {
                                gapChoicesCopy.push(gapChoice[0].cloneNode(true));
                            }
                        });

                        dragItems.each(function(index, gapChoice) {
                            gapChoice = $(gapChoice);
                            //Only move option if not "fixed"
                            if (gapChoice.attr("connect:fixed") !== "true") {
                                selectedOption = Math.floor(Math.random() * gapChoicesCopy.length);
                                dragContainer[0].replaceChild(gapChoicesCopy[selectedOption], gapChoice[0]);
                                gapChoicesCopy.splice(selectedOption, 1);
                            }
                        });

                        //Recreate collection using new order
                        dragItems = $("*[connect\\:class~='" + dragTargetClass + "']");
                    }
                })();

                //Ensure that the interaction remains visible by forcing
                //the parent window or element to scroll
                $.dragScroll(interaction[0]);

                //Drag and Drop 
                //Please note that we use the following terminology to 
                //idenify components of the Drag & Drop mechanism. The
                //dragged "object" is called the drag target. The "object"
                //on which a drag target can be dropped is called the drop
                //target.

                //Drag targets are made up of two parts - the drag node and
                //the insert node. The drag node is the original element set
                //to be draggable. The insert node is a copy of the drag node
                //and is the actual element that gets dropped at the drop
                //target. Insert nodes are created when the Drag & Drop
                //mechanism is initialized.

                //Object elements can cause problems for the Drag & Drop
                //mechanism as they are difficult to select with the mouse.
                //To avoid this problem, if an object element is used as a
                //drag or drop target, the Drag & Drop mechanism creates 
                //accompanying "div" elements. These are placed over the
                //object elements.

                (function() {

                    //Array used to track drag nodes and their respective insert
                    //nodes. This is needed by the "drop and replace" mechanism
                    //where a newly dropped insert node forces a previously
                    //dropped insert node to be removed and its associated drag
                    //node returned to the drag container
                    var dragObjects = [];

                    //Can drop take place
                    function canDrop(dragTarget, dropTarget) {

                        return isMatching(dragTarget, dropTarget);
                    }

                    //Temporary effect to show drop targets
                    function showDestination(mode, insertNode) {

                        if (mode) {
                            dropItems.each(function(index, dropItem) {
                                dropItem = $(dropItem);
                                if (canDrop(insertNode, dropItem)) {
                                    dropItem.attr("connect:availableTarget", "true");
                                }
                            });
                        } else {
                            dropItems.each(function(index, dropItem) {
                                dropItem = $(dropItem);
                                if (canDrop(insertNode, dropItem)) {
                                    dropItem.attr("connect:availableTarget", "false");
                                }
                            });
                        }
                    }

                    function fixObjects(parentObject, objectElements, isDrop) {

                        if (typeof isDrop === "undefined") {
                            isDrop = false;
                        }

                        var divNode;
                        var newNode;
                        var isSwf = new RegExp("\\b\\.swf\\b");

                        //Create a document fragment and use this to build
                        //the new node layout ("object" and "div")
                        var docFragment = document.createDocumentFragment();

                        //Create an accompanying "div" node for each object. Set the 
                        //"height" and "width" styles on this "div" using the "height" 
                        //and "width" attributes taken from the "object" node
                        objectElements.each(function(index, objectElement) {
                            objectElement = $(objectElement);
                            divNode = $.ulib.div();

                            if (isDrop) {
                                var elementClass = objectElement.attr("connect:class");
                                objectElement.attr("connect:class", "");
                                divNode.attr("connect:class", elementClass);
                            }

                            divNode.css({
                                height: objectElement.attr("height") + "px",
                                width: objectElement.attr("width") + "px"
                            });

                            //Append the "div" and "object" to the document fragment
                            //and in turn, append the fragment to the drag node 
                            docFragment.appendChild(divNode[0]);
                            docFragment.appendChild(objectElement[0]);
                            parentObject.append(docFragment);

                            if (isDrop) {
                                for (var i = 0; i < parentObject[0].childNodes.length - 2; i++) {
                                    parentObject.append(parentObject.firstChild());
                                }
                            }

                            //Attach a "param" node to all ".swf" nodes. This "param" 
                            //node value is used to control transparency
                            if (isSwf.test(objectElement.attr("data"))) {
                                newNode = $.param();
                                newNode.attr("name", "wmode");
                                newNode.attr("value", "transparent");
                                objectElement.append(newNode);
                                //Force transparency to take effect by removing and
                                //re-attaching the object "data" source
                                objectElement.copyAttributes(objectElement);
                            }
                        });

                        if (isDrop) {
                            return divNode;
                        }
                    }

                    //Get drag node associated with a given insert node
                    function getDragNode(insertNode) {
                        var dragNode;
                        dragObjects.forEach(function(dragObject) {
                            if (dragObject.insertNode[0] === insertNode[0]) {
                                dragNode = dragObject.dragNode[0];
                            }
                        });
                        return dragNode;
                    }

                    //Get drag object associated with a given drag node
                    function checkDragObject(dragNode) {
                        var localDragObject;
                        dragObjects.forEach(function(dragObject) {
                            if (dragObject.dragNode[0] === dragNode[0]) {
                                localDragObject = dragObject;
                            }
                        });
                        return localDragObject;
                    }

                    function getDragObject(item) {

                        var dragObject = checkDragObject(item);

                        if (!dragObject) {
                            var deleteNode;
                            var insertNode;
                            var dragData = {};
                            dragObject = {};

                            fixObjects(item, $("object", item));
                            insertNode = item.copyNode("ins", false);
                            insertNode.attr("connect:class", item.attr("connect:class"));
                            insertNode.attr("connect:matchMax", item.attr("connect:matchMax"));
                            insertNode.attr("connect:identifier", item.attr("connect:identifier"));
                            insertNode.attr("draggable", item.attr("draggable"));

                            dragObject.createData = function(event) {

                                var draggedItem;

                                if (insertNode.parent()) {
                                    draggedItem = insertNode[0];
                                } else {
                                    draggedItem = item[0];
                                }

                                dragData.toDelete = toDelete;
                                dragData.floating = false;
                                dragData.exactPosition = exactPosition;
                                dragData.replaceDropped = replaceDropped;
                                dragData.mouseOffset = {
                                    x: 0,
                                    y: 0
                                };

                                if (typeof event !== 'undefined') {
                                    var eCoords = $.getCoordinates(event, draggedItem);

                                    dragData.mouseOffset = {
                                        x: eCoords.mouseX - eCoords.x1,
                                        y: eCoords.mouseY - eCoords.y1
                                    };
                                    //Needed to effect drag/drop but globalDataObject now carries
                                    //dragged object information
                                    event.dataTransfer.mozSetDataAt("dragData", dragData, 0);
                                }
                                //Assign dragObject to the globalDataObject. The globalDataObject
                                //represents the drabObject actually being dragged by the mouse
                                //or keyboard
                                globalDataObject = dragObject;
                            };

                            dragObject.doDrag = function() {

                                deleteNode = null;

                                if (item.children().length !== 0) {
                                    var firstChild = item.firstChild();
                                    if (firstChild.localName() === "del") {
                                        deleteNode = firstChild;
                                    }
                                }

                                if (!deleteNode) {

                                    deleteNode = $.del();
                                    item.append(deleteNode);

                                    while (item.children().length > 1) {
                                        deleteNode.append(item.firstChild());
                                    }

                                    item.attr("draggable", "false");
                                    //ARIA - grabbed attribute
                                    item.attr("aria-grabbed", "true");
                                }
                            };

                            dragObject.undoDrag = function() {

                                while (deleteNode.children().length > 0) {
                                    item.append(deleteNode.firstChild());
                                }

                                deleteNode.remove();
                                item.attr("draggable", "true");
                                //ARIA - grabbed attribute
                                item.attr("aria-grabbed", "false");

                                if (insertNode.parent()) {
                                    var dragParent = insertNode.parent();
                                    //Remove response value
                                    var gapIdentifier = dragParent.attr("connect:identifier");
                                    value.remove(gapIdentifier);
                                    if (value.size() !== 0) {
                                        responseVariable.setValue(value);
                                    } else {
                                        responseVariable.setValue(undefined);
                                    }
                                    insertNode.remove();
                                }

                                globalDataObject = null;
                            };

                            dragObject.insertNode = insertNode;
                            dragObject.dragNode = item;
                            dragObject.dragData = dragData;

                            dragObjects.push(dragObject);
                        }
                        return dragObject;
                    }

                    var isDragItem = new RegExp("\\b" + dragTargetClass + "\\b");

                    dragItems.each(function(index, dragItem) {

                        dragItem = $(dragItem);
                        //ARIA - role attribute
                        dragItem.attr("role", "option");
                        var dragObject = getDragObject(dragItem);

                        function dragStart(event) {

                            showDestination(true, dragObject.insertNode);
                            if (globalDataObject && globalDataObject.dragData.toDelete) {
                                showDestination(false, globalDataObject.insertNode);
                                globalDataObject.undoDrag();
                            }
                            dragObject.createData(event);
                        }

                        function dragEnd(event) {

                            showDestination(false, dragObject.insertNode);

                            //Only delete drag nodes marked to be deleted
                            if (toDelete) {

                                dragObject.doDrag();

                                //If drag was unsuccessful
                                if (event.dataTransfer.dropEffect === "none") {
                                    dragObject.undoDrag();
                                    dragItem[0].focus();
                                }
                            }
                        }

                        function keyDown(event) {
                            var keyCode = event.keyCode;

                            if (keyCode === 32) {

                                if (!globalDataObject) {
                                    showDestination(true, dragObject.insertNode);
                                    dragObject.createData();
                                    if (toDelete) {
                                        dragObject.doDrag();
                                    }
                                } else {
                                    showDestination(false, globalDataObject.insertNode);
                                    if (globalDataObject !== dragObject) {
                                        globalDataObject.undoDrag();
                                        showDestination(true, dragObject.insertNode);
                                        dragObject.createData();
                                        if (toDelete) {
                                            dragObject.doDrag();
                                        }
                                    } else {
                                        globalDataObject.undoDrag();
                                    }
                                }

                                event.preventDefault();
                            }
                        }

                        //Attach event handlers to drag node and insert node
                        dragItem.dragstart(dragStart);
                        dragItem.dragend(dragEnd);
                        dragItem.attr("draggable", "true");
                        //ARIA - grabbed attribute
                        dragItem.attr("aria-grabbed", "false");
                        dragItem.focus(focus);
                        dragItem.blur(blur);
                        dragItem.keydown(keyDown);

                        dragObject.insertNode.dragstart(dragStart);
                        dragObject.insertNode.dragend(dragEnd);
                        dragObject.insertNode.attr("draggable", "true");
                        //ARIA - grabbed attribute
                        dragObject.insertNode.attr("aria-grabbed", "false");
                        dragObject.insertNode.focus(focus);
                        dragObject.insertNode.blur(blur);
                    });

                    dropItems.each(function(index, dropItem) {

                        dropItem = $(dropItem);

                        //Used to store the globalDataObject locally when drag item is dropped
                        var localDataObject;

                        var gapIdentifier = dropItem.attr("connect:identifier");

                        //Make "object" elements selectable
                        if (dropItem.localName() === "object") {
                            var objectElements = [];
                            objectElements.push(dropItem[0]);
                            dropItem = fixObjects(dropItem.parent(), objectElements, true);
                        }

                        function dragStop(event) {

                            //Make sure mouse is over drop target and not a dropped node
                            function inBounds() {

                                var eCoords = $.getCoordinates(event, dropItem[0]);

                                if ((eCoords.mouseX < eCoords.x1) || (eCoords.mouseX > eCoords.x2) ||
                                    (eCoords.mouseY < eCoords.y1) || (eCoords.mouseY > eCoords.y2)) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }

                            if (inBounds()) {

                                //Check for null object - happens if different object type is dropped
                                if (globalDataObject.insertNode) {
                                    //Can the DragTarget be dropped here?
                                    if (canDrop(globalDataObject.insertNode, dropItem)) {
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        function drop(event) {

                            var dragData = globalDataObject.dragData;
                            localDataObject = globalDataObject;
                            globalDataObject = null;

                            var draggedItem = localDataObject.insertNode;
                            var draggedPosition = dragData.mouseOffset;

                            function setPosition() {

                                var eCoords = $.getCoordinates(event, dropItem[0]);
                                var xOffset = eCoords.mouseX - eCoords.x1 - draggedPosition.x + "px";
                                var yOffset = eCoords.mouseY - eCoords.y1 - draggedPosition.y + "px";

                                return {
                                    top: yOffset,
                                    left: xOffset
                                };
                            }

                            //Check for null object - happens if different object type is dropped
                            if (draggedItem) {

                                if (isDragItem.test(draggedItem.attr("connect:class"))) {

                                    if (event) {
                                        draggedPosition = setPosition();
                                    }

                                    if (!dragData.floating && !dragData.toDelete) {

                                        draggedItem = draggedItem.copyNode("ins", true);

                                        draggedItem.dragstart(function(event) {
                                            showDestination(true, draggedItem);
                                            globalDataObject = localDataObject;
                                            globalDataObject.dragData.floating = true;
                                            globalDataObject.insertNode = draggedItem;
                                            event.dataTransfer.mozSetDataAt("dragData", globalDataObject, 0);
                                        });

                                        draggedItem.dragend(function(event) {
                                            showDestination(false, draggedItem);
                                            //If drag was unsuccessful
                                            if (event.dataTransfer.dropEffect === "none") {
                                                draggedItem.remove();
                                            }
                                        });
                                    }

                                    //Set the exact coordinate drop position of drag target
                                    if (dragData.exactPosition) {
                                        draggedItem.css(draggedPosition);
                                    }

                                    if (dropItem.children().length !== 0) {
                                        if (dragData.toDelete ||
                                            dropItem.firstChild()[0].nodeType !== 1) {
                                            //Replace insert node where appropriate
                                            if (dragData.replaceDropped) {
                                                //Recover drag node related to dragged "ins" node
                                                var relatedDragItem = getDragNode(dropItem.firstChild());
                                                if (relatedDragItem) {
                                                    relatedDragItem = $(relatedDragItem);
                                                    var replaceNode = relatedDragItem.firstChild();
                                                    while (replaceNode.children().length !== 0) {
                                                        relatedDragItem.append(replaceNode.firstChild());
                                                    }
                                                    replaceNode.remove();
                                                    relatedDragItem.attr("draggable", "true");
                                                    //ARIA - grabbed attribute
                                                    relatedDragItem.attr("aria-grabbed", "false");
                                                }
                                                dropItem.firstChild().remove();
                                            }
                                        }
                                    }
                                    var dragParent = draggedItem.parent();
                                    dropItem.append(draggedItem);
                                    //Save response value
                                    value.set(gapIdentifier, draggedItem.attr("connect:identifier"));
                                    if (value.size() !== 0) {
                                        responseVariable.setValue(value);
                                    } else {
                                        responseVariable.setValue(undefined);
                                    }
                                    if (dragParent) {
                                        //Remove response value
                                        value.remove(dragParent.attr("connect:identifier"));
                                        if (value.size() !== 0) {
                                            responseVariable.setValue(value);
                                        } else {
                                            responseVariable.setValue(undefined);
                                        }
                                    }

                                    //Do not set focus when reloading values
                                    if (event) {
                                        dropItem[0].focus();
                                    }

                                    //Locate all object nodes and then detach and re-attach the "data"
                                    //attributes to force the DOM to update properly. Without this,
                                    //the link between the object and its data source is lost
                                    var objectList = $("object", draggedItem[0]);
                                    objectList.each(function(index, objectElement) {
                                        objectElement = $(objectElement);
                                        objectElement.copyAttributes(objectElement);
                                    });
                                    if (event) {
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        function keyDown(event) {
                            var keyCode = event.keyCode;

                            if (keyCode === 32) {
                                if (globalDataObject) {
                                    drop(event);
                                    showDestination(false, localDataObject.insertNode);
                                } else {
                                    if (localDataObject) {
                                        showDestination(true, localDataObject.insertNode);
                                        localDataObject.doDrag();
                                        globalDataObject = localDataObject;
                                        localDataObject = null;
                                        event.preventDefault();
                                    }
                                }
                            }
                        }

                        //Load existing responses
                        if (value.size() !== 0) {
                            var dragId = value.get(gapIdentifier);
                            if (dragId) {
                                var dragItem = $("*[connect\\:identifier=" + dragId + "]");
                                var dragObject = getDragObject(dragItem);
                                dragObject.createData();
                                if (toDelete) {
                                    dragObject.doDrag();
                                }
                                globalDataObject = dragObject;
                                drop();
                            }
                        }

                        dropItem.dragenter(dragStop);
                        dropItem.dragover(dragStop);
                        dropItem.drop(drop);
                        dropItem.focus(focus);
                        dropItem.blur(blur);
                        dropItem.keydown(keyDown);
                    });
                })();

                interaction.keydown(function(event) {

                    var keyCode = event.keyCode;

                    if ((keyCode === 39 || keyCode === 40)) {

                        focusIndex++;
                        if (focusIndex === tabList.length) {
                            focusIndex = 0;
                        }

                        tabList[focusIndex].focus();
                        event.preventDefault();
                    }

                    if ((keyCode === 37 || keyCode === 38)) {

                        focusIndex--;
                        if (focusIndex === -1) {
                            focusIndex = tabList.length - 1;
                        }

                        tabList[focusIndex].focus();
                        event.preventDefault();
                    }
                });
            });
        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Graphic Gap Match iteractions", "graphicGapMatchInt");
    })();

    (function() {
        var MAX_DIGITS = 10;
        var calculatorMemory = 0;

        var loadItemFunc = function(itemObj) {
            var itemBody = itemObj.body,
                calculators = $('[connect\\:class~="calculator"]'),
                $advCalc;
            if (qti.useAdvancedCalc) {
                calculators.hide();
                $advCalc = $("#advancedCalculator");
                $advCalc.attr('src', $advCalc.attr('data-src')).show();
            }
            calculators.each(function(index, calculator) {
                calculator = $(calculator);
                var idx, len;
                var engine;
                var calculatorKeys;
                var display;
                var keypad;
                var keypadHandler;
                var disableKeyEntry;
                var operators;
                var setState;
                var performCurrentOperation;
                var hideCalculator;
                var accumulatorElement = calculator.find("input");
                var copyPasteButton = calculator.find('button.copy');
                var copyPasteHandler;
                var clearCopyPaste;
                var insertCalculatorResult;
                var insertAtCaret = qti.insertAtCaret;
                var computedStyle = qti.computedStyle;

                if (window.allCalculators === undefined) {
                    window.allCalculators = [calculator[0]];
                } else {
                    for (idx = 0, len = window.allCalculators.length; idx < len; idx += 1) {
                        if (window.allCalculators[idx] === calculator[0]) {
                            return false;
                        }
                    }
                    window.allCalculators.push(calculator[0]);
                }

                calculator.attr("role", "application");

                display = (function() {

                    var update;
                    var initialiseElement;

                    update = function() {
                        accumulatorElement.value(engine.getAccumulator());
                    };

                    initialiseElement = function() {
                        while (accumulatorElement.children().length !== 0) {
                            accumulatorElement.first().remove();
                        }
                    };

                    return {
                        update: update,
                        initialise: function() {
                            initialiseElement();
                        }
                    };

                })();

                engine = (function() {

                    var states;
                    var operations;
                    var currentState;
                    var currentOperation;
                    var accumulator;
                    var pendingAccumulator;
                    var accumulatorReset;
                    var accumulatorEmpty;
                    var accumulatorValueOf;
                    var runtimeSetState;
                    var setupSetState;
                    var setOperation;
                    var performCalculation;
                    var roundResult;
                    var roundResultValue;
                    var isOutOfBounds;
                    var calculatePoint;
                    var factorial;
                    var removeLastZeros;
                    var acceptDigit;
                    var isSpaceAvailable;
                    var acceptOperator;
                    var acceptMemoryPlus;
                    var acceptMemoryRecall;
                    var acceptMemoryClear;
                    var acceptPoint;
                    var acceptEquals;
                    var acceptClear;
                    var reset;
                    var divPrecisionMultiplier;
                    var piFunc;
                    var scienceOp = {
                        isScienceOperator: false,
                        scienceOpValue: "",
                        scienceOpResult: 0,
                        sciencePendingInitialOp: {
                            name: ""
                        },
                        scienceOpIteration: 0

                    };

                    accumulatorReset = function() {
                        this.value = "0";
                    };

                    accumulatorEmpty = function() {
                        this.value = "";
                    };

                    accumulatorValueOf = function() {
                        return this.value;
                    };

                    accumulator = {
                        value: "0",
                        reset: accumulatorReset,
                        clear: accumulatorEmpty,
                        valueOf: accumulatorValueOf
                    };

                    pendingAccumulator = {
                        value: "0",
                        reset: accumulatorReset,
                        clear: accumulatorEmpty,
                        valueOf: accumulatorValueOf
                    };

                    reset = function() {
                        accumulator.reset();
                        pendingAccumulator.reset();
                        setOperation("nop");
                        setState("initial");
                        clearCopyPaste();
                    };

                    states = {
                        template: {
                            name: "template",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {},
                            point: function() {},
                            operator: function(operator) {},
                            memoryPlus: function() {},
                            memoryRecall: function() {},
                            memoryClear: function() {},
                            equals: function() {},
                            clear: reset
                        },
                        initial: {
                            name: "initial",
                            activate: function() {
                                setOperation("nop");
                            },
                            deactivate: function() {},
                            digit: function(digit) {
                                if (digit !== 0) {
                                    accumulator.clear();
                                    setState("accumulateIntegral");
                                    currentState.digit(digit);
                                }
                            },
                            point: function() {
                                accumulator.reset();
                                setState("accumulateFractional");
                                //accumulator.value += ".";
                                accumulator.value =
                                    (accumulator.value === "0") ? accumulator.value += "." : accumulator.value += "";
                            },
                            operator: function(operator) {
                                performCurrentOperation();
                                setOperation(operator);
                                pendingAccumulator.value = accumulator.value;

                                if (operator === "sin" || operator === "cos" || operator === "tan" || operator === "squareroot" || operator === "e" || operator === "inverseLog" || operator === "log" || operator === "factorial" || operator === "pie" || operator === "modulus" || operator === "cbrt" || operator === "xy") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;

                                    if (operator === "squareroot") {
                                        accumulator.value = $("<span/>").html('&#8730;').html();
                                    } else if (operator === "e") {
                                        accumulator.value = "e";
                                    } else if (operator === "inverseLog") {
                                        accumulator.value = "ln";
                                    } else if (operator === "log") {
                                        accumulator.value = "log";
                                    } else if (operator === "factorial") {
                                        accumulator.value = "!";
                                    } else if (operator === "pie") {
                                        accumulator.value = $("<span/>").html('&#960;').html();
                                    } else if (operator === "cbrt") {
                                        accumulator.value = "3" + $("<span/>").html('&#8730;').html();
                                    } else if (operator === "xy") {
                                        //pending logic
                                    } else {
                                        accumulator.value = (accumulator.value === "0") ? operator : operator;
                                    }
                                } else {
                                    scienceOp.isScienceOperator = false;
                                }
                                setState("pendingInitial");
                            },
                            equals: function() {
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.clear();
                                setState("accumulateIntegral");
                                currentState.memoryRecall();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        },
                        pendingInitial: {
                            name: "pendingInitial",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {
                                if (!scienceOp.isScienceOperator) {
                                    accumulator.value = "";
                                } else {
                                    //accumulator.value = scienceOpValue;
                                }
                                setState("pendingAccumulateIntegral");
                                currentState.digit(digit);
                            },
                            point: function() {
                                setState("pendingAccumulateFractional");
                                accumulator.reset();
                                accumulator.value += ".";
                            },
                            operator: function(operator) {
                                var simpleOperator = currentOperation;
                                scienceOp.sciencePendingInitialOp.name = simpleOperator.name;
                                if (operator === "sin" || operator === "cos" || operator === "tan" || operator === "squareroot" || operator === "e" || operator === "inverseLog" || operator === "log" || operator === "factorial" || operator === "pie" || operator === "modulus" || operator === "cbrt" || operator === "xy") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;
                                    if (operator === "squareroot") {
                                        accumulator.value = $("<span/>").html('&#8730;').html();
                                    } else if (operator === "e") {
                                        accumulator.value = "e";
                                    } else if (operator === "inverseLog") {
                                        accumulator.value = "ln";
                                    } else if (operator === "log") {
                                        accumulator.value = "log";
                                    } else if (operator === "factorial") {
                                        accumulator.value = "!";
                                    } else if (operator === "pie") {
                                        accumulator.value = $("<span/>").html('&#960;').html();
                                    } else if (operator === "cbrt") {
                                        accumulator.value = "3" + $("<span/>").html('&#8730;').html();
                                    } else if (operator === "xy") {
                                        //pending logic
                                    } else {
                                        accumulator.value = (accumulator.value === "0") ? operator : operator;
                                    }

                                } else {
                                    scienceOp.isScienceOperator = false;
                                }
                                setOperation(operator);
                            },
                            equals: function() {
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.value = "";
                                setState("pendingAccumulateIntegral");
                                currentState.memoryRecall();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        },
                        accumulateIntegral: {
                            name: "accumulateIntegral",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {
                                if (isSpaceAvailable()) {
                                    //accumulator.value += "" + digit;
                                    accumulator.value =
                                        (accumulator.value === "0") ? "" + digit : accumulator.value + "" + digit;
                                }
                            },
                            point: function() {
                                setState("accumulateFractional");
                                accumulator.value += ".";
                            },
                            operator: function(operator) {
                                performCurrentOperation();
                                setOperation(operator);
                                if (operator === "modulus") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;
                                    accumulator.value = accumulator.value + "mod";
                                } else if (operator === "xy") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;
                                    accumulator.value = accumulator.value + "^";
                                } else {
                                    pendingAccumulator.value = accumulator.value;
                                    scienceOp.isScienceOperator = false;
                                }
                                setState("pendingInitial");
                            },
                            equals: function() {
                                performCurrentOperation();
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.value = calculatorMemory.toString();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        },
                        accumulateFractional: {
                            name: "accumulateFractional",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {
                                if (isSpaceAvailable()) {
                                    //accumulator.value += "" + digit;
                                    accumulator.value =
                                        (accumulator.value === "0") ? "" + digit : accumulator.value + "" + digit;
                                }
                            },
                            point: function() {},
                            operator: function(operator) {
                                performCurrentOperation();
                                setOperation(operator);
                                pendingAccumulator.value = accumulator.value;
                                setState("pendingInitial");
                                if (operator === "modulus") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;
                                    accumulator.value = accumulator.value + "mod";
                                } else if (operator === "xy") {
                                    scienceOp.isScienceOperator = true;
                                    scienceOp.scienceOpValue = operator;
                                    accumulator.value = accumulator.value + "^";
                                } else {
                                    scienceOp.isScienceOperator = false;
                                }

                            },
                            equals: function() {
                                performCurrentOperation();
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.value = calculatorMemory.toString();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        },
                        pendingAccumulateIntegral: {
                            name: "pendingAccumulateIntegral",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {
                                if (isSpaceAvailable()) {
                                    //accumulator.value += "" + digit;
                                    accumulator.value =
                                        (accumulator.value === "0") ? "" + digit : accumulator.value + "" + digit;
                                }
                            },
                            point: function() {
                                setState("pendingAccumulateFractional");
                                accumulator.value += ".";
                            },
                            operator: function(operator) {
                                performCurrentOperation();
                                setOperation(operator);
                                pendingAccumulator.value = accumulator.value;
                                setState("pendingInitial");
                            },
                            equals: function() {
                                performCurrentOperation();
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.value = calculatorMemory.toString();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        },
                        pendingAccumulateFractional: {
                            name: "pendingAccumulateFractional",
                            activate: function() {},
                            deactivate: function() {},
                            digit: function(digit) {
                                if (isSpaceAvailable()) {
                                    //accumulator.value += "" + digit;
                                    accumulator.value =
                                        (accumulator.value === "0") ? "" + digit : accumulator.value + "" + digit;
                                }
                            },
                            point: function() {},
                            operator: function(operator) {
                                performCurrentOperation();
                                setOperation(operator);
                                pendingAccumulator.value = accumulator.value;
                                setState("pendingInitial");
                            },
                            equals: function() {
                                performCurrentOperation();
                                setOperation("nop");
                                setState("initial");
                            },
                            memoryRecall: function() {
                                accumulator.value = calculatorMemory.toString();
                            },
                            memoryPlus: function() {
                                calculatorMemory = accumulator.valueOf();
                            },
                            memoryClear: function() {
                                calculatorMemory = 0;
                            },
                            clear: reset
                        }
                    };

                    operators = {
                        "+": {
                            name: "+",
                            exec: function() {
                                // carry out addition
                                performCalculation("+");
                            }
                        },
                        "sin": {
                            name: "sin",
                            exec: function() {
                                performCalculation("sin");
                            }
                        },
                        "cos": {
                            name: "cos",
                            exec: function() {
                                performCalculation("cos");
                            }
                        },
                        "tan": {
                            name: "tan",
                            exec: function() {
                                performCalculation("tan");
                            }
                        },
                        "log": {
                            name: "log",
                            exec: function() {
                                performCalculation("log");
                            }
                        },
                        "squareroot": {
                            name: "squareroot",
                            exec: function() {
                                performCalculation("squareroot");
                            }
                        },
                        "inverseLog": {
                            name: "inverseLog",
                            exec: function() {
                                performCalculation("inverseLog");
                            }
                        },
                        "cbrt": {
                            name: "cbrt",
                            exec: function() {
                                performCalculation("cbrt");
                            }
                        },
                        "modulus": {
                            name: "modulus",
                            exec: function() {
                                performCalculation("modulus");
                            }
                        },
                        "xy": {
                            name: "xy",
                            exec: function() {
                                performCalculation("xy");
                            }
                        },
                        "factorial": {
                            name: "factorial",
                            exec: function() {
                                performCalculation("factorial");
                            }
                        },
                        "pie": {
                            name: "pie",
                            exec: function() {
                                performCalculation("pie");
                            }
                        },
                        "e": {
                            name: "e",
                            exec: function() {
                                performCalculation("e");
                            }
                        },
                        "−": {
                            name: "−",
                            exec: function() {
                                // carry out subtraction
                                performCalculation("−");
                            }
                        },
                        "×": {
                            name: "×",
                            exec: function() {
                                // carry out multiplication
                                performCalculation("×");
                            }
                        },
                        "÷": {
                            name: "÷",
                            exec: function() {
                                // carry out division
                                performCalculation("÷");
                            }
                        },
                        nop: {
                            name: "nop",
                            exec: function() {
                                // carry out no-op
                            }
                        }
                    };

                    runtimeSetState = function(stateName) {
                        currentState.deactivate();
                        currentState = states[stateName];
                        currentState.activate();
                    };

                    setupSetState = function(stateName) {
                        setState = runtimeSetState;
                        currentState = states[stateName];
                        currentState.activate();
                    };

                    setOperation = function(operatorName) {
                        currentOperation = operators[operatorName];
                    };

                    isSpaceAvailable = function() {
                        if ((accumulator.value.toString().indexOf('.') !== -1) && (accumulator.value.length < MAX_DIGITS + 1)) {
                            return true;
                        } else if (accumulator.value.length < MAX_DIGITS) {
                            return true;
                        }
                        return false;
                    };

                    performCurrentOperation = function() {
                        currentOperation.exec();
                        pendingAccumulator.reset();
                    };

                    performCalculation = function(operation) {
                        var result, resultInt, resultString, resultPrePoint, resultPostPoint, dividePointPosition,
                            pendingAccumulatorPoint = calculatePoint(pendingAccumulator),
                            accumulatorPoint = calculatePoint(accumulator),
                            power = (pendingAccumulatorPoint < accumulatorPoint) ? accumulatorPoint : pendingAccumulatorPoint,
                            valueAInt, valueBInt;
                        if (!scienceOp.isScienceOperator) {
                            valueBInt = BigInteger(accumulator.valueOf() + "*10^" + power);
                            valueAInt = BigInteger(pendingAccumulator.valueOf() + "*10^" + power);
                        } else {
                            if (scienceOp.scienceOpValue === "e" || scienceOp.scienceOpValue === "squareroot" || scienceOp.scienceOpValue === "factorial" || scienceOp.scienceOpValue === "pie") {
                                valueBInt = accumulator.valueOf().slice(1);
                            } else if (scienceOp.scienceOpValue === "inverseLog" || scienceOp.scienceOpValue === "cbrt") {
                                valueBInt = accumulator.valueOf().slice(2);
                            } else if (scienceOp.scienceOpValue === "xy") {
                                var powSring = accumulator.value.split("^");
                                valueAInt = Number(powSring[0], 10);
                                valueBInt = Number(powSring[1], 10);
                            } else if (scienceOp.scienceOpValue === "modulus") {
                                var modSring = accumulator.value.split("mod");
                                valueAInt = Number(modSring[0], 10);
                                valueBInt = Number(modSring[1], 10);
                            } else {
                                valueBInt = accumulator.valueOf().slice(3);
                            }
                        }
                        switch (operation) {


                            case "sin":
                                resultInt = Math.sin(valueBInt * (Math.PI / 180.0));
                                break;

                            case "cos":
                                resultInt = Math.cos(valueBInt * (Math.PI / 180.0));
                                break;

                            case "tan":
                                resultInt = Math.tan(valueBInt * (Math.PI / 180.0));

                                break;

                            case "log":
                                resultInt = Math.log(valueBInt) / Math.LN10;
                                break;

                            case "squareroot":
                                resultInt = Math.sqrt(valueBInt);
                                break;

                            case "e":
                                resultInt = Math.exp(valueBInt);
                                break;

                            case "inverseLog":
                                resultInt = Math.log(valueBInt);

                                break;

                            case "modulus":
                                resultInt = valueAInt % valueBInt;
                                break;

                            case "pie":
                                resultInt = valueBInt * 3.14;
                                break;

                            case "cbrt":
                                resultInt = Math.cbrt(valueBInt);
                                break;

                            case "factorial":
                                resultInt = factorial(valueBInt);
                                break;
                            case "+":
                                resultInt = valueAInt.add(valueBInt);
                                resultInt = (resultInt / (Math.pow(10, power)));
                                if (scienceOp.scienceOpIteration === 1) {
                                    scienceOp.sciencePendingInitialOp.name = "";
                                }
                                break;


                            case "−":
                                resultInt = valueAInt.subtract(valueBInt);
                                resultInt = (resultInt / (Math.pow(10, power)));
                                if (scienceOp.scienceOpIteration === 1) {
                                    scienceOp.sciencePendingInitialOp.name = "";
                                }
                                break;

                            case "×":
                                resultInt = valueAInt.multiply(valueBInt);
                                resultInt = (resultInt / (Math.pow(10, (power * 2))));
                                if (scienceOp.scienceOpIteration === 1) {
                                    scienceOp.sciencePendingInitialOp.name = "";
                                }

                                break;

                            case "÷":
                                if (valueBInt.isZero()) {
                                    return "Divide by zero";
                                }
                                resultInt = (valueAInt / valueBInt);

                                if (scienceOp.scienceOpIteration === 1) {
                                    scienceOp.sciencePendingInitialOp.name = "";
                                }
                                break;

                            case "xy":
                                resultInt = Math.pow(valueAInt, valueBInt);
                                break;

                            default:
                                break;
                        }

                        result = resultInt.toString();

                        if (isOutOfBounds(result)) {
                            return "Out Of Bounds";
                        }
                        /*if (scienceOp.isScienceOperator) {
                        	scienceOp.scienceOpResult = roundResult(result, MAX_DIGITS + 1);
                        }*/
                        if (scienceOp.sciencePendingInitialOp !== undefined && scienceOp.sciencePendingInitialOp.name === "+" || scienceOp.sciencePendingInitialOp.name === "-" || scienceOp.sciencePendingInitialOp.name === "*" || scienceOp.sciencePendingInitialOp.name === "÷") {

                            accumulator.value = scienceOp.scienceOpResult;
                            pendingAccumulator.value = roundResult(result, MAX_DIGITS + 1);
                            scienceOp.isScienceOperator = false;
                            scienceOp.scienceOpIteration = scienceOp.scienceOpIteration + 1;
                            performCalculation(scienceOp.sciencePendingInitialOp.name);
                        } else {
                            scienceOp.scienceOpIteration = 0;
                            scienceOp.isScienceOperator = false;
                            accumulator.value = roundResult(result, MAX_DIGITS + 1);
                            scienceOp.scienceOpResult = accumulator.value;
                        }

                    };
                    factorial = function(val) {
                        if (val === 0) {
                            return 1;
                        }

                        // This is it! Recursion!!
                        return val * factorial(val - 1);
                    };
                    /*var ExpandExponents = function(inputval) {
                    	return inputval.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function(x, s, n, f, c) {
                    		var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
                    		c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
                    		z = (new Array(c + 1)).join("0"), r = n + f;
                    		return s + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
                    	});
                    };*/

                    calculatePoint = function(val) {
                        var v = val.valueOf(),
                            i = v.indexOf('.');

                        return i > 0 ? v.length - i - 1 : 0;
                    };

                    removeLastZeros = function(val) {
                        while (val.substring(val.length - 1, val.length) === '0') {
                            val = val.substring(0, val.length - 1);
                        }
                        return val;
                    };

                    roundResult = function(result, round) {
                        if (result.length > round) {
                            return roundResultValue(result, MAX_DIGITS - result.substring(0, result.valueOf().indexOf('.')).length);
                        }
                        return result;
                    };

                    roundResultValue = function(val, dec) {
                        return parseFloat(val).toFixed(dec);
                    };

                    isOutOfBounds = function(result) {
                        if (result.indexOf('.') > MAX_DIGITS || (result.indexOf('.') === -1 && result.length >= MAX_DIGITS)) {
                            return true;
                        }
                        return false;
                    };

                    acceptDigit = function(digit) {
                        var value = Number(digit, 10);
                        if (isNaN(value) || value < 0 || value > 9) {
                            throw new Error("Invalid argument: " + value + " is not a digit");
                        }
                        currentState.digit(value);
                    };

                    acceptOperator = function(operator) {
                        if (!operators.hasOwnProperty(operator)) {
                            throw new Error("Invalid argument: " + operator + " is not an operator");
                        }
                        currentState.operator(operator);
                    };

                    acceptMemoryPlus = function() {
                        currentState.memoryPlus();
                    };

                    acceptMemoryRecall = function() {
                        currentState.memoryRecall();
                    };

                    acceptMemoryClear = function() {
                        currentState.memoryClear();
                    };

                    acceptPoint = function() {
                        currentState.point();
                    };

                    acceptEquals = function() {
                        currentState.equals();
                    };

                    acceptClear = function() {
                        //scienceOp.sciencePendingInitialOp.name="nop";
                        currentState.clear();
                    };

                    setState = setupSetState;
                    setState("initial");

                    return {
                        // for testing:
                        state: currentState,
                        operations: operations,
                        states: states,
                        accumulator: accumulator,
                        pendingAccumulator: pendingAccumulator,
                        // for real:
                        acceptDigit: acceptDigit,
                        acceptOperator: acceptOperator,
                        acceptMemoryPlus: acceptMemoryPlus,
                        acceptMemoryRecall: acceptMemoryRecall,
                        acceptMemoryClear: acceptMemoryClear,
                        acceptPoint: acceptPoint,
                        acceptEquals: acceptEquals,
                        acceptClear: acceptClear,
                        getAccumulator: function() {
                            return accumulator.value;
                        },
                        getPendingAccumulator: function() {
                            return pendingAccumulator.value;
                        },
                        getOperation: function() {
                            return currentOperation.name;
                        },
                        getState: function() {
                            return currentState.name;
                        }
                    };

                })();

                function makeDigitKeyHandler(value) {
                    var digit = "" + value;
                    return function(event) {
                        engine.acceptDigit(digit);
                    };
                }

                function makeOperatorKeyHandler(operatorName) {
                    return function(event) {
                        engine.acceptOperator(operatorName);
                    };
                }

                function memoryPlusKeyHandler(event) {
                    engine.acceptMemoryPlus();
                }

                function memoryRecallKeyHandler(event) {
                    engine.acceptMemoryRecall();
                }

                function memoryClearKeyHandler(event) {
                    engine.acceptMemoryClear();
                }

                function pointKeyHandler(event) {
                    engine.acceptPoint();
                }

                function equalsKeyHandler(event) {
                    engine.acceptEquals();
                }

                function clearKeyHandler(event) {
                    engine.acceptClear();
                }

                calculatorKeys = {
                    46: pointKeyHandler,
                    48: makeDigitKeyHandler(0),
                    49: makeDigitKeyHandler(1),
                    50: makeDigitKeyHandler(2),
                    51: makeDigitKeyHandler(3),
                    52: makeDigitKeyHandler(4),
                    53: makeDigitKeyHandler(5),
                    54: makeDigitKeyHandler(6),
                    55: makeDigitKeyHandler(7),
                    56: makeDigitKeyHandler(8),
                    57: makeDigitKeyHandler(9),
                    43: makeOperatorKeyHandler("+"),
                    45: makeOperatorKeyHandler("−"),
                    42: makeOperatorKeyHandler("×"),
                    47: makeOperatorKeyHandler("÷"),
                    61: equalsKeyHandler,
                    13: equalsKeyHandler,
                    27: clearKeyHandler
                };

                function makeKeyPressHandler(keyHandlerSet) {
                    return function(event) {
                        var charCode;
                        charCode = event.charCode;
                        if (charCode === 0) {
                            charCode = event.keyCode;
                        }
                        if (keyHandlerSet.hasOwnProperty(charCode)) {
                            keyHandlerSet[charCode](event);
                            display.update();
                            event.preventDefault();
                        }
                    };
                }

                keypadHandler = function(event) {

                    var target;
                    var functionName;
                    //var value;
                    var actions;

                    target = event.target;

                    if (target &&
                        target.nodeType &&
                        target.nodeType === 1 &&
                        target.nodeName.toLowerCase() === "button") {
                        functionName = $(target).attr("connect:function");
                        actions = {
                            digit: function(digit) {
                                engine.acceptDigit(digit);
                            },
                            point: function() {
                                engine.acceptPoint();
                            },
                            operator: function(operator) {
                                engine.acceptOperator(operator);
                            },
                            memoryPlus: function() {
                                engine.acceptMemoryPlus();
                            },
                            memoryRecall: function() {
                                engine.acceptMemoryRecall();
                            },
                            memoryClear: function() {
                                engine.acceptMemoryClear();
                            },
                            equals: function() {
                                engine.acceptEquals();
                            },
                            clear: function() {
                                engine.acceptClear();
                            }
                        };

                        actions[functionName](target.value);
                        display.update();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                };

                insertCalculatorResult = function(event) {
                    var textInputs, calcVisible, pasteAvailable, testval, value, respId, respvar;

                    textInputs = $("[role~='main'] textarea, [role~='main'] input");
                    calcVisible = (computedStyle(calculator[0], 'visibility') === "visible") ? true : false;
                    pasteAvailable = (copyPasteButton.attr("value") !== "") ? true : false;

                    if (calcVisible && pasteAvailable) {
                        if (event.button === 0) {
                            value = copyPasteButton.attr("value");
                            respId = this.getAttribute('connect:responseIdentifier');
                            respvar = qti.getVariable(respId);

                            testval = insertAtCaret(this, value);
                            respvar.setState(testval);
                            respvar.setValue(testval);

                            /*textInputs.css("cursor", "text");
                            textInputs.unbind("mousedown", insertCalculatorResult);
                            copyPasteButton.attr("value", "").attr("style", null);*/
                            clearCopyPaste();
                        }
                    }
                };

                copyPasteHandler = function(event) {
                    var textInputs = $("[role~='main'] textarea, [role~='main'] input");
                    var calcResult = calculator.find('input')[0].value;

                    if ($(this).attr("value") === "") {
                        $(this).attr("value", calcResult).attr("style", "background-color:#ee0; border-color: #d00; color: #d00;");
                        textInputs.css("cursor", "url(images/main/paste.png), url(images/main/page_white_paste.png), auto");
                        textInputs.bind("mousedown", insertCalculatorResult);
                    } else {
                        /*textInputs.css("cursor", "text");
                        textInputs.unbind("mousedown", insertCalculatorResult);
                        $(this).attr("value", "").attr("style", null);*/
                        clearCopyPaste();
                    }
                };

                clearCopyPaste = function() {
                    var textInputs = $("[role~='main'] textarea, [role~='main'] input");
                    var calcVisible = (computedStyle(calculator[0], 'visibility') === "visible") ? true : false;
                    if (calcVisible) {
                        textInputs.css("cursor", "text");
                        textInputs.unbind("mousedown", insertCalculatorResult);
                        copyPasteButton.attr("value", "").attr("style", null);
                    }
                };
                disableKeyEntry = function() {
                    return false;
                };

                display.initialise();
                display.update();
                calculator.keypress(makeKeyPressHandler(calculatorKeys));
                keypad = calculator.find("div.keypad");
                keypad.bind("click", keypadHandler);
                copyPasteButton.bind("click", copyPasteHandler);
                accumulatorElement.bind("keypress", disableKeyEntry);

                /*			// this for itemUnload event if ever needed otherwise rely on testEnd event below
                			hideCalculator = function() {
                				var ftcs = $('[connect\\:class~="floatingToolContainer"]');
                				ftcs.each(function(index, ftc) {
                					var calc = $(ftc).find('*[connect\\:class~="calculator"]');
                					if (calc.length === 1 && qti.computedStyle(calc[0], 'visibility') === "visible") {
                						var toolLinks = $('[connect\\:class~="floatingTool"] a[connect\\:identifier~="calculator"]');
                						toolLinks[0].click();
                					}
                				});
                			};
                			qti.subscribeToEvent("itemUnload", hideCalculator, "Calculator functions", "calcHide", true);
                */
                hideCalculator = function() {
                    var calc = $('[connect\\:class~="calculator"]');
                    if (calc.length === 1 && qti.computedStyle(calc[0], 'visibility') === "visible") {
                        calc.css("visibility", "hidden");
                        engine.acceptClear();
                    }
                };

                qti.subscribeToEvent("testEnd", hideCalculator, "Calculator functions", "calcHide", true);
            });
        };

        qti.subscribeToEvent("toolItemLoad", loadItemFunc, "Calculator functions", "calc");
    })();
    (function() {
        //RULES ENGINE
        var itemIdentifier;
        var rules = {};
        //  here be dragons...
        // BAR GRAPH
        rules.bar = {
            getBarsData: function(chart, chartTable) {
                chart.dataObjectSeries.stroke = chartTable.attr("raphaelChart:stroke");
                chart.dataObjectSeries.strokeWidth = chartTable.attr("raphaelChart:strokeWidth");

                return chart;
            },
            getAxisData: function(chart, axisData, axisRef) {
                var inc, axisScale;

                chart[axisRef + "AxisLabel"] = axisData.find("th").text();
                chart.dataObjectSeries[axisRef + "AxisType"] = axisData.attr("raphaelChart:axisType");

                if (chart.dataObjectSeries[axisRef + "AxisType"] === "increment") {
                    axisScale = axisData.attr("raphaelChart:axisScale");
                    if (axisScale !== undefined) {
                        inc = axisScale.split(" ");
                        chart.dataObjectSeries[axisRef + "AxisMajorInc"] = inc[0];
                        chart.dataObjectSeries[axisRef + "AxisMinorInc"] = inc[1];
                    }
                    chart.dataObjectSeries[axisRef + "Max"] = axisData.attr("raphaelChart:max");
                    chart.dataObjectSeries[axisRef + "Min"] = axisData.attr("raphaelChart:min");
                    chart.dataObjectSeries[axisRef + "AxisOrigin"] = axisData.attr("raphaelChart:origin");
                    chart.dataObjectSeries[axisRef + "ShowGrid"] = axisData.attr("raphaelChart:showGrid");
                    chart.dataObjectSeries[axisRef + "GridColour"] = axisData.attr("raphaelChart:gridColour");
                    chart.dataObjectSeries[axisRef + "SnapTo"] = axisData.attr("raphaelChart:snapTo");
                    chart.dataObjectSeries[axisRef + "GuideStroke"] = axisData.attr("raphaelChart:guideColour");
                    chart.dataObjectSeries[axisRef + "ShowGuide"] = axisData.attr("raphaelChart:showGuide");
                    chart.dataObjectSeries[axisRef + "ShowValue"] = axisData.attr("raphaelChart:showValue");
                    chart.dataObjectSeries[axisRef + "ZeroBarHeight"] = axisData.attr("raphaelChart:zeroBarHeight");
                }

                chart.dataObjectSeries[axisRef + "AxisShow"] = axisData.attr("raphaelChart:axisShow");

                return chart;
            },
            makeDataObjects: function(chart, xData, yData) {
                if (xData.length !== yData.length) {
                    throw new Error("Incorrect data values");
                }
                var dos = chart.dataObjectSeries.dataObjects;
                var xDataSet = xData.find("td");
                var yDataSet = yData.find("td");
                var xLen = xDataSet.length;

                for (var i = 0; i < xLen; i += 1) {
                    var dataObject = {};
                    var x = $(xDataSet[i]);
                    var y = $(yDataSet[i]);

                    dataObject.xValue = x.text();
                    dataObject.yValue = y.text();
                    dataObject.fill = x.attr("raphaelChart:fill") || y.attr("raphaelChart:fill");
                    dataObject.activeFill = y.attr("raphaelChart:activeFill") || yData.attr("raphaelChart:activeFill");
                    dataObject.xRid = x.attr("connect:responseIdentifier");
                    dataObject.xTd = x;
                    dataObject.yRid = y.attr("connect:responseIdentifier");
                    dataObject.yTd = y;
                    dataObject.isXEditable = x.attr("raphaelChart:isEditable");
                    dataObject.isYEditable = y.attr("raphaelChart:isEditable");

                    dos.push(dataObject);
                }

                return chart;
            }
        };

        // LINE CHART
        rules.line = {
            getBarsData: function(chart, chartTable) {
                chart.dataObjectSeries.stroke = chartTable.attr("raphaelChart:lineColour");
                chart.dataObjectSeries.strokeWidth = chartTable.attr("raphaelChart:lineWidth");
                chart.dataObjectSeries.pointColour = chartTable.attr("raphaelChart:pointColour");
                chart.dataObjectSeries.pointSize = chartTable.attr("raphaelChart:pointSize");
                chart.dataObjectSeries.pointFill = chartTable.attr("raphaelChart:pointFill");
                chart.dataObjectSeries.pointActive = chartTable.attr("raphaelChart:pointActive");

                return chart;
            },
            getAxisData: function(chart, axisData, axisRef) {
                var inc, axisScale;

                chart[axisRef + "AxisLabel"] = axisData.find("th").text();
                chart.dataObjectSeries[axisRef + "AxisType"] = axisData.attr("raphaelChart:axisType");
                //var inc = axisData.attr("raphaelChart:axisScale").split(" ");
                axisScale = axisData.attr("raphaelChart:axisScale");
                if (axisScale !== undefined) {
                    inc = axisScale.split(" ");
                    chart.dataObjectSeries[axisRef + "AxisMajorInc"] = inc[0];
                    chart.dataObjectSeries[axisRef + "AxisMinorInc"] = inc[1];
                }
                chart.dataObjectSeries[axisRef + "Max"] = axisData.attr("raphaelChart:max");
                chart.dataObjectSeries[axisRef + "Min"] = axisData.attr("raphaelChart:min");
                chart.dataObjectSeries[axisRef + "AxisScale"] = axisData.attr("raphaelChart:axisScale");
                chart.dataObjectSeries[axisRef + "AxisTickHeight"] = axisData.attr("raphaelChart:axisTickHeight");
                chart.dataObjectSeries[axisRef + "AxisOrigin"] = axisData.attr("raphaelChart:origin");
                chart.dataObjectSeries[axisRef + "AxisShow"] = axisData.attr("raphaelChart:axisShow");
                chart.dataObjectSeries[axisRef + "SnapTo"] = axisData.attr("raphaelChart:snapTo");
                chart.dataObjectSeries[axisRef + "GuideStroke"] = axisData.attr("raphaelChart:guideColour");
                chart.dataObjectSeries[axisRef + "ShowGuide"] = axisData.attr("raphaelChart:showGuide");

                return chart;
            },
            makeDataObjects: function(chart, xData, yData) {
                if (xData.length !== yData.length) {
                    throw new Error("Incorrect data values");
                }
                var dos = chart.dataObjectSeries.dataObjects;
                var xDataSet = xData.find("td");
                var yDataSet = yData.find("td");
                var xLen = xDataSet.length;

                for (var i = 0; i < xLen; i += 1) {
                    var dataObject = {};
                    var x = $(xDataSet[i]);
                    var y = $(yDataSet[i]);

                    dataObject.xValue = x.text();
                    dataObject.yValue = y.text();
                    dataObject.fill = y.attr("raphaelChart:fill");
                    dataObject.xRid = x.attr("connect:responseIdentifier");
                    dataObject.yRid = y.attr("connect:responseIdentifier");
                    dataObject.xMax = x.attr("raphaelChart:max");
                    dataObject.xMin = x.attr("raphaelChart:min");
                    dataObject.isXEditable = x.attr("raphaelChart:isEditable");
                    dataObject.isYEditable = y.attr("raphaelChart:isEditable");
                    dataObject.xTd = x;
                    dataObject.yTd = y;
                    dos.push(dataObject);
                }

                return chart;
            }
        };

        // PIE CHART
        rules.pie = {
            getBarsData: function(chart, chartTable) {
                chart.dataObjectSeries.stroke = chartTable.attr("raphaelChart:stroke");
                chart.dataObjectSeries.strokeWidth = chartTable.attr("raphaelChart:strokeWidth");
                chart.dataObjectSeries.handleWidth = chartTable.attr("raphaelChart:handleWidth");
                chart.dataObjectSeries.radius = chartTable.attr("raphaelChart:radius");
                chart.dataObjectSeries.min = chartTable.attr("raphaelChart:min");
                chart.dataObjectSeries.max = chartTable.attr("raphaelChart:max");

                return chart;
            },
            getAxisData: function(chart, axisData, axisRef) {
                chart.dataObjectSeries[axisRef + "AxisShow"] = axisData.attr("raphaelChart:axisShow");
                chart.dataObjectSeries[axisRef + "AxisTotal"] = axisData.attr("raphaelChart:axisTotal");
                chart.dataObjectSeries[axisRef + "AxisType"] = axisData.attr("raphaelChart:axisType");
                return chart;
            },
            makeDataObjects: function(chart, xData, yData) {
                if (xData.length !== yData.length) {
                    throw new Error("Incorrect data values");
                }
                var dos = chart.dataObjectSeries.dataObjects;
                var xDataSet = xData.find("td");
                var yDataSet = yData.find("td");
                var xLen = xDataSet.length;

                for (var i = 0; i < xLen; i += 1) {
                    var dataObject = {};
                    var x = $(xDataSet[i]);
                    var y = $(yDataSet[i]);

                    dataObject.xValue = x.text();
                    dataObject.yValue = y.text();
                    dataObject.fill = y.attr("raphaelChart:fill");
                    dataObject.xRid = x.attr("connect:responseIdentifier");
                    dataObject.yRid = y.attr("connect:ResponseIdentifier");
                    dataObject.isXEditable = x.attr("raphaelChart:isEditable");
                    dataObject.isYEditable = y.attr("raphaelChart:isEditable");
                    dataObject.xTd = x;
                    dataObject.yTd = y;
                    dos.push(dataObject);
                }

                return chart;
            }
        };

        function createChart(chartDiv) {
            // mappings to transmute a table into a chart
            var chart = {};
            // Chart Level data comes from chart div
            chart.orientation = chartDiv.attr("raphaelChart:chartOrientation");
            chart.heading = chartDiv.find("caption").text();
            chart.height = chartDiv.attr("raphaelChart:chartHeight");
            chart.width = chartDiv.attr("raphaelChart:chartWidth");
            chart.fontSize = chartDiv.attr("raphaelChart:chartFontSize");
            chart.container = chartDiv.attr("raphaelChart:chartContainer");
            chart.dataSets = chartDiv.attr("raphaelChart:chartDataSets");

            // chart.dataObjectSeries - each series is kept in a table
            var chartTable = chartDiv.find("table");
            chart.dataObjectSeries = {};
            chart.dataObjectSeries.type = chartTable.attr("raphaelChart:type");
            var type = chart.dataObjectSeries.type;
            chart = rules[type].getBarsData(chart, chartTable);

            // rows are where we split data into x and y values
            var dataRows = chartTable.find("tbody");
            var xData = dataRows.find("[raphaelChart\\:axis='x']");
            var yData = $(dataRows.find("[raphaelChart\\:axis='y']"));
            chart = rules[type].getAxisData(chart, xData, "x");
            chart = rules[type].getAxisData(chart, yData, "y");

            // Data Objects to represent the values
            chart.dataObjectSeries.dataObjects = [];
            chart = rules[type].makeDataObjects(chart, xData, yData);

            return chart;
        }

        function setTableValue(td, value) {
            td.text(value);
        }

        function getStoredResults(cd) {
            var responseIdentifiers = cd.find("td[connect\\:responseIdentifier]");

            responseIdentifiers.each(function(index, rId) {
                var td = $(rId);
                var rid = td.attr("connect:responseIdentifier");

                var responseVariable = qti.getVariable(rid, itemIdentifier);
                setTableValue(td, responseVariable.getValue());
            });
        }

        function createChartList(chartDivs) {
            var chartList = [];

            chartDivs.each(function(index, chartDiv) {
                var cd = $(chartDiv);
                // get any qti stored values
                getStoredResults(cd);
                // create charts
                var chart = createChart(cd);
                chartList.push(chart);
            });
            //createCharts(chartList);

            // Kick off the test axis build
            qti.chartAxis(chartList);
        }

        function chartChecker(itemBody) {
            itemIdentifier = itemBody.attr('connect:identifier');
            var chartDivs = $("div [raphaelChart\\:class='chart']", itemBody);
            if (!chartDivs.length) {
                return;
            }

            createChartList(chartDivs);
        }
        qti.subscribeToEvent("newScreenDisplay", chartChecker, "Chart functionality - bar, line and pie", "chart");
    })();

    (function() {
        var lineHeight, fontSize, chart,
            getFontSize = qti.getFontSize;

        function prepCSSValues() {
            var body = $("body")[0],
                bodyStyles = document.defaultView.getComputedStyle(body, "");

            lineHeight = parseInt(bodyStyles.lineHeight, 0);
            fontSize = parseInt(bodyStyles.fontSize, 0);
        }

        // AXIS VALUES
        var axisLabelNumber = {};

        axisLabelNumber.bar = axisLabelNumber.line = axisLabelNumber.pie = function(axis) {
            var dos = chart.dataObjectSeries,
                axisType = dos[axis + "AxisType"];

            if (axisType === "subLabel") {
                dos[axis + "Incs"] = dos.dataObjects.length;
            } else if (axisType === "increment") {
                var max = parseInt(chart.dataObjectSeries[axis + "Max"], 0),
                    min = parseInt(chart.dataObjectSeries[axis + "Min"], 0),
                    majorInc = parseInt(chart.dataObjectSeries[axis + "AxisMajorInc"], 0),
                    incs = (max - min) / majorInc;

                dos[axis + "Incs"] = (qti.isInteger(incs)) ? incs : parseInt(incs, 0) + 1;
            } else {
                throw new Error("Incorrect axis type");
            }
        };
        // AXIS LABEL GENERATOR
        var axisLabels = {};

        // This is a first pass through, where we don't know what the graph height will be, we need to know the labels before that
        axisLabels.bar = axisLabels.line = axisLabels.pie = function(axis) {
            var dos = chart.dataObjectSeries,
                axisType = dos[axis + "AxisType"],
                min = parseInt(chart.dataObjectSeries[axis + "Min"], 0),
                max = parseInt(chart.dataObjectSeries[axis + "Max"], 0),
                majorInc = parseInt(chart.dataObjectSeries[axis + "AxisMajorInc"], 0);

            dos[axis + "AxisObject"] = [];

            if (min < 0 && majorInc) {
                for (var z = min; z <= max; z += majorInc) {
                    var object = {};
                    object.label = z;
                    dos[axis + "AxisObject"].push(object);
                }
            } else {
                var len = dos[axis + "Incs"];
                for (var i = 0; i < len; i += 1) {
                    var obj = {};
                    var dataObject = dos.dataObjects[i];
                    if (axisType === "subLabel") {
                        obj.label = dataObject[axis + "Value"];
                    } else {
                        obj.label = dos[axis + "AxisMajorInc"] * (i + 1);
                    }
                    dos[axis + "AxisObject"].push(obj);
                }
            }
        };

        // set gutter and associated values
        var setValues = {};
        setValues.bar = setValues.line = function() {
            var dos = chart.dataObjectSeries,
                xLen = dos.xIncs,
                yLen = dos.yIncs,
                xType = dos.xAxisType,
                yType = dos.yAxisType,
                testRun = 0,
                textDepth = 2,
                yMin = chart.dataObjectSeries.yMin,
                yMax = chart.dataObjectSeries.yMax;

            function getXGutter() {
                var multiplier = chart.xAxisLabel ? textDepth + 1 : textDepth;
                return (lineHeight * multiplier);
            }

            function getYGutter() {
                var chars = (yType === "increment") ? 4 : 10,
                    width = chars * (fontSize / 2);
                if (chart.yAxisLabel) {
                    width += lineHeight;
                }
                return width;
            }

            function checkGutterWidth(label, max, p) {
                var canvas = p.text(0, 0, label).hide(),
                    w = canvas.getBBox().width;
                canvas.remove();

                if (w >= max) {
                    return false;
                }
                return true;
            }

            chart.graphXFinalised = true;
            chart.graphYFinalised = true;

            function makeGutters() {
                chart.gutterX = getXGutter();
                chart.gutterY = getYGutter();
                chart.topGutter = lineHeight;
                chart.rightGutter = (xType === "increment") ? fontSize * 7 : dos.strokeWidth / 2;
            }

            function generateValues() {
                var w = chart.graphWidth = chart.width - chart.gutterY - chart.rightGutter,
                    h = chart.graphHeight = chart.height - chart.gutterX - chart.topGutter,
                    originYOffset = Math.abs(yMax) / (Math.abs(yMin) + Math.abs(yMax));

                chart.p.setSize(chart.width, chart.height);

                chart.lineHeight = lineHeight;
                chart.graphXstart = chart.gutterY;
                chart.graphXend = chart.graphWidth + chart.gutterY;
                chart.graphYstart = chart.topGutter;
                chart.graphYend = chart.graphHeight + chart.topGutter;
                chart.xWidth = w / xLen;
                chart.yHeight = h / yLen;
                chart.xAxisY = chart.graphYend + lineHeight;
                chart.yAxisX = chart.graphXstart - 12;

                chart.origin = {};
                chart.origin.x = chart.graphXstart;
                if (parseInt(chart.dataObjectSeries.yAxisOrigin, 10) === 0) {
                    chart.origin.y = chart.graphYend;
                } else {
                    chart.origin.y = chart.graphYstart + ((chart.graphYend - chart.graphYstart) * originYOffset);
                }
                if (xType === "increment") {
                    chart.xScale = chart.xWidth / dos.xAxisMajorInc;
                }
                if (yType === "increment") {
                    chart.yScale = chart.yHeight / dos.yAxisMajorInc;
                }
            }

            function breakOnSpace(label, axis) {
                var len = label.length,
                    i = 0,
                    pi = 0, // position of previous space
                    c = 1, // count - equal to the line depth of the text on the xGutter
                    max = 2; // maximum value that c achieved.

                while (i !== -1) {
                    i = label.indexOf(" ", (i + 1));
                    var nextSpace = label.indexOf(" ", (i + 1));
                    if (nextSpace === -1) {
                        nextSpace = len;
                    }
                    if (((i - pi) > 4) && ((nextSpace - i) > 4)) {
                        label = label.substr(0, i) + '\n' + label.substr(i + 1);
                        c += 1;
                    }
                    pi = i;
                }
                if (c > 2 && c < 5) {
                    textDepth = (c > textDepth) ? c : textDepth;
                    chart.gutterX = getXGutter();
                }
                return label;
            }

            function adjustValues(axis) {
                var c = $("#" + chart.container);
                var p = c.parent();
                var parentWidth = p[0].offsetWidth;
                var parentHeight = p[0].offsetHeight;

                if (axis === "x") {
                    if (testRun === 1 && xType === "subLabel") {
                        for (var i = 0; i < xLen; i += 1) {
                            dos.xAxisObject[i].label = breakOnSpace(dos.xAxisObject[i].label, axis);
                        }
                    } else {
                        var cw = Number(chart.width) + 30;
                        if (cw < parentWidth) {
                            chart.width = cw;
                        }
                    }
                } else {
                    if (testRun === 1 && yType === "subLabel") {
                        for (var x = 0; x < yLen; x += 1) {
                            dos.yAxisObject[x].label = breakOnSpace(dos.yAxisObject[x].label, axis);
                        }
                    } else {
                        var ch = Number(chart.height) + 30;
                        if (ch < parentHeight) {
                            chart.height = ch;
                        }
                    }
                }
            }

            function testXValues() {
                for (var i = 0; i < xLen; i += 1) {
                    if (!chart.graphXFinalised) {
                        return;
                    }
                    var data = dos.xAxisObject[i];
                    var label = data.label;
                    var max = chart.xWidth;
                    var p = chart.p;

                    chart.graphXFinalised = checkGutterWidth(label, max, p);
                }
            }

            function testYValues() {
                for (var i = 0; i < yLen; i += 1) {
                    if (!chart.graphYFinalised) {
                        return;
                    }
                    var data = dos.yAxisObject[i];
                    var label = data.label;
                    var max = chart.gutterY;
                    if (chart.yAxisLabel) {
                        max -= lineHeight;
                    }

                    var p = chart.p;

                    chart.graphYFinalised = checkGutterWidth(label, max, p);
                }
            }
            // RUN INITIAL SETUP
            makeGutters();
            generateValues();
            testXValues();
            testYValues();

            while ((!chart.graphXFinalised || !chart.graphYFinalised) && testRun < 5) {
                testRun += 1;
                var xOK = chart.graphXFinalised;
                var yOK = chart.graphYFinalised;
                chart.graphXFinalised = chart.graphYFinalised = true;
                if (!xOK) {
                    adjustValues("x");
                } else if (!yOK) {
                    adjustValues("y");
                }
                generateValues();
                testXValues();
                testYValues();
            }
        };

        setValues.pie = function() {
            var verticalSpacing = 2 * lineHeight;
            var horizontalSpacing = fontSize * 6;
            var dos = chart.dataObjectSeries;
            var maxHeight = 0;
            var maxWidth = 0;

            function labelSize(label) {
                var p = chart.p;
                var canvas = p.text(0, 0, label).hide();
                var box = canvas.getBBox();
                canvas.remove();

                var size = {};
                size.h = box.height;
                size.w = box.width;
                return size;
            }

            function insertBreak(label) {
                var la = label.split(" ");
                var len = la.length;
                var n = Math.round((len - 1) / 2);
                var la1 = la.slice(0, n);
                var la2 = la.slice(n, len);
                label = la1.join(" ") + "\n" + la2.join(" ");
                return label;
            }

            function resizeLabel(label) {
                var la = label.split("\n");
                var len = la.length;
                var newLabel = "";
                for (var i = 0; i < len; i += 1) {
                    newLabel += insertBreak(la[i]) + "\n";
                }
                return newLabel;
            }

            function makeValues() {
                var w = chart.graphWidth = chart.width - verticalSpacing * 2;
                var h = chart.graphHeight = chart.height - horizontalSpacing * 2;
                var rad = dos.radius = (w <= h) ? w / 2 : h / 2;
            }

            function checkValues() {
                var axisObject = dos.yAxisObject;
                var len = axisObject.length; // Because pie charts are symmetrical, we can assign y to subLabels and x to increments for ease

                for (var i = 0; i < len; i += 1) {
                    var label = axisObject[i].label;
                    var size = labelSize(label);
                    var cnt = 0;
                    while (size.w > horizontalSpacing && size.h < verticalSpacing) {
                        if (cnt < 0) {
                            verticalSpacing = 3 * lineHeight;
                        }
                        label = resizeLabel(label);
                        size = labelSize(label);
                        cnt += 1;
                    }
                    axisObject[i].label = label;
                }
            }

            makeValues();
            checkValues();
        };

        // Now we have the true gutter measurements, we can set the values for the axis labels
        var makeAxisLabels = {};

        makeAxisLabels.bar = makeAxisLabels.line = function() {
            var dos = chart.dataObjectSeries,
                xLen = dos.xIncs,
                yLen = dos.yIncs,
                xType = dos.xAxisType,
                yType = dos.yAxisType,
                yMin = parseInt(chart.dataObjectSeries.yMin, 0),
                yMax = parseInt(chart.dataObjectSeries.yMax, 0),
                majorYInc = parseInt(chart.dataObjectSeries.yAxisMajorInc, 0);

            // X LABELS
            for (var i = 0; i < xLen; i += 1) {
                var data = dos.xAxisObject[i];
                data.height = lineHeight * 2;
                data.y = chart.xAxisY;

                if (xType === "subLabel") {
                    data.width = chart.xWidth;
                    if (dos.type === 'line') {
                        // position labels at start of bar, ie where the point is placed on the graph
                        data.x = (chart.xWidth * i) + chart.gutterY;
                    } else {
                        // position labels at middle of bar
                        data.x = (chart.xWidth * i) + (chart.xWidth / 2) + chart.gutterY;
                    }
                } else {
                    data.width = 4 * (fontSize / 2);
                    data.x = chart.xWidth * (i + 1) + chart.graphXstart;
                }
            }

            // Y LABELS
            var chars = (yType === "increment") ? 4 : 10,
                width = chars * (fontSize / 2),
                item = 0;

            if (yMin < 0 && majorYInc) {
                for (var z = yMin; z <= yMax; z += majorYInc) {
                    var a = dos.yAxisObject[item];
                    a.height = lineHeight * 3;
                    a.width = width;
                    a.x = chart.yAxisX;
                    a.y = chart.graphYend - (chart.yHeight * (item));
                    item++;
                }
            } else {
                for (var x = 0; x < yLen; x += 1) {
                    var d = dos.yAxisObject[x];
                    d.height = lineHeight * 3;

                    if (yType === "subLabel") {
                        d.width = 10 * (fontSize / 2);
                        d.x = lineHeight + (d.width / 2);
                        d.y = chart.graphYend - chart.yHeight * (x + 1) + (chart.yHeight / 2);
                    } else {
                        d.width = width;
                        d.x = chart.yAxisX;
                        d.y = chart.graphYend - (chart.yHeight * (x + 1));
                    }
                }
            }
        };

        makeAxisLabels.pie = function() {
            // not needed for pie charts
            return;
        };

        // MAKE PRIMITIVE VALUES
        var makePrimitiveValues = {};

        makePrimitiveValues.bar = function() {
            var dos = chart.dataObjectSeries;
            var dataObjects = dos.dataObjects;
            var len = dataObjects.length;

            for (var i = 0; i < len; i += 1) {
                if (dos.xAxisType === "increment") {
                    dataObjects[i].w = dataObjects[i].xValue * chart.xScale;
                    dataObjects[i].x = chart.origin.x; //chart.graphXstart;
                } else {
                    dataObjects[i].w = chart.xWidth;
                    dataObjects[i].x = chart.gutterY + (i * chart.xWidth);
                }

                if (dos.yAxisType === "increment") {
                    var h = dataObjects[i].h = dataObjects[i].yValue * chart.yScale;
                    dataObjects[i].y = chart.origin.y - h;
                } else {
                    dataObjects[i].h = chart.yHeight;
                    dataObjects[i].y = chart.origin.y + (-(i + 1) * chart.yHeight);
                }
            }
        };

        makePrimitiveValues.line = function() {
            var dos = chart.dataObjectSeries;
            var dataObjects = dos.dataObjects;
            var len = dataObjects.length;

            for (var i = 0; i < len; i += 1) {
                if (dos.xAxisType === "increment") {
                    dataObjects[i].x = chart.graphXstart + (dataObjects[i].xValue * chart.xScale);
                } else {
                    dataObjects[i].w = chart.xWidth;
                    dataObjects[i].x = chart.gutterY + (i * chart.xWidth);
                }

                if (dos.yAxisType === "increment") {
                    dataObjects[i].y = chart.graphYend - (dataObjects[i].yValue * chart.yScale);
                } else {
                    dataObjects[i].h = chart.yHeight;
                    dataObjects[i].y = chart.graphYend + (-(i + 1) * chart.yHeight);
                }
            }
        };

        makePrimitiveValues.pie = function() {
            var dos = chart.dataObjectSeries;
            var dataObjects = dos.dataObjects;
            var len = dataObjects.length;

            for (var i = 0; i < len; i += 1) {
                var cdo = dataObjects[i];
                cdo.x = cdo.xValue;
                cdo.total = dos.xAxisTotal;
            }
        };

        // INIT FUNCTION
        var chartAxis = qti.chartAxis = function(chartList) {
            var len = chartList.length;
            prepCSSValues(); // sigh, not ideal, but waiting for the document to be ready

            var chartWidth;
            var chartFontSize;
            var svgElement;
            var svgContainer;

            var setChartText = function() {
                var textElements = svgContainer.find("svg\\:tspan");
                var containerWidth = svgElement.parentNode.clientWidth;
                if (containerWidth > chartWidth) {
                    containerWidth = chartWidth;
                }
                if (textElements) {
                    textElements.each(function(index, textElement) {
                        textElement.setAttribute("style", "font-size:" +
                            ((chartWidth / containerWidth) * chartFontSize) + "px");
                    });
                }
            };

            for (var i = 0; i < len; i += 1) {
                chart = chartList[i];
                var type = chart.dataObjectSeries.type;

                var p = Raphael(chart.container, chart.width, chart.height);
                chart.p = p;

                // Calculate the number of labels on each access, either increments or subLabels
                axisLabelNumber[type]("x");
                axisLabelNumber[type]("y");

                // Create the axis labels
                axisLabels[type]("x");
                axisLabels[type]("y");

                setValues[type]();

                makeAxisLabels[type]();

                makePrimitiveValues[type]();

                qti.drawAxis(chart);

                //Set viewBox to allow automatic scaling - clunky method used for older version of Raphael
                svgContainer = $("#" + chart.container);
                if (svgContainer) {
                    svgElement = svgContainer.find('svg,svg\\:svg')[0];
                    svgElement.setAttribute("viewBox", "0 0 " + chart.width + " " + chart.height);

                    chartWidth = chart.width;

                    if (chart.fontSize > 0) {
                        chartFontSize = chart.fontSize;
                    } else {
                        chartFontSize = 12;

                        var tempElement = svgContainer.find("svg\\:tspan")[0];

                        if (tempElement) {
                            chartFontSize = getFontSize(tempElement);
                        }
                    }

                    setChartText();
                    qti.subscribeToEvent("windowResize", setChartText, "Resize chart text", "resizeChartText", true);
                }
            }
        };
    })();

    (function() {
        function showXGrid(chart, p, x1) {
            if (chart.dataObjectSeries.xShowGrid === "true") {
                var gridColour = chart.dataObjectSeries.xGridColour;
                p.path(["M", x1, chart.graphYstart, "L", x1, chart.graphYend]).attr("stroke", gridColour);
            }
        }

        function showYGrid(chart, p, y1) {
            if (chart.dataObjectSeries.yShowGrid === "true") {
                var gridColour = chart.dataObjectSeries.yGridColour;
                p.path(["M", chart.gutterY, y1, "L", chart.width, y1]).attr("stroke", gridColour);
            }
        }

        function drawxAxis(chart, dataArray, p) {
            var dos = chart.dataObjectSeries;
            var len = dos.xIncs;
            var type = chart.dataObjectSeries.xAxisType;
            for (var i = 0; i < len; i += 1) {
                var data = dataArray[i];
                var label = p.text(data.x, data.y, data.label);
                var x1 = chart.graphXstart + ((i + 1) * chart.xWidth);
                var y1 = chart.origin.y;
                var y2 = chart.origin.y + 5;
                var t = "M" + x1 + " " + y1 + "L" + x1 + " " + y2;
                var tick = p.path(t);
                showXGrid(chart, p, x1);

                var minorIncs = Number(chart.dataObjectSeries.xAxisMinorInc);
                if (minorIncs) {
                    var start = chart.graphXstart + (chart.xWidth * i);
                    var incNumber = Number(chart.dataObjectSeries.xAxisMajorInc) / minorIncs;
                    for (var x = 0; x < incNumber; x += 1) {
                        var ix1 = start + ((x + 1) * minorIncs) * chart.xScale;
                        var iy1 = chart.origin.y;
                        var iy2 = iy1 + 3;
                        var it = "M" + ix1 + " " + iy1 + "L" + ix1 + " " + iy2;
                        var itick = p.path(it);
                    }
                }
            }
        }

        function drawyAxis(chart, dataArray, p) {
            var dos = chart.dataObjectSeries;
            var len = dos.yIncs;
            var type = chart.dataObjectSeries.yAxisType;

            // put a line at bottom of chart, increase increments length by 1 (includes 0 which would otherwise not be shown)
            if (dos.yMin < 0) {
                showYGrid(chart, p, chart.graphYend);
                len += 1;
            }

            for (var i = 0; i < len; i += 1) {
                var data = dataArray[i];
                var label = data && p.text(data.x, data.y, data.label);
                var x1 = chart.gutterY;
                var x2 = chart.gutterY - 5;
                var y1 = chart.graphYend - (chart.yHeight * (i + 1));
                var t = "M" + x1 + " " + y1 + "L" + x2 + " " + y1;
                var tick = p.path(t);

                // only add line if it's not on the chart's x axis
                if (y1 !== chart.origin.y) {
                    showYGrid(chart, p, y1);
                }

                var minorIncs = Number(chart.dataObjectSeries.yAxisMinorInc);
                if (minorIncs) {
                    var start = chart.graphYend - (chart.yHeight * i);
                    var incNumber = Number(chart.dataObjectSeries.yAxisMajorInc) / minorIncs;

                    for (var x = 0; x < incNumber; x += 1) {
                        var ix1 = chart.graphXstart;
                        var ix2 = ix1 - 3;
                        var iy1 = start - ((x + 1) * minorIncs) * chart.yScale;
                        var it = "M" + ix1 + " " + iy1 + "L" + ix2 + " " + iy1;
                        var itick = p.path(it);
                    }
                }
            }
        }
        qti.drawAxis = function(chart) {
            var p = chart.p;
            var dos = chart.dataObjectSeries;
            if (chart.dataObjectSeries.xAxisShow === "true") {
                var xPath = "M" + chart.origin.x + " " + chart.origin.y + "L" + chart.graphXend + " " + chart.origin.y;
                var x = p.path(xPath);
                if (chart.xAxisLabel) {
                    var xPos = chart.graphXend / 2;
                    var yPos = chart.height - chart.lineHeight;
                    var xLabel = p.text(xPos, yPos, chart.xAxisLabel);
                }
                drawxAxis(chart, dos.xAxisObject, p);
            }

            if (chart.dataObjectSeries.yAxisShow === "true") {
                var yPath = "M" + chart.graphXstart + " " + chart.graphYend + "L" + chart.graphXstart + " " + chart.graphYstart;
                var y = p.path(yPath);
                if (chart.yAxisLabel) {
                    var yLabel = p.text(chart.lineHeight, chart.graphYend / 2, chart.yAxisLabel).rotate(270, true);
                }
                drawyAxis(chart, dos.yAxisObject, p);
            }

            // Now make the primitives themselves
            qti.makePrimitives(chart);
        };
    })();

    (function() {

        // BAR CLASS
        var bar = (function() {
            var bar = {};
            var chart;
            var p; // paper
            var dos;
            var type;
            var dataObjects;
            var len;

            function makeBar(dataObject, i) {
                var o = chart.orientation;
                if (o !== "vertical" && o !== "horizontal") {
                    throw new Error("unknown orientation");
                }
                var bar,
                    VERT = (o === "vertical"),
                    attr = {
                        "stroke": dos.stroke,
                        "fill": dataObject.fill,
                        "stroke-width": dos.strokeWidth
                    };

                if (VERT && (dataObject.h === 0) && (dataObject.isYEditable === "true")) {
                    bar = p.rect(dataObject.x, dataObject.y - dos.yZeroBarHeight, dataObject.w, dos.yZeroBarHeight);
                    attr = {
                        "stroke": dos.stroke,
                        "fill": "rgba(255,255,255,0.75)",
                        "stroke-width": "0"
                    };
                } else if (dataObject.h < 0) {
                    bar = p.rect(dataObject.x, dataObject.y + dataObject.h, dataObject.w, Math.abs(dataObject.h));
                } else {
                    bar = p.rect(dataObject.x, dataObject.y, dataObject.w, dataObject.h);
                }
                bar.attr(attr);

                if ((VERT && dataObject.isYEditable) || (!VERT && dataObject.isXEditable)) {
                    qti.addChartEvents("move", "bar", bar, chart, dataObject, VERT);
                }
            }

            bar.makeBars = function(thisChart) {
                chart = thisChart;
                p = chart.p;
                dos = chart.dataObjectSeries;
                type = dos.type;
                dataObjects = dos.dataObjects;
                len = dataObjects.length;

                for (var i = 0; i < len; i += 1) {
                    var dataObject = dataObjects[i];
                    makeBar(dataObject, i);
                }
            };

            return bar;
        }());

        // LINE CLASS
        var line = (function() {
            var line = {};
            var chart;
            var p;
            var dos;
            var dataObjects;
            var len;
            var pointsList = [];

            function makeLine(dataObject, i) {
                var o = chart.orientation;
                if (o !== "vertical" && o !== "horizontal") {
                    throw new Error("unknown orientation");
                }
                var VERT = (o === "vertical");
                var value = (VERT) ? dataObject.yValue : dataObject.xValue;

                var lineInfo = {
                    "x": dataObject.x,
                    "y": dataObject.y,
                    "value": value
                };

                // draw line
                if (i !== 0) {
                    var path = "M" + dataObject.x + " " + dataObject.y + "L" + pointsList[i - 1].x + " " + pointsList[i - 1].y;
                    var line = p.path(path);
                    var lineAttr = {
                        "stroke": dos.stroke,
                        "stroke-width": dos.strokeWidth
                    };
                    line.attr(lineAttr);
                    line.toBack();
                    lineInfo.preLine = line;
                }

                // draw point
                var point = p.circle(dataObject.x, dataObject.y, dos.pointSize);
                var pointAttr = {
                    "fill": dos.pointFill
                };
                point.attr(pointAttr);
                lineInfo.point = point;

                if (dataObject.isXEditable || dataObject.isYEditable) {
                    qti.addChartEvents("move", "line", lineInfo, chart, dataObject, VERT);
                }

                pointsList.push(lineInfo);
            }

            line.makeLines = function(thisChart) {
                chart = thisChart;
                p = chart.p;
                dos = chart.dataObjectSeries;
                dataObjects = dos.dataObjects;
                len = dataObjects.length;
                pointsList = [];
                for (var i = 0; i < len; i += 1) {
                    var dataObject = dataObjects[i];
                    makeLine(dataObject, i);
                }

                //attach postLine
                for (var x = 0; x < len - 1; x += 1) {
                    pointsList[x].postLine = pointsList[x + 1].preLine;
                }
            };

            return line;
        })();

        // PIE CLASS
        var pie = (function() {
            var chart;
            var p; // paper
            var dos;
            var type;
            var dataObjects;
            var len;
            var pie = {};
            var origin;
            var previousAngle;
            var r;

            function updateDataObject(i, settings) {
                dataObjects[i].currentSlice = dataObjects[i].currentSlice || {};
                for (var key in settings) {
                    if (settings.hasOwnProperty(key)) {
                        dataObjects[i].currentSlice[key] = settings[key];
                    }
                }
            }

            qti.HsPoint = function(x, y, q) {
                this.x = x;
                this.y = y;
                var shell = this;
                var quad = q || 0;

                this.scale = function(s) {
                    var x = shell.x * s;
                    var y = shell.y * s;
                    return new qti.HsPoint(x, y, quad);
                };

                this.addToMe = function(vector) {
                    var x = shell.x + vector.x;
                    var y = shell.y + vector.y;
                    return new qti.HsPoint(x, y, quad);
                };

                this.getQuad = function() {
                    return quad;
                };

                this.diff = function(v) {
                    var x, y;

                    if (shell.x > v.x && v.y > shell.y) {
                        quad = 0;
                        x = shell.x - v.x;
                        y = v.y - shell.y;
                    } else if (shell.x > v.x && shell.y > v.y) {
                        quad = 90;
                        x = shell.x - v.x;
                        y = shell.y - v.y;
                    } else if (v.x > shell.x && shell.y > v.y) {
                        quad = 180;
                        x = v.x - shell.x;
                        y = shell.y - v.y;
                    } else {
                        quad = 270;
                        x = v.x - shell.x;
                        y = v.y - shell.y;
                    }

                    return new qti.HsPoint(x, y, quad);
                };

                this.returnAngle = function() {
                    var angle;
                    if (quad === 90 || quad === 270) {
                        angle = Math.atan(this.y / this.x);
                    } else {
                        angle = Math.atan(this.x / this.y);
                    }
                    angle = quad + $.rToD(angle);
                    return angle;
                };

                this.unitVector = function(a) {
                    var angle = (a !== undefined) ? a : this.returnAngle();
                    var x = Math.sin(angle * (Math.PI / 180));
                    var y = -Math.cos(angle * (Math.PI / 180));
                    return new qti.HsPoint(x, y, quad);
                };
            };

            qti.angleFromValue = function(value) {
                return 360 * value / dos.xAxisTotal;
            };

            qti.valueFromAngle = function(angle) {
                return angle / 360 * dos.xAxisTotal;
            };

            function drawSlice(x1, y1, x2, y2, largeArcFlag, attr) {
                var slice = p.path(["M", origin.x, origin.y, "L", x1, y1, "A", r, r, 0, largeArcFlag, 1, x2, y2, "z"]);
                slice.attr(attr);
                return slice;
            }

            qti.PieLabel = function(a) {
                var d = r + 50;
                var x1y1 = new qti.HsPoint().unitVector(a).scale(d).addToMe(origin);
                var x = x1y1.x;
                var y = x1y1.y;
                var attr = {};

                while (a > 360) {
                    a = a - 360;
                }

                if (a < 45) {
                    x += 5;
                    y += 10;
                    attr["text-anchor"] = "start";
                } else if (a >= 45 && a < 135) {
                    x += 10;
                    y += 5;
                    attr["text-anchor"] = "start";
                } else if (a >= 135 && a < 225) {
                    x -= 10;
                    y -= 5;
                    attr["text-anchor"] = "start";
                } else {
                    x -= 5;
                    y -= 10;
                    attr["text-anchor"] = "end";
                }

                return {
                    "x": x,
                    "y": y,
                    "attr": attr
                };
            };

            function drawLabel(angle, endAngle, label, i) {
                var a = endAngle - (angle / 2);
                var x1y1 = new qti.PieLabel(a);

                var labelLine = p.path(["M", origin.x, origin.y, "L", x1y1.x, x1y1.y]).attr("stroke", "#ccc").toBack();
                var text = p.text(x1y1.x + 5, x1y1.y + 5, label).attr(x1y1.attr);

                updateDataObject(i, {
                    "labelLine": labelLine,
                    "labelText": text,
                    "labelAngle": a
                });
            }

            function makeSlice(dataObject, i) {
                var x1y1 = new qti.HsPoint().unitVector(previousAngle).scale(r).addToMe(origin);
                var angle = qti.angleFromValue(dataObject.x);
                var newEndAngle = previousAngle + angle;
                var x2y2 = new qti.HsPoint().unitVector(newEndAngle).scale(r).addToMe(origin);
                var largeArcFlag = (angle >= 180) ? 1 : 0;
                var attr = {
                    "stroke": "#000",
                    "stroke-width": 1,
                    "fill": dataObject.fill
                };

                var pieSlice = drawSlice(x1y1.x, x1y1.y, x2y2.x, x2y2.y, largeArcFlag, attr);

                var label = drawLabel(angle, newEndAngle, dos.yAxisObject[i].label, i);

                updateDataObject(i, {
                    "slice": pieSlice,
                    "x1y1": x1y1,
                    "x2y2": x2y2,
                    "startAngle": previousAngle,
                    "endAngle": newEndAngle,
                    "angle": angle,
                    "index": i,
                    "fill": dataObject.fill,
                    "label": dataObject.yValue,
                    "total": dataObject.total,
                    "value": dataObject.x
                });

                previousAngle = newEndAngle;

            }

            function makeHandles() {
                var i, len, slice1, slice2, point, handle;

                for (i = 0, len = dataObjects.length; i < len; i += 1) {
                    slice1 = (i === 0) ? dataObjects[len - 1].currentSlice : dataObjects[i - 1].currentSlice;
                    slice2 = dataObjects[i].currentSlice;
                    point = p.circle(slice2.x1y1.x, slice2.x1y1.y, dos.handleWidth);
                    handle = {
                        "slice1": slice1.index,
                        "slice2": slice2.index,
                        "point": point
                    };

                    point.attr({
                        "fill": slice2.fill
                    });

                    if (dataObjects[i].isXEditable) {
                        qti.addChartEvents("move", "pie", handle, chart, dataObjects[i], false);
                    } else {
                        qti.addChartEvents("nonMove", "pie", handle, chart, dataObjects[i], false);
                    }
                }
            }

            pie.makeSlices = function(thisChart) {
                chart = thisChart;
                p = chart.p;
                dos = chart.dataObjectSeries;
                type = dos.type;
                dataObjects = dos.dataObjects;
                len = dataObjects.length;
                origin = new qti.HsPoint(250, 200);
                dos.origin = origin;
                previousAngle = 0;
                r = dos.radius;

                for (var i = 0; i < len; i += 1) {
                    var dataObject = dataObjects[i];
                    makeSlice(dataObject, i);
                }

                makeHandles();
            };

            return pie;
        })();

        // MAKE PRIMITIVES INIT
        qti.makePrimitives = function(chart) {
            var type = chart.dataObjectSeries.type;

            switch (type) {
                case "bar":
                    bar.makeBars(chart);
                    break;
                case "line":
                    line.makeLines(chart);
                    break;
                case "pie":
                    pie.makeSlices(chart);
                    break;
                default:
                    throw new Error("unrecognised chart type");
            }
        };
    })();
    (function() {
        var chartEvent = {};
        chartEvent.move = {};
        chartEvent.nonMove = {};

        // SET TEXT AND QTI VALUES                        
        var setText = function(textElement, newValue, max, min) {
            var text = Math.round(newValue, 0);
            if (newValue === max) {
                text += " - max";
            }

            if (newValue === min) {
                text += " - min";
            }

            textElement.attr({
                "text": text
            });
        };

        var setTableValue = function(dataObject, newValue, VERT) {
            var td;
            if (VERT) {
                td = dataObject.yTd;
            } else {
                td = dataObject.xTd;
            }
            td.text(newValue);
        };

        var setQtiValue = function(dataObject, VERT, newValue) {
            var rid;
            if (VERT) {
                rid = dataObject.yRid;
            } else {
                rid = dataObject.xRid;
            }
            var responseVariable = qti.getVariable(rid);
            responseVariable.setValue(newValue);
        };

        var showAnglePerCent = function(point, origin, s, textElement, dragging, v) {
            var angle, x, y, offset = 20;

            dragging = (dragging === undefined) ? false : dragging;

            x = point.attr("cx");
            y = point.attr("cy");

            x = (x > origin.x) ? x + offset : x - offset;
            y = (y > origin.y) ? y + offset : y - offset;

            angle = dragging ? parseInt(Math.round(v), 0) : parseInt(s.xValue, 0);
            textElement.attr({
                "text": Math.round(angle, 0) + "%",
                "x": x,
                "y": y
            }).show();
        };

        // MOVE A BAR
        chartEvent.move.bar = function(bar, chart, dataObject, VERT) {
            var o = chart.orientation;
            if (o !== "vertical" && o !== "horizontal") {
                throw new Error("unknown orientation");
            }

            var dos = chart.dataObjectSeries;
            var newValue, neww, newh, newy;
            var textElement = chart.p.text(100, 100, newValue).attr({
                "text-anchor": "left"
            }).hide();
            var max = (VERT) ? Number(dos.yMax) : Number(dos.xMax);
            var min = (VERT) ? Number(dos.yMin) : Number(dos.xMin);
            var isDragging = false;
            var mouseWithin = false;
            var snapTo = (VERT) ? dos.ySnapTo : dos.xSnapTo;
            var chartOffset = (VERT) ? chart.origin.y : chart.origin.x;
            var showText = (VERT) ? dos.yShowValue : dos.xShowValue;
            var showGuide = (VERT) ? dos.yShowGuide : dos.xShowGuide;
            var fill = dataObject.fill;
            var activeFill = dataObject.activeFill;
            var guide;
            var guideStroke = (VERT) ? dos.yGuideStroke : dos.xGuideStroke;

            var fillBar = function(type) {
                if (activeFill) {
                    if (type === "active") {
                        bar.attr("fill", activeFill);
                    } else {
                        bar.attr("fill", fill);
                    }
                }
            };

            var toggleVisibility = function(type) {
                if (type === "hidden") {
                    bar.attr({
                        "fill": "rgba(255,255,255,0.75)",
                        "stroke-width": "0"
                    });
                } else if (type === "hover") {
                    bar.attr({
                        "fill": dataObject.fill.replace(',1)', ',0.25)'),
                        "stroke-width": dos.strokeWidth
                    });
                } else {
                    bar.attr({
                        "fill": dataObject.fill,
                        "stroke-width": dos.strokeWidth
                    });
                }
            };

            // DRAWING THE GUIDE
            var drawGuide = function(isNegative) {
                if (showGuide === "true") {
                    if (VERT) {
                        var y;
                        if (isNegative) {
                            y = chartOffset + bar.attr("height");
                        } else {
                            y = chartOffset - bar.attr("height");
                        }
                        var x2 = dataObject.x;
                        var x1 = chart.graphXstart;
                        guide = chart.p.path(["M", x1, y, "L", x2, y]).attr("stroke", guideStroke);
                    } else {
                        var x = bar.attr("width") + chartOffset;
                        var y1 = dataObject.y;
                        var y2 = chart.graphYend;
                        guide = chart.p.path(["M", x, y1, "L", x, y2]).attr("stroke", guideStroke);
                    }
                }
            };

            var removeGuide = function() {
                if (showGuide === "true") {
                    guide.remove();
                }
            };

            var moveXguide = function(isNegative) {
                var y, y1;
                if (isNegative) {
                    y = chartOffset + bar.attr("height");
                    y1 = y + chart.lineHeight / 2;
                } else {
                    y = chartOffset - bar.attr("height");
                    y1 = y - chart.lineHeight / 2;
                }
                textElement.attr({
                    "y": y1
                });
                var x1 = chart.graphXstart;
                var x2 = dataObject.x;
                if (showGuide === "true") {
                    guide.attr({
                        "path": ["M", x1, y, "L", x2, y]
                    });
                }
            };
            var moveYguide = function() {
                var x = newValue * chart.xScale + chartOffset;
                var y1 = dataObject.y;
                var y2 = chart.graphYend;
                if (showGuide === "true") {
                    guide.attr({
                        "path": ["M", x, y1, "L", x, y2]
                    });
                }
                textElement.attr({
                    "x": x + 5
                });
            };

            // SNAP TO
            var snapBar = function(isNegative) {
                if (VERT) {
                    var y, y1,
                        h = Math.abs(newValue) * chart.yScale,

                        barZero = (h === 0);

                    // make handler bar
                    if (barZero) {
                        h = dos.yZeroBarHeight;
                        toggleVisibility('hidden');
                    } else {
                        toggleVisibility('show');
                    }

                    if (isNegative && !barZero) {
                        y = chartOffset;
                        y1 = y + h + chart.lineHeight / 2;
                    } else {
                        y = chartOffset - h;
                        y1 = y - chart.lineHeight / 2;
                    }

                    bar.attr({
                        y: y,
                        height: h
                    });
                    textElement.attr({
                        "y": y1
                    });

                } else {
                    var w = newValue * chart.xScale;
                    bar.attr({
                        width: w
                    });
                    var x = w + chartOffset + 5;
                    textElement.attr({
                        "x": x
                    });
                }
            };

            // Drawing the bars
            var drawVerticalBar = function() {
                bar.attr({
                    y: newy,
                    height: newh
                });
            };

            var drawHorizontalBar = function() {
                var w = newValue * chart.xScale;
                bar.attr({
                    width: w
                });
            };

            var minMax = function(isNegative) {
                if (VERT) {
                    if (newValue > max) {
                        newValue = max;
                        if (isNegative) {

                            newh = Math.abs(newValue) * chart.yScale;
                            newy = chartOffset;
                        } else {

                            newh = newValue * chart.yScale;
                            newy = chartOffset - newh;
                        }
                        return;
                    }
                    if (newValue < min) {
                        newValue = min;
                        if (isNegative) {
                            newh = Math.abs(newValue) * chart.yScale;
                            newy = chartOffset;
                        } else {
                            newh = newValue * chart.yScale;
                            newy = chartOffset - newh;
                        }
                        return;
                    }
                } else {
                    if (newValue > max) {
                        newValue = max;
                        neww = newValue * chart.xScale;
                    }
                    if (newValue < min) {
                        newValue = min;
                        neww = newValue * chart.xScale;
                    }
                }
            };

            var start = function(x, y) {
                var chartNegative = (dos.yMin < 0 && (y >= (Math.round($('[raphaelChart\\:class="chartContainer"]').offset().top) + chartOffset)));
                // storing original coordinates
                this.oh = this.attr("height");
                this.oy = this.attr("y");
                this.ow = this.attr("width");
                this.ox = this.attr("x");
                drawGuide(chartNegative);
                isDragging = true;
            };

            var move = function(dx, dy, x, y) {
                if (VERT) {
                    var chartTop = (Math.round($('[raphaelChart\\:class="chartContainer"]').offset().top) + chartOffset),
                        chartNegative = (dos.yMin < 0 && (y >= chartTop));

                    if (chartNegative) {
                        newh = y - chartTop;
                        newy = chartOffset;
                        newValue = -Math.round(newh / chart.yScale);
                    } else if (dos.yMin < 0) {
                        newh = chartTop - y;
                        newy = chartOffset - newh;

                        newValue = Math.round(newh / chart.yScale);
                    } else {
                        newh = Math.round(this.oh - dy);
                        newy = chartOffset - newh;
                        newValue = Math.round(newh / chart.yScale);
                    }

                    minMax(chartNegative);

                    toggleVisibility('show');
                    drawVerticalBar(newy, newh);
                    moveXguide(chartNegative);
                } else {
                    neww = this.ow + dx;
                    newValue = Math.round(neww / chart.xScale);
                    minMax();
                    drawHorizontalBar();
                    moveYguide();
                }
                setText(textElement, newValue, max, min);

                if (showText === "false") {
                    textElement.hide();
                }
            };

            var up = function(e) {
                var chartNegative = (dos.yMin < 0 && (e.clientY >= (Math.round($('[raphaelChart\\:class="chartContainer"]').offset().top) + chartOffset)));

                newValue = (Math.round(newValue / snapTo) * snapTo);
                minMax();
                setText(textElement, newValue, max, min);
                snapBar(chartNegative);
                setTableValue(dataObject, newValue, VERT);
                setQtiValue(dataObject, VERT, newValue);
                removeGuide();

                if (!mouseWithin) {
                    textElement.hide();
                }
                isDragging = false;
            };

            bar.drag(move, start, up);

            var over = function(e) {
                var x, y,
                    h = bar.attr("height"),
                    chartNegative = (dos.yMin < 0 && (e.clientY >= (Math.round($('[raphaelChart\\:class="chartContainer"]').offset().top) + chartOffset)));

                if (VERT) {
                    if (chartNegative) {
                        newValue = -(h / chart.yScale);
                        y = (chartOffset + h) + chart.lineHeight / 2;
                    } else {
                        if ((h === dos.yZeroBarHeight) && (!isDragging)) {
                            h = 0;
                            toggleVisibility('hover');
                        }
                        newValue = h / chart.yScale;
                        y = (chartOffset - h) - chart.lineHeight / 2;
                    }

                    x = dataObject.x + 10;
                    //this.attr("cursor", "row-resize");
                    this.attr("cursor", "pointer");
                } else {
                    newValue = bar.attr("width") / chart.xScale;
                    y = dataObject.y + chart.yHeight / 2;
                    x = bar.attr("width") + chartOffset + 5;
                    //this.attr("cursor", "col-resize");
                    this.attr("cursor", "pointer");
                }
                if (newValue === 0) {
                    textElement.attr({
                        "text": 0,
                        "x": x,
                        "y": y - dos.yZeroBarHeight
                    }).show();
                } else if (showText === "true") {
                    textElement.attr({
                        "text": Math.round(newValue, 0),
                        "x": x,
                        "y": y
                    }).show();
                }

                fillBar("active");
                mouseWithin = true;
            };

            var out = function(e) {
                if (!isDragging) {
                    textElement.hide();
                    if (bar.attr("height") === dos.yZeroBarHeight) {
                        toggleVisibility('hidden');
                    }
                }
                fillBar("inactive");
                this.attr("cursor", "pointer");
                mouseWithin = false;
            };

            bar.hover(over, out);

        };

        // MOVE A LINE
        chartEvent.move.line = function(lineInfo, chart, dataObject, VERT) {
            var point = lineInfo.point;
            var newValue = lineInfo.value;
            var newy = lineInfo.y;
            var newx = lineInfo.x;
            var dos = chart.dataObjectSeries;
            var textElement = chart.p.text(100, 100, newValue).attr({
                "text-anchor": "left"
            }).hide();
            var max = (VERT) ? Number(dos.yMax) : Number(dos.xMax);
            var min = (VERT) ? Number(dos.yMin) : Number(dos.xMin);
            var isDragging = false;
            var mouseWithin = false;
            var snapTo = (VERT) ? Number(dos.ySnapTo) : Number(dos.xSnapTo);
            var chartOffset = (VERT) ? chart.graphYend : chart.graphXstart;
            var showText = dataObject.showValue;
            var showGuide = (VERT) ? dos.yShowGuide : dos.xShowGuide;
            var guide;
            var guideStroke = (VERT) ? dos.yGuideStroke : dos.xGuideStroke;
            var fill = dos.pointFill;
            var activeFill = dos.pointActive;

            var fillPoint = function(type) {
                if (activeFill) {
                    if (type === "active") {
                        point.attr("fill", activeFill);
                    } else {
                        point.attr("fill", fill);
                    }
                }
            };

            // DRAWING THE GUIDE
            var drawGuide = function() {
                if (showGuide === "true") {
                    if (VERT) {
                        var x2 = dataObject.x;
                        var x1 = chart.graphXstart;
                        guide = chart.p.path(["M", x1, newy, "L", x2, newy]);
                        guide.attr("stroke", guideStroke);
                        guide.toBack();
                    } else {
                        var y1 = dataObject.y;
                        var y2 = chart.graphYend;
                        guide = chart.p.path(["M", newx, y1, "L", newx, y2]);
                        guide.attr("stroke", guideStroke);
                        guide.toBack();
                    }
                }
            };

            var removeGuide = function() {
                if (showGuide === "true") {
                    guide.remove();
                }
            };

            var moveXguide = function() {
                var x1 = chart.graphXstart;
                var x2 = dataObject.x;
                if (showGuide === "true") {
                    guide.attr({
                        "path": ["M", x1, newy, "L", x2, newy]
                    });
                }
                textElement.attr({
                    "y": newy - 15
                });
            };

            var moveYguide = function() {
                var y1 = dataObject.y;
                var y2 = chart.graphYend;
                if (showGuide === "true") {
                    guide.attr({
                        "path": ["M", newx, y1, "L", newx, y2]
                    });
                }
                textElement.attr({
                    "x": newx + 15
                });
            };


            var minMax = function() {
                if (VERT) {
                    var newh;

                    if (newValue > max) {
                        newValue = max;
                        newh = newValue * chart.yScale;
                        newy = chartOffset - newh;
                        return;
                    }

                    if (newValue < min) {
                        newValue = min;
                        newh = newValue * chart.yScale;
                        newy = chartOffset - newh;
                        return;
                    }
                } else {
                    if (newValue > max) {
                        newValue = max;
                        newx = chart.graphXstart + (newValue * chart.xScale);
                    }

                    if (newValue < min) {
                        newValue = min;
                        newx = chart.graphXstart + (newValue * chart.xScale);
                    }
                }
            };

            // Drawing the lines
            var drawVerticalLine = function() {
                var postLine = lineInfo.postLine;
                var m, l;
                if (postLine !== undefined) {
                    m = postLine.attr("path")[0];
                    l = postLine.attr("path")[1];
                    postLine.attr({
                        "path": ["M", m[1], m[2], "L", l[1], newy]
                    });
                }

                var preLine = lineInfo.preLine;
                if (preLine !== undefined) {
                    m = preLine.attr("path")[0];
                    l = preLine.attr("path")[1];
                    preLine.attr({
                        "path": ["M", m[1], newy, "L", l[1], l[2]]
                    });
                }
                point.attr({
                    "cy": newy
                });

            };

            var drawHorizontalLine = function() {
                var postLine = lineInfo.postLine;
                var m, l;
                if (postLine !== undefined) {
                    m = postLine.attr("path")[0];
                    l = postLine.attr("path")[1];
                    postLine.attr({
                        "path": ["M", m[1], m[2], "L", newx, l[2]]
                    });
                }

                var preLine = lineInfo.preLine;
                if (preLine !== undefined) {
                    m = preLine.attr("path")[0];
                    l = preLine.attr("path")[1];
                    preLine.attr({
                        "path": ["M", newx, m[2], "L", l[1], l[2]]
                    });
                }
                point.attr({
                    "cx": newx
                });
            };

            var start = function() {
                // storing original coordinates
                this.oy = this.attr("cy");
                this.ox = this.attr("cx");
                drawGuide();
                isDragging = true;
            };

            var move = function(dx, dy) {
                if (VERT) {
                    newy = this.oy + dy;
                    newValue = (chart.graphYend - newy) / chart.yScale;

                    minMax();
                    drawVerticalLine();
                    moveXguide();

                } else {
                    newx = this.ox + dx;
                    newValue = (newx - chart.graphXstart) / chart.xScale;
                    minMax();
                    drawHorizontalLine();
                    moveYguide();
                }

                setText(textElement, newValue, max, min);
            };

            var up = function() {
                newValue = Math.round(newValue / snapTo) * snapTo;
                if (VERT) {
                    newy = chart.graphYend - (newValue * chart.yScale);
                } else {
                    newx = chart.graphXstart + (newValue * chart.xScale);
                }

                minMax();
                setText(textElement, newValue, max, min);
                if (VERT) {
                    drawVerticalLine();
                } else {
                    drawHorizontalLine();
                }

                setTableValue(dataObject, newValue, VERT);
                setQtiValue(dataObject, VERT, newValue);
                removeGuide();

                if (!mouseWithin) {
                    textElement.hide();
                }
                isDragging = false;
            };

            point.drag(move, start, up);

            var over = function(e) {
                var x = newx || lineInfo.x;
                var y = newy || lineInfo.y;

                if (VERT) {
                    y -= 15;
                    //this.attr("cursor", "row-resize");
                    this.attr("cursor", "pointer");
                } else {
                    x += 15;
                    //this.attr("cursor", "col-resize");
                    this.attr("cursor", "pointer");
                }
                textElement.attr({
                    "text": Math.round(newValue, 0),
                    "x": x,
                    "y": y
                }).show();
                fillPoint("active");
                mouseWithin = true;
            };

            var out = function(e) {
                if (!isDragging) {
                    textElement.hide();
                }
                fillPoint("inactive");
                this.attr("cursor", "pointer");
                mouseWithin = false;
            };

            point.hover(over, out);

        };

        // nonmoveable slice of PIE 
        chartEvent.nonMove.pie = function(handle, chart, dataObject, VERT) {
            var point = handle.point;
            var dos = chart.dataObjectSeries;
            var s2 = dos.dataObjects[handle.slice2];
            var p = chart.p;
            var origin = dos.origin;
            var textElement = chart.p.text(100, 100, parseInt(s2.xValue, 0)).attr({
                "text-anchor": "left"
            }).hide();

            var over = function(e) {
                showAnglePerCent(point, origin, s2, textElement);
            };

            var out = function(e) {
                textElement.hide();
            };

            point.hover(over, out);
        };

        // MOVE PIE 
        chartEvent.move.pie = function(handle, chart, dataObject, VERT) {
            var point = handle.point;
            var dos = chart.dataObjectSeries;
            var s1 = dos.dataObjects[handle.slice1];
            var s2 = dos.dataObjects[handle.slice2];
            var v1, v2;
            var la1, la2; // Label angles
            var cs1 = s1.currentSlice;
            var cs2 = s2.currentSlice;
            var p = chart.p;
            var r = dos.radius;
            var origin = dos.origin;
            var m; // marker
            var textElement = chart.p.text(100, 100, parseInt(s2.xValue, 0)).attr({
                "text-anchor": "left"
            }).hide();
            var fill = dos.pointFill;
            var activeFill = dos.pointActive;
            //var chartOffset = (VERT) ? chart.graphYend : chart.graphXstart; 
            var mouseWithin = false;
            var isDragging = false;

            var fillPoint = function(type) {
                if (activeFill) {
                    if (type === "active") {
                        point.attr("fill", activeFill);
                    } else {
                        point.attr("fill", fill);
                    }
                }
            };

            function makeArcFlag(val) {
                var totalAngle = qti.angleFromValue(val);
                return (totalAngle >= 180) ? 1 : 0;
            }

            function updateValues() {
                setTableValue(s1, s1.xValue, VERT);
                setQtiValue(s1, VERT, s1.xValue);
                setTableValue(s2, s2.xValue, VERT);
                setQtiValue(s2, VERT, s2.xValue);
            }

            function moveLabel(slice, aFlag) {
                var a = slice.labelAngle + (m.angleDiff / 2);

                if (aFlag === "la1") {
                    la1 = a;
                } else {
                    la2 = a;
                }

                var xy = new qti.PieLabel(a);
                var labelLine = slice.labelLine.attr({
                    "path": ["M", origin.x, origin.y, "L", xy.x, xy.y]
                });
                var text = slice.labelText.attr({
                    "x": xy.x + 5,
                    "y": xy.y + 5,
                    "text-anchor": xy.attr["text-anchor"]
                });
            }

            function moveSlices() {
                var cv1 = Number(s1.xValue) + m.value;
                var cv2 = Number(s2.xValue) - m.value;
                var v1GreaterThanMin = cv1 >= dos.min;
                var v1LessThanMax = cv1 <= dos.max;
                var v2GreaterThanMin = cv2 >= dos.min;
                var v2LessThanMax = cv2 <= dos.max;

                if ((v1GreaterThanMin && v1LessThanMax) && (v2GreaterThanMin && v2LessThanMax)) {
                    //Move slice 1
                    v1 = cv1;
                    var largeArcFlag = makeArcFlag(v1);
                    cs1.x2y2.x = m.point.x;
                    cs1.x2y2.y = m.point.y;
                    var newSlice = cs1.slice.attr({
                        "path": ["M", origin.x, origin.y, "L", cs1.x1y1.x, cs1.x1y1.y, "A", r, r, 1, largeArcFlag, 1, m.point.x, m.point.y, "z"]
                    });
                    moveLabel(cs1, "la1");


                    //Move slice 2
                    v2 = cv2;
                    largeArcFlag = makeArcFlag(v2);
                    cs2.x1y1.x = m.point.x;
                    cs2.x1y1.y = m.point.y;
                    var newSlice2 = cs2.slice.attr({
                        "path": ["M", origin.x, origin.y, "L", cs2.x2y2.x, cs2.x2y2.y, "A", r, r, 1, largeArcFlag, 0, m.point.x, m.point.y, "z"]
                    });
                    moveLabel(cs2, "la2");

                    // Move point
                    point.attr({
                        cx: m.point.x,
                        cy: m.point.y
                    });
                }

            }

            var makeNewMarker = function(x, y, angles) {
                var m = {};
                m.point = new qti.HsPoint(x, y).diff(origin);
                m.angle = m.point.returnAngle();
                m.point = m.point.unitVector(m.angle).scale(r).addToMe(origin);
                m.sa = angles.startAngle;

                if (m.angle > angles.s2End && m.sa < angles.s2End) {
                    m.angle = m.angle - 360;
                } else if (m.angle < angles.s1Start && m.sa > angles.s1Start) {
                    m.sa = m.sa - 360;
                }

                m.angleDiff = m.angle - m.sa;

                var v = qti.valueFromAngle(m.angleDiff);
                m.value = v;

                return m;
            };

            var start = function() {
                // storing original coordinates
                this.oy = this.attr("cy");
                this.ox = this.attr("cx");
                this.angles = {};
                this.angles.startAngle = new qti.HsPoint(this.ox, this.oy).diff(origin).returnAngle();
                this.angles.s1Start = new qti.HsPoint(cs1.x1y1.x, cs1.x1y1.y).diff(origin).returnAngle();
                this.angles.s2End = new qti.HsPoint(cs2.x2y2.x, cs2.x2y2.y).diff(origin).returnAngle();

                if (this.angles.startAngle === 360) { // I know, I know...
                    this.angles.startAngle = 0;
                }

                isDragging = true;
            };

            var move = function(dx, dy) {
                var x = this.ox + dx,
                    y = this.oy + dy;

                m = makeNewMarker(x, y, this.angles);
                moveSlices();
                showAnglePerCent(point, origin, s2, textElement, isDragging, v2);
            };

            var up = function() {
                s1.xValue = Math.round(v1);
                s2.xValue = Math.round(v2);
                cs1.labelAngle = la1;
                cs2.labelAngle = la2;
                updateValues();

                if (!mouseWithin) {
                    textElement.hide();
                }
                isDragging = false;
            };

            point.drag(move, start, up);

            var over = function(e) {
                this.attr("cursor", "pointer");

                showAnglePerCent(point, origin, s2, textElement, isDragging, v2);
                fillPoint("active");
                mouseWithin = true;
            };

            var out = function(e) {
                if (!isDragging) {
                    textElement.hide();
                }
                fillPoint("inactive");
                this.attr("cursor", "pointer");
                mouseWithin = false;
            };

            point.hover(over, out);
        };

        qti.addChartEvents = function(action, type, element, chart, dataObject, VERT) {
            if (typeof chartEvent[action] !== "object" || typeof chartEvent[action][type] !== "function") {
                throw new Error("Unknown interaction type");
            }
            chartEvent[action][type](element, chart, dataObject, VERT);
        };
    })();

    (function() {

        var interactionLineHashes = $.createHash(),
            /* precompletedData = {
            	preCompletedArray:[],
            	preCompletedLine:false
            }, */

            transposeTable = function(table) {
                table.find('thead tr').detach().prependTo(table.find('tbody'));
                var t = table.find('tbody').eq(0),
                    r = t.find('tr'),
                    cols = r.length,
                    rows = r.eq(0).find('td,th').length,
                    cell, next, tem, i = 0,
                    tb = $('<tbody></tbody>');

                while (i < rows) {
                    cell = 0;
                    tem = $('<tr></tr>');
                    while (cell < cols) {
                        next = r.eq(cell++).find('td,th').eq(0);
                        tem.append(next);
                    }
                    tb.append(tem);
                    ++i;
                }
                table.find('tbody').remove();
                $(tb).appendTo(table);
                $(table)
                    .find('tbody tr:eq(0)')
                    .detach()
                    .appendTo(table.find('thead'))
                    .children()
                    .each(function() {
                        var trgt = $('<th scope="col">' + $(this).html() + '</th>');
                        $(this).copyAttributes(trgt);
                        $(this).replaceWith(trgt);
                    });
                $(table)
                    .find('tbody tr th:first-child')
                    .each(function() {
                        var trgt = $('<td scope="row">' + $(this).html() + '</td>');
                        $(this).copyAttributes(trgt);
                        $(this).replaceWith(trgt);
                    });
                table.show();
            },

            setEqualMaxHeight = qti.setEqualMaxHeight = function(elmts) {
                var maxHeight = 0;

                $(elmts).each(function() {
                    var $el = $(this).height('auto'),
                        currentHeight = $el.height();
                    maxHeight = Math.max(currentHeight, maxHeight);
                }).height(maxHeight);
            };

        function valueToConsole(val) {
            var i, j, k, v, str, strVal, keys = val.keys();

            for (i = 0; i < keys.length; i += 1) {
                k = keys[i];
                v = val.get(k);
                str = k + ':' + v;
                strVal = (strVal === undefined) ? str : strVal + ',' + str;
            }
            console.log(strVal);
        }

        function createLine(lineContainer, sourceX, sourceY, targetX, targetY, preCompletedLine) {
            var svgGroup = $.el('svg:g'),
                svgLine = $.el('svg:line'),
                svgContainer = lineContainer.find('svg,svg\\:svg');

            if (svgContainer[0].clientHeight === 0) {
                svgContainer.attr("style", "height:" + lineContainer[0].clientHeight + "px");
            }

            svgContainer.append(svgGroup);

            svgLine.attr("x1", sourceX);
            svgLine.attr("y1", sourceY);
            svgLine.attr("x2", targetX);
            svgLine.attr("y2", targetY);
            if (preCompletedLine) {
                $(svgLine).attr("class", "preCompletedLink");
            }
            svgGroup.append(svgLine);

            return svgGroup;
        }

        function getCoords(node) {
            var nodeCoords = {},
                parent = node.offsetParent;

            if (node && node.nodeType !== 1 && node.nodeType !== 3 &&
                node.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            nodeCoords.x1 = parseInt(node.offsetLeft, 10);
            nodeCoords.y1 = parseInt(node.offsetTop, 10);


            while (parent) {
                nodeCoords.x1 += parseInt(parent.offsetLeft, 10);
                nodeCoords.y1 += parseInt(parent.offsetTop, 10);
                parent = parent.offsetParent;
            }

            parent = node.parentNode;

            while (parent) {
                if (parent !== document.documentElement) {
                    if (!isNaN(parseInt(parent.scrollLeft, 10))) {
                        nodeCoords.x1 -= parseInt(parent.scrollLeft, 10);
                        if (parent.scrollWidth !== parent.offsetWidth) {
                            if (!nodeCoords.scrollParent) {
                                nodeCoords.scrollParent = parent;
                            }
                        }
                    }

                    if (!isNaN(parseInt(parent.scrollTop, 10))) {
                        nodeCoords.y1 -= parseInt(parent.scrollTop, 10);
                        if (parent.scrollHeight !== parent.offsetHeight) {
                            if (!nodeCoords.scrollParent) {
                                nodeCoords.scrollParent = parent;
                            }
                        }
                    }
                }
                parent = parent.parentNode;
            }

            nodeCoords.x2 = parseInt(nodeCoords.x1 + node.offsetWidth, 10);
            nodeCoords.y2 = parseInt(nodeCoords.y1 + node.offsetHeight, 10);

            return nodeCoords;
        }

        var loadItemFunc = function(itemBody) {
            var itemIdentifier = itemBody.attr('connect:identifier'),
                matchInteractions = itemBody.find('*[connect\\:class~="matchInteraction"]'),
                tableMatchInteractions = itemBody.find('*[connect\\:class~="tableMatchInteraction"]');

            tableMatchInteractions.each(function(index, tableMatchInteraction) {
                var interaction = $(tableMatchInteraction),
                    associableChoices, responseVariable, responseIdentifier, value, $separateStimulus;

                if (interaction.is('[connect\\:author-class~="separateStimulus"]')) {
                    $separateStimulus = interaction.find('div.separateStimulus');
                    if ($separateStimulus.length === 0) {
                        $separateStimulus = $('<div class="separateStimulus"/>');
                        interaction.prepend($separateStimulus);
                    }
                    if (itemBody.find('em[connect\\:author-class~="highlight"]').length === 0) {
                        $separateStimulus.addClass('active');
                    }
                    interaction.find('tbody td:has(span.questionNumber)').each(function(idx) {
                        var $this = $(this),
                            qnSpan = $this.find('span.questionNumber'),
                            qNum = qnSpan.text(),
                            p = $('<p/>').attr('data-interaction-identifier', $this.attr('connect:identifier')),
                            tdContent = $this.clone();

                        tdContent.children('span.questionNumber').remove();
                        p.append('<span class="qn"><strong>' + qNum + '</strong></span>');
                        p.append($.trim(tdContent.text()));

                        $separateStimulus.append(p);
                        $this.html(qnSpan);
                    });
                }

                if (interaction.is('[connect\\:author-class~="transposeView"]')) {
                    transposeTable(interaction.children('table'));
                }

                interaction.find('thead th, tbody td').each(function(idx) {
                    var $this = $(this),
                        $firstRowOfCells = interaction.find('tbody tr').first().find('td');

                    if ($this.is('th[connect\\:identifier]')) {
                        $this.on('focus click', function(event) {
                            var i = interaction.find('th').index($this[0]);
                            $($firstRowOfCells[i]).focus();
                        });
                    } else if ($this.is('td[connect\\:identifier]')) {
                        $this.on('focus click', function(event) {
                            $(this).next().focus();
                        });
                    } else if ($this.is('td')) {
                        $this.attr('tabindex', "0");
                    }

                    if ($this.has('input')) {
                        $this.on('keydown', function(event) {
                            if (event.which === 13) {
                                $(this).trigger('click');
                            }
                        });
                    }
                });

                var maxAssociations = interaction.attr('connect:maxAssociations');
                maxAssociations = (!maxAssociations) ? 0 : parseInt(maxAssociations, 10);

                responseIdentifier = interaction.attr('connect:responseIdentifier');
                responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);

                var cardinality = responseVariable.getCardinality();
                var baseType = responseVariable.getBaseType();

                if (responseVariable.getValue() !== undefined) {
                    value = $.createHash(responseVariable.getValue());
                } else {
                    value = $.createHash();
                }

                associableChoices = interaction.find('*[connect\\:class~="associableChoice"]');
                associableChoices.each(function(index, associableChoice) {
                    associableChoice = $(associableChoice);

                    var choiceValue = associableChoice[0].value,
                        sourceId = choiceValue.substring(0, choiceValue.indexOf(' ')),
                        targetId = choiceValue.substring(choiceValue.indexOf(' ') + 1, choiceValue.length),
                        checked = function(id) {
                            var checked = interaction.find('td.checked').find('input[value~="' + id + '"]');
                            return checked;
                        },
                        setResponseVariable = function() {
                            if (value.size() !== 0) {
                                //valueToConsole(value);	// uncomment for trace
                                responseVariable.setValue(value);
                            } else {
                                responseVariable.setValue(undefined);
                            }
                        },
                        removeValue = function(sId, tId) {
                            var i, l,
                                av = value.get(sId);
                            if (av !== undefined) {
                                av = av.replace('_' + tId, '');
                                av = av.replace(tId + '_', '');
                                av = av.replace(tId, '');
                            }

                            if (av !== undefined && av.length > 0) {
                                value.set(sId, av);
                            } else {
                                value.remove(sId);
                            }
                            setResponseVariable();
                        },
                        addValue = function(sId, tId) {
                            var av = value.get(sId);
                            if (av === undefined) {
                                av = tId;
                            } else {
                                av = av + '_' + tId;
                            }
                            value.set(sId, av);
                            setResponseVariable();
                        },
                        removeChecked = function(id) {
                            var cell = checked(id),
                                ids;
                            cell[0].checked = false;
                            cell.parent().removeClass('checked');
                            ids = cell[0].value.split(" ");
                            removeValue(ids[0], ids[1]);
                        };

                    value.ulibEach(function(currentValue) {
                        var av = currentValue.value(),
                            i, l;
                        if (currentValue.key() === sourceId) {
                            for (i = 0, l = av.length; i < l; i++) {
                                if (av[i] === targetId) {
                                    associableChoice[0].checked = true;
                                    associableChoice.parent().addClass('checked');
                                    break;
                                }
                            }
                        }
                    });

                    associableChoice.parent().click(function(event) {
                        var sChecked, tChecked,
                            rMax = parseInt(interaction.find('[connect\\:identifier="' + sourceId + '"]').attr('connect:matchMax'), 10),
                            cMax = parseInt(interaction.find('[connect\\:identifier="' + targetId + '"]').attr('connect:matchMax'), 10);

                        if (associableChoice[0].checked === true) {
                            associableChoice[0].checked = false;
                            associableChoice.parent().removeClass('checked');
                            removeValue(sourceId, targetId);
                            return;
                        }

                        sChecked = checked(sourceId);
                        tChecked = checked(targetId);
                        if (sChecked.length === 1 && rMax === 1) {
                            removeChecked(sourceId);
                        }
                        if (tChecked.length === 1 && cMax === 1) {
                            removeChecked(targetId);
                        }
                        // one can't use sChecked and tChecked variables in test below as they are linked to DOM objects
                        // which won't change after the removeChecked() call above. So checked() has to be called afresh 
                        // if (sChecked.length < rMax && tChecked.length < cMax &&
                        if (checked(sourceId).length < rMax && checked(targetId).length < cMax &&
                            interaction.find('*[class="checked"]').length < maxAssociations || maxAssociations === 0) {

                            associableChoice[0].checked = true;
                            associableChoice.parent().addClass('checked');
                            addValue(sourceId, targetId);
                        }
                    });
                });
            });

            matchInteractions.each(function(index, interaction) {
                var responseVariable, responseIdentifier,
                    currentSource = null,
                    currentTarget = null,
                    lineContainer,
                    matchTargets, matchSources, rowCount, sourceId, targetId,
                    value, valueParsers, cardinality, baseType,
                    sourceX, sourceY, targetX, targetY,
                    svgGroup, svgContainer,
                    singleLinksOnly,
                    lineHash = $.createHash();

                interaction = $(interaction);
                singleLinksOnly = (interaction
                        .find('div[connect\\:class~="simpleAssociableChoice"]')
                        .filter(':not([connect\\:matchMax="1"])').length === 0) ?
                    true : false;

                //Response handling
                responseIdentifier = interaction.attr('connect:responseIdentifier');
                responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                cardinality = responseVariable.getCardinality();
                baseType = responseVariable.getBaseType();

                valueParsers = $.createHash(
                    'directedPair', qti.parseDirectedPair);

                if (cardinality !== "single" && cardinality !== "multiple") {
                    throw new Error('Invalid cardinality');
                }

                if (cardinality === "single" && matchSources.length > 1) {
                    throw new Error('Invalid cardinality');
                }

                if (!valueParsers.has(baseType)) {
                    throw new Error('Invalid baseType');
                }

                if (responseVariable.getValue() !== undefined) {
                    value = $.createHash(responseVariable.getValue());
                } else {
                    value = $.createHash();

                    // uncomment to test responseVariable reloading...
                    // either...
                    /*(function() {
                    	// matchMax values: A:4, B:3, C:2, D:1; E:1, F:2, G:3, H:4
                    	value.set('A','E_F_G_H');
                    	value.set('B','F_G_H');
                    	value.set('C','G_H');
                    	value.set('D','H');
                    	responseVariable.setValue(value);
                    })();*/

                    // or...
                    /*(function() {
                    	// matchMax values: A:1, B:1, C:1, D:1; E:1, F:1, G:1, H:1
                    	value.set('A','H');
                    	value.set('B','G');
                    	value.set('C','F');
                    	value.set('D','E');
                    	responseVariable.setValue(value);
                    })();*/
                }

                interactionLineHashes.set(itemIdentifier + '.' + responseIdentifier, lineHash);

                rowCount = parseInt(interaction.find('tbody>tr').length, 10);
                lineContainer = interaction.find('*[connect\\:function~="selector"], .connectors-container');
                //lineContainer.attr('rowspan', rowCount);
                svgContainer = $.el('svg:svg');
                svgContainer.attr('style', "height:" + lineContainer[0].clientHeight + "px");
                lineContainer.append(svgContainer);

                function allowLine() {
                    var sourceDiv = $(currentSource.find('div')[0]),
                        targetDiv = $(currentTarget.find('div')[0]),
                        sourceMatchedWith = sourceDiv.attr('connect:matchedWith'),
                        targetMatchedWith = targetDiv.attr('connect:matchedWith'),
                        sourceMatched = (sourceMatchedWith === '') ? 0 : sourceMatchedWith.split('_').length,
                        targetMatched = (targetMatchedWith === '') ? 0 : targetMatchedWith.split('_').length,
                        sourceMax = Number(sourceDiv.attr('connect:matchMax')),
                        targetMax = Number(targetDiv.attr('connect:matchMax'));

                    return (sourceMax === sourceMatched || targetMax === targetMatched) ? false : true;

                    /* var stimulusSequesnceNum = sourceDiv.attr('connect:identifier'),
                    responseSequenceNum = targetDiv.attr('connect:identifier'),
                    individual_item = stimulusSequesnceNum + "_" + responseSequenceNum,
                    lineExists = false;
                    if (interaction.attr('connect:maxAssociations') > $('.connectors-container svg').find('g').length) {
                    	lineExists = (precompletedData.preCompletedArray[0].indexOf(individual_item) !== -1) ? true : false;
                    	return (sourceMax === sourceMatched || targetMax === targetMatched || lineExists) ? false : true;
                    } else {
                    	return false;
                    } */
                }

                matchTargets = interaction.find('tr>td:last-child, .responses ol li');

                matchTargets.each(function(index, matchTarget) {
                    matchTarget = $(matchTarget);

                    matchTarget.click(function(event) {
                        var targetCoords, svgCoords, existingGroup, sourceMatchedWith, sourceDiv,
                            innerDiv = matchTarget.find('div').eq(0),
                            matchMax = Number(innerDiv.attr("connect:matchMax")),
                            matchedWith = innerDiv.attr("connect:matchedWith");

                        if (matchedWith === undefined) {
                            innerDiv.attr("connect:matchedWith", "");
                            matchedWith = innerDiv.attr("connect:matchedWith");
                        }

                        targetId = innerDiv.attr("connect:identifier");

                        targetCoords = $.getCoordinates(event, matchTarget[0]);
                        svgCoords = $.getCoordinates(event, lineContainer[0]);

                        if (currentSource) {
                            targetX = lineContainer[0].clientWidth + "px";
                            targetY = targetCoords.y1 - svgCoords.y1 + ((targetCoords.y2 - targetCoords.y1) / 2) + "px";

                            currentTarget = matchTarget;
                            sourceDiv = $(currentSource.find('div')[0]);
                            sourceMatchedWith = sourceDiv.attr('connect:matchedWith');

                            if (singleLinksOnly && matchedWith !== '') {
                                existingGroup = lineHash.get(matchedWith + targetId);
                                if (existingGroup !== undefined) {
                                    existingGroup.remove();
                                    value.remove(matchedWith);
                                }

                                interaction.find('div[connect\\:identifier="' + matchedWith + '"]').attr('connect:matchedWith', "");
                                innerDiv.attr('connect:matchedWith', "");
                                matchedWith = innerDiv.attr("connect:matchedWith");
                            }

                            if (matchedWith.indexOf(sourceId) !== -1) {
                                matchedWith = matchedWith.replace('_' + sourceId, '');
                                matchedWith = matchedWith.replace(sourceId + '_', '');
                                matchedWith = matchedWith.replace(sourceId, '');
                                innerDiv.attr('connect:matchedWith', matchedWith);

                                sourceMatchedWith = sourceMatchedWith.replace('_' + targetId, '');
                                sourceMatchedWith = sourceMatchedWith.replace(targetId + '_', '');
                                sourceMatchedWith = sourceMatchedWith.replace(targetId, '');
                                sourceDiv.attr('connect:matchedWith', sourceMatchedWith);

                                existingGroup = lineHash.get(sourceId + targetId);
                                if (existingGroup !== undefined) {
                                    existingGroup.remove();

                                    if (sourceMatchedWith !== '') {
                                        value.set(sourceId, sourceMatchedWith);
                                    } else {
                                        value.remove(sourceId);
                                    }
                                }
                            } else if (allowLine()) {
                                //precompletedData.preCompletedLine = false;
                                svgGroup = createLine(lineContainer, sourceX, sourceY, targetX, targetY);
                                innerDiv.attr('connect:matchedWith', (matchedWith === '') ? sourceId : matchedWith + '_' + sourceId);
                                sourceDiv.attr('connect:matchedWith', (sourceMatchedWith === '') ? targetId : sourceMatchedWith + '_' + targetId);
                                value.set(sourceId, sourceDiv.attr('connect:matchedWith'));
                            } else {
                                return;
                            }

                            lineHash.set(sourceId + targetId, svgGroup);

                            if (value.size() !== 0) {
                                //valueToConsole(value); // uncomment for trace
                                responseVariable.setValue(value);
                            } else {
                                responseVariable.setValue(undefined);
                            }
                        }
                        if (currentSource !== null) {
                            currentSource.attrNS("connect:class", "");
                            currentSource = null;
                        }
                    });
                });

                matchSources = interaction.find('tr>td:first-child, .stimulus ol li');
                matchSources.each(function(index, matchSource) {
                    matchSource = $(matchSource);

                    matchSource.click(function(event) {
                        var sourceCoords, svgCoords, existingGroup,
                            innerDiv = matchSource.find('div').eq(0),
                            matchMax = Number(innerDiv.attr('connect:matchMax')),
                            matchedWith = innerDiv.attr('connect:matchedWith'),
                            clearMatchedWith = function() {
                                if (matchedWith !== undefined && matchedWith !== '') {
                                    interaction.find('div[connect\\:identifier="' + matchedWith + '"]').attr('connect:matchedWith', "");
                                }
                                innerDiv.attr('connect:matchedWith', "");
                                matchedWith = innerDiv.attr('connect:matchedWith');
                            };

                        if (matchedWith === undefined) {
                            clearMatchedWith();
                        }

                        sourceId = innerDiv.attr("connect:identifier");

                        matchSources.each(function(index, matchSource2) {
                            matchSource2 = $(matchSource2);
                            matchSource2.attrNS('connect:class', "");
                        });

                        sourceCoords = $.getCoordinates(event, matchSource[0]);
                        svgCoords = $.getCoordinates(event, lineContainer[0]);

                        matchSource.attrNS('connect:class', "highlightText");
                        currentSource = matchSource;
                        sourceX = "0px";
                        sourceY = sourceCoords.y1 - svgCoords.y1 + ((sourceCoords.y2 - sourceCoords.y1) / 2) + "px";

                        if (singleLinksOnly && matchedWith !== '') {
                            existingGroup = lineHash.get(sourceId + matchedWith);
                            if (existingGroup !== undefined) {
                                existingGroup.remove();
                                value.remove(sourceId);
                            }

                            clearMatchedWith();
                        }

                        if (value.size() !== 0) {
                            //valueToConsole(value); // uncomment for trace
                            responseVariable.setValue(value);
                        } else {
                            responseVariable.setValue(undefined);
                        }
                    });
                });
                /* var precompletedInteractionSet = interaction.attr('connect:author-class');
                $('.connectors p.title').height("0px");
                var stumulus_response_array = JSON.parse($("<span/>").html(precompletedInteractionSet.split("-")[1]).html());
                $.each(stumulus_response_array, function (index, value) {
                	var completed_stimulus = Object.keys(value)[0],
                	completed_response = value[completed_stimulus],
                	stimulus_response_pair = completed_stimulus + "_" + completed_response;
                	precompletedData.preCompletedArray.push(stimulus_response_pair);
                	//$('.stimulus ol li').eq(completed_stimulus - 1).trigger("click");
                	//$('.responses ol li').eq(completed_response - 1).trigger("click");
                }); */
            });
        };

        var drawRecoveredResponses = function(itemBody, matchInteractions) {
            var itemIdentifier = itemBody.attr('connect:identifier');
            //matchInteractions = itemBody.find('*[connect\\:class~="matchInteraction"]');

            matchInteractions.each(function(index, interaction) {
                var responseIdentifier, responseVariable, lineContainer, value,
                    svgContainer, lineHash;

                interaction = $(interaction);
                lineContainer = interaction.find('*[connect\\:function~="selector"], .connectors-container');
                svgContainer = lineContainer.find('svg,svg\\:svg');

                responseIdentifier = interaction.attr('connect:responseIdentifier');
                responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);
                // exceptional conditions already checked during loadItemFunc()

                lineHash = interactionLineHashes.get(itemIdentifier + '.' + responseIdentifier);

                if (responseVariable.getValue() !== undefined) {
                    value = $.createHash(responseVariable.getValue());
                } else {
                    value = $.createHash();
                }

                if (value.size() !== 0) {
                    value.ulibEach(function(currentValue) {
                        var matchSource, sDiv, sMatchedWith, tDiv, tMatchedWith, idx, k, v, valArray,
                            sourceCoords, svgCoords, svgGroup, targetSource, targetCoords,
                            sourceX, sourceY, targetX, targetY;

                        k = currentValue.key();
                        matchSource = $('div[connect\\:identifier~="' + k + '"]').parent();
                        sourceCoords = getCoords(matchSource[0]);
                        svgCoords = getCoords(lineContainer[0]);

                        sourceX = "0px";
                        sourceY = sourceCoords.y1 - svgCoords.y1 + ((sourceCoords.y2 - sourceCoords.y1) / 2) + "px";

                        valArray = currentValue.value().split('_');
                        for (idx = 0; idx < valArray.length; idx += 1) {
                            v = valArray[idx];

                            targetSource = $('div[connect\\:identifier~="' + v + '"]').parent();
                            targetCoords = getCoords(targetSource[0]);

                            targetX = "100px";
                            targetY = targetCoords.y1 - svgCoords.y1 + ((targetCoords.y2 - targetCoords.y1) / 2) + "px";
                            //precompletedData.preCompletedLine = false;
                            svgGroup = createLine(lineContainer, sourceX, sourceY, targetX, targetY);

                            lineHash.set(k + v, svgGroup);

                            sDiv = interaction.find('div[connect\\:identifier="' + k + '"]');
                            sMatchedWith = sDiv.attr('connect:matchedWith');
                            sDiv.attr('connect:matchedWith',
                                (sMatchedWith === undefined) ? v : sMatchedWith + '_' + v);

                            tDiv = interaction.find('div[connect\\:identifier="' + v + '"]');
                            tMatchedWith = tDiv.attr('connect:matchedWith');
                            tDiv.attr('connect:matchedWith',
                                (tMatchedWith === undefined) ? k : tMatchedWith + '_' + k);
                        }
                    });
                }
                /* var precompletedInteractionSet = interaction.attr('connect:author-class'),
                preCompletedArrayIndiv = [],
                stumulus_response_array = JSON.parse($("<span/>").html(precompletedInteractionSet.split("-")[1]).html());
                $('.connectors p.title').height("0px"); // NOT GOOD !!!!!!!!!!!!
                $('.connectors .title').css("height", "0px"); // NOT GOOD !!!!!!!!!!!!
                $.each(stumulus_response_array, function (index, value) {
                	var completed_stimulus = Object.keys(value)[0],
                	completed_response = value[completed_stimulus],
                	stimulus_pos = $($('.stimulus-options li div[connect\\:identifier="' + completed_stimulus + '"]').parent()).offset(), //$('.matchInteraction .left ol li').eq(parseInt(completed_stimulus.substring(3)) - 1).offset(),
                	response_pos = $($('.responses-options li div[connect\\:identifier="' + completed_response + '"]').parent()).offset(), //$('.matchInteraction .right ol li').eq(completed_response.charCodeAt(0) - 65).offset();
                	sourceX = "0px",
                	sourceY = stimulus_pos.top - 75 + "px",
                	targetX = $('.connectors').width() + "px",
                	targetY = response_pos.top - 75 + "px",
                	stimulus_response_pair = completed_stimulus + "_" + completed_response;
                	preCompletedArrayIndiv.push(stimulus_response_pair);
                	precompletedData.preCompletedLine = true;
                	createLine($('.connectors'), sourceX, sourceY, targetX, targetY, precompletedData.preCompletedLine);
                });
                precompletedData.preCompletedArray.push(preCompletedArrayIndiv); */
            });
        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };
        qti.subscribeToEvent("itemLoad", loadFunc, "Match interactions", "matchInt");

        var screenDisplay = function(itemBody) {
            var itemIdentifier = itemBody.attr('connect:identifier'),
                matchInteractions = itemBody.find('*[connect\\:class~="matchInteraction"]'),
                tableMatchInteractions = itemBody.find('*[connect\\:class~="tableMatchInteraction"]'),
                updateStimulusPromptsHeight = function() {
                    tableMatchInteractions.each(function() {
                        var stimulusPrompts = $(this).find('div.separateStimulus p');
                        setEqualMaxHeight(stimulusPrompts);
                    });
                };

            if (matchInteractions.length > 0) {
                drawRecoveredResponses(itemBody, matchInteractions);
            }
            if (tableMatchInteractions.length > 0) {
                tableMatchInteractions.each(function() {
                    var tableRows = $(this).find('tbody tr');
                    setEqualMaxHeight(tableRows);
                });

                updateStimulusPromptsHeight();
                qti.subscribeToEvent("windowResize", updateStimulusPromptsHeight, "Make stimulus prompts the same height on window resize", "updateStimulusPromptsHeight_windowResize_" + itemIdentifier);
                qti.subscribeToEvent("settingsChange", updateStimulusPromptsHeight, "Make stimulus prompts the same height on settings change", "updateStimulusPromptsHeight_settingsChange_" + itemIdentifier);
            }
        };
        qti.subscribeToEvent("newScreenDisplay", screenDisplay, "Match interactions UI setup", "screenDisplay");
    })();

    (function() {

        var loadItemFunc = function(itemBody) {

            var containingDiv,
                startClickX, startClickY, endClickX, endClickY,
                parseValue,
                stage, // stage ~ image area or a lesser rect over the image
                ldis = [],
                lineAttrPrefix = "lineIndex_",
                itemIdentifier = itemBody.attr('connect:identifier'),
                lineDrawStages = itemBody.find('*[connect\\:class~="lineDrawStage"]');

            function createCrossHairs(paper, rect) {
                var moveCrossHairs, showCrossHairs, hideCrossHairs,
                    horizontal, vertical,
                    hPath = [
                        ["M", stage.x1, stage.y1],
                        ["L", stage.x1, stage.y2]
                    ],
                    vPath = [
                        ["M", stage.x1, stage.y1],
                        ["L", stage.x2, stage.y1]
                    ];

                showCrossHairs = function() {
                    horizontal.node.style.visibility = "visible";
                    vertical.node.style.visibility = "visible";
                };

                hideCrossHairs = function() {
                    horizontal.node.style.visibility = "hidden";
                    vertical.node.style.visibility = "hidden";
                };

                moveCrossHairs = function(event) {
                    var x, y, tx, ty, ctl;

                    if (event !== undefined) {
                        x = event.layerX;
                        y = event.layerY;

                        x = ((x > stage.x1) ? ((x < stage.x2) ? x : stage.x2) : stage.x1);
                        y = ((y > stage.y1) ? ((y < stage.y2) ? y : stage.y2) : stage.y1);
                        tx = x;
                        ty = y;

                        hPath[0][1] = x;
                        hPath[1][1] = x;
                        horizontal.attr({
                            "path": hPath
                        });
                        vPath[0][2] = y;
                        vPath[1][2] = y;
                        vertical.attr({
                            "path": vPath
                        });

                        showCrossHairs();
                    } else {
                        hideCrossHairs();
                    }
                };

                horizontal = paper.path(hPath).attr({
                    "stroke": "grey",
                    "stroke-width": 1
                });
                horizontal.insertBefore(rect);

                vertical = paper.path(vPath).attr({
                    "stroke": "grey",
                    "stroke-width": 1
                });
                vertical.insertBefore(rect);

                rect.mouseover(function(event) {
                    moveCrossHairs(event);
                });
                rect.mousemove(function(event) {
                    moveCrossHairs(event);
                });
                rect.mouseout(function(event) {
                    moveCrossHairs();
                });
            }

            function createCircle(paper, pointX, pointY, ldi) {

                var start, move, end, lastx, lasty,
                    circle = paper.circle(pointX, pointY, 4),
                    pointSelected = false,
                    deselect = function() {
                        pointSelected = false;
                    };

                circle.attr({
                    "fill": "grey",
                    "cursor": "pointer"
                });
                circle.node.setAttribute("connect:class", lineAttrPrefix + ldi.index);

                start = function(x, y, event) {
                    pointX = circle.attr("cx");
                    pointY = circle.attr("cy");
                    lastx = 0;
                    lasty = 0;
                    pointSelected = true;
                };

                move = function(dx, dy, x, y, event) {
                    var i, j, rl, sl, el, path, respvar, newx, newy, ddx, ddy,
                        circBox = circle.getBBox();

                    if (pointSelected) {

                        ddx = dx - lastx;
                        ddy = dy - lasty;

                        if ((circBox.x + ddx <= stage.x1) ||
                            (circBox.x + circBox.width + ddx >= stage.x2) ||
                            (circBox.y + ddy <= stage.y1) ||
                            (circBox.y + circBox.height + ddy >= stage.y2)) {
                            pointSelected = false;
                            return;
                        }

                        newx = pointX + ddx;
                        newy = pointY + ddy;

                        for (i = 0, rl = ldi.responseArray.length; i < rl; i++) {

                            respvar = ldi.responseArray[i];

                            if (respvar.x === pointX && respvar.y === pointY) {

                                for (j = 0, sl = ldi.set.length; j < sl; j++) {
                                    el = ldi.set[j];
                                    if (el.type === "path") {
                                        path = el.attr("path");
                                        if (path[0][1] === respvar.x && path[0][2] === respvar.y) {
                                            path[0][1] = newx;
                                            path[0][2] = newy;
                                        } else if (path[1][1] === respvar.x && path[1][2] === respvar.y) {
                                            path[1][1] = newx;
                                            path[1][2] = newy;
                                        }

                                        el.attr({
                                            "path": path
                                        });
                                    } else { // a circle
                                        if (el.attr("cx") === respvar.x && el.attr("cy") === respvar.y) {
                                            el.attr("cx", newx);
                                            el.attr("cy", newy);
                                        }
                                    }
                                }

                                if ((i === rl - 1) && (ldi.points === ldi.segments + 1)) {
                                    if (ldi.textEntryInteraction !== undefined) {
                                        ldi.textEntryInteraction.css({
                                            display: "block",
                                            top: newy + 2 + "px",
                                            left: newx + 2 + "px"
                                        });
                                    }

                                    ldi.bin.css({
                                        display: "block",
                                        top: newy + 5 + "px",
                                        left: newx - 12 + "px"
                                    });
                                }

                                ldi.responseArray[i] = parseValue(newx + " " + newy);
                                break;
                            }
                        }

                        pointX = newx;
                        pointY = newy;

                        lastx = dx;
                        lasty = dy;
                    }
                };

                end = function(event) {
                    if (pointSelected) {
                        setTimeout(deselect, 5); // delay deselection till after click event fires
                    }

                    ldi.responseVariable.setValue(ldi.responseArray);
                };

                circle.drag(move, start, end);
                ldi.set.push(circle);
            }

            function createPath(paper, ldi) {
                var start, move, end, lastx, lasty, path, p, respvar,
                    setSelected = false,
                    deselect = function() {
                        setSelected = false;
                    };

                if (ldi.responseArray === undefined) {
                    path = [
                        ["M", startClickX, startClickY],
                        ["L", endClickX, endClickY]
                    ];
                } else {
                    respvar = ldi.responseArray[ldi.responseArray.length - 1];
                    path = [
                        ["M", respvar.x, respvar.y],
                        ["L", endClickX, endClickY]
                    ];
                }

                p = paper.path(path).attr({
                    "stroke": "red",
                    "stroke-width": 2,
                    "cursor": "pointer"
                });
                p.node.setAttribute("connect:class", lineAttrPrefix + ldi.index);

                start = function(x, y, event) {
                    lastx = 0;
                    lasty = 0;
                    setSelected = true;
                };

                move = function(dx, dy, x, y, event) {
                    var i, j, rl, sl, el, respvar, ddx, ddy, newx, newy,
                        setBBox = ldi.set.getBBox();

                    if (setSelected) {

                        ddx = dx - lastx;
                        ddy = dy - lasty;

                        for (i = 0, rl = ldi.responseArray.length; i < rl; i++) {
                            respvar = ldi.responseArray[i];

                            if ((setBBox.x + ddx <= stage.x1) ||
                                (setBBox.x + setBBox.width + ddx >= stage.x2) ||
                                (setBBox.y + ddy <= stage.y1) ||
                                (setBBox.y + setBBox.height + ddy >= stage.y2)) {
                                setSelected = false;
                                return;
                            }

                            newx = respvar.x + ddx;
                            newy = respvar.y + ddy;

                            for (j = 0, sl = ldi.set.length; j < sl; j++) {
                                el = ldi.set[j];

                                if (el.type === "path") {

                                    path = el.attr("path");

                                    if (path[0][1] === respvar.x && path[0][2] === respvar.y) {
                                        path[0][1] = newx;
                                        path[0][2] = newy;
                                    } else if (path[1][1] === respvar.x && path[1][2] === respvar.y) {
                                        path[1][1] = newx;
                                        path[1][2] = newy;
                                    }

                                    el.attr({
                                        "path": path
                                    });
                                } else { // a circle
                                    if (el.attr("cx") === respvar.x && el.attr("cy") === respvar.y) {
                                        el.attr("cx", newx);
                                        el.attr("cy", newy);
                                    }
                                }
                            }

                            if ((i === rl - 1) && (ldi.points === ldi.segments + 1)) {
                                if (ldi.textEntryInteraction !== undefined) {
                                    ldi.textEntryInteraction.css({
                                        display: "block",
                                        top: newy + 2 + "px",
                                        left: newx + 2 + "px"
                                    });
                                }

                                ldi.bin.css({
                                    display: "block",
                                    top: newy + 5 + "px",
                                    left: newx - 12 + "px"
                                });
                            }

                            ldi.responseArray[i] = parseValue(newx + " " + newy);
                        }

                        lastx = dx;
                        lasty = dy;
                    }
                };

                end = function(event) {
                    if (setSelected) {
                        // delay deselection till after click event fires
                        setTimeout(deselect, 5);
                    }

                    ldi.responseVariable.setValue(ldi.responseArray);
                };

                p.drag(move, start, end);
                ldi.set.push(p);
            }

            function getX(elem) {

                var total = 0;

                while (elem) {
                    total += elem.offsetLeft;
                    elem = elem.offsetParent;
                }
                return total;
            }

            function getY(elem) {

                var total = 0;

                while (elem) {
                    total += elem.offsetTop;
                    elem = elem.offsetParent;
                }
                return total;
            }

            function midPointXY() {

                startClickX = endClickX;
                startClickY = endClickY;
                endClickX = null;
                endClickY = null;
            }

            function resetXY() {

                startClickX = null;
                startClickY = null;
                endClickX = null;
                endClickY = null;
            }

            lineDrawStages.each(function(index, lineDrawStage) {

                var img, imageName, imageWidth, imageHeight, paper, s, showCrossHairs;

                lineDrawStage = $(lineDrawStage);
                showCrossHairs = (lineDrawStage.attr('connect:showCrossHairs') === 'true') ? true : false;
                containingDiv = itemBody.find('*[connect\\:class~="RAPHAEL"]');
                img = lineDrawStage.find("img");
                imageName = img.attr("src");
                imageWidth = img.attr("width");
                imageHeight = img.attr("height");
                s = img.attr("connect:stage").split(",");
                if (s.length === 4) {
                    stage = {
                        "x1": s[0],
                        "y1": s[1],
                        "x2": s[2],
                        "y2": s[3]
                    };
                } else {
                    stage = {
                        "x1": 0,
                        "y1": 0,
                        "x2": imageWidth,
                        "y2": imageHeight
                    };
                }

                containingDiv.each(function(index, container) {

                    var g, rect, set,
                        lineCount = 0,
                        lineDrawInteractions = itemBody.find('*[connect\\:class~="lineDrawInteraction"]');

                    function addDataToResponseArray(x, y, responseArray) {
                        var responseValue = parseValue(x + " " + y);
                        responseArray.push(responseValue);
                    }

                    paper = Raphael(container, imageWidth, imageHeight);

                    container = $(container);
                    //paper.setViewBox(0, 0, imageWidth, imageHeight, true);            ohoh - requires raphael 2.0 !!
                    container.children().attr("viewBox", "0 0 " + imageWidth + " " + imageHeight);

                    paper.image(imageName, 0, 0, imageWidth, imageHeight);
                    rect = paper.rect(stage.x1, stage.y1, (stage.x2 - stage.x1), (stage.y2 - stage.y1)).attr({
                        "stroke": "#fff",
                        "fill": "#fff",
                        "opacity": 0.0
                    });

                    if (showCrossHairs) {
                        createCrossHairs(paper, rect);
                    }

                    rect.click(function(event) {
                        var i, x, y, coords, ldi, currentLineIndex;

                        for (i = 0; i < ldis.length; i++) {
                            if (ldis[i].showing === false) {
                                currentLineIndex = i;
                                break;
                            }
                        }

                        ldi = ldis[currentLineIndex];
                        if (ldi === undefined) {
                            return;
                        }

                        if (ldi.points < ldi.segments + 1) {

                            coords = $.getCoordinates(event, lineDrawStage[0]);

                            x = coords.mouseX - coords.x1;
                            y = coords.mouseY - coords.y1;

                            if (ldi.points === 0) {
                                // first point of a line
                                startClickX = coords.mouseX - coords.x1;
                                startClickY = coords.mouseY - coords.y1;
                                ldi.set = paper.set();
                                createCircle(paper, startClickX, startClickY, ldi);
                                addDataToResponseArray(startClickX, startClickY, ldi.responseArray);
                                ldi.points = 1;
                            } else {

                                endClickX = coords.mouseX - coords.x1;
                                endClickY = coords.mouseY - coords.y1;
                                createCircle(paper, endClickX, endClickY, ldi);
                                createPath(paper, ldi);
                                addDataToResponseArray(endClickX, endClickY, ldi.responseArray);
                                ldi.points++;

                                if (ldi.points === ldi.segments + 1) {
                                    // last point of a complete line
                                    if (ldi.textEntryInteraction !== undefined) {
                                        ldi.textEntryInteraction.css({
                                            display: "block",
                                            top: coords.mouseY - coords.y1 + 2 + "px",
                                            left: coords.mouseX - coords.x1 + 2 + "px"
                                        });
                                    }

                                    ldi.bin.css({
                                        display: "block",
                                        top: coords.mouseY - coords.y1 + 5 + "px",
                                        left: coords.mouseX - coords.x1 - 12 + "px"
                                    });

                                    ldi.responseVariable.setValue(ldi.responseArray);
                                    ldi.showing = true;
                                    resetXY();
                                } else {
                                    // mid-point of multisegment line
                                    midPointXY();
                                }
                            }
                        }
                    });

                    lineDrawInteractions.each(function(index, lineDrawInteraction) {
                        var responseIdentifier, cardinality, baseType, valueParsers, existingValues, i, tei;

                        lineDrawInteraction = $(lineDrawInteraction);
                        responseIdentifier = lineDrawInteraction.attr('connect:responseIdentifier');
                        lineDrawInteraction.responseVariable = qti.getVariable(responseIdentifier, itemIdentifier);

                        cardinality = lineDrawInteraction.responseVariable.getCardinality();
                        if (cardinality !== "multiple") {
                            throw new Error('Invalid cardinality');
                        }

                        baseType = lineDrawInteraction.responseVariable.getBaseType();
                        valueParsers = $.createHash('point', qti.parsePoint);
                        if (!valueParsers.has(baseType)) {
                            throw new Error('Invalid baseType');
                        }

                        parseValue = valueParsers.get(baseType);


                        lineDrawInteraction.index = lineCount;
                        lineCount++;

                        lineDrawInteraction.segments = Number(lineDrawInteraction.attr("segments"));
                        tei = lineDrawInteraction.find('*[connect\\:class~="textEntryInteraction"]');
                        if (tei.length > 0) {
                            lineDrawInteraction.textEntryInteraction = tei;
                        }

                        lineDrawInteraction.bin = lineDrawInteraction.find('*[connect\\:class~="deleteLine"]');
                        lineDrawInteraction.showing = false;

                        lineDrawInteraction.bin.click(function(event) {
                            var respId, textInteraction;

                            lineDrawInteraction.bin.css({
                                display: "none"
                            });

                            textInteraction = lineDrawInteraction.textEntryInteraction;
                            if (textInteraction !== undefined) {
                                textInteraction.value("");
                                respId = textInteraction
                                    .find('[connect\\:responseIdentifier]')
                                    .attr('connect:responseIdentifier');
                                textInteraction.responseVariable = qti.getVariable(respId, itemIdentifier);
                                textInteraction.responseVariable.setState("");
                                textInteraction.responseVariable.setValue(undefined);
                                textInteraction.css({
                                    display: "none"
                                });
                            }

                            lineDrawInteraction.set.remove();
                            lineDrawInteraction.points = 0;
                            lineDrawInteraction.showing = false;
                            lineDrawInteraction.responseArray.length = 0;
                            lineDrawInteraction.responseVariable.setValue(lineDrawInteraction.responseArray);
                            lineDrawInteraction.responseVariable.setValue(undefined);
                        });

                        if (lineDrawInteraction.textEntryInteraction !== undefined) {
                            lineDrawInteraction.textEntryInteraction.css({
                                position: "absolute",
                                display: "none"
                            });
                        }

                        lineDrawInteraction.bin.css({
                            position: "absolute",
                            display: "none"
                        });

                        lineDrawInteraction.points = 0;

                        existingValues = lineDrawInteraction.responseVariable.getValue();

                        if (existingValues !== undefined && (existingValues.length === lineDrawInteraction.segments + 1)) {
                            for (i = 0; i < existingValues.length; i++) {
                                if (i === 0) {
                                    startClickX = existingValues[i].x;
                                    startClickY = existingValues[i].y;
                                    lineDrawInteraction.set = paper.set();
                                    createCircle(paper, startClickX, startClickY, lineDrawInteraction);
                                    lineDrawInteraction.points++;
                                } else {
                                    endClickX = existingValues[i].x;
                                    endClickY = existingValues[i].y;
                                    createCircle(paper, endClickX, endClickY, lineDrawInteraction);
                                    createPath(paper, lineDrawInteraction);
                                    lineDrawInteraction.points++;
                                    if (lineDrawInteraction.points === lineDrawInteraction.segments + 1) {
                                        if (lineDrawInteraction.textEntryInteraction !== undefined) {
                                            lineDrawInteraction.textEntryInteraction.css({
                                                display: "block",
                                                top: existingValues[i].y + 2 + "px",
                                                left: existingValues[i].x + 2 + "px"
                                            });
                                        }

                                        lineDrawInteraction.bin.css({
                                            display: "block",
                                            top: existingValues[i].y + 5 + "px",
                                            left: existingValues[i].x - 12 + "px"
                                        });
                                        lineDrawInteraction.showing = true;
                                        resetXY();
                                    } else {
                                        midPointXY();
                                    }
                                }
                            }
                        }

                        lineDrawInteraction.responseArray = (existingValues !== undefined && existingValues.length > 1) ? existingValues : [];
                        ldis.push(lineDrawInteraction);
                    });
                });
            });
        };

        var loadFunc = function(item) {
            if (qti.preloadTestContents) {
                $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                    loadItemFunc($(this));
                });
            } else {
                loadItemFunc(item);
            }
        };

        qti.subscribeToEvent("itemLoad", loadFunc, "Line interactions", "lineInt");
    })();

    (function() {
        var loadItemFunc = function(itemBody) {
                //var itemBody = itemObj.body;
                var pvElements = itemBody.find('*[connect\\:class~="printedVariable"]');
                pvElements.each(function() {
                    var $pvElement = $(this),
                        variableIdentifier = $pvElement.attr('connect:identifier'),
                        variable = qti.getVariable(variableIdentifier),
                        value = variable.getValue();
                    if (value !== undefined) {
                        $pvElement.text(value);
                    } else {
                        $pvElement.text('');
                    }
                });
            },
            onLoadItem = function(item) {
                if (qti.preloadTestContents) {
                    $('[role="main"] [connect\\:class~="itemBody"]').each(function() {
                        loadItemFunc($(this));
                    });
                } else {
                    loadItemFunc(item);
                }
            };
        qti.subscribeToEvent("itemLoad", onLoadItem, "Printed Variable Functions", "printVari");
    }());

}(ulib.withNamespaces("http://www.w3.org/1999/xhtml", {
        connect: "http://connect.ucles.org.uk/ns/ConnectDeliveryEngine",
        qti: "http://www.imsglobal.org/xsd/imsqti_v2p1",
        raphaelChart: "http://connect.ucles.org.uk/ns/QTICharts",
        p: "http://connect.ucles.org.uk/ns/QTIItemParameters",
        svg: "http://www.w3.org/2000/svg"
    }),
    window.qti || (window.qti = {})
));
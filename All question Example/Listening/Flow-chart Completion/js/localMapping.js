/* Copyright © UCLES, 2014 */

/*global ulib, window*/
var mapping = (function($) {
    var mapping = {};
    qti.mappingState = "Preview";


    // Send XML results to server
    function onError(s, st) {
        //console.log(s); 
        throw new Error(st);
    }

    //TestViewer API
    var TestViewerApi = function() {

        var TestViewer = {};

        function _createAjaxSession() {
            var ajax_session;
            try {
                ajax_session = new XMLHttpRequest();
            } catch (trymicrosoft) {
                try {
                    ajax_session = new window.ActiveXObject("Msxml2.XMLHTTP");
                } catch (othermicrosoft) {
                    try {
                        ajax_session = new window.ActiveXObject("Microsoft.XMLHTTP");
                    } catch (failed) {
                        ajax_session = null;
                    }
                }
            }
            return ajax_session;
        }

        function _dataResponse(aSession, callback) {
            if (aSession.readyState === 4) {
                if (aSession.status === 200) {
                    if (callback !== undefined) {
                        callback(decodeURIComponent(aSession.responseText));
                    }
                }
            }
            aSession = null;
        }

        var BASE_URL = "http://127.0.0.1:" + window.location.port;

        var ajaxPost = function(query) {
            var url = BASE_URL + "/tvpr";
            var aSession = _createAjaxSession();
            aSession.open("POST", url, true);
            aSession.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            aSession.onreadystatechange = function() {
                _dataResponse(aSession);
            };
            aSession.send(query);
        };

        var ajaxGet = function(query, callback) {
            var url = BASE_URL + "/tv?" + query + "&" + Math.random();
            var aSession = _createAjaxSession();
            aSession.open("GET", url, true);
            aSession.onreadystatechange = function() {
                _dataResponse(aSession, callback);
            };
            aSession.send(null);
        };

        var responseList = $.createHash();
        var allResults = $.createHash();

        function sendResponse(id, responseVariable) {
            var rawValueObj = responseVariable.getValue();
            var url = "response/" + id;
            var baseType = responseVariable.getBaseType();
            var cardinality = responseVariable.getCardinality();
            var state = responseVariable.getState();

            var data = qti.createSerializedXMLResults(id, baseType, cardinality, state, rawValueObj);
            var oSerializer = new window.XMLSerializer();
            var sXML = oSerializer.serializeToString(data[0]);

            return sXML;
        }

        var sendAllResponses = function() {
            var responseFile = "";
            $.ulibEach(allResults, function(response) {
                var id = response.key();
                var val = response.value();
                responseFile = responseFile + sendResponse(id, val);
            });
            ajaxPost("ro=" + encodeURIComponent("<responses>" + responseFile + "</responses>"));
        };

        function sendResults(id, responseVariable) {
            var singleXMLValue = sendResponse(id, responseVariable);
            ajaxPost("id=" + id + "&cr=" + encodeURIComponent(singleXMLValue));
        }

        var sendAllResults = function() {
            $.ulibEach(allResults, function(response) {
                var id = response.key();
                var val = response.value();
                sendResults(id, val);
            });
        };

        var echo = false;
        var autoInterval;

        (function() {
            if (window.location.port) {
                ajaxGet("ec=TestViewer Ping", function(response) {
                    if (response === "TestViewer Ping") {
                        echo = true;
                    }
                });
            }
        })();

        TestViewer.buildResponses = function() {
            if (echo) {
                if (autoInterval) {
                    clearInterval(autoInterval);
                }
                //sendAllResponses();
            }
        };

        TestViewer.manualPoll = function() {
            if (echo) {
                var allResultsList = qti.getVariables();
                $.ulibEach(allResultsList, function(result) {
                    allResults.set(result.getIdentifier(), result);
                });
                sendAllResults();
            }
        };

        TestViewer.autoPoll = function() {
            autoInterval = setInterval(function() {
                TestViewer.manualPoll();
            }, 5000);
        };

        return TestViewer;
    }();

    (function() {
        var responseList = $.createHash();

        function sendResults(id, resultDetails) {
            var url = "ResponseHandler/" + id;
            var baseType = resultDetails[0];
            var cardinality = resultDetails[1];
            var rawValueObj = resultDetails[2];
            var onSuccess = function() {
                //console.log("post xml success");
            };

            var data = qti.createSerializedXMLResults(id, baseType, cardinality, rawValueObj);
            //$.postXML(url, onSuccess, data[0], onError); 
        }

        function checkForResults() {
            if (responseList.size() === 0) {
                return false;
            }

            $.ulibEach(responseList, function(response) {
                var id = response.key();
                var val = response.value();
                sendResults(id, val);
                responseList.remove(id);
            });
        }

        function changeResponseHandler(id, baseType, cardinality, valueObj) {
            if (arguments.length !== 4) {
                throw new Error("Invalid Arguments");
            }

            responseList.set(id, [baseType, cardinality, valueObj]);
        }
        qti.addToPollingList(checkForResults);
    }());

    // get XML results from server
    (function() {
        // Recover full results set
        /* function setResults(resultObj) {
            var variable = qti.getVariable(resultObj.id);
            var vBaseType = variable.getBaseType();
            var vCardinality = variable.getCardinality();
    
            if (vBaseType !== resultObj.baseType) {
                throw new Error("Base types do not match");
            }
            if (vCardinality !== resultObj.cardinality) {
                throw new Error("Cardinality does not match");
            }
    
            variable.setValue(resultObj.value);
        }
    
        function handleItemVariables (itemResult) {
            var itemVariables = $(itemResult).find("qti|itemVariable");
            itemVariables.each(function(index, itemVariable) {
                var resultObj = qti.deserializeXML($(itemVariable));
                setResults(resultObj);
            });
        }
    
        function handleItemResults (xml) {
            var itemResults = xml.find("qti|itemResult");
            itemResults.each(function(index, itemResult) {
                handleItemVariables(itemResult);
            });
        }
    
        mapping.recoverAllXMLResults = function(id) {
            //$.getXML(id, handleItemResults, onError);
        }; */

        function setResults(resultObj) {
            var variable = qti.getVariable(resultObj.id);
            var vBaseType = variable.getBaseType();
            var vCardinality = variable.getCardinality();

            if (vBaseType !== resultObj.baseType) {
                throw new Error("Base types do not match");
            }
            if (vCardinality !== resultObj.cardinality) {
                throw new Error("Cardinality does not match");
            }
            variable.setState(resultObj.state);
            variable.setValue(resultObj.value);
        }

        function handleItemVariables(itemResult) {
            var itemVariables = $(itemResult).find('response');
            itemVariables.each(function(index, itemVariable) {
                var resultObj = qti.deserializeXML($(itemVariable));
                setResults(resultObj);
            });
        }

        function handleItemResults(xml) {
            var itemResults = $(xml).find('Response');
            itemResults.each(function(index, itemResult) {
                var responseData = $(itemResult).find('ResponseData'),
                    cdata, qtiResponse;
                //if (responseData.children('response').length > 0) {
                //	handleItemVariables(responseData);
                //} else {
                cdata = responseData.text();
                qtiResponse = (new DOMParser()).parseFromString(cdata, "text/xml");
                handleItemVariables(qtiResponse);
                //}
            });
        }

        mapping.recoverAllXMLResults = function(url, callback) {
            $.getXML(url, handleItemResults, onError).done(callback);
        };
    }());

    //  get JSON Results
    (function() {
        function handleExternalState(jsonResult) {
            var externalState = jsonResult.Status;
            mapping.setStatus(externalState, "external");
        }

        function getTestStatus() {
            //$.getJSON("stubs/teststatus?type=JSON", handleExternalState, onError);
        }

        qti.addToPollingList(getTestStatus);
    }());

    //  TEST STATE CLASS
    (function() {
        var state = 0;
        var internalState = 0;
        var externalState = 0;
        var statusObjects = [];
        var timer;
        var testTime;
        var preTestUrl = "instructions/preTest.xml.xhtml";
        var holdingPagesUrl = "instructions/holdingPages.xml.xhtml";
        var instructionsUrl = "instructions/instructions.xml.xhtml";
        var cisFormUrl = "instructions/cisForm.xml.xhtml";
        var holdingPagesContent;
        var _domHolder_main;
        var _domHolder_pausePage;

        // prviate functions to be called as state changes
        var main = function() {
            if (!_domHolder_main) {
                _domHolder_main = $('[role~="main"]');
            }
            return _domHolder_main;
        };

        var pausePage = function() {
            if (!_domHolder_pausePage) {
                _domHolder_pausePage = holdingPagesContent.find('[data-type="paused"]');
            }
            return _domHolder_pausePage;
        };

        function isInt(value) {
            return (value.toString().search(/^-?[0-9]+$/) === 0);
        }

        function timerCheck(t) {
            if (t <= 0) {
                mapping.setStatus(7, "internal");
                qti.timerPause();
            }
        }

        qti.subscribeToEvent("time", timerCheck, "Sends the time to connect every minute", "sendTime");

        // STATE 0 FUNCTIONS
        var candidate;

        function checkRecovery() {
            if (candidate.TestRecoverySuceeded === undefined) {
                //console.log("This is a fresh test");
                return false; //This is a fresh test
            }
            if (!candidate.TestRecoverySuceeded) {
                throw new Error("Incomplete Recovery Data");
            }
            // console.log("Handle stored data recovery");
            // mapping.recoverAllXMLResults("stubs/handler.xml");
        }

        function setCandidateName() {
            var name = candidate.FirstName + " " + candidate.LastName;
            $('[aria-labelled-by="candidate-label"]').text(name);
            $('[aria-labelled-by="candidate-name-label"]').text(name);
            $('[aria-labelled-by="candidate-number-label"]').text(candidate.CandidateId);
        }

        function setCandidate(candidateJSON) {
            candidate = candidateJSON;
            checkRecovery();
            setCandidateName();
        }

        function setCandidateConfirmDetails() {
            $('[candidate-data="name"]').text(candidate.FirstName + " " + candidate.LastName);
            $('[candidate-data="dob"]').text(candidate.DateOfBirth);
            $('[candidate-data="id"]').text(candidate.CandidateId);
        }

        function getHoldingPagesContent(xml) {
            holdingPagesContent = qti.screens.holdingPagesContent = xml;
        }

        function showPreTestScreens(xml) {
            qti.fireEvent("preTestXML", xml);
            var screens = xml.find('[data-section]');
            if (screens.length < 1) {
                mapping.setStatus(1, "internal");
            }
            var contentArr = [];
            var screenNumber = 0;
            var contentHolder = main();

            function moveToNextScreen() {
                var screen, screenType,
                    audioContent = contentHolder.find('#sample-audio-content');
                if (audioContent.length > 0 && qti.audioPlayer) {
                    qti.audioPlayer.jPlayer("stop");
                }
                if (contentArr[screenNumber]) {
                    screen = contentArr[screenNumber];
                    screenType = screen.attr("data-sectionType");

                    if (screenType === "access") {
                        qti.screens.settingsContent = screen.find('.panel-body');
                        if (!qti.hasAccessAPI) {
                            screenNumber += 1;
                            moveToNextScreen(); // skip the access screen
                            return;
                        }
                    }

                    contentHolder.empty();
                    contentHolder.append(screen);

                    screenNumber += 1;
                    //setCandidateConfirmDetails();

                    if (screenType === "access") {
                        qti.fireEvent("accessControls");
                    }
                    qti.fireEvent("preTestScreenChange");
                } else if (screenNumber === contentArr.length) {
                    screen = holdingPagesContent.find('[data-type="wait"]').clone();
                    contentHolder.empty();
                    contentHolder.append(screen);
                    //mapping.setStatus(1, "internal");
                    if (qti.showCISForm) {
                        mapping.setStatus(1, "internal");
                    } else {
                        mapping.setStatus(2, "internal");
                    }
                }
            }

            screens.each(function(index, screen) {
                screen = $(screen);
                screen.find('[data-confirm]').click(moveToNextScreen);
                contentArr.push(screen);
            });

            moveToNextScreen();
        }

        // STATE ! FUNCTIONS
        function showInstructions(xml) {
            qti.fireEvent("instructionsStart", xml);
            var content = main();
            var items = xml.find('[data-section]');
            if (items.length < 1) {
                content.empty();
                mapping.setStatus(4, "internal");
            }
            var screens = [];
            //var screenNumber = 0;

            items.each(function(index, item) {
                item = $(item);
                screens.push(item);
                //screenNumber += 1;
            });

            /* if (screens.length !== 2) {
            	throw new Error("Incorrect item number in Instructions");
            } */

            function confirmReading() {
                var screen = holdingPagesContent.find('[data-type="wait"]').clone();
                content.empty();
                content.append(screen);
                mapping.setStatus(4, "internal");
            }
            var button = screens[0].find("#instructionsConfirm");
            button.click(confirmReading);

            function showCopyrightInfo() {
                var copy = $(document).find('*[connect\\:class~="copyrightInfo"]');
                copy.css({
                    "display": "block"
                });
            }
            var copyright = xml.find('*[connect\\:class~="showCopyright"]');
            copyright.click(showCopyrightInfo);

            content.empty();
            content.append(screens[0]);
            qti.fireEvent("showInstructions");
        }

        // CIS STATE FUNCTIONS
        function showCISForm(xhtml) {
            var content = main(),
                cisform = xhtml.find('form'),
                confirmAction = function() {
                    var screen = holdingPagesContent.find('[data-type="wait"]').clone();
                    content.empty();
                    content.append(screen);
                    mapping.setStatus(2, "internal");
                },
                button = cisform.find('#finish_button');
            button.click(confirmAction);

            content.empty();
            content.append(cisform);
            qti.setupCISForm();
            qti.fireEvent("showCISForm");
        }

        // STATE 4 FUNCTIONS
        function setLocalTimer(t) {
            if (isNaN(parseInt(t, 10))) {
                //arbitrary 60 minutes for item preview
                qti.timerStart(3600);
            } else {
                qti.timerStart(t);
            }
        }

        function testStart() {
            qti.fireEvent("testStart");
        }

        // STATE 5 FUNCTIONS
        function pauseTimer() {
            qti.timerPause();
            if (qti.audioPlayer && qti.audioPlayer.$mainAudio.length > 0) {
                qti.audioPlayer.jPlayer("pause");
            }
        }

        function showPauseHoldingPage() {
            var content = main(),
                pauseScreen = pausePage();
            if (qti.preloadTestContents) {
                if (content.find('[data-type="paused"]').length === 0) {
                    content.find('>:not(div[connect\\:class~="itemBody"],div.async-stimulus)').remove();
                    //content.find('[connect\\:class="itemBody"]').not('[connect\\:identifier]').remove();
                    content.append(pauseScreen);
                }
                content.find('>[connect\\:class~="activeItem"]').removeAttrToken('connect:class', 'activeItem').hide();
                pauseScreen.addAttrToken('connect:class', 'activeItem').show();
            } else {
                content.empty();
                content.append(pauseScreen);
            }
        }

        function cancelClicks(e) {
            //console.log("All click events are stopped");
            e.preventDefault();
            e.stopPropagation();
        }

        function stopInteractions(dom) {
            $(dom).click(cancelClicks);
        }

        function restartInteractions(dom) {
            $(dom).unbind("click", cancelClicks);
        }

        var showTestControls = qti.screen.showTestControls = function(showCandidateLabel) {
                $('[role~="navigation"], [role~="toolbar"]').show();
                // UA 24/02/2014: #timer needs to be inline-block to avoid banner occasionally breaking into two lines
                // UA 27/04/2016: ditto for candidate label
                if (showCandidateLabel) {
                    $('#candidate').css('display', 'inline-block');
                }
                $('#timer').css('display', 'inline-block');
                if (qti.hasAccessAPI) {
                    $('[connect\\:class~="accessibilityLink"]').show();
                    $('[connect\\:class~="settingsLink"]').show();
                }
            },

            hideTestControls = qti.screen.hideTestControls = function(hideCandidateLabel) {
                $('[role~="navigation"]').hide();
                $('[role~="toolbar"]').hide();
                if (hideCandidateLabel) {
                    $('#candidate').hide();
                }
                $('#timer').hide();
                $('[connect\\:class~="accessibilityLink"]').hide();
                $('[connect\\:class~="settingsLink"]').hide();
            },

            hideTools = qti.screen.hideTools = function() {
                $('div#context-menu-layer').hide();
                $('ul.context-menu-list').hide();
                $('div.note').hide();
                $('div.dialogue-overlay, div.dialogue-wrapper').hide();
                if (qti.screens.helpContent && qti.screens.helpContent.modal) {
                    qti.screens.helpContent.modal('hide');
                }
                $('[connect\\:class~="floatingToolContainer"]').hide();
            };

        // STATE 7 FUNCTIONS
        function showFinishedHoldingPage() {
            var main = $('[role~="main"]');
            main.empty();
            var finishPage = holdingPagesContent.find('[data-type="finished"]');
            main.append($(finishPage));
        }

        function responsesDataReady() {
            qti.fireEvent("responsesDataReady");
        }

        function doRecovery() {
            mapping.recoverAllXMLResults("test-responses.xml", responsesDataReady);
        }
        /* if (qti.showCISForm) {
        	qti.subscribeToEvent("showCISForm", doRecovery, "TESTING: check and recover saved responses or upload all responses", "checkRecovery");
        } else {
        	qti.subscribeToEvent("instructionsStart", doRecovery, "TESTING: check and recover saved responses or upload all responses", "checkRecovery");
        } */


        // STATE 0
        statusObjects[0] = {
            rules: function(source) {
                if (qti.showCISForm) {
                    if (internalState === 1) {
                        this.changeState(1);
                    }
                } else if (instructionsUrl) {
                    if (internalState === 2) {
                        this.changeState(internalState);
                    }
                } else {
                    if (internalState === 2) {
                        this.changeState(4);
                    }
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                internalState = newState;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                try {
                    $.getXML(holdingPagesUrl, getHoldingPagesContent, onError);
                    $.getXML(preTestUrl, showPreTestScreens, onError);
                    stopInteractions('[role~="navigation"]');
                } catch (er) {
                    //mapping.setStatus(1, "internal");
                    if (qti.showCISForm) {
                        mapping.setStatus(1, "internal");
                    } else {
                        mapping.setStatus(2, "internal");
                    }
                }
                hideTestControls();
            },
            hasRun: false
        };

        // STATE 1
        statusObjects[1] = {
            rules: function(source) {
                if (internalState === 2) {
                    this.changeState(internalState);
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                try {
                    $.getXML(cisFormUrl, showCISForm, onError);
                } catch (er) {
                    mapping.setStatus(2, "internal");
                }
            },
            hasRun: false
        };

        // STATE 2
        statusObjects[2] = {
            rules: function(source) {
                if (internalState === 2 || internalState === 4) {
                    this.changeState(internalState);
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                try {
                    $.getXML(instructionsUrl, showInstructions, onError);
                    stopInteractions('[role~="navigation"]');
                } catch (er) {
                    mapping.setStatus(4, "internal");
                }
            },
            hasRun: false
        };

        // STATE 4
        statusObjects[4] = {
            rules: function(source) {
                if (externalState === 5) {
                    this.changeState(externalState);
                }
                if (internalState === 7) {
                    this.changeState(internalState);
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                if (newState === 7) {
                    qti.fireEvent("itemUnload", qti.getCurrentItem());
                }
                internalState = newState;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                //$.getJSON("stubs/timer?type=JSON", setLocalTimer, onError);
                if ($('div#test-banner p.no-timer').length === 0) {
                    testTime = $('connect\\:timeLimits, timeLimits').attr('maxTime');
                    setLocalTimer(testTime);
                }
                if (this.hasRun) {
                    // Resume test
                    if (qti.preloadTestContents) {
                        qti.displayItem();
                    } else {
                        qti.changeItem(qti.getCurrentItem());
                    }
                    restartInteractions(document);
                    if (qti.audioPlayer && qti.audioPlayer.$mainAudio.length > 0) {
                        qti.audioPlayer.jPlayer("play");
                    }
                } else {
                    // Initialise test
                    if (qti.preloadTestContents) {
                        qti.loadTestItems(testStart);
                    } else {
                        qti.changeItem(qti.getFirstItem(), null, testStart);
                    }
                    restartInteractions('[role~="navigation"]');
                }
                showTestControls();
                TestViewerApi.autoPoll();
            },
            hasRun: false
        };

        // STATE 5
        statusObjects[5] = {
            rules: function(source) {
                if (externalState === 5) {
                    return;
                }

                if (externalState === 4) {
                    this.changeState(externalState);
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                internalState = newState;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                pauseTimer();
                showPauseHoldingPage();
                stopInteractions(document);
                hideTools();
                hideTestControls();
            },
            hasRun: false
        };

        // STATE 7
        statusObjects[7] = {
            rules: function(source) {
                if (externalState === 8) {
                    this.changeState(externalState);
                }
            },
            changeState: function(newState) {
                this.hasRun = true;
                internalState = newState;
                state = newState;
                statusObjects[newState].initState();
            },
            initState: function() {
                showFinishedHoldingPage();
                stopInteractions(document);
                hideTools();
                hideTestControls();
                TestViewerApi.manualPoll();
                TestViewerApi.buildResponses();
                qti.fireEvent("testEnd");
            },
            hasRun: false
        };

        // STATE 8
        statusObjects[8] = {
            rules: function(source) {
                return;
            },
            changeState: function(newState) {
                return;
            },
            initState: function() {
                //console.log("Run any shutdown scripts - thank you and good night");
                // RUN SHOTDOWN FUNCS
            },
            hasRun: false
        };

        /*
        statusObjects[1999] = {
        	rules: function() {
        		// Rules for changing state
        		// if state === receivedState return
        		// is the received state legal for this state?
        		//  do the state and received state allow progression?
        		//  if so, call changeState
        	},
        	changeState: function() {
        		// functions to be called on state change - including set new state value
        		// set hasRun
        		// run any specific functions - none forseen at present
        		// run initState for new state object
        		//  set state
        	},
        	initState: function() {
        		// functions to be called on initiation of this state
        		// these may depend on the value of hasRun
        	},
        	hasRun: false
        };
        */

        mapping.setStatus = function(newState, source) {
            if (typeof(newState) !== "number") {
                throw new Error("Incorrect incoming state type");
            }
            if (newState > 9) {
                throw new Error("Incorrect incoming state value");
            }

            //console.log("state:" + state);
            //console.log("internalState: " + internalState);
            //console.log("externalState: " + externalState);

            if (source === "internal") {
                internalState = newState;
            } else if (source === "external") {
                externalState = newState;
            } else {
                throw new Error("Incorrect state received");
            }
            statusObjects[state].rules();
        };

        mapping.getStatus = function() {
            return state;
        };

        // Always run state 0 initialisation automatically
        qti.mappingLoadListener.push(statusObjects[0].initState);

    }());

    return mapping;
}(ulib.withNamespaces("http://www.w3.org/1999/xhtml", {
    connect: "http://connect.ucles.org.uk/ns/ConnectDeliveryEngine",
    qti: "http://www.imsglobal.org/xsd/imsqti_v2p1",
    p: "http://connect.ucles.org.uk/ns/QTIItemParameters",
    svg: "http://www.w3.org/2000/svg"
})));
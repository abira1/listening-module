/* Copyright © UCLES, 2013 */

/*global ulib, window, qti*/

var theme = (function($) {
    var theme = {};
    qti._setupScrollContentContainers();

    var mobileInteractions = function() {
        //$('[connect\\:class~="rubricBlock"]').parent().hide();

        $('[connect\\:class~="choiceInteraction"]').each(function() {
            var $this = $(this),
                layout;
            if ($this.is('[connect\\:author-class~="presentation-horizontalOptions"]')) {
                layout = "horizontal";
                $this.find('label').addClass('ui-btn-icon-left');
            } else {
                layout = "vertical";
            }
            $this.children('ul').controlgroup({
                type: layout
            });
        });

        $('[connect\\:class~="inlineChoiceInteraction"] select')
            .selectmenu({
                nativeMenu: false,
                mini: true
            })
            .siblings('a.ui-btn').addClass('needsclick');

        $('[connect\\:class~="textEntryInteraction"] input, [connect\\:class~="extendedTextInteraction"] textarea')
            .attr({
                autocomplete: "off",
                autocorrect: "off",
                autocapitalize: "off",
                spellcheck: "false"
            })
            .on('cut copy paste', function(e) {
                e.preventDefault();
            })
            .textinput();
    };
    if (qti.touchDeviceSupport) {
        qti.subscribeToEvent("itemLoad", mobileInteractions, "Prepare screen and elements, and apply settings for mobile/touchscreen use", "mobileInteractions");
    }

    $(document).ready(function() {
        //qti._setupVideo(); // 38-videoSetup.js
        qti.audioPlayer = qti._setupAudio();
    });

    (function() {
        var flashChanges = 20,
            firstAlarm = false,
            secondAlarm = false,
            timerMarkup = function() {
                qti.timerMarkup.display = $('span[connect\\:function~="timer"]');
                qti.timerMarkup.displayValue = $('span[connect\\:function~="timer"] > em');
                qti.timerMarkup.displayText = $('span[connect\\:function~="timer"] > span');

                //Show and Hide Timer Display
                var clockState = true,
                    clickMessage = $.ulib.span().text("Click to show time");
                clickMessage.attr("connect:function", "clickTimer");

                $('#timer').click(function(event) {
                    if (clockState) {
                        qti.timerMarkup.display.css("display", "none");
                        qti.timerMarkup.display.parent().append(clickMessage);
                        clockState = false;
                    } else {
                        clickMessage.remove();
                        qti.timerMarkup.display.css("display", "inline-block");
                        clockState = true;
                    }
                });
            };

        qti.themeLoadListener.push(timerMarkup);

        if (!qti.hideTimerWarnings) {
            var timeOutWarning = function(t) {
                /* timeWarning will be triggered every 5 seconds - ensure the flashing lasts no longer */
                var flashColor = '#f33', // light red - will be on a very dark background
                    originalColor = qti.computedStyle($('span[connect\\:function~="timer"]')[0], 'color'),
                    color = originalColor,
                    flash = function() {
                        color = (color === originalColor) ? flashColor : originalColor;

                        if (flashChanges > 0) {
                            qti.timerMarkup.display.css("color", color);
                            flashChanges -= 1;
                            setTimeout(flash, 200);
                        } else if (secondAlarm) {
                            qti.timerMarkup.display.css("color", flashColor);
                        }
                    };

                if (t <= 10 && !firstAlarm) {
                    setTimeout(flash, 0);
                    firstAlarm = true;
                } else if (t <= 5 && !secondAlarm) {
                    secondAlarm = true;
                    setTimeout(flash, 0);
                }
            };

            qti.subscribeToEvent("time", timeOutWarning, "warn candidate at 10mins and 5mins", "timeOutWarning", true);
        }
    }());

    (function() {
        function showCandidateDetails() {
            $('p#candidate').show();
        }
        if (qti.showCISForm) {
            qti.subscribeToEvent("showCISForm", showCandidateDetails, "Show candidate details in the top toolbar strip", "showCandidateDetails");
        } else {
            qti.subscribeToEvent("instructionsStart", showCandidateDetails, "Show candidate details in the top toolbar strip", "showCandidateDetails");
        }

        function preparePreTestAudio() {
            var btnText;
            if (qti.audioPlayer && $('#sample-audio-content').length > 0) {
                qti.audioPlayer.jPlayer("setMedia", {
                    oga: $('#sample-audio-content').val()
                });
                $('#audio-control').show();
            }
            $('input:button.sound').click(function() {
                if ($(this).is('.playing')) {
                    $(this).removeClass('playing');
                    $(this).val(btnText);
                    qti.audioPlayer.jPlayer("stop");
                } else {
                    qti.audioPlayer.jPlayer("play");
                    $(this).addClass('playing');
                    btnText = $(this).val();
                    $(this).val('Stop sound');
                }
            });
        }
        qti.subscribeToEvent("preTestScreenChange", preparePreTestAudio, "Setup pre-test audio-check player and controls when available", "preparePreTestAudio");

        function preloadMainAudio() {
            if (qti.audioPlayer) {
                $('#audio-control').show();
                qti.audioPlayer.jPlayer("setMedia", {
                    oga: $('#main-audio-content').val()
                });
                qti.audioPlayer.jPlayer("option", "loop", false);
                // 30/04/2013: below is hack to force preloading of the sizable main audio file, in Gecko 3.6
                qti.audioPlayer.jPlayer("play");
                qti.audioPlayer.jPlayer("stop");
            }
        }
        qti.subscribeToEvent("showInstructions", preloadMainAudio, "Preload the main test audio file", "preloadMainAudio");

        function prepareTestScreen() {
            $('div#banner').hide();
            qti._onResize();
            if (qti.audioPlayer) {
                qti.audioPlayer.jPlayer("play", qti.audioPlayer.mainAudioStart);
            }
        }
        qti.subscribeToEvent("testStart", prepareTestScreen, "Hide the top banner on starting the test", "prepareTestScreen");
    })();

    (function() {

        function toolbar() {
            var toolbox = $("#access-toolbar");
            var tools = toolbox.find("[class~=tool]");
            var toolWidth = 0;
            var dynamicStyles = $.createHash();
            var tabUp = true;

            //Determine direction of tabbing
            $(document).keypress(function(event) {

                if (event.keyCode === 9) {
                    if (!event.shiftKey) {
                        tabUp = true;
                    } else {
                        tabUp = false;
                    }
                }
            });

            tools.each(function(index, tool) {

                tool = $(tool);

                var optionValue;
                var handle = tool.find("dt");
                var slideWidth = tool[0].offsetWidth;
                var toolType = handle.text();
                var toolOptions = tool.find("a");
                var toolFocused = false;
                var toolSelected = false;

                function setOption() {

                    if (optionValue.substring(0, 6) !== "volume") {

                        if (!dynamicStyles.has(toolType)) {
                            dynamicStyles.set(toolType, $.link());
                            $(dynamicStyles.get(toolType)).attr("rel", "stylesheet");
                            $("head").append(dynamicStyles.get(toolType));
                        }
                        $(dynamicStyles.get(toolType)).attr("href", optionValue + ".css");
                    } else {
                        var mediaVolume =
                            Math.floor(Math.exp(parseInt(optionValue.substring(6), 10) / 2)) * 5;
                        if (qti.mediaPlayer.exists) {
                            qti.mediaPlayer.volume(mediaVolume);
                        }
                    }
                }

                function showTool(selectedOption) {

                    tool.parent().cssAnimation("width", toolWidth + "px", slideWidth + "px",
                        250, {
                            tweening: $.tweening.easeBoth()
                        }).
                    then(function() {
                        toolOptions.attr("tabindex", "1");
                        if (selectedOption) {
                            selectedOption.focus();
                        }
                        tool.addClass("open");
                        tool.addClass("extended");
                    }).start();
                }

                function hideTool() {

                    tool.parent().cssAnimation("width", slideWidth + "px", toolWidth + "px",
                        250, {
                            tweening: $.tweening.easeBoth()
                        }).
                    then(function() {
                        tool.removeClass("extended");
                        tool.removeClass("open");
                        toolSelected = false;
                        tool[0].blur();
                    }).start();
                }

                tool.css({
                    left: "0",
                    width: tool[0].offsetWidth + "px"
                });

                if (handle[0].offsetWidth > toolWidth) {
                    toolWidth = handle[0].offsetWidth;
                }

                //The tool itself is tabbable. When this gets focus
                //set its tabindex to -1 and set the tabindex of all
                //options on the tool to 1. This mechanism prevents
                //the page scrolling and also means that you can step
                //between tools quickly without having to tab through
                //every option
                tool.focus(function(event) {

                    $.later(function() {
                        if (!toolSelected) {

                            toolSelected = true;
                            tool.attr("tabindex", "-1");

                            if (tabUp) {
                                showTool(toolOptions[0]);
                            } else {
                                showTool(toolOptions[toolOptions.length - 1]);
                            }
                        }
                    });
                });

                toolOptions.each(function(index, toolOption) {
                    toolOption = $(toolOption);

                    toolOption.focus(function(event) {

                        if (tool.hasClass("extended")) {
                            toolFocused = true;
                        }
                    });

                    //If focus is lost from the tool, set the tabindex
                    //on all options to -1 and set the tabindex on the
                    //tool to 1
                    toolOption.blur(function(event) {

                        toolFocused = false;
                        $.later(function() {

                            if (!toolFocused && tool.hasClass("extended")) {

                                toolOptions.attr("tabindex", "-1");
                                tool.attr("tabindex", "1");
                                hideTool();
                            }
                        });
                    });

                    toolOption.click(function(event) {
                        toolOptions.removeClass("current");
                        toolOption.removeClass("toolOption");
                        optionValue = toolOption.attr("class");
                        toolOption.addClass("toolOption");
                        toolOption.addClass("current");
                        toolOption[0].blur();
                        qti.fireEvent("accessChange", toolOption);
                        setOption();
                        event.preventDefault();
                    });

                });
                tool.parent().css({
                    width: toolWidth + "px"
                });
            });
        }
        qti.themeLoadListener.push(toolbar);
    })();

    (function() {

        var textHighlighting = function() {
            $('[role="main"]').attr('id', 'highlightable-content');
            qti._setupTextHighlighting({
                noteHtext: false
            });
        };
        qti.subscribeToEvent("testStart", textHighlighting, "Setup text highlighting for the main part of the test screen", "textHighlighting");

        var itemLoadHandler = function() {
            if (qti.getCurrentItem()) {
                qti.updateScreenStore();
                qti.restoreTextNotes();
                qti.restoreSavedRanges();
                //setupRubricHandler();
                //setupEditActions();
                //setupWordCount();

                var audioClips = $('a.audio-clip');
                if (audioClips.length > 0) {
                    audioClips.click(qti.audioClipHandler);
                    var firstClip = $(audioClips[0]);
                    qti.loadAudioClip(firstClip.attr('href'), firstClip.text());
                    $('div.audio-content').css('visibility', 'visible');
                }
            }
        };
        var itemUnloadHandler = function() {
            if (qti.getCurrentItem()) {
                qti.saveTextNotes();
                qti.saveCurrentRanges();
                if ($('a.audio-clip').length > 0) {
                    qti.audioPlayer.audio.pause();
                    $('div.audio-content').css('visibility', 'hidden');
                }
            }
        };

        qti.subscribeToEvent("itemLoad", itemLoadHandler, "Restores any saved ranges, text notes and data relevant to the current item, from memory", "restoreTextData");
        qti.subscribeToEvent("itemUnload", itemUnloadHandler, "Perform necessary saving and housekeeping for text ranges, notes and data for the currently displayed item", "saveTextData");

        if (qti.useClipboard) {
            qti.subscribeToEvent("newScreenDisplay", qti.setupTextareaOverlay, "Setup overlaid editable div in place of textareas", "setupTextareaOverlay");
        }
    })();

    (function() {
        var cisForm, formElements, $tabs,
            singleInputs = {},
            groupedInputs = {},
            validationOptions = {
                ignore: "",
                errorContainer: '#CISerrors',
                errorLabelContainer: '#missing-entries',
                wrapper: 'li',
                messages: {}
            };

        // Set up CIS form UI
        qti.setupCISForm = function() {
            $tabs = $('#tabs').tabs();
            cisForm = $('#candidateInformation');

            cisForm.keydown(function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    return false;
                }
            });

            cisForm.find('[data-message]').each(function() {
                var element = $(this),
                    message = element.data('message'),
                    name = element.attr('name');
                if (!name) {
                    name = element.find(':input:first').attr('name');
                }
                validationOptions.messages[name] = message;
            });

            cisForm.validate(validationOptions);

            var otherExamList = $('input[name="other_Cambridge_exams_taken"], input[name="other_Cambridge_exams_taken2"]'),
                otherExamNone = $('#other_Cambridge_exams_taken_none');

            otherExamList.change(function() {
                if ($(this).is(otherExamNone)) {
                    if ($(this).is(':checked')) {
                        otherExamList.not($(this)).removeAttr('checked');
                    }
                } else {
                    otherExamNone.removeAttr('checked');
                }
            });

            checkCISButtons(0);

            $('#finish_confirm_no_button', $tabs).click(function() {
                $tabs.tabs('option', 'active', 1);
                checkCISButtons(1);
            });

            $('#CISnav .CISprevious').click(function() {
                var selected = $tabs.tabs('option', 'active');
                $tabs.tabs('option', 'active', selected - 1);
                checkCISButtons(selected - 1);
            });

            $('#CISnav .CISnext').click(function() {
                var selected = $tabs.tabs('option', 'active');
                $tabs.tabs('option', 'active', selected + 1);
                checkCISButtons(selected + 1);
            });

            $('.other-selection', $tabs).each(function() {
                var otherField = $(this).hide(),
                    otherEntry = otherField.find('input:text');

                otherField.prev().find('select').change(function() {
                    if ($(this).val() === "other") {
                        otherField.slideDown(250, function() {
                            otherEntry.addClass('required').focus();
                        });
                    } else {
                        otherField.slideUp(250, function() {
                            otherEntry.removeClass('required').val("");
                        });
                    }
                });
            });

            $('.dual:not(.matched)').each(function() {
                var dualField = $(this).hide(),
                    dualEntry = dualField.find('select');
                dualField.parent().find(':checkbox').change(function() {
                    if ($(this).is(':checked')) {
                        dualField.slideDown(250, function() {
                            dualEntry.addClass('required').focus();
                        });
                    } else {
                        if (dualEntry.val() === "other") {
                            dualField.next('.other-selection').slideUp(250, function() {
                                dualField.next('.other-selection').find('input:text').removeClass('required').val("");
                            });
                        }
                        dualField.slideUp(250, function() {
                            dualEntry.removeClass('required').val("");
                        });
                    }
                });
            });

            $('.dual.matched').each(function() {
                var dualField = $(this).hide(),
                    dualFieldInput = dualField.find('input[type="text"]'),
                    matchedName = dualField.attr('name'),
                    matchedEntry = dualField.parent().find(':checkbox[id=' + matchedName + ']');

                matchedEntry.change(function() {
                    if (matchedEntry.is(':checked')) {
                        dualField.slideDown(250, function() {
                            dualFieldInput.addClass('required').focus();
                        });
                    } else {
                        dualField.slideUp(250, function() {
                            dualFieldInput.removeClass('required').val("");
                        });
                    }
                });
            });

            $('.more-info', $tabs).each(function() {
                var moreField = $(this).hide(),
                    moreEntry = moreField.find('select, input:radio[name="work_sector"]');
                moreField.prev().find('input:radio').change(function() {
                    if ($(this).val() !== "no") {
                        moreField.slideDown(250, function() {
                            moreEntry.addClass('required').focus();
                        });
                    } else {
                        moreField.slideUp(250, function() {
                            moreEntry.removeClass('required').val("");
                        });
                    }
                });
            });

            formElements = cisForm.find('input:not([type="button"]):not([type="submit"]), select, textarea');
            formElements.each(function() {
                if ($(this).is('[type="checkbox"],[type="radio"]')) {
                    if (groupedInputs[this.name] === undefined) {
                        groupedInputs[this.name] = [];
                    }
                    groupedInputs[this.name].push($(this));
                } else {
                    singleInputs[this.name] = $(this);
                }
            });

            qti.setupCustomFormResponses(cisForm, true);

        };

        function setupMisssingEntryLinks() {
            $('#missing-entries li label').each(function() {
                var label = $(this),
                    target = label.attr('for');
                $(this).wrap('<a href="#"/>')
                    .parent().click(function(event) {
                        event.preventDefault();
                        var targetElm = $('[name="' + target + '"]:first'),
                            container;
                        if (targetElm.is(':checkbox')) {
                            container = 'table';
                        } else {
                            container = 'tr';
                        }
                        var targetField = targetElm.closest('p,ul,' + container),
                            targetTab = targetField.closest('div[id^="tab"]'),
                            tabId = targetTab.parent().find('>div[id^="tab"]').index(targetTab);
                        $tabs.tabs('option', 'active', tabId);
                        qti.flash(targetField);
                        checkCISButtons($tabs.tabs('option', 'active'));
                    });
            });
        }

        function checkCISButtons(currentTab) {
            var lastTab = $tabs.find('> ul li ').length - 1;
            if (currentTab === 0) {
                $('#CISnav .CISprevious').hide();
                $('#CISnav .CISnext').show();
            } else if (currentTab === lastTab) {
                $('#CISnav .CISprevious, #CISnav .CISnext').hide();
                $('#missing-entries').empty();
                if (!cisForm.valid()) {
                    setupMisssingEntryLinks();
                }
            } else {
                $('#CISnav .CISprevious, #CISnav .CISnext').show();
            }
        }

        function bindFormElementsToResponses() {
            formElements.each(function() {
                var fld = $(this),
                    fldName = fld.attr('name'),
                    fldVal = fld.attr('value'),
                    rspId = cisForm.attr('id') + '.' + fldName,
                    rspVar = qti.getCustomFormVariable(rspId),
                    rspVal, input, inputs, i;
                if (rspVar) {
                    rspVal = rspVar.getValue();
                    input = singleInputs[fldName];
                    if (input === undefined) {
                        inputs = groupedInputs[fldName];
                        if (inputs !== undefined) {
                            if ($.isArray(rspVal) && (rspVal.indexOf(fldVal) !== -1)) {
                                this.checked = true;
                                fld.change(); // UA 28/01/2014: to trigger any attached show handlers for fields dependent on this checkbox
                            } else if (rspVal === fldVal) {
                                this.checked = true;
                                fld.change(); // ditto
                            }
                        }
                    } else {
                        input.val(rspVal);
                        if (input.is('select')) {
                            input.change(); // UA 28/01/2014: to trigger any attached show handlers connected to an 'other' option being set for this select dropdown
                        }
                    }
                }
            });

            formElements.bind('change blur', function() {
                var val, fldName = $(this).attr('name'),
                    rspId = cisForm.attr('id') + '.' + fldName,
                    rspVar = qti.getCustomFormVariable(rspId);
                if ($(this).is('[type="checkbox"]')) {
                    val = [];
                    if (formElements.filter('[name="' + fldName + '"]').length > 1) {
                        formElements.filter('[name="' + fldName + '"]:checked').each(function() {
                            val.push($(this).val());
                        });
                    } else {
                        val = $(this).val();
                    }
                } else {
                    val = $(this).val();
                }
                if (rspVar) {
                    rspVar.setValue(val);
                }
            });
        }

        if (qti.showCISForm) {
            qti.subscribeToEvent("responsesDataReady", bindFormElementsToResponses, "bind CIS form input elements to response variables and their update handlers", "bindFormElementsToResponses");
        }
    }());
    return theme;
}(ulib.withNamespaces("http://www.w3.org/1999/xhtml", {
    connect: "http://connect.ucles.org.uk/ns/ConnectDeliveryEngine",
    qti: "http://www.imsglobal.org/xsd/imsqti_v2p1",
    svg: "http://www.w3.org/2000/svg"
})));
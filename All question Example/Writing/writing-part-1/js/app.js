(function(qti) {
    var appScripts,
        gup = function(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)",
                regex = new RegExp(regexS),
                results = regex.exec(window.location.href);
            if (results == null) {
                return "";
            } else {
                return results[1];
            }
        },
        locationParam = gup("location");

    if (document.querySelector('script[data-main="js/app"]')) {
        qti.appScriptsLoad = true;

        requirejs.config({
            shim: {
                "jquery-ui": {
                    deps: ["jquery"]
                },
                "jquery.throttle-debounce": {
                    deps: ["jquery"]
                },
                "jquery.validate": {
                    deps: ["jquery"]
                },
                "jquery.ui.position": {
                    deps: ["jquery"]
                },
                "jquery.contextMenu": {
                    deps: ["jquery"]
                },
                "jquery.jplayer.min": {
                    deps: ["jquery"]
                },
                "rangy-core": {
                    deps: []
                },
                "rangy-classapplier": {
                    deps: ["rangy-core"]
                },
                "rangy-selectionsaverestore": {
                    deps: ["rangy-core"]
                },
                "rangy-serializer": {
                    deps: ["rangy-core"]
                },
                "ulib": {
                    deps: ["jquery"]
                },
                "qti": {
                    deps: [
                        "jquery",
                        "jquery-ui",
                        "jquery.throttle-debounce",
                        "jquery.validate",
                        "jquery.ui.position",
                        "jquery.contextMenu",
                        "jquery.jplayer.min",
                        "rangy-core",
                        "rangy-classapplier",
                        "rangy-selectionsaverestore",
                        "rangy-serializer",
                        "d3",
                        "jxon",
                        "biginteger",
                        "raphael",
                        "notes",
                        "ulib"
                    ]
                },
                "settings": {
                    deps: ["qti"]
                },
                "theme": {
                    deps: ["settings"]
                },
                "localMapping": {
                    deps: ["settings"]
                },
                "serverMapping": {
                    deps: ["settings"]
                }
            }
        });

        appScripts = [
            "jquery",
            "jquery-ui",
            "jquery.throttle-debounce",
            "ulib",
            "jxon",
            "biginteger",
            "raphael",
            "d3",
            "rangy-core",
            "rangy-classapplier",
            "rangy-selectionsaverestore",
            "rangy-serializer",
            "jquery.validate",
            "jquery.ui.position",
            "jquery.contextMenu",
            "jquery.jplayer.min",
            "notes",
            "qti",
            "settings",
            "theme"
        ];
    } else {
        if (window.theme) {
            appScripts = [];
        } else {
            appScripts = ["theme"];
        }
    }

    //if (locationParam === "local") {
    appScripts.push("localMapping");
    //} else {
    //	appScripts.push("serverMapping");
    //}
    requirejs(appScripts, function() {
        // UA 01/10/2016: seems unnecessarily verbose, but resolve() call below must be wrapped in anonymous function,
        // because in the full AMD mode with just the one (pre)declared <script src="js/require.js" data-main="js/app"/> tag,
        // qti.appScriptsLoad is not yet set to a Deferred, at the time of requirejs() call above.
        qti.appScriptsLoad.resolve();
    });

})(window.qti || (window.qti = {}));
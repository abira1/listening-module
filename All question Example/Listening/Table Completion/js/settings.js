/* XHTML Test player scripting configuration */
var JXON = require("jxon");

JXON.config({
    autoDate: false
});

qti.preloadTestContents = true;
qti.inContextHelp = 2;
qti.setTextareaHeight = true;
qti.clearAllNotes = true;

// Extra scripting libraries
require([
    "rangy-core",
    "jplayer.playlist"
]);
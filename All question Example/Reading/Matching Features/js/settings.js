/* XHTML Test player scripting configuration */
var JXON = require("jxon");

JXON.config({
    autoDate: false
});

qti.preloadTestContents = true;
qti.inContextHelp = 2;
qti.setTextareaHeight = true;
qti.showCISForm = false;
qti.clearAllNotes = true;
/*
qti.useBootstrapDialogs = true;
qti.provideTestEndPause = true;
qti.dynamicAccessibilityImages = false;
qti.angularModules = [];
*/

// Extra scripting libraries
require([
    "rangy-core"
]);
/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

(function(window) {
    var bugpack         = require("bugpack").context();
    var BugCortex       = bugpack.require("bugcortex.BugCortex");
    window.bugcortex    = window.bugcortex || BugCortex.getInstance();
})(window);

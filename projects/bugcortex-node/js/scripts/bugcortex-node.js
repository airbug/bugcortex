/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

var bugpack     = require("bugpack").loadContextSync(module);
bugpack.loadExportSync("bugcortex.BugCortex");
var BugCortex   = bugpack.require("bugcortex.BugCortex");


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = BugCortex.getInstance();

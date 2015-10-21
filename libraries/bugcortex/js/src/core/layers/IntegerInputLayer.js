/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.IntegerInputLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Throwables')
//@Require('bugcortex.InputLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Collections     = bugpack.require('Collections');
    var Throwables      = bugpack.require('Throwables');
    var InputLayer      = bugpack.require('bugcortex.InputLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {InputLayer.<number>}
     */
    var IntegerInputLayer = Class.extend(InputLayer, {

        _name: "bugcortex.IntegerInputLayer",


        //-------------------------------------------------------------------------------
        // InputLayer Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} value
         * @return {string}
         */
        doCalculateBinaryFromValue: function(value) {
            return value.toString(2);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.IntegerInputLayer', IntegerInputLayer);
});

/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.INeuralInput')

//@Require('Interface')
//@Require('bugcortex.INeuralLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Interface       = bugpack.require('Interface');
    var INeuralLayer    = bugpack.require('bugcortex.INeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Interface
    //-------------------------------------------------------------------------------

    /**
     * @interface
     * @extends {INeuralLayer}
     * @template I
     */
    var INeuralInput = Interface.extend(INeuralLayer, {

        _name: "bugcortex.INeuralInput",


        //-------------------------------------------------------------------------------
        // Interface Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {I} value
         */
        inputValue: function(value) {}
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.INeuralInput', INeuralInput);
});

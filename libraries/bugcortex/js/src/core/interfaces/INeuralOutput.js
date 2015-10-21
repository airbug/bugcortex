/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.INeuralOutput')

//@Require('Interface')
//@Require('bugcortex.IOuterLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Interface           = bugpack.require('Interface');
    var IOuterLayer    = bugpack.require('bugcortex.IOuterLayer');


    //-------------------------------------------------------------------------------
    // Declare Interface
    //-------------------------------------------------------------------------------

    /**
     * @interface
     * @extends {IOuterLayer}
     * @template I
     */
    var INeuralOutput = Interface.extend(IOuterLayer, {

        _name: "bugcortex.INeuralOutput",


        //-------------------------------------------------------------------------------
        // Interface Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} tick
         * @return {I}
         */
        getOutputValueForTick: function(tick) {},

        /**
         * @param {number} tick
         * @return {boolean}
         */
        hasOutputValueForTick: function(tick) {},

        /**
         * @param {I} value
         * @param {function(Throwable=)=} callback
         */
        trainValue: function(value, callback) {}
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.INeuralOutput', INeuralOutput);
});

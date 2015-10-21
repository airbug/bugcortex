/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.IntegerOutputLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Throwables')
//@Require('bugcortex.OutputLayer')


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
    var OutputLayer     = bugpack.require('bugcortex.OutputLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {OutputLayer.<number>}
     */
    var IntegerOutputLayer = Class.extend(OutputLayer, {

        _name: "bugcortex.IntegerOutputLayer",


        //-------------------------------------------------------------------------------
        // OutputLayer Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} value
         * @return {string}
         */
        doCalculateBinaryFromValue: function(value) {
            return value.toString(2);
        },

        /**
         * @protected
         * @param {number} tick
         */
        doCalculateValueForTick: function(tick) {
            var binaryString = "";
            this.getNeuronList().forEach(function(neuron) {
                binaryString = neuron.getBitForTick(tick) + binaryString;
            });
            if (binaryString) {
                return parseInt(binaryString, 2);
            } else {
                return null;
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.IntegerOutputLayer', IntegerOutputLayer);
});

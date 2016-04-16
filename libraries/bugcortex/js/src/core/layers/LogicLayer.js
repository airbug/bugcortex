/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.LogicLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Throwables')
//@Require('bugcortex.LogicNeuron')
//@Require('bugcortex.NeuralLayer')


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
    var LogicNeuron     = bugpack.require('bugcortex.LogicNeuron');
    var NeuralLayer     = bugpack.require('bugcortex.NeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {NeuralLayer}
     */
    var LogicLayer = Class.extend(NeuralLayer, {

        _name: "bugcortex.LogicLayer",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------


        //-------------------------------------------------------------------------------
        // NeuralLayer Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @return {boolean}
         */
        doStimulateGrowth: function() {
            //TODO BRN: We can control rates of growth here. For now simply growing in groups of 5.
            var currentSize = this.getNeuronCount();
            this.growLayerToSize(currentSize + 5);
            return true;
        },

        /**
         * @protected
         * @return {Neuron}
         */
        generateNeuron: function() {
            return new LogicNeuron(this);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.LogicLayer', LogicLayer);
});

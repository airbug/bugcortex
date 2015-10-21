/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.WeightedLinearMovingAverageNeuron')

//@Require('Class')
//@Require('Collections')
//@Require('bugcortex.Neuron')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Collections     = bugpack.require('Collections');
    var Neuron          = bugpack.require('bugcortex.Neuron');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Neuron}
     */
    var WeightedLinearMovingAverageNeuron = Class.extend(Neuron, {

        _name: "bugcortex.WeightedLinearMovingAverageNeuron",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {INeuralLayer} neuralLayer
         */
        _constructor: function(neuralLayer) {

            this._super(neuralLayer);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {number}
             */
            this.linearAverageMaxLength     = 10;

            /**
             * @private
             * @type {Queue.<Neuron>}
             */
            this.linearMovingAverageQueue   = Collections.queue();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------


    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.WeightedLinearMovingAverageNeuron', WeightedLinearMovingAverageNeuron);
});

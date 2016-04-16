/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.ConstantLayer')

//@Require('Class')
//@Require('Throwables')
//@Require('bugcortex.INeuralConstant')
//@Require('bugcortex.NeuralLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Throwables          = bugpack.require('Throwables');
    var INeuralConstant     = bugpack.require('bugcortex.INeuralConstant');
    var NeuralLayer         = bugpack.require('bugcortex.NeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {NeuralLayer}
     * @implements {INeuralConstant.<I>}
     * @template I
     */
    var ConstantLayer = Class.extend(NeuralLayer, {

        _name: "bugcortex.ConstantLayer",


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

            /**
             * @private
             * @type {number}
             */
            this.currentTick            = -1;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {number}
         */
        getCurrentTick: function() {
            return this.currentTick;
        },


        //-------------------------------------------------------------------------------
        // INeuralConstant Implementation
        //-------------------------------------------------------------------------------

        /**
         *
         */
        tickLayer: function() {
            this.doTickLayer();
        },


        //-------------------------------------------------------------------------------
        // NeuralLayer Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        doStimulateGrowth: function() {
            return false;
        },

        /**
         * @param {number} size
         */
        growLayerToSize: function(size) {
            throw Throwables.exception("CannotGrowLayer", {}, "ConstantLayers cannot be grown");
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @abstract
         * @protected
         */
        doTickLayer: function(value) {
            var _this = this;
            this.currentTick++;
            this.getNeuronList().forEach(function(neuron) {
                /** @type {ConstantNeuron} */
                var constantNeuron = /** @type {ConstantNeuron} */ (neuron);
                constantNeuron.tickNeuron(_this.currentTick);
            });
        },

        /**
         * @protected
         * @param {number} tick
         * @param {string} binaryString
         */
        doInputNeuronsForTick: function(tick, binaryString) {
            var lengthOfInput   = binaryString.length;
            this.growLayerToSize(lengthOfInput);
            this.forEachNeuron(function(neuron, i) {
                /** @type {InputNeuron} */
                var inputNeuron     = /** {InputNeuron} */(neuron);
                var bit             = 0;
                if (i < lengthOfInput) {
                    bit = parseInt(binaryString[lengthOfInput - i - 1]);
                }
                inputNeuron.feedNeuronInputBitForTick(bit, tick);
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(ConstantLayer, INeuralConstant);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.ConstantLayer', ConstantLayer);
});

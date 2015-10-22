/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.InputLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Throwables')
//@Require('bugcortex.INeuralInput')
//@Require('bugcortex.InputNeuron')
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
    var INeuralInput    = bugpack.require('bugcortex.INeuralInput');
    var InputNeuron     = bugpack.require('bugcortex.InputNeuron');
    var NeuralLayer     = bugpack.require('bugcortex.NeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {NeuralLayer}
     * @implements {INeuralInput.<I>}
     * @template I
     */
    var InputLayer = Class.extend(NeuralLayer, {

        _name: "bugcortex.InputLayer",


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

            /**
             * @private
             * @type {Map.<number, I>}
             */
            this.tickToInputValueMap    = Collections.map();
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

        /**
         * @return {Map.<number, I>}
         */
        getTickToInputValueMap: function() {
            return this.tickToInputValueMap;
        },


        //-------------------------------------------------------------------------------
        // INeuralInput Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {I} value
         */
        inputValue: function(value) {
           this.doInputValue(value);
        },


        //-------------------------------------------------------------------------------
        // Abstract Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @abstract
         * @protected
         * @param {I} value
         * @return {string}
         */
        doCalculateBinaryFromValue: function(value) {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement InputLayer.doCalculateBinaryFromValue");
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
         * @protected
         * @return {Neuron}
         */
        generateNeuron: function() {
            return new InputNeuron(this);
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {I} value
         */
        doInputValue: function(value) {
            this.currentTick++;
            this.tickToInputValueMap.put(this.currentTick, value);
            var binary = this.doCalculateBinaryFromValue(value);
            this.doInputNeuronsForTick(this.currentTick, binary);
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

    Class.implement(InputLayer, INeuralInput);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.InputLayer', InputLayer);
});

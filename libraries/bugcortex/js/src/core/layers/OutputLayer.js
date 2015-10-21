/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.OutputLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Flows')
//@Require('Throwables')
//@Require('bugcortex.INeuralOutput')
//@Require('bugcortex.NeuralLayer')
//@Require('bugcortex.Neuron')
//@Require('bugcortex.OutputNeuron')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Collections         = bugpack.require('Collections');
    var Flows               = bugpack.require('Flows');
    var Throwables          = bugpack.require('Throwables');
    var INeuralOutput       = bugpack.require('bugcortex.INeuralOutput');
    var NeuralLayer         = bugpack.require('bugcortex.NeuralLayer');
    var Neuron              = bugpack.require('bugcortex.Neuron');
    var OutputNeuron        = bugpack.require('bugcortex.OutputNeuron');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachParallel    = Flows.$forEachParallel;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {NeuralLayer}
     * @implements {INeuralOutput.<I>}
     * @template I
     */
    var OutputLayer = Class.extend(NeuralLayer, {

        _name: "bugcortex.OutputLayer",


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
             * @type {number}
             */
            this.currentTrainingTick    = -1;

            /**
             * @private
             * @type {Map.<number, I>}
             */
            this.tickToOutputValueMap   = Collections.map();

            /**
             * @private
             * @type {Map.<number, I>}
             */
            this.tickToTrainingValueMap = Collections.map();
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
         * @private
         * @return {number}
         */
        getCurrentTrainingTick: function() {
            return this.currentTrainingTick;
        },

        /**
         * @return {Map.<number, I>}
         */
        getTickToOutputValueMap: function() {
            return this.tickToOutputValueMap;
        },

        /**
         * @return {Map.<number, I>}
         */
        getTickToTrainingValueMap: function() {
            return this.tickToTrainingValueMap;
        },


        //-------------------------------------------------------------------------------
        // INeuralOutput Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {number} tick
         * @return {I}
         */
        getOutputValueForTick: function(tick) {
            if (this.hasOutputValueForTick(tick)) {
                return this.tickToOutputValueMap.get(tick);
            } else {
                throw Throwables.exception("HasNotTicked", {}, "No value found for tick '" + tick + "'");
            }
        },

        /**
         * @param {number} tick
         * @return {boolean}
         */
        hasOutputValueForTick: function(tick) {
            return this.tickToOutputValueMap.containsKey(tick);
        },

        /**
         * @param {I} value
         * @param {function(Throwable=)=} callback
         */
        trainValue: function(value, callback) {
            this.doTrainValue(value, callback);
        },


        //-------------------------------------------------------------------------------
        // NeuralLayer Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doAddNeuron: function(neuron) {
            this._super(neuron);
            neuron.addEventListener(Neuron.EventTypes.TICK, this.hearNeuronTick, this);
        },

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
            return OutputNeuron(this);
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
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement OutputLayer.doCalculateBinaryFromValue");
        },

        /**
         * @abstract
         * @protected
         * @param {number} tick
         * @return {I}
         */
        doCalculateValueForTick: function(tick) {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement OutputLayer.doCalculateValueForTick");
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        doOutputValue: function() {
            this.currentTick++;
            var value = this.doCalculateValueForTick(this.currentTick);
            this.tickToOutputValueMap.put(this.currentTick, value);
            this.dispatchEvent(new Event(OutputLayer.EventTypes.OUTPUT_VALUE, {value: value, tick: this.currentTick}));
        },

        /**
         * @protected
         * @param {I} value
         * @param {function(Throwable=)=} callback
         */
        doTrainValue: function(value, callback) {
            this.currentTrainingTick++;
            this.tickToTrainingValueMap.put(this.currentTrainingTick, value);
            var binary = this.doCalculateBinaryFromValue(value);
            this.doTrainNeuronsForTick(this.currentTrainingTick, binary, callback);
        },

        /**
         * @protected
         * @param {number} tick
         * @param {string} binaryString
         * @param {function(Throwable=)=} callback
         */
        doTrainNeuronsForTick: function(tick, binaryString, callback) {
            var lengthOfInput   = binaryString.length;
            this.growLayerToSize(lengthOfInput);

            $forEachParallel(this.getNeuronList(), function(callback, neuron, i) {
                /** @type {OutputNeuron} */
                var outputNeuron    = /** @type {OutputNeuron} */neuron;
                var bit             = 0;
                if (i < lengthOfInput) {
                    bit = parseInt(binaryString[lengthOfInput - i - 1]);
                }
                outputNeuron.feedNeuronTrainingBitForTick(bit, tick, callback);
            }).callback(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        checkAndProcessReadyToOutputValue: function() {
            if (this.isReadyToOutputValue()) {
                this.doOutputValue();
            }
        },

        /**
         * @private
         * @return {boolean}
         */
        isReadyToOutputValue: function() {
            var nextTick    = this.currentTick + 1;
            var iterator    = this.getNeuronList().iterator();
            while (iterator.hasNext()) {
                var neuron = iterator.nextValue();
                if (neuron.getCurrentTick() < nextTick) {
                    return false;
                }
            }
            return true;
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronTick: function(event) {
            var neuron = event.getData().neuron;
            var neuronTick = neuron.getCurrentTick();

            //NOTE BRN: We only need to check if our output value is ready to process if this is the next tick in the sequence. Otherwise it's a future tick and does not need to be looked at...
            if (neuronTick === this.currentTick + 1) {
                this.checkAndProcessReadyToOutputValue();
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    OutputLayer.EventTypes = {
        OUTPUT_VALUE: "OutputLayer:EventTypes:OutputValue"
    };


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(OutputLayer, INeuralOutput);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.OutputLayer', OutputLayer);
});

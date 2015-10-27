/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.InputNeuron')

//@Require('Class')
//@Require('Collections')
//@Require('Flows')
//@Require('Throwables')
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
    var Throwables      = bugpack.require('Throwables');
    var Neuron          = bugpack.require('bugcortex.Neuron');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Neuron}
     */
    var InputNeuron = Class.extend(Neuron, {

        _name: "bugcortex.InputNeuron",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {InputLayer} inputLayer
         */
        _constructor: function(inputLayer) {

            this._super(inputLayer);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Map.<number, number>}
             */
            this.tickToInputBitMap = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Init Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {InputLayer} inputLayer
         * @return {InputNeuron}
         */
        init: function(inputLayer) {
            var _this = this._super(inputLayer);
            if (_this) {
                _this.seedState = Neuron.SeedState.SEEDED;
            }
            return _this;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Map.<number, number>}
         */
        getTickToInputBitMap: function() {
            return this.tickToInputBitMap;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} inputBit
         * @param {number} tick
         */
        feedNeuronInputBitForTick: function(inputBit, tick) {
            this.tickToInputBitMap.put(tick, inputBit);
            this.seedCurrentTick(tick - 1);
            this.checkAndProcessReadyToTick();
        },


        //-------------------------------------------------------------------------------
        // Neuron Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} tick
         */
        doCalculateBitForTick: function(tick) {
            if (this.tickToInputBitMap.containsKey(tick)) {
                return this.tickToInputBitMap.get(tick);
            } else {
                throw Throwables.exception("TickOutOfSync", {}, "Could not find bit for tick '" + tick + "'");
            }
        },

        /**
         * @protected
         * @param {Set.<TrainingContext>} trainingContextSet
         * @param {number} currentTrainingTick
         * @param {function()} callback
         */
        doProcessTrainingContextSetForTick: function(trainingContextSet, currentTrainingTick, callback) {
            var _this = this;
            if (this.getCurrentTick() < currentTrainingTick) {
                var hearTick = function(event) {
                    if (_this.getCurrentTick() === currentTrainingTick) {
                        _this.removeEventListener(Neuron.EventTypes.TICK, hearTick);
                        _this.processTrainingContextSet(trainingContextSet, currentTrainingTick, callback);
                    }
                };
                this.addEventListener(Neuron.EventTypes.TICK, hearTick);
            } else {
                this.processTrainingContextSet(trainingContextSet, currentTrainingTick, callback);
            }
        },

        /**
         * @protected
         */
        doSeeding: function() {
            throw Throwables.error("IllegalState", {}, "This should not be called in InputNeuron");
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Set.<TrainingContext>} trainingContextSet
         * @param {number} currentTrainingTick
         * @param {function()} callback
         */
        processTrainingContextSet: function(trainingContextSet, currentTrainingTick, callback) {
            var bit = this.getBitForTick(currentTrainingTick);
            trainingContextSet.forEach(function(trainingContext) {
                if (bit === trainingContext.getTrainingBit()) {
                    trainingContext.returnTrainingResult(null, Neuron.TrainingResult.MATCH);
                } else {
                    trainingContext.returnTrainingResult(null, Neuron.TrainingResult.REJECTED);
                }
            });
            callback();
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.InputNeuron', InputNeuron);
});

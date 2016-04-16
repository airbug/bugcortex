/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.ConstantNeuron')

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
    var ConstantNeuron = Class.extend(Neuron, {

        _name: "bugcortex.ConstantNeuron",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {ConstantLayer} constantLayer
         * @param {number} constantBit
         */
        _constructor: function(constantLayer, constantBit) {

            this._super(constantLayer);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {number}
             */
            this.constantBit    = constantBit;
        },


        //-------------------------------------------------------------------------------
        // Init Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {ConstantLayer} constantLayer
         * @return {ConstantNeuron}
         */
        init: function(constantLayer) {
            var _this = this._super(constantLayer);
            if (_this) {
                _this.seedState = Neuron.SeedState.SEEDED;
            }
            return _this;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {number}
         */
        getConstantBit: function() {
            return this.constantBit;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} tick
         */
        tickNeuron: function(tick) {
            this.seedCurrentTick(tick - 1);
            this.checkAndProcessReadyToTick();
        },


        //-------------------------------------------------------------------------------
        // Neuron Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} tick
         * @return {number}
         */
        doCalculateBitForTick: function(tick) {
            if (this.getCurrentTick() >= tick) {
                return this.constantBit;
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
            this.ensureTick(currentTrainingTick, function() {
                _this.processTrainingContextSet(trainingContextSet, currentTrainingTick, callback);
            });
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

    bugpack.export('bugcortex.ConstantNeuron', ConstantNeuron);
});

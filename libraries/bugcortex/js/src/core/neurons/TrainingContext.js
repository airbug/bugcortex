/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.TrainingContext')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TrainingContext = Class.extend(Obj, {

        _name: "bugcortex.TrainingContext",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {number} trainingBit
         * @param {Neuron} neuron
         * @param {number} tick
         * @param {function(Throwable, Neuron.TrainingResult)} callback
         */
        _constructor: function(trainingBit, neuron, tick, callback) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {function(Throwable, Neuron.TrainingResult)}
             */
            this.callback       = callback;

            /**
             * @private
             * @type {Neuron}
             */
            this.neuron         = neuron;

            /**
             * @private
             * @type {number}
             */
            this.tick           = tick;

            /**
             * @private
             * @type {number}
             */
            this.trainingBit    = trainingBit;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {function(Throwable, Neuron.TrainingResult)}
         */
        getCallback: function() {
            return this.callback;
        },

        /**
         * @return {Neuron}
         */
        getNeuron: function() {
            return this.neuron;
        },

        /**
         * @return {number}
         */
        getTick: function() {
            return this.tick;
        },

        /**
         * @return {number}
         */
        getTrainingBit: function() {
            return this.trainingBit;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Throwable} throwable
         * @param {Neuron.TrainingResult} trainingResult
         */
        returnTrainingResult: function(throwable, trainingResult) {
            this.callback(throwable, trainingResult);
        },


        //-------------------------------------------------------------------------------
        // Obj Methods
        //-------------------------------------------------------------------------------

        /**
         * @override
         * @param {*} value
         * @return {boolean}
         */
        equals: function(value) {
            if (Class.doesExtend(value, TrainingContext)) {
                return (Obj.equals(value.getTick(), this.tick) && Obj.equals(value.getNeuron(), this.neuron));
            }
            return false;
        },

        /**
         * @override
         * @return {number}
         */
        hashCode: function() {
            if (!this._hashCode) {
                this._hashCode = Obj.hashCode("[TrainingContext]" +
                    Obj.hashCode(this.tick) + "_" +
                    Obj.hashCode(this.neuron));
            }
            return this._hashCode;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.TrainingContext', TrainingContext);
});

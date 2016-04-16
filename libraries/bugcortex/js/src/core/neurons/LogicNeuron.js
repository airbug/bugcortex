/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.LogicNeuron')

//@Require('Class')
//@Require('Collections')
//@Require('Flows')
//@Require('Obj')
//@Require('RandomUtil')
//@Require('Throwables')
//@Require('bugcortex.Neuron')


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
    var Obj                 = bugpack.require('Obj');
    var RandomUtil          = bugpack.require('RandomUtil');
    var Throwables          = bugpack.require('Throwables');
    var Neuron              = bugpack.require('bugcortex.Neuron');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachParallel    = Flows.$forEachParallel;
    var $series             = Flows.$series;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Neuron}
     */
    var LogicNeuron = Class.extend(Neuron, {

        _name: "bugcortex.LogicNeuron",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {OutputLayer} neuralLayer
         */
        _constructor: function(neuralLayer) {

            this._super(neuralLayer);


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {LogicStatement}
             */
            this.logicStatement                     = null;

            /**
             * @private
             * @type {Set.<Neuron>}
             */
            this.logicStatementNeuronSet            = Collections.set();

            /**
             * @private
             * @type {Map.<Neuron, number>}
             */
            this.parentNeuronAttachmentStrengthMap  = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {LogicStatement}
         */
        getLogicStatement: function() {
            return this.logicStatement;
        },

        /**
         * @return {Set.<Neuron>}
         */
        getLogicStatementNeuronSet: function() {
            return this.logicStatementNeuronSet;
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
            return this.logicStatement.resolveLogicForTick(tick) ? 1 : 0;
        },

        /**
         * @protected
         * @param {Set.<TrainingContext>} trainingContextSet
         * @param {number} currentTrainingTick
         * @param {function()} callback
         */
        doProcessTrainingContextSetForTick: function(trainingContextSet, currentTrainingTick, callback) {
            var _this = this;
            $series([
                function(callback) {
                    _this.processTrainingContextSet(trainingContextSet, currentTrainingTick, callback);
                }
            ]).callback(callback);
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doRemoveChildNeuron: function(neuron) {
            this._super(neuron);
            if (this.logicStatementNeuronSet.contains(neuron)) {
                this.logicStatementNeuronSet.remove(neuron);
                this.generateLogicStatement();
            }
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} trainingBit
         * @param {number} tick
         * @param {function(Throwable=)=} callback
         */
        feedNeuronTrainingBitForTick: function(trainingBit, tick, callback) {
            var _this = this;
            this.tickToTrainingBitMap.put(tick, trainingBit);
            _this.feedTrainingBitFromNeuronForTick(trainingBit, this, tick, callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        generateLogicStatement: function() {

        },


        ensureChildSelectedForTick: function(tick) {
            if (!this.selectedChildNeuron) {
                this.selectRandomChildFromNeuronList(this.retrieveChildNeuronsWithEarliestTickBeforeTick(tick));
            }
        },

        /**
         * @private
         * @param {Set.<TrainingContext>} trainingContextSet
         * @param {number} currentTrainingTick
         * @param {function(Throwable=)} callback
         */
        processTrainingContextSet: function(trainingContextSet, currentTrainingTick, callback) {
            //NOTE BRN: Since the OutputNeuron is providing itself feedback, there should only be one trainingContext.
            if (trainingContextSet.getCount() > 1) {
                throw Throwables.bug("IllegalState", {}, "OutputNeuron has more than one trainingContext. This should not happen.");
            }
            var _this                   = this;
            var trainingContext         = trainingContextSet.toArray()[0];
            var trainingBit             = trainingContext.getTrainingBit();
            var matchList               = Collections.list();
            var mutatedList             = Collections.list();
            var rejectedList            = Collections.list();
            var childNeuronList         = this.retrieveChildNeuronsWithEarliestTickBeforeTick(currentTrainingTick);

            $series([
                $forEachParallel(childNeuronList, function(callback, childNeuron) {
                    childNeuron.feedTrainingBitFromNeuronForTick(trainingBit, _this, currentTrainingTick, function(throwable, trainingResult) {
                        if (!throwable) {
                            switch (trainingResult) {
                                case Neuron.TrainingResult.ALREADY_TRAINED:
                                    var neuronBit = childNeuron.getBitForTick(currentTrainingTick);
                                    if (neuronBit === trainingBit) {
                                        matchList.add(childNeuron);
                                    }
                                    break;
                                case Neuron.TrainingResult.MATCH:
                                    matchList.add(childNeuron);
                                    break;
                                case Neuron.TrainingResult.MUTATED:
                                    mutatedList.add(childNeuron);
                                    break;
                                case Neuron.TrainingResult.REJECTED:
                                    rejectedList.add(rejectedList);
                                    break;
                            }
                        }
                        callback(throwable);
                    });
                }),
                function(callback) {
                    _this.ensureTick(currentTrainingTick, callback);
                },
                function(callback) {
                    var bit = _this.getBitForTick(currentTrainingTick);
                    rejectedList.forEach(function(childNeuron) {
                        if (childNeuronList.getCount() > 1) {
                            _this.removeChildNeuron(childNeuron);
                            childNeuronList.remove(childNeuron);
                        }
                    });
                    if (!_this.selectedChildNeuron || !matchList.contains(_this.selectedChildNeuron)) {
                        if (matchList.getCount() > 0) {
                            _this.selectRandomChildFromNeuronList(matchList);
                        } else if (mutatedList.getCount() > 0) {
                            _this.selectRandomChildFromNeuronList(mutatedList);
                        } else {
                            _this.selectRandomChildFromNeuronList(childNeuronList);
                        }
                    }

                    var trainingResult = Neuron.TrainingResult.MATCH;
                    if (bit !== trainingBit) {
                        trainingResult = Neuron.TrainingResult.MUTATED;
                    }
                    trainingContext.returnTrainingResult(null, trainingResult);
                    callback();
                }
            ]).callback(callback);
        },

        /**
         * @private
         * @param {List.<Neuron>} neuronList
         */
        selectRandomChildFromNeuronList: function(neuronList) {
            var index = RandomUtil.randomBetween(0, neuronList.getCount() - 1);
            this.selectedChildNeuron = neuronList.getAt(index);
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.LogicNeuron', LogicNeuron);
});

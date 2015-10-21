/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.OutputNeuron')

//@Require('Class')
//@Require('Collections')
//@Require('Flows')
//@Require('Obj')
//@Require('RandomUtil')
//@Require('Throwables')
//@Require('bugcortex.NeuralLayerEvent')
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
    var NeuralLayerEvent    = bugpack.require('bugcortex.NeuralLayerEvent');
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
    var OutputNeuron = Class.extend(Neuron, {

        _name: "bugcortex.OutputNeuron",


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
             * @type {Neuron}
             */
            this.selectedChildNeuron    = null;

            /**
             * @private
             * @type {Map.<number, number>}
             */
            this.tickToTrainingBitMap   = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Map.<number, number>}
         */
        getTickToTrainingBitMap: function() {
            return this.tickToTrainingBitMap;
        },


        //-------------------------------------------------------------------------------
        // Neuron Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} tick
         */
        doCalculateBitForTick: function(tick) {
            return this.selectedChildNeuron.getBitForTick(tick);
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
                    _this.ensureChildren(callback);
                },
                function(callback) {
                    _this.ensureChildSelected();
                    _this.ensureTick(currentTrainingTick, callback);
                },
                function(callback) {
                    _this.processTrainingContextSet(trainingContextSet, currentTrainingTick, callback);
                }
            ]).callback(callback);
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
        addRandomChildNeurons: function() {
            var _this = this;
            var subLayerList = this.retrieveAttachedSubLayersWithNeurons();
            if (subLayerList.getCount() > 0) {
                var maxNumberRandomNeurons = 2;
                subLayerList.forEach(function(subLayer) {
                    _this.addNumberRandomChildNeuronsFromLayer(maxNumberRandomNeurons, subLayer);
                });
            }
        },

        /**
         * @private
         * @param {List.<Neuron>} neuronList
         */
        addRandomChildNeuronFromNeuronList: function(neuronList) {
            var index = RandomUtil.randomBetween(0, neuronList.getCount() - 1);
            this.addChildNeuron(neuronList.removeAt(index));
        },

        /**
         * @private
         * @param {number} maxNumberRandomNeurons
         * @param {NeuralLayer} neuralLayer
         */
        addNumberRandomChildNeuronsFromLayer: function(maxNumberRandomNeurons, neuralLayer) {
            var selectableNeurons = neuralLayer.getAttachedNeuronList().clone().removeAll(this.getChildNeuronList());
            if (selectableNeurons.getCount() < maxNumberRandomNeurons) {
                maxNumberRandomNeurons = selectableNeurons.getCount();
            }
            for (var i = 0; i < maxNumberRandomNeurons; i++) {
                this.addRandomChildNeuronFromNeuronList(selectableNeurons);
            }
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        ensureChildren: function(callback) {
            var _this = this;
            if (this.getChildNeuronList().getCount() <= 0) {
                if (!this.hasUsableSubLayers()) {
                    return callback(Throwables.exception("NoUsableSubLayers", {}, "Could not find any usable sub layers that have neurons"))
                }
                this.addRandomChildNeurons();
                if (this.getChildNeuronList().getCount() <= 0) {
                    this.stimulateSubLayerGrowthAndWaitForChildren(function(throwable) {
                        if (!throwable) {
                            _this.addRandomChildNeurons();
                        }
                        callback(throwable);
                    });
                } else {
                    callback();
                }
            } else {
                callback();
            }
        },

        /**
         * @private
         */
        ensureChildSelected: function() {
            if (!this.selectedChildNeuron) {
                this.selectRandomChildFromNeuronList(this.getChildNeuronList());
            }
        },

        /**
         * @private
         * @param {number} trainingTick
         * @param {function(Throwable=)} callback
         */
        ensureTick: function(trainingTick, callback) {
            var _this = this;
            if (this.getCurrentTick() < trainingTick) {
                var hearTick = function(event) {
                    if (_this.getCurrentTick() >= trainingTick) {
                        _this.removeEventListener(Neuron.EventTypes.TICK, hearTick);
                        callback();
                    }
                };
                this.addEventListener(Neuron.EventTypes.TICK, hearTick);
            } else {
                callback();
            }
        },

        /**
         * @private
         * @return {boolean}
         */
        hasUsableSubLayers: function() {
            return this.retrieveAttachedSubLayers().getCount() > 0;
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
                throw Throwables.error("IllegalState", {}, "OutputNeuron has more than one trainingContext. This should not happen.");
            }
            var _this                   = this;
            var bit                     = this.getBitForTick(currentTrainingTick);
            var trainingContext         = trainingContextSet.toArray()[0];
            var trainingBit             = trainingContext.getTrainingBit();
            var matchList               = Collections.list();
            var mutatedList             = Collections.list();

            $series([
                $forEachParallel(this.getChildNeuronList(), function(callback, childNeuron) {
                    childNeuron.feedTrainingBitFromNeuronForTick(trainingBit, _this, currentTrainingTick, function(throwable, trainingResult) {
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
                                if (Obj.equals(_this.selectedChildNeuron, childNeuron)) {
                                    _this.selectedChildNeuron = null;
                                }
                                _this.removeChildNeuron(childNeuron);
                                break;
                        }
                    });
                }),
                function(callback) {
                    if (!_this.selectedChildNeuron || !matchList.contains(_this.selectedChildNeuron)) {
                        if (matchList.getCount() > 0) {
                            _this.selectRandomChildFromNeuronList(matchList);
                        } else if (mutatedList.getCount() > 0) {
                            _this.selectRandomChildFromNeuronList(mutatedList);
                        } else {
                            _this.selectRandomChildFromNeuronList(_this.getChildNeuronList());
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
         * @return {List.<NeuralLayer>}
         */
        retrieveAttachedSubLayers: function() {
            /** @type {OuterLayer} */
            var neuralLayer = /** @type {OuterLayer} */(this.getNeuralLayer());
            var subLayerList = neuralLayer.getNeuralSubLayerList().clone();
            subLayerList.forEach(function(subLayer) {
                if (subLayer.isDetached()) {
                    subLayerList.remove(subLayer);
                }
            });
            return subLayerList;
        },

        /**
         * @private
         * @return {List.<NeuralLayer>}
         */
        retrieveAttachedSubLayersWithNeurons: function() {
            var subLayerList = this.retrieveAttachedSubLayers();
            subLayerList.forEach(function(subLayer) {
                if (subLayer.getAttachedNeuronList().getCount() <= 0) {
                    subLayerList.remove(subLayer);
                }
            });
            return subLayerList;
        },

        /**
         * @private
         * @param {List.<Neuron>} neuronList
         */
        selectRandomChildFromNeuronList: function(neuronList) {
            var index = RandomUtil.randomBetween(0, neuronList.getCount() - 1);
            this.selectedChildNeuron = neuronList.getAt(index);
        },

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        stimulateSubLayerGrowthAndWaitForChildren: function(callback) {
            var subLayerList = this.retrieveAttachedSubLayers();
            $forEachParallel(subLayerList, function(callback, subLayer) {
                subLayer.addEventListener(NeuralLayerEvent.EventTypes.GROW, function(event) {
                    callback();
                });
                subLayer.stimulateGrowth();
            }).callback(callback);
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.OutputNeuron', OutputNeuron);
});

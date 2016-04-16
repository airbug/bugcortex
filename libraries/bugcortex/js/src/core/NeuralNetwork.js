/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.NeuralNetwork')

//@Require('Class')
//@Require('Collections')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Flows')
//@Require('ObjectUtil')
//@Require('Throwables')
//@Require('bugcortex.INeuralConstant')
//@Require('bugcortex.INeuralInput')
//@Require('bugcortex.INeuralOutput')
//@Require('bugcortex.NeuronProcessor')
//@Require('bugcortex.OutputLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Collections         = bugpack.require('Collections');
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Flows               = bugpack.require('Flows');
    var ObjectUtil          = bugpack.require('ObjectUtil');
    var Throwables          = bugpack.require('Throwables');
    var INeuralConstant     = bugpack.require('bugcortex.INeuralConstant');
    var INeuralInput        = bugpack.require('bugcortex.INeuralInput');
    var INeuralOutput       = bugpack.require('bugcortex.INeuralOutput');
    var NeuronProcessor     = bugpack.require('bugcortex.NeuronProcessor');
    var OutputLayer         = bugpack.require('bugcortex.OutputLayer');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forInParallel      = Flows.$forInParallel;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     */
    var NeuralNetwork = Class.extend(EventDispatcher, {

        _name: "bugcortex.NeuralNetwork",


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
             * @type {Set.<NeuralLayer>}
             */
            this.neuralLayerSet         = Collections.set();

            /**
             * @private
             * @type {Set.<INeuralConstant>}
             */
            this.neuralConstantLayerSet      = Collections.set();

            /**
             * @private
             * @type {BidiMap.<string. INeuralInput>}
             */
            this.neuralInputBidiMap     = Collections.bidiMap();

            /**
             * @private
             * @type {BidiMap.<string. INeuralOutput>}
             */
            this.neuralOutputBidiMap    = Collections.bidiMap();

            /**
             * @private
             * @type {NeuronProcessor}
             */
            this.neuronProcessor        = new NeuronProcessor();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Set.<INeuralConstant>}
         */
        getNeuralConstantLayerSet: function() {
            return this.neuralConstantLayerSet;
        },

        /**
         * @return {BidiMap.<string., INeuralInput>}
         */
        getNeuralInputBidiMap: function() {
            return this.neuralInputBidiMap;
        },

        /**
         * @return {BidiMap.<string., INeuralOutput>}
         */
        getNeuralOutputBidiMap: function() {
            return this.neuralOutputBidiMap;
        },

        /**
         * @return {NeuronProcessor}
         */
        getNeuronProcessor: function() {
            return this.neuronProcessor;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {ConstantLayer} neuralConstantLayer
         */
        addConstantLayer: function(neuralConstantLayer) {
            if (!Class.doesImplement(neuralConstantLayer, INeuralConstant)) {
                throw Throwables.illegalArgumentBug("neuralConstantLayer", neuralConstantLayer, "neuralConstantLayer must implement INeuralConstant");
            }
            if (!this.neuralConstantLayerSet.contains(neuralConstantLayer)) {
                this.neuralConstantLayerSet.add(neuralConstantLayer);
                neuralConstantLayer.attach();
                neuralConstantLayer.setNeuronProcessor(this.neuronProcessor);
            }
        },

        /**
         * @param {ConstantLayer} neuralConstantLayer
         */
        removeConstantLayer: function(neuralConstantLayer) {
            if (this.neuralConstantLayerSet.contains(neuralConstantLayer)) {
                this.neuralConstantLayerSet.remove(neuralConstantLayer);
                neuralConstantLayer.detach();
            }
        },

        /**
         * @param {string} name
         * @param {InputLayer} neuralInputLayer
         */
        addInputLayer: function(name, neuralInputLayer) {
            if (!Class.doesImplement(neuralInputLayer, INeuralInput)) {
                throw Throwables.illegalArgumentBug("neuralInputLayer", neuralInputLayer, "neuralInputLayer must implement INeuralInput");
            }
            if (!this.neuralInputBidiMap.containsKey(name) && !this.neuralInputBidiMap.containsValue(neuralInputLayer)) {
                this.neuralInputBidiMap.put(name, neuralInputLayer);
                neuralInputLayer.attach();
                neuralInputLayer.setNeuronProcessor(this.neuronProcessor);
            }
        },

        /**
         * @param {InputLayer} neuralInputLayer
         */
        removeInputLayer: function(neuralInputLayer) {
            if (this.neuralInputBidiMap.containsValue(neuralInputLayer)) {
                this.neuralInputBidiMap.removeByValue(neuralInputLayer);
                neuralInputLayer.detach();
            }
        },

        /**
         * @param {INeuralLayer} neuralLayer
         */
        addLayer: function(neuralLayer) {
            /*if (!this.neuralLayerSet.contains(neuralLayer)) {
                this.neuralInputSet.add(neuralLayer);
                neuralLayer.attach();
            }*/
        },

        /**
         * @param {INeuralLayer} neuralLayer
         */
        removeLayer: function(neuralLayer) {
            /*if (this.neuralLayerSet.contains(neuralLayer)) {
                this.neuralInputSet.remove(neuralLayer);
                neuralLayer.detach();
            }*/
        },

        /**
         * @param {string} name
         * @param {OutputLayer} neuralOutputLayer
         */
        addOutputLayer: function(name, neuralOutputLayer) {
            if (!Class.doesImplement(neuralOutputLayer, INeuralOutput)) {
                throw Throwables.illegalArgumentBug("neuralOutputLayer", neuralOutputLayer, "neuralOutputLayer must implement INeuralOutput");
            }
            if (!this.neuralOutputBidiMap.containsKey(name) && !this.neuralOutputBidiMap.containsValue(neuralOutputLayer)) {
                this.neuralOutputBidiMap.put(name, neuralOutputLayer);
                neuralOutputLayer.addEventListener(OutputLayer.EventTypes.OUTPUT_VALUE, this.hearLayerOutputValue, this);
                neuralOutputLayer.attach();
                neuralOutputLayer.setNeuronProcessor(this.neuronProcessor);
            }
        },

        /**
         * @param {INeuralOutput} neuralOutputLayer
         */
        removeOutputLayer: function(neuralOutputLayer) {
            if (this.neuralOutputBidiMap.containsValue(neuralOutputLayer)) {
                this.neuralOutputBidiMap.removeByValue(neuralOutputLayer);
                neuralOutputLayer.detach();
            }
        },

        /**
         * @param {{
         *      inputs: Object.<string, *>,
         *      outputs: Object.<string, *>
         * }} trainObject
         * @param {function(Throwable=)=} callback
         */
        trainNetwork: function(trainObject, callback) {
            var _this           = this;
            var expectedInputs  = this.neuralInputBidiMap.toKeyCollection();
            var expectedOutputs = this.neuralOutputBidiMap.toKeyCollection();
            if (expectedInputs.getCount() === 0) {
                throw Throwables.exception("NetworkRequiresInput", {}, "Must add a NeuralInput before network can be updated");
            }
            if (expectedOutputs.getCount() === 0) {
                throw Throwables.exception("NetworkRequiresOutput", {}, "Must add a NeuralOutput before network can be updated");
            }
            var unknownInputs = Collections.collection();
            var unknownOutputs = Collections.collection();
            var inputs = trainObject.inputs;
            var outputs = trainObject.outputs;

            ObjectUtil.forIn(inputs, function(key, value) {
                if (expectedInputs.contains(key)) {
                    expectedInputs.remove(key);
                } else {
                    unknownInputs.add(key);
                }
            });

            ObjectUtil.forIn(outputs, function(key, value) {
                if (expectedOutputs.contains(key)) {
                    expectedOutputs.remove(key);
                } else {
                    unknownOutputs.add(key);
                }
            });

            if (expectedInputs.getCount() > 0) {
                throw Throwables.exception("Missing expected input '" + expectedInputs[0] + "'");
            }
            if (unknownInputs.getCount() > 0) {
                throw Throwables.exception("Unknown input '" + unknownInputs[0] + "'");
            }
            if (expectedOutputs.getCount() > 0) {
                throw Throwables.exception("Missing expected output '" + expectedOutputs[0] + "'");
            }
            if (unknownOutputs.getCount() > 0) {
                throw Throwables.exception("Unknown output '" + unknownOutputs[0] + "'");
            }

            ObjectUtil.forIn(inputs, function(key, value) {
                var neuralInput = _this.neuralInputBidiMap.getValue(key);
                neuralInput.inputValue(value);
            });

            this.neuralConstantLayerSet.forEach(function(neuralConstant) {
                neuralConstant.tickLayer();
            });

            $forInParallel(outputs, function(callback, key, value) {
                var neuralOutput = _this.neuralOutputBidiMap.getValue(key);
                neuralOutput.trainValue(value, callback);
            }).callback(callback);
        },

        /**
         * @param {{
         *      inputs: Object.<string, *>,
         *      outputs: Object.<string, *>
         * }} inputObject
         */
        inputNetwork: function(inputObject) {
            var _this           = this;
            var expectedInputs  = this.neuralInputBidiMap.toKeyCollection();
            if (expectedInputs.getCount() === 0) {
                throw Throwables.exception("NetworkRequiresInput", {}, "Must add a NeuralInput before network can be updated");
            }
            var unknownInputs = Collections.collection();
            var inputs = inputObject.inputs;

            ObjectUtil.forIn(inputs, function(key, value) {
                if (expectedInputs.contains(key)) {
                    expectedInputs.remove(key);
                } else {
                    unknownInputs.add(key);
                }
            });

            if (expectedInputs.getCount() > 0) {
                throw Throwables.exception("Missing expected input '" + expectedInputs[0] + "'");
            }
            if (unknownInputs.getCount() > 0) {
                throw Throwables.exception("Unknown input '" + unknownInputs[0] + "'");
            }

            ObjectUtil.forIn(inputs, function(key, value) {
                var neuralInput = _this.neuralInputBidiMap.getValue(key);
                neuralInput.inputValue(value);
            });

            this.neuralConstantLayerSet.forEach(function(neuralConstant) {
                neuralConstant.tickLayer();
            });
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearLayerOutputValue: function(event) {
            var tick            = event.getData().tick;
            var value           = event.getData().value;
            var outputLayer     = event.getTarget();
            var name            = this.neuralOutputBidiMap.getKey(outputLayer);
            this.dispatchEvent(new Event(NeuralNetwork.EventTypes.OUTPUT_VALUE, {
                tick: tick,
                value: value,
                outputLayer: outputLayer,
                name: name
            }));
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    NeuralNetwork.EventTypes = {
        OUTPUT_VALUE: "NeuralNetwork:EventTypes:OutputValue"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.NeuralNetwork', NeuralNetwork);
});

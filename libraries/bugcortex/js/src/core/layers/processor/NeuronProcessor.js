/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.NeuronProcessor')

//@Require('Class')
//@Require('Collections')
//@Require('Obj')
//@Require('Throwables')
//@Require('ValidationMachine')
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
    var Obj                 = bugpack.require('Obj');
    var Throwables          = bugpack.require('Throwables');
    var ValidationMachine   = bugpack.require('ValidationMachine');
    var Neuron              = bugpack.require('bugcortex.Neuron');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var NeuronProcessor = Class.extend(Obj, {

        _name: "bugcortex.NeuronProcessor",


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
            this.allowableTrainingGap       = 10;

            /**
             * @private
             * @type {number}
             */
            this.nextTick                   = null;

            /**
             * @private
             * @type {number}
             */
            this.nextTrainingTick           = null;

            /**
             * @private
             * @type {Set.<Neuron>}
             */
            this.neuronSet                  = Collections.set();

            /**
             * @private
             * @type {ValidationMachine}
             */
            this.neuronValidationMachine    = new ValidationMachine();

            /**
             * @private
             * @type {Map.<number, Set.<Neuron>}
             */
            this.tickToTickingNeuronSetMap  = Collections.map();

            /**
             * @private
             * @type {Map.<number, Set.<Neuron>}
             */
            this.tickToTrainingNeuronSetMap = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Init Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {NeuronProcessor}
         */
        init: function() {
            var _this = this._super();
            if (_this) {
                _this.neuronValidationMachine.addValidator(NeuronProcessor.ValidationTypes.PROCESS_NEURONS, _this.validateProcessNeurons, _this);
            }
            return _this;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {number}
         */
        getAllowableTrainingGap: function() {
            return this.allowableTrainingGap;
        },

        /**
         * @return {Set.<Neuron>}
         */
        getNeuronSet: function() {
            return this.neuronSet;
        },

        /**
         * @return {ValidationMachine}
         */
        getNeuronValidationMachine: function() {
            return this.neuronValidationMachine;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Collection.<Neuron>} neurons
         */
        addAllNeurons: function(neurons) {
            var _this = this;
            neurons = Collections.ensureCollection(neurons);
            neurons.forEach(function(neuron) {
                _this.addNeuron(neuron);
            });
        },

        /**
         * @param {Neuron} neuron
         */
        addNeuron: function(neuron) {
            if (!this.neuronSet.contains(neuron)) {
                this.doAddNeuron(neuron);
            }
        },

        /**
         * @param {Collection.<Neuron>} neurons
         */
        removeAllNeurons: function(neurons) {
            var _this = this;
            neurons = Collections.ensureCollection(neurons);
            neurons.forEach(function(neuron) {
                _this.removeNeuron(neuron);
            });
        },

        /**
         * @param {Neuron} neuron
         */
        removeNeuron: function(neuron) {
            if (this.neuronSet.contains(neuron)) {
                this.doRemoveNeuron(neuron);
            }
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doAddNeuron: function(neuron) {
            this.neuronSet.add(neuron);
            neuron.addEventListener(Neuron.EventTypes.READY_TO_TICK, this.hearNeuronReadyToTick, this);
            neuron.addEventListener(Neuron.EventTypes.READY_TO_TRAIN, this.hearNeuronReadyToTrain, this);
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doRemoveNeuron: function(neuron) {
            this.neuronSet.remove(neuron);
            neuron.removeEventListener(Neuron.EventTypes.READY_TO_TICK, this.hearNeuronReadyToTick, this);
            neuron.removeEventListener(Neuron.EventTypes.READY_TO_TRAIN, this.hearNeuronReadyToTrain, this);
        },

        /**
         * @protected
         * @param {function(Throwable=)} callback
         */
        processNeurons: function(callback) {
            var nextTickingNeuronSet    = this.popNextTickingNeuronSet();
            var nextTrainingNeuronSet   = this.popNextTrainingNeuronSet();
            if (nextTrainingNeuronSet) {
                this.trainNeurons(nextTrainingNeuronSet);
            }
            if (this.nextTick < this.nextTrainingTick + this.allowableTrainingGap) {
                this.tickNeurons(nextTickingNeuronSet);
            }
            callback();
            if (!this.tickToTickingNeuronSetMap.isEmpty() || !this.tickToTrainingNeuronSetMap.isEmpty()) {
                this.neuronValidationMachine.invalidate(NeuronProcessor.ValidationTypes.PROCESS_NEURONS);
            }
        },

        /**
         * @protected
         * @param {Neuron} neuron
         * @param {number} tick
         */
        scheduleNeuronForTickProcessing: function(neuron, tick) {
            var tickingNeuronSet = this.tickToTickingNeuronSetMap.get(tick);
            if (!tickingNeuronSet) {
                tickingNeuronSet = Collections.set();
                this.tickToTickingNeuronSetMap.put(tick, tickingNeuronSet);
            }
            tickingNeuronSet.add(neuron);
            if (this.nextTick === null || tick < this.nextTick) {
                this.nextTick = tick;
            }
            this.neuronValidationMachine.invalidate(NeuronProcessor.ValidationTypes.PROCESS_NEURONS);
        },

        /**
         * @protected
         * @param {Neuron} neuron
         * @param {number} tick
         */
        scheduleNeuronForTrainProcessing: function(neuron, tick) {
            var trainingNeuronSet = this.tickToTrainingNeuronSetMap.get(tick);
            if (!trainingNeuronSet) {
                trainingNeuronSet = Collections.set();
                this.tickToTrainingNeuronSetMap.put(tick, trainingNeuronSet);
            }
            trainingNeuronSet.add(neuron);
            if (this.nextTrainingTick === null || tick < this.nextTrainingTick) {
                this.nextTrainingTick = tick;
            }
            this.neuronValidationMachine.invalidate(NeuronProcessor.ValidationTypes.PROCESS_NEURONS);
        },

        /**
         * @private
         * @param {Collection.<Neuron>} neurons
         */
        tickNeurons: function(neurons) {
            neurons.forEach(function(neuron) {
                neuron.tick();
            });
        },

        /**
         * @private
         * @param {Collection.<Neuron>} neurons
         */
        trainNeurons: function(neurons) {
            neurons.forEach(function(neuron) {
                neuron.train();
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @return {Set.<Neuron>}
         */
        popNextTickingNeuronSet: function() {
            if (!this.tickToTickingNeuronSetMap.isEmpty()) {
                while (true) {
                    if (this.tickToTickingNeuronSetMap.containsKey(this.nextTick)) {
                        return this.tickToTickingNeuronSetMap.remove(this.nextTick);
                    } else {
                        this.nextTick++;
                    }
                }
            }
            return null;
        },

        /**
         * @private
         * @return {Set.<Neuron>}
         */
        popNextTrainingNeuronSet: function() {
            if (!this.tickToTrainingNeuronSetMap.isEmpty()) {
                while (true) {
                    if (this.tickToTrainingNeuronSetMap.containsKey(this.nextTrainingTick)) {
                        return this.tickToTrainingNeuronSetMap.remove(this.nextTrainingTick);
                    } else {
                        this.nextTrainingTick++;
                    }
                }
            }
            return null;
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronReadyToTick: function(event) {
            var neuron  = event.getData().neuron;
            var tick    = event.getData().tick;
            this.scheduleNeuronForTickProcessing(neuron, tick);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronReadyToTrain: function(event) {
            var neuron  = event.getData().neuron;
            var tick    = event.getData().tick;
            this.scheduleNeuronForTrainProcessing(neuron, tick);
        },


        //-------------------------------------------------------------------------------
        // Validators
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {function(Throwable=)} callback
         */
        validateProcessNeurons: function(callback) {
            this.processNeurons(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    NeuronProcessor.ValidationTypes = {
        PROCESS_NEURONS: "NeuronProcessor:ValidationTypes:ProcessNeurons"
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.NeuronProcessor', NeuronProcessor);
});

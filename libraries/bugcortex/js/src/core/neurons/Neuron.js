/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.Neuron')

//@Require('Class')
//@Require('Collections')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Throwables')
//@Require('bugcortex.INeuron')
//@Require('bugcortex.TrainingContext')


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
    var Throwables          = bugpack.require('Throwables');
    var INeuron             = bugpack.require('bugcortex.INeuron');
    var TrainingContext     = bugpack.require('bugcortex.TrainingContext');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     * @implements {INeuron}
     */
    var Neuron = Class.extend(EventDispatcher, {

        _name: "bugcortex.Neuron",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {INeuralLayer} neuralLayer
         */
        _constructor: function(neuralLayer) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Neuron.AttachmentState}
             */
            this.attachmentState                    = Neuron.AttachmentState.DETACHED;

            /**
             * @private
             * @type {List.<Neuron>}
             */
            this.childNeuronList                    = Collections.list();

            /**
             * @private
             * @type {number}
             */
            this.currentTick                        = -1;

            /**
             * @private
             * @type {number}
             */
            this.currentTrainingTick                = -1;

            /**
             * @private
             * @type {Neuron.LifeState}
             */
            this.lifeState                          = Neuron.LifeState.ALIVE;

            /**
             * @private
             * @type {INeuralLayer}
             */
            this.neuralLayer                        = neuralLayer;

            /**
             * @private
             * @type {number}
             */
            this.oldestTick                         = -1;

            /**
             * @private
             * @type {List.<Neuron>}
             */
            this.parentNeuronList                   = Collections.list();

            /**
             * @private
             * @type {Map.<number, number>}
             */
            this.tickToBitMap                       = Collections.map();

            /**
             * @private
             * @type {Map.<number, Set.<TrainingContext>>}
             */
            this.tickToTrainingContextSetMap        = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Neuron.AttachmentState}
         */
        getAttachmentState: function() {
            return this.attachmentState;
        },

        /**
         * @return {List.<Neuron>}
         */
        getChildNeuronList: function() {
            return this.childNeuronList;
        },

        /**
         * @return {number}
         */
        getCurrentTick: function() {
            return this.currentTick;
        },

        /**
         * @return {number}
         */
        getCurrentTrainingTick: function() {
            return this.currentTrainingTick;
        },

        /**
         * @return {Neuron.LifeState}
         */
        getLifeState: function() {
            return this.lifeState;
        },

        /**
         * @return {INeuralLayer}
         */
        getNeuralLayer: function() {
            return this.neuralLayer;
        },

        /**
         * @return {List.<Neuron>}
         */
        getParentNeuronList: function() {
            return this.parentNeuronList;
        },

        /**
         * @return {Map.<number, number>}
         */
        getTickToBitMap: function() {
            return this.tickToBitMap;
        },


        //-------------------------------------------------------------------------------
        // INeuron Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {INeuron} neuron
         */
        addChildNeuron: function(neuron) {
            if (this.isDead()) {
                throw Throwables.exception("NeuronIsDead", {}, "Neuron is dead and cannot have new neurons attached");
            }
            if (this.isDetached()) {
                throw Throwables.exception("NeuronIsDetached", {}, "Neuron is detached and cannot have new neurons attached in this state. Attach neuron first.");
            }
            if (neuron.isDead()) {
                throw Throwables.exception("NeuronIsDead", {}, "Attaching neuron is dead and cannot have new neurons attached");
            }
            if (!this.containsChildNeuron(neuron)) {
                this.doAddChildNeuron(neuron);
            }
        },

        /**
         * @param {INeuron} neuron
         */
        addParentNeuron: function(neuron) {
            if (this.isDead()) {
                throw Throwables.exception("NeuronIsDead", {}, "Neuron is dead and cannot have new neurons attached");
            }
            if (this.isDetached()) {
                throw Throwables.exception("NeuronIsDetached", {}, "Neuron is detached and cannot have new neurons attached in this state. Attach neuron first.");
            }
            if (neuron.isDead()) {
                throw Throwables.exception("NeuronIsDead", {}, "Attaching neuron is dead and cannot have new neurons attached");
            }
            if (!this.containsParentNeuron(neuron)) {
                this.doAddParentNeuron(neuron);
            }
        },

        /**
         *
         */
        attach: function() {
            if (this.isDead()) {
                throw Throwables.exception("NeuronIsDead", {}, "Neuron is dead and cannot be attached");
            }
            if (this.isDetached()) {
                this.attachmentState = Neuron.AttachmentState.ATTACHED;
                this.dispatchEvent(new Event(Neuron.EventTypes.ATTACHED, {
                    neuron: this
                }));
            }
        },

        /**
         * @param {INeuron} neuron
         * @return {boolean}
         */
        containsChildNeuron: function(neuron) {
            return this.childNeuronList.contains(neuron);
        },

        /**
         * @param {INeuron} neuron
         * @return {boolean}
         */
        containsParentNeuron: function(neuron) {
            return this.parentNeuronList.contains(neuron);
        },

        /**
         *
         */
        detach: function() {
            if (this.isAttached()) {
                this.attachmentState = Neuron.AttachmentState.DETACHED;
                this.removeAllChildNeurons();
                this.dispatchEvent(new Event(Neuron.EventTypes.DETACHED, {
                    neuron: this
                }));
            }
        },

        /**
         * @param {number} tick
         * @return {number}
         */
        getBitForTick: function(tick) {
            return this.tickToBitMap.get(tick);
        },

        /**
         * @param {number} tick
         * @return {boolean}
         */
        hasBitForTick: function(tick) {
            return this.tickToBitMap.containsKey(tick);
        },

        /**
         * @return {boolean}
         */
        isAlive: function() {
            return this.lifeState === Neuron.AttachmentState.ALIVE;
        },

        /**
         * @return {boolean}
         */
        isAttached: function() {
            return this.attachmentState === Neuron.AttachmentState.ATTACHED;
        },

        /**
         * @return {boolean}
         */
        isDead: function() {
            return this.lifeState === Neuron.AttachmentState.DEAD;
        },

        /**
         * @return {boolean}
         */
        isDetached: function() {
            return this.attachmentState === Neuron.AttachmentState.DETACHED;
        },

        /**
         *
         */
        kill: function() {
            if (this.isAlive()) {
                this.lifeState = Neuron.LifeState.DEAD;
                this.detach();
            }
        },

        /**
         *
         */
        removeAllChildNeurons: function() {
            var _this = this;
            this.childNeuronList.forEach(function(neuron) {
                _this.removeChildNeuron(neuron);
            });
        },

        /**
         *
         */
        removeAllParentNeurons: function() {
            var _this = this;
            this.parentNeuronList.forEach(function(neuron) {
                _this.removeParentNeuron(neuron);
            });
        },

        /**
         * @param {INeuron} neuron
         */
        removeChildNeuron: function(neuron) {
            if (this.containsChildNeuron(neuron)) {
                this.doRemoveChildNeuron(neuron);
            }
        },

        /**
         * @param {INeuron} neuron
         */
        removeParentNeuron: function(neuron) {
            if (this.containsParentNeuron(neuron)) {
                this.doRemoveParentNeuron(neuron);
            }
        },

        /**
         *
         */
        tick: function() {
            if (this.isReadyToTick()) {
                this.currentTick++;
                this.doTick();
            }
        },

        /**
         *
         */
        train: function() {
            if (this.isReadyToTrain()) {
                this.currentTrainingTick++;
                this.doTrain();
            }
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} trainingBit
         * @param {Neuron} neuron
         * @param {number} tick
         * @param {function(Throwable, Neuron.TrainingResult=)} callback
         */
        feedTrainingBitFromNeuronForTick: function(trainingBit, neuron, tick, callback) {
            if (this.currentTrainingTick < tick) {
                var trainingContextSet = this.tickToTrainingContextSetMap.get(tick);
                if (!trainingContextSet) {
                    trainingContextSet = Collections.set();
                    this.tickToTrainingContextSetMap.put(tick, trainingContextSet);
                }
                var trainingContext = new TrainingContext(trainingBit, neuron, tick, callback);
                if (trainingContextSet.contains(trainingContext)) {
                    throw Throwables.exception("AlreadyHasTrainingBitFromNeuronForTick", {}, "Neuron already has a training bit from this neuron for tick '" + tick + "'");
                }
                trainingContextSet.add(trainingContext);
                this.checkAndProcessReadyToTrain();
            } else {
                callback(null, Neuron.TrainingResult.ALREADY_TRAINED);
            }
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        checkAndProcessReadyToTick: function() {
            if (this.isReadyToTick()) {
                this.dispatchEvent(new Event(Neuron.EventTypes.READY_TO_TICK, {neuron: this}));
            }
        },

        /**
         * @protected
         */
        checkAndProcessReadyToTrain: function() {
            if (this.isReadyToTrain()) {
                this.dispatchEvent(new Event(Neuron.EventTypes.READY_TO_TRAIN, {neuron: this}));
            }
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doAddChildNeuron: function(neuron) {
            this.childNeuronList.add(neuron);
            if (!neuron.containsParentNeuron(this)) {
                neuron.addParentNeuron(this);
            }
            this.checkAndProcessReadyToTick();
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doAddParentNeuron: function(neuron) {
            this.parentNeuronList.add(neuron);
            if (!neuron.containsChildNeuron(this)) {
                neuron.addChildNeuron(this);
            }
            this.checkAndProcessReadyToTrain();
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doRemoveChildNeuron: function(neuron) {
            this.childNeuronList.remove(neuron);
            if (neuron.containsParentNeuron(this)) {
                neuron.removeParentNeuron(this);
            }
            this.checkAndProcessReadyToTick();
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doRemoveParentNeuron: function(neuron) {
            this.parentNeuronList.remove(neuron);
            if (neuron.containsChildNeuron(this)) {
                neuron.removeChildNeuron(this);
            }
            this.checkAndProcessReadyToTrain();
        },

        /**
         * @protected
         */
        doTick: function() {
            var currentTick     = this.currentTick;
            var bit             = this.doCalculateBitForTick(currentTick);
            if (bit === 0 || bit === 1) {
                this.updateBitAtTick(bit, currentTick);
                this.dispatchEvent(new Event(Neuron.EventTypes.TICK, {
                    neuron: this,
                    tick: currentTick
                }));
            } else {
                throw Throwables.error("BadBit", {}, "Bad bit value received from call to doCalculateBitForTick");
            }
        },

        /**
         * @protected
         */
        doTrain: function() {
            var _this                   = this;
            var currentTrainingTick     = this.currentTrainingTick;
            var trainingContextSet      = this.tickToTrainingContextSetMap.get(currentTrainingTick);
            this.doProcessTrainingContextSetForTick(trainingContextSet, currentTrainingTick, function() {
                _this.tickToTrainingContextSetMap.remove(currentTrainingTick);
                _this.dispatchEvent(new Event(Neuron.EventTypes.TRAIN, {
                    neuron: _this,
                    tick: currentTrainingTick
                }));
            });
        },

        /**
         * @protected
         * @param {number} bit
         * @param {number} tick
         */
        updateBitAtTick: function(bit, tick) {
            if (!this.hasBitForTick(tick)) {
                this.getTickToBitMap().put(tick, bit);
            } else {
                throw Throwables.exception("AlreadyTicked", {}, "Neuron already has a bit for tick '" + tick + "'");
            }
        },


        //-------------------------------------------------------------------------------
        // Abstract Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @abstract
         * @protected
         * @param {number} tick
         */
        doCalculateBitForTick: function(tick) {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement Neuron.doCalculateBitForTick");
        },

        /**
         * @abstract
         * @protected
         * @param {Set.<TrainingContext>} trainingContextSet
         * @param {number} currentTrainingTick
         * @param {function()} callback
         */
        doProcessTrainingContextSetForTick: function(trainingContextSet, currentTrainingTick, callback) {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement Neuron.doProcessTrainingContextSetForTick");
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @return {boolean}
         */
        isReadyToTick: function() {
            var nextTick    = this.currentTick + 1;
            var iterator    = this.childNeuronList.iterator();
            while (iterator.hasNext()) {
                var neuron = iterator.nextValue();
                if (neuron.getCurrentTick() < nextTick) {
                    return false;
                }
            }
            return true;
        },

        /**
         * @private
         * @return {boolean}
         */
        isReadyToTrain: function() {
            var nextTrainingTick    = this.currentTrainingTick + 1;
            var iterator            = this.parentNeuronList.iterator();
            while (iterator.hasNext()) {
                var neuron = iterator.nextValue();
                if (neuron.getCurrentTrainingTick() < nextTrainingTick) {
                    return false;
                }
            }
            return true;
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    Neuron.AttachmentState = {
        ATTACHED: "Neuron:AttachmentState:Attached",
        DETACHED: "Neuron:AttachmentState:Detached"
    };

    /**
     * @static
     * @enum {string}
     */
    Neuron.EventTypes = {
        ATTACHED: "Neuron:EventTypes:Attached",
        DETACHED: "Neuron:EventTypes:Detached",
        READY_TO_TICK: "Neuron:EventTypes:ReadyToTick",
        READY_TO_TRAIN: "Neuron:EventTypes:ReadyToTrain",
        TICK: "Neuron:EventTypes:Tick",
        TRAIN: "Neuron:EventTypes:Train"
    };

    /**
     * @static
     * @enum {string}
     */
    Neuron.LifeState = {
        ALIVE: "Neuron:LifeState:Alive",
        DEAD: "Neuron:LifeState:Dead"
    };

    /**
     * @static
     * @enum {string}
     */
    Neuron.TrainingResult = {
        ALREADY_TRAINED: "Neuron:TrainingResult:AlreadyTrained",
        MATCH: "Neuron:TrainingResult:Match",
        MUTATED: "Neuron:TrainingResult:Mutated",
        REJECTED: "Neuron:TrainingResult:Rejected"
    };


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(Neuron, INeuron);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.Neuron', Neuron);
});

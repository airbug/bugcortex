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
//@Require('Flows')
//@Require('Obj')
//@Require('RandomUtil')
//@Require('Throwables')
//@Require('bugcortex.INeuron')
//@Require('bugcortex.NeuralLayerEvent')
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
    var Flows               = bugpack.require('Flows');
    var Obj                 = bugpack.require('Obj');
    var RandomUtil          = bugpack.require('RandomUtil');
    var Throwables          = bugpack.require('Throwables');
    var INeuron             = bugpack.require('bugcortex.INeuron');
    var NeuralLayerEvent    = bugpack.require('bugcortex.NeuralLayerEvent');
    var TrainingContext     = bugpack.require('bugcortex.TrainingContext');


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
            this.currentTick                        = null;

            /**
             * @private
             * @type {number}
             */
            this.currentTrainingTick                = null;

            /**
             * @private
             * @type {number}
             */
            this.earliestTick                       = null;

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
             * @type {List.<Neuron>}
             */
            this.parentNeuronList                   = Collections.list();

            /**
             * @private
             * @type {Neuron.SeedState}
             */
            this.seedState                          = Neuron.SeedState.NOT_SEEDED;

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
         * @return {Neuron.SeedState}
         */
        getSeedState: function() {
            return this.seedState;
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
         * @return {boolean}
         */
        isSeeded: function() {
            return this.seedState === Neuron.SeedState.SEEDED;
        },

        /**
         * @return {boolean}
         */
        isSeeding: function() {
            return this.seedState === Neuron.SeedState.SEEDING;
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
        seed: function() {
            if (!this.isSeeded() && !this.isSeeding()) {
                this.seedState = Neuron.SeedState.SEEDING;
                this.doSeeding();
            }
        },

        /**
         *
         */
        tick: function() {
            if (this.isReadyToTick()) {
                this.doTick();
            }
        },

        /**
         *
         */
        train: function() {
            if (this.isReadyToTrain()) {
                this.doTrain();
            }
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {number} trainingBit
         * @param {Neuron} fromNeuron
         * @param {number} forTick
         * @param {function(Throwable, Neuron.TrainingResult=)} callback
         */
        feedTrainingBitFromNeuronForTick: function(trainingBit, fromNeuron, forTick, callback) {
            var _this = this;
            this.seedCurrentTrainingTick(forTick - 1);
            $series([
                function(callback) {
                    _this.ensureSeeded(callback);
                },
                function(callback) {
                    _this.scheduleAndWaitForTraining(trainingBit, fromNeuron, forTick, callback);
                }
            ]).callback(callback);
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         */
        addRandomChildNeurons: function() {
            var _this = this;
            var subLayerList = this.getNeuralLayer().retrieveAttachedSubLayersWithNeurons();
            if (subLayerList.getCount() > 0) {
                var maxNumberRandomNeurons = 2;
                subLayerList.forEach(function(subLayer) {
                    _this.addNumberRandomChildNeuronsFromLayer(maxNumberRandomNeurons, subLayer);
                });
            }
        },

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
            neuron.addEventListener(Neuron.EventTypes.TICK, this.hearChildNeuronTick, this);
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
            neuron.removeEventListener(Neuron.EventTypes.TICK, this.hearChildNeuronTick, this);
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
         * @param {number=} tick
         */
        doSeedCurrentTick: function(tick) {
            if (tick) {
                this.currentTick = tick;
            } else {
                var lowestTick = null;
                this.getChildNeuronList().forEach(function (childNeuron) {
                    var childCurrentTick = childNeuron.getCurrentTick();
                    if (childCurrentTick !== null) {
                        if (childCurrentTick < lowestTick) {
                            if (childCurrentTick === -1) {
                                lowestTick = -1;
                            } else {
                                lowestTick = childCurrentTick - 1;
                            }
                        }
                    }
                });
                if (lowestTick !== null) {
                    this.currentTick = lowestTick;
                }
            }
        },

        /**
         * @protected
         * @param {number=} tick
         */
        doSeedCurrentTrainingTick: function(tick) {
            if (tick) {
                this.currentTrainingTick = tick;
            }
        },

        /**
         * @protected
         */
        doSeeding: function() {
            var _this = this;
            this.ensureChildren(function(throwable) {
                if (!throwable) {
                    _this.seedCurrentTick();
                    _this.seedState = Neuron.SeedState.SEEDED;
                    _this.dispatchEvent(new Event(Neuron.EventTypes.SEEDED, {
                        neuron: _this
                    }));
                } else {
                    throw throwable;
                }
            });
        },

        /**
         * @protected
         */
        doTick: function() {
            this.currentTick++;
            var currentTick     = this.currentTick;
            if (this.earliestTick === null) {
                this.updateEarliestTick(currentTick);
            }
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
            this.currentTrainingTick++;
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
         * @param {function()} callback
         */
        ensureSeeded: function(callback) {
            var _this = this;
            if (!this.isSeeded()) {
                var hearSeeded = function(event) {
                    _this.removeEventListener(Neuron.EventTypes.SEEDED, hearSeeded);
                    callback();
                };
                this.addEventListener(Neuron.EventTypes.SEEDED, hearSeeded);
                this.seed();
            } else {
                callback();
            }
        },

        /**
         * @protected
         * @param {number} trainingBit
         * @param {Neuron} fromNeuron
         * @param {number} forTick
         * @param {function(Throwable, Neuron.TrainingResult=)} callback
         */
        scheduleAndWaitForTraining: function(trainingBit, fromNeuron, forTick, callback) {
            if (this.currentTrainingTick < forTick) {
                var trainingContextSet = this.tickToTrainingContextSetMap.get(forTick);
                if (!trainingContextSet) {
                    trainingContextSet = Collections.set();
                    this.tickToTrainingContextSetMap.put(forTick, trainingContextSet);
                }
                var trainingContext = new TrainingContext(trainingBit, fromNeuron, forTick, callback);
                if (trainingContextSet.contains(trainingContext)) {
                    throw Throwables.exception("AlreadyHasTrainingBitFromNeuronForTick", {}, "Neuron already has a training bit from this neuron for tick '" + tick + "'");
                }
                trainingContextSet.add(trainingContext);
                this.checkAndProcessReadyToTrain();
            } else {
                callback(null, Neuron.TrainingResult.ALREADY_TRAINED);
            }
        },

        /**
         * @protected
         * @param {number=} tick
         */
        seedCurrentTick: function(tick) {
            if (this.currentTick === null) {
                this.doSeedCurrentTick(tick);
            }
        },

        /**
         * @protected
         * @param {number=} tick
         */
        seedCurrentTrainingTick: function(tick) {
            if (this.currentTrainingTick === null) {
                this.doSeedCurrentTrainingTick(tick);
            }
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

        /**
         * @protected
         * @param {number} earliestTick
         */
        updateEarliestTick: function(earliestTick) {
            this.earliestTick = earliestTick;
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
            var selectableNeurons = neuralLayer.getAttachedNeuronList().clone();
            selectableNeurons.removeAll(this.getChildNeuronList());
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
                if (!this.neuralLayer.hasUsableSubLayers()) {
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
         * @param {Neuron} neuron
         * @param {number} trainingTick
         * @returns {boolean}
         */
        hasTrainingContextForNeuronAtTrainingTick: function(neuron, trainingTick) {
            var trainingContextSet  = this.tickToTrainingContextSetMap.get(trainingTick);
            if (!trainingContextSet) {
                return false;
            }
            var iterator = trainingContextSet.iterator();
            while (iterator.hasNext()) {
                var trainingContext = iterator.next();
                if (Obj.equals(trainingContext.getNeuron(), neuron)) {
                    return true;
                }
            }
            return false
        },

        /**
         * @private
         * @return {boolean}
         */
        isReadyToTick: function() {
            if (this.currentTick === null) {
                return false;
            }
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
            if (this.currentTrainingTick === null) {
                return false;
            }
            var nextTrainingTick    = this.currentTrainingTick + 1;
            var iterator            = this.parentNeuronList.iterator();
            while (iterator.hasNext()) {
                /** @type {Neuron} */
                var neuron = /** @type {Neuron} */(iterator.nextValue());
                if (neuron.getCurrentTrainingTick() < nextTrainingTick) {
                    return false;
                }
                if (!this.hasTrainingContextForNeuronAtTrainingTick(neuron, nextTrainingTick)) {
                    return false;
                }
            }
            return true;
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
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearChildNeuronTick: function(event) {
            this.seedCurrentTick();
            this.checkAndProcessReadyToTick();
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
        SEEDED: "Neuron:EventTypes:Seeded",
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
    Neuron.SeedState = {
        NOT_SEEDED: "Neuron:SeedState:NotSeeded",
        SEEDING: "Neuron:SeedState:Seeding",
        SEEDED: "Neuron:SeedState:Seeded"
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

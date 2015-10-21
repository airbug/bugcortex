/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.NeuralLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('Throwables')
//@Require('bugcortex.INeuralLayer')
//@Require('bugcortex.INeuron')
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
    var Event               = bugpack.require('Event');
    var EventDispatcher     = bugpack.require('EventDispatcher');
    var Throwables          = bugpack.require('Throwables');
    var INeuralLayer        = bugpack.require('bugcortex.INeuralLayer');
    var INeuron             = bugpack.require('bugcortex.INeuron');
    var NeuralLayerEvent    = bugpack.require('bugcortex.NeuralLayerEvent');
    var Neuron              = bugpack.require('bugcortex.Neuron');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {EventDispatcher}
     * @implements {INeuralLayer}
     */
    var NeuralLayer = Class.extend(EventDispatcher, {

        _name: "bugcortex.NeuralLayer",


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
             * @type {List.<INeuron>}
             */
            this.attachedNeuronList     = Collections.list();

            /**
             * @private
             * @type {NeuralLayer.AttachmentState}
             */
            this.attachmentState        = NeuralLayer.AttachmentState.DETACHED;

            /**
             * @private
             * @type {List.<INeuron>}
             */
            this.neuronList             = Collections.list();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<INeuron>}
         */
        getAttachedNeuronList: function() {
            return this.attachedNeuronList;
        },

        /**
         * @return {NeuralLayer.AttachmentState}
         */
        getAttachmentState: function() {
            return this.attachmentState;
        },

        /**
         * @return {List.<INeuron>}
         */
        getNeuronList: function() {
            return this.neuronList;
        },


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        isAttached: function() {
            return this.attachmentState === NeuralLayer.AttachmentState.ATTACHED;
        },

        /**
         * @return {boolean}
         */
        isDetached: function() {
            return this.attachmentState === NeuralLayer.AttachmentState.DETACHED;
        },


        //-------------------------------------------------------------------------------
        // INeuralLayer Implementation
        //-------------------------------------------------------------------------------

        /**
         *
         */
        attach: function() {
            if (this.isDetached()) {
                this.attachmentState = NeuralLayer.AttachmentState.ATTACHED;
                this.neuronList.forEach(function(neuron) {
                    neuron.attach();
                });
            }
        },

        /**
         *
         */
        detach: function() {
            if (this.isAttached()) {
                this.attachmentState = NeuralLayer.AttachmentState.DETACHED;
                this.neuronList.forEach(function(neuron) {
                    neuron.detach();
                });
            }
        },

        /**
         * @param {function(INeuron, number)} func
         */
        forEachNeuron: function(func) {
            this.neuronList.forEach(func);
        },

        /**
         * @param {number} index
         * @return {INeuron}
         */
        getNeuronAt: function(index) {
            return this.neuronList.getAt(index);
        },

        /**
         * @return {number}
         */
        getNeuronCount: function() {
            return this.neuronList.getCount();
        },

        /**
         * @param {number} size
         */
        growLayerToSize: function(size) {
            var neuronCount = this.getNeuronCount();
            if (neuronCount < size) {
                for (var i = neuronCount; i < size; i++) {
                    var neuron = this.generateNeuron();
                    this.addNeuron(neuron);
                }
                this.dispatchEvent(new NeuralLayerEvent(NeuralLayerEvent.EventTypes.GROW, {
                    neuralLayer: this
                }));
            }
        },

        /**
         * @return {boolean}
         */
        stimulateGrowth: function() {
            return this.doStimulateGrowth();
        },


        //-------------------------------------------------------------------------------
        // Abstract Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @abstract
         * @protected
         * @return {boolean}
         */
        doStimulateGrowth: function() {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement NeuralLayer.doStimulateGrowth");
        },

        /**
         * @abstract
         * @protected
         * @return {Neuron}
         */
        generateNeuron: function() {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement NeuralLayer.generateNeuron");
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {Neuron} neuron
         */
        addNeuron: function(neuron) {
            if (!this.neuronList.contains(neuron)) {
                this.doAddNeuron(neuron);
            }
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doAddNeuron: function(neuron) {
            this.neuronList.add(neuron);
            neuron.addEventListener(Neuron.EventTypes.ATTACHED, this.hearNeuronAttached, this);
            neuron.addEventListener(Neuron.EventTypes.DETACHED, this.hearNeuronDetached, this);
            neuron.addEventListener(Neuron.EventTypes.READY_TO_TICK, this.hearNeuronReadyToTick, this);
            neuron.addEventListener(Neuron.EventTypes.READY_TO_TRAIN, this.hearNeuronReadyToTrain, this);
            if (neuron.isAttached()) {
                neuron.detach();
            }
            if (this.isAttached()) {
                neuron.attach();
            }
        },

        /**
         * @protected
         * @param {INeuron} neuron
         */
        doAttachNeuron: function(neuron) {
            this.attachedNeuronList.add(neuron);
        },

        /**
         * @protected
         * @param {INeuron} neuron
         */
        doDetachNeuron: function(neuron) {
            this.attachedNeuronList.remove(neuron);
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        doRemoveNeuron: function(neuron) {
            this.neuronList.remove(neuron);
            if (neuron.isAttached()) {
                neuron.detach();
            }
            neuron.removeEventListener(Neuron.EventTypes.ATTACHED, this.hearNeuronAttached, this);
            neuron.removeEventListener(Neuron.EventTypes.DETACHED, this.hearNeuronDetached, this);
            neuron.removeEventListener(Neuron.EventTypes.READY_TO_TICK, this.hearNeuronReadyToTick, this);
            neuron.removeEventListener(Neuron.EventTypes.READY_TO_TRAIN, this.hearNeuronReadyToTrain, this);
        },

        /**
         * @protected
         * @param {Neuron} neuron
         */
        removeNeuron: function(neuron) {
            if (this.neuronList.contains(neuron)) {
                this.doRemoveNeuron(neuron);
            }
        },


        //-------------------------------------------------------------------------------
        // Event Listeners
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronAttached: function(event) {
            var neuron = event.getData().neuron;
            this.doAttachNeuron(neuron);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronDetached: function(event) {
            var neuron = event.getData().neuron;
            this.doDetachNeuron(neuron);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronReadyToTick: function(event) {
            var neuron = event.getData().neuron;
            //TODO BRN: Here we can prioritize tick processing. For now just tick each neuron on timeout to simulate async.
            setTimeout(function() {
                neuron.tick();
            }, 0);
        },

        /**
         * @private
         * @param {Event} event
         */
        hearNeuronReadyToTrain: function(event) {
            var neuron = event.getData().neuron;
            //TODO BRN: Here we can prioritize train processing. For now just train each neuron on timeout to simulate async.
            setTimeout(function() {
                neuron.train();
            }, 0);
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    NeuralLayer.AttachmentState = {
        ATTACHED: "NeuralLayer:AttachmentState:Attached",
        DETACHED: "NeuralLayer:AttachmentState:Detached"
    };


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(NeuralLayer, INeuralLayer);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.NeuralLayer', NeuralLayer);
});

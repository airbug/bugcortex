/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.OuterLayer')

//@Require('Class')
//@Require('Collections')
//@Require('Obj')
//@Require('Throwables')
//@Require('bugcortex.INeuron')
//@Require('bugcortex.IOuterLayer')
//@Require('bugcortex.NeuralLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Collections     = bugpack.require('Collections');
    var Obj             = bugpack.require('Obj');
    var Throwables      = bugpack.require('Throwables');
    var INeuralLayer    = bugpack.require('bugcortex.INeuralLayer');
    var INeuron         = bugpack.require('bugcortex.INeuron');
    var IOuterLayer     = bugpack.require('bugcortex.IOuterLayer');
    var NeuralLayer     = bugpack.require('bugcortex.NeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {NeuralLayer}
     * @implements {IOuterLayer}
     */
    var OuterLayer = Class.extend(NeuralLayer, {

        _name: "bugcortex.OuterLayer",


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
             * @type {List.<NeuralLayer>}
             */
            this.neuralSubLayerList     = Collections.list();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<NeuralLayer>}
         */
        getNeuralSubLayerList: function() {
            return this.neuralSubLayerList;
        },


        //-------------------------------------------------------------------------------
        // IOuterLayer Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {INeuralLayer} neuralSubLayer
         */
        addSubLayer: function(neuralSubLayer) {
            if (!this.neuralSubLayerList.contains(neuralSubLayer)) {
                this.doAddSubLayer(neuralSubLayer);
            }
        },

        /**
         *
         */
        removeAllSubLayers: function() {
            var _this = this;
            this.neuralSubLayerList.forEach(function(neuralSubLayer) {
                _this.removeSubLayer(neuralSubLayer);
            });
        },

        /**
         * @param {INeuralLayer} neuralSubLayer
         */
        removeSubLayer: function(neuralSubLayer) {
            this.neuralSubLayerList.remove(neuralSubLayer);
            //TODO BRN: the connections between this layer's neurons and the sublayers neurons needs to be separated, but that does not mean that
            //all neurons on the sublayer need to be detached. (could belong to multiple OuterLayers). Plus we don't want those neurons to separate
            // from their children, just the parents that belong to this layer.

        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        hasUsableSubLayers: function() {
            return this.retrieveAttachedSubLayers().getCount() > 0;
        },

        /**
         * @return {List.<NeuralLayer>}
         */
        retrieveAttachedSubLayers: function() {
            var subLayerList = this.getNeuralSubLayerList().clone();
            subLayerList.forEach(function(subLayer) {
                if (subLayer.isDetached()) {
                    subLayerList.remove(subLayer);
                }
            });
            return subLayerList;
        },

        /**
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


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {INeuralLayer} neuralSubLayer
         */
        doAddSubLayer: function(neuralSubLayer) {
            this.neuralSubLayerList.add(neuralSubLayer);
        }


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

    });


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(OuterLayer, IOuterLayer);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.OuterLayer', OuterLayer);
});

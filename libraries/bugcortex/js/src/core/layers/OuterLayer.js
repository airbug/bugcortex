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
//@Require('bugcortex.IOuterLayer')
//@Require('bugcortex.INeuron')
//@Require('bugcortex.NeuralLayer')


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
    var IOuterLayer         = bugpack.require('bugcortex.IOuterLayer');
    var INeuralLayer        = bugpack.require('bugcortex.INeuralLayer');
    var INeuron             = bugpack.require('bugcortex.INeuron');
    var NeuralLayer         = bugpack.require('bugcortex.NeuralLayer');


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
                this.neuralSubLayerList.add(neuralSubLayer);
                this.doAttachSubLayer(neuralSubLayer);
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
            neuralSubLayer.forEachNeuron(function(neuron) {
                neuron.detach();
            });
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @abstract
         * @protected
         * @param neuralSubLayer
         */
        doAttachSubLayer: function(neuralSubLayer) {
            throw Throwables.bug("AbstractMethodNotImplemented", {}, "Must implement OuterLayer.doAttachSubLayer");
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

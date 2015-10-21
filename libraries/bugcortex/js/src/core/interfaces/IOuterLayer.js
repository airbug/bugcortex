/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.IOuterLayer')

//@Require('Interface')
//@Require('bugcortex.INeuralLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Interface       = bugpack.require('Interface');
    var INeuralLayer    = bugpack.require('bugcortex.INeuralLayer');


    //-------------------------------------------------------------------------------
    // Declare Interface
    //-------------------------------------------------------------------------------

    /**
     * @interface
     * @extends {INeuralLayer}
     */
    var IOuterLayer = Interface.extend(INeuralLayer, {

        _name: "bugcortex.IOuterLayer",


        //-------------------------------------------------------------------------------
        // Interface Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {INeuralLayer} neuralSubLayer
         */
        addSubLayer: function(neuralSubLayer) {},

        /**
         *
         */
        removeAllSubLayers: function() {},

        /**
         * @param {INeuralLayer} neuralSubLayer
         */
        removeSubLayer: function(neuralSubLayer) {}
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.IOuterLayer', IOuterLayer);
});

/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.INeuralLayer')

//@Require('IEventDispatcher')
//@Require('Interface')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var IEventDispatcher    = bugpack.require('IEventDispatcher');
    var Interface           = bugpack.require('Interface');


    //-------------------------------------------------------------------------------
    // Declare Interface
    //-------------------------------------------------------------------------------

    /**
     * @interface
     * @extends {IEventDispatcher}
     */
    var INeuralLayer = Interface.extend(IEventDispatcher, {

        _name: "bugcortex.INeuralLayer",


        //-------------------------------------------------------------------------------
        // Interface Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        attach: function() {},

        /**
         *
         */
        detach: function() {},

        /**
         * @param {function(INeuron, number)} func
         */
        forEachNeuron: function(func) {},

        /**
         * @param {number} index
         * @return {INeuron}
         */
        getNeuronAt: function(index) {},

        /**
         * @return {number}
         */
        getNeuronCount: function() {},

        /**
         * @param {number} size
         */
        growLayerToSize: function(size) {},

        /**
         * @return {boolean}
         */
        stimulateGrowth: function() {}
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.INeuralLayer', INeuralLayer);
});

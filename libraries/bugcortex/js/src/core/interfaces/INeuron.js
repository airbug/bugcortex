/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.INeuron')

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
     */
    var INeuron = Interface.extend(IEventDispatcher, {

        _name: "bugcortex.INeuron",


        //-------------------------------------------------------------------------------
        // Interface Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {INeuron} neuron
         */
        addChildNeuron: function(neuron) {},

        /**
         * @param {INeuron} neuron
         */
        addParentNeuron: function(neuron) {},

        /**
         *
         */
        attach: function() {},

        /**
         * @param {INeuron} neuron
         * @return {boolean}
         */
        containsChildNeuron: function(neuron) {},

        /**
         * @param {INeuron} neuron
         * @return {boolean}
         */
        containsParentNeuron: function(neuron) {},

        /**
         *
         */
        detach: function() {},

        /**
         * @param {number} tick
         * @return {number}
         */
        getBitForTick: function(tick) {},

        /**
         * @param {number} tick
         * @return {boolean}
         */
        hasBitForTick: function(tick) {},

        /**
         * @return {boolean}
         */
        isAlive: function() {},

        /**
         * @return {boolean}
         */
        isAttached: function() {},

        /**
         * @return {boolean}
         */
        isDead: function() {},

        /**
         * @return {boolean}
         */
        isDetached: function() {},

        /**
         * @return {boolean}
         */
        isSeeded: function() {},

        /**
         * @return {boolean}
         */
        isSeeding: function() {},

        /**
         *
         */
        kill: function() {},

        /**
         *
         */
        removeAllChildNeurons: function() {},

        /**
         *
         */
        removeAllParentNeurons: function() {},

        /**
         * @param {INeuron} neuron
         */
        removeChildNeuron: function(neuron) {},

        /**
         * @param {INeuron} neuron
         */
        removeParentNeuron: function(neuron) {},

        /**
         *
         */
        seed: function() {},

        /**
         *
         */
        tick: function() {},

        /**
         * @param {number} bit
         */
        train: function(bit) {}
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.INeuron', INeuron);
});

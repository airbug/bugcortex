/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.ValueStatement')

//@Require('Class')
//@Require('Collections')
//@Require('Obj')
//@Require('Throwables')
//@Require('bugcortex.LogicStatement')


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
    var LogicStatement  = bugpack.require('bugcortex.LogicStatement');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var ValueStatement = Class.extend(LogicStatement, {

        _name: "bugcortex.ValueStatement",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Neuron} neuron
         */
        _constructor: function(neuron) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Neuron}
             */
            this.neuron = neuron;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Neuron}
         */
        getNeuron: function() {
            return this.neuron;
        },


        //-------------------------------------------------------------------------------
        // LogicStatement Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {number} tick
         * @return {boolean}
         */
        doResolveLogicForTick: function(tick) {
            return !!this.neuron.getBitForTick(tick);
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.ValueStatement', ValueStatement);
});

/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.AndStatement')

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
    var AndStatement = Class.extend(LogicStatement, {

        _name: "bugcortex.AndStatement",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {LogicStatement} logicStatementA
         * @param {LogicStatement} logicStatementB
         */
        _constructor: function(logicStatementA, logicStatementB) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {LogicStatement}
             */
            this.logicStatementA = logicStatementA;

            /**
             * @private
             * @type {LogicStatement}
             */
            this.logicStatementB = logicStatementB;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {LogicStatement}
         */
        getLogicStatementA: function() {
            return this.logicStatementA;
        },

        /**
         * @return {LogicStatement}
         */
        getLogicStatementB: function() {
            return this.logicStatementB;
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
            return (this.logicStatementA.resolveLogicForTick(tick) && this.logicStatementB.resolveLogicForTick(tick));
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.AndStatement', AndStatement);
});

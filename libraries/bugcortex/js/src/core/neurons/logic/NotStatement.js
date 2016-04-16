/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.NotStatement')

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
    var NotStatement = Class.extend(LogicStatement, {

        _name: "bugcortex.NotStatement",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {LogicStatement} logicStatement
         */
        _constructor: function(logicStatement) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {LogicStatement}
             */
            this.logicStatement = logicStatement;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {LogicStatement}
         */
        getLogicStatement: function() {
            return this.logicStatement;
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
            return (!this.logicStatement.resolveLogicForTick(tick));
        }
    });



    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.NotStatement', NotStatement);
});

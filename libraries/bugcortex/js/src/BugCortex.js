/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.BugCortex')

//@Require('Class')
//@Require('Obj')
//@Require('bugcortex.HighLowConstantLayer')
//@Require('bugcortex.IntegerInputLayer')
//@Require('bugcortex.IntegerOutputLayer')
//@Require('bugcortex.NeuralNetwork')
//@Require('bugcortex.OutputLayer')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class                   = bugpack.require('Class');
    var Obj                     = bugpack.require('Obj');
    var HighLowConstantLayer    = bugpack.require('bugcortex.HighLowConstantLayer');
    var IntegerInputLayer       = bugpack.require('bugcortex.IntegerInputLayer');
    var IntegerOutputLayer      = bugpack.require('bugcortex.IntegerOutputLayer');
    var NeuralNetwork           = bugpack.require('bugcortex.NeuralNetwork');
    var OutputLayer             = bugpack.require('bugcortex.OutputLayer');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugCortex = Class.extend(Obj, {

        _name: "bugcortex.BugCortex",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Public Properties
            //-------------------------------------------------------------------------------

            /**
             * @type {function(new:HighLowConstantLayer)}
             */
            this.HighLowConstantLayer   = HighLowConstantLayer;

            /**
             * @type {function(new:IntegerInputLayer)}
             */
            this.IntegerInputLayer      = IntegerInputLayer;

            /**
             * @type {function(new:IntegerOutputLayer)}
             */
            this.IntegerOutputLayer     = IntegerOutputLayer;

            /**
             * @type {function(new:NeuralNetwork)}
             */
            this.NeuralNetwork          = NeuralNetwork;

            /**
             * @type {function(new:OutputLayer)}
             */
            this.OutputLayer            = OutputLayer;
        }


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

    });


    //-------------------------------------------------------------------------------
    // Private Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BugCortex}
     */
    BugCortex.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {BugCortex}
     */
    BugCortex.getInstance = function() {
        if (BugCortex.instance === null) {
            BugCortex.instance = new BugCortex();
        }
        return BugCortex.instance;
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.BugCortex', BugCortex);
});

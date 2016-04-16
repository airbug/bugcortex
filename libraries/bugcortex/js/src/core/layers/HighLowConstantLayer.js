/*
 * Copyright (c) 2015 airbug Inc. http://airbug.com
 *
 * bugcortex may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugcortex.HighLowConstantLayer')

//@Require('Class')
//@Require('Throwables')
//@Require('bugcortex.ConstantLayer')
//@Require('bugcortex.ConstantNeuron')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Throwables      = bugpack.require('Throwables');
    var ConstantLayer   = bugpack.require('bugcortex.ConstantLayer');
    var ConstantNeuron  = bugpack.require('bugcortex.ConstantNeuron');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {ConstantLayer}
     */
    var HighLowConstantLayer = Class.extend(ConstantLayer, {

        _name: "bugcortex.HighLowConstantLayer",


        //-------------------------------------------------------------------------------
        // Init Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {HighLowConstantLayer}
         */
        init: function() {
            var _this = this._super();
            if (_this) {
                _this.addNeuron(new ConstantNeuron(_this, 1)); // high bit
                _this.addNeuron(new ConstantNeuron(_this, 0)); // low bit
            }
            return _this;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugcortex.HighLowConstantLayer', HighLowConstantLayer);
});

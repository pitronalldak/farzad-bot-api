'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Service = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var api = (0, _express.Router)();

var Service = exports.Service = function () {
    function Service(handler) {
        _classCallCheck(this, Service);
    }

    // Generic GET handler;


    _createClass(Service, [{
        key: 'GET',
        value: function GET(url, handler) {
            app.get(url, function (req, res) {
                handler(req).then(function (data) {
                    res.json({
                        success: true,
                        data: data
                    });
                }).catch(function (error) {
                    res.json({
                        success: false,
                        error: error.message || error
                    });
                });
            });
        }
    }, {
        key: 'POST',


        // Generic GET handler;
        value: function POST(url, handler) {
            app.post(url, function (req, res) {
                handler(req).then(function (data) {
                    res.json({
                        success: true,
                        data: data
                    });
                }).catch(function (error) {
                    res.json({
                        success: false,
                        error: error.message || error
                    });
                });
            });
        }
    }]);

    return Service;
}();
//# sourceMappingURL=utils.js.map
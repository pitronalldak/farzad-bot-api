'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function () {
    function Model(entity) {
        _classCallCheck(this, Model);

        this.entity = entity;
    }

    /**
     * Select record or records.
     *
     * @param {Object} criteria
     * @param {Object} params
     * @param {Object} selection
     * @returns {Promise}
     */


    _createClass(Model, [{
        key: 'select',
        value: function select(criteria) {
            var _this = this;

            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var selection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return new _bluebird2.default(function (resolve, reject) {

                var query = _this.entity.find(criteria);
                var single = false;

                if (!params.all) {
                    query = query.select(selection);
                }

                if (params.sort) {
                    query = query.sort(_defineProperty({}, params.sortKey || 'id', params.sort));
                }

                if (params.sorts) {
                    query = query.sort(params.sorts);
                }

                if (params.skip) {
                    query = query.skip(params.skip);
                }

                if (params.limit) {
                    single = params.limit === 1;
                    query = query.limit(params.limit);
                }

                query.exec(function (err, data) {
                    if (single) {
                        data = data.length === 1 ? data[0] : null;
                    }
                    return err ? reject(err) : resolve(data);
                });
            });
        }

        /**
         * Create a new record.
         *
         * @param {Object} params
         * @returns {Promise}
         */

    }, {
        key: 'create',
        value: function create() {
            var _this2 = this;

            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return new _bluebird2.default(function (resolve, reject) {
                var entity = new _this2.entity(params);
                return entity.save(function (err, data) {
                    return err ? reject(err) : resolve(data);
                });
            });
        }

        /**
         * Update record.
         *
         * @param {Object} criteria
         * @param {Object} update
         * @param {Object} flags
         * @returns {Promise}
         */

    }, {
        key: 'update',
        value: function update(criteria) {
            var _this3 = this;

            var _update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return new _bluebird2.default(function (resolve, reject) {
                return _this3.entity.update(criteria, _update, flags, function (err, data) {
                    return err ? reject(err) : resolve(data);
                });
            });
        }

        /**
         * Delete existing record.
         *
         * @param {Object} criteria
         * @returns {Promise}
         */

    }, {
        key: 'remove',
        value: function remove(criteria) {
            var _this4 = this;

            return new _bluebird2.default(function (resolve, reject) {
                return _this4.entity.remove(criteria, function (err) {
                    return err ? reject(err) : resolve();
                });
            });
        }
    }]);

    return Model;
}();

exports.default = Model;
//# sourceMappingURL=model.js.map
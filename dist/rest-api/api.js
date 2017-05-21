'use strict';

Object.defineProperty(exports, "__esModule", {
       value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Api = function Api(app, service) {
       _classCallCheck(this, Api);

       this.app = app;
       if (!this.app) throw new Error('Missing app property');

       // could use this place to configure the express app
       this.app.use(require('express-middleware')());

       // actually register the routes to express
       this.registerRoutes();
};

exports.default = Api;
//# sourceMappingURL=api.js.map
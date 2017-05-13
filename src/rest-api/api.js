
export default class Api{
	constructor (app, service) {
        this.app = app;
        if (!this.app) throw new Error('Missing app property');

        // could use this place to configure the express app
        this.app.use(require('express-middleware')());

        // actually register the routes to express
        this.registerRoutes();
	}
}

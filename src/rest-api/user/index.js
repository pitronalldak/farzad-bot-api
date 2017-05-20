/**
 * Rest level class with methods for authorization.
 */
export default class UserApi {
    constructor (app, service) {
        this.app = app;
        this.service = service;
    }

    /**
     * Authorization routes list
     */
    register = () => {
        this.app.get('/users/bo', (req, res) => this.service.getUser(req, res));
        this.app.get('/users/logout', (req, res) => this.service.logout(req, res));
        this.app.post('/users/sign-up', (req, res) => this.service.createUser(req, res));
        this.app.post('/users/login', (req, res) => this.service.login(req, res));
    }
}

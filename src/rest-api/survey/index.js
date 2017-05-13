/**
 * Rest level class with methods for Surveys.
 */
export default class SurveyApi {
    constructor (app, service) {
        this.app = app;
        this.service = service;
    }

    /**
     * Surveys routes list
     */
    register = () => {
        this.app.get('/surveys', (req, res) => this.service.get(req, res));
        this.app.post('/surveys/create', (req, res) => this.service.create(req, res));
        this.app.put('/surveys/update', (req, res) => this.service.update(req, res));
        this.app.post('/surveys/remove', (req, res) => this.service.remove(req, res));
    }
}

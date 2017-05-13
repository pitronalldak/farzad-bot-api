/**
 * Rest level class with methods for Questions.
 */
export default class QuestionApi {
    constructor (app, service) {
        this.app = app;
        this.service = service;
    }
    
    /**
     * Questions routes list
     */
    register = () => {
        this.app.get('/questions', (req, res) => this.service.getAll(req, res));
        this.app.post('/questions/create', (req, res) => this.service.create(req, res));
        this.app.put('/questions/update', (req, res) => this.service.update(req, res));
        this.app.post('/questions/remove', (req, res) => this.service.remove(req, res));
    }
}

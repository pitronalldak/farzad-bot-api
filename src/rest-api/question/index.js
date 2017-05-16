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
        this.app.post('/questions', (req, res) => this.service.getAll(req, res));
        this.app.post('/questions/create', (req, res) => this.service.create(req, res));
        this.app.put('/questions/update', (req, res) => this.service.update(req, res));
        this.app.post('/questions/remove', (req, res) => this.service.remove(req, res));
        this.app.post('/questions/order', (req, res) => this.service.getOrder(req, res));
        this.app.put('/questions/order', (req, res) => this.service.updateOrder(req, res));
    }
}

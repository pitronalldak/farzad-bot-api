import Promise from 'bluebird';

export default class Model {
    
    constructor(entity) {
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
    select(criteria, params = {}, selection = {}) {
        return new Promise((resolve, reject) => {
            console.log(criteria);
            let query = this.entity.find(criteria);
            let single = false;
            
            if (!params.all) {
                query = query.select(selection);
            }
            
            if (params.sort) {
                query = query.sort({[params.sortKey || 'id']: params.sort});
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
            
            query.exec((err, data) => {
                if (single) {
                    data = data.length === 1 ? data[0] : null;
                }
                return (err) ? reject(err) : resolve(data);
            });
        });
    }
    
    /**
     * Create a new record.
     *
     * @param {Object} params
     * @returns {Promise}
     */
    create(params = {}) {
        return new Promise((resolve, reject) => {
            let entity = new this.entity(params);
            return entity.save((err, data) => {
                return (err) ? reject(err) : resolve(data);
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
    update(criteria, update = {}, flags = {}) {
        return new Promise((resolve, reject) => {
            return this.entity.update(criteria, update, flags, (err, data) => {
                return (err) ? reject(err) : resolve(data);
            });
        });
    }
    
    /**
     * Delete existing record.
     *
     * @param {Object} criteria
     * @returns {Promise}
     */
    remove(criteria) {
        return new Promise((resolve, reject) => {
            return this.entity.remove(criteria, (err) => {
                return (err) ? reject(err) : resolve();
            });
        });
    }
}
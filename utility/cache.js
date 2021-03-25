const NodeCache = require("node-cache");

/**
 * This is a wrapper around node-cache
 * 
 */
class Cache {
    /**
     * Initialize the cache based on the provided ttl
     * 
     * @param {Number} ttl Time-to-live for each key in seconds
     * @param {Boolean} throwError If true, functions can throw errors. If false, suppress errors
     */
    constructor(ttl, throwError = false) {
        this.throwError = throwError;
        this.cache = new NodeCache({ stdTTL: ttl });
    }

    getKey(key) {
        try {
            return this.cache.get(key);
        } catch (err) {
            console.error(err);
            if (this.throwError) {
                throw err;
            }
        }
        return null;
    }

    setKey(key, value) {
        try {
            let success = this.cache.set(key, value);
            if (!success) {
                throw Error(`Failed to set key: ${key}`);
            }
        } catch (err) {
            console.error(err);
            if (this.throwError) {
                throw err;
            }
        }
    }

    deleteKey(key) {
        try {
            return this.cache.set(key, value);
        } catch (err) {
            console.error(err);
            if (this.throwError) {
                throw err;
            }
        }
    }
}

module.exports = Cache;
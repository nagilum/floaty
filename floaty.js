(function (window) {
    "use strict";

    /**
     * The framework wrapper.
     */
    window.floaty = function () {};

    /**
     * All registered routes.
     * @returns {Array}
     */
    window.floaty.routes = {};

    /**
     * All registered templates.
     * @returns {Array}
     */
    window.floaty.templates = {};

    /**
     * Initiate the framework and hook up to all <a> clicks.
     * @param {Array} options
     */
    window.floaty.init = function (options) {
    };

    /**
     * Register a callback function which will handle all links not resolved
     * by the routes.
     * 
     * @param {Function} callback
     */
    window.floaty.notFound = function (callback) {
    };

    /**
     * Render a template under the selector.
     * @param {string} name
     * @param {string} selector
     * @param {Array} values
     */
    window.floaty.render = function (name, selector, values) {
    };

    /**
     * Register a route.
     * @param {string} path
     * @param {Function} middleware
     * @param {Function} callback
     */
    window.floaty.route = function (path) {
    };

    /**
     * Register a template for later use.
     * @param {string} name
     * @param {string} value
     */
    window.floaty.template = function (name, value) {
    };
})(window);
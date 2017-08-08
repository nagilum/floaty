(function (window) {
    "use strict";

    /**
     * Analyzes the click event of an element to see if we should interrupt it.
     * @param {event} e 
     */
    var analyzeAnchorClickEvent = function (e) {
        if (e.target.tagName.toLowerCase() !== 'a') {
            return;
        }

        var href = e.target.getAttribute('href');

        if (!href) {
            return;
        }

        var intercept = true;

        if (!href.startsWith('/')) {
            intercept = false;
        }

        if (!intercept) {
            return;
        }

        e.preventDefault();

        var route = getRouteFromURL(href);

        if (route) {
            executeRoute(route);
        }
        else {
            if (window.floaty.notFoundCallback) {
                window.floaty.notFoundCallback();
            }
        }
    };

    /**
     * Execute a given route middleware and callback.
     * @param {route} route
     */
    var executeRoute = function (route) {
        // Set window location and add to history.
        window.history.pushState(null, null, route.url);

        var exceptions = [];

        // Execute middlewares.
        if (route.middlewares) {
            route.middlewares.forEach(function (middleware) {
                if (exceptions.length > 0 && !window.floaty.continueOnExceptions) {
                    return;
                }

                try {
                    middleware(route);
                }
                catch (err) {
                    exceptions.push(err);
                }
            });
        }

        if (exceptions.length > 0 && !window.floaty.continueOnExceptions) {
            return;
        }

        // Execute callback.
        route.callback(route);
    };

    /**
     * Analyze URL, or browser location, to determine a suitable route.
     * @param {string} url
     * @returns {route}
     */
    var getRouteFromURL = function (url) {
        if (!url) {
            url = window.location.pathname;
        }

        var urlSections = url.split('/');

        for (var key in window.floaty.routes) {
            if (window.floaty.routes.hasOwnProperty(key)) {
                var route = window.floaty.routes[key];

                route.url = url;
                route.urlSections = urlSections;

                // Direct route?
                if (key === url) {
                    return route;
                }

                // Parmeter route?
                if (key.indexOf(':') > -1) {
                    if (urlSections.length === route.pathSections.length) {
                        var hits = 0,
                            params = {};

                        for (var i = 0; i < urlSections.length; i++) {
                            if (route.pathSections[i].startsWith(':')) {
                                var id = route.pathSections[i].substr(1);

                                params[id] = urlSections[i];
                                hits++;
                            }
                            else {
                                if (route.pathSections[i] === urlSections[i]) {
                                    hits++;
                                }
                            }
                        }

                        if (hits === urlSections.length) {
                            route.params = params;
                            return route;
                        }
                    }
                }
            }
        }
    };

    /**
     * The framework wrapper.
     */
    window.floaty = function () {};

    /**
     * Whether or not to continue executing a route if a middleware throws an error.
     * @returns {bool}
     */
    window.floaty.continueOnExceptions = false;

    /**
     * The callback function to handle all routes not resolved.
     * @returns {Function}
     */
    window.floaty.notFoundCallback = null;

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
     */
    window.floaty.init = function (options) {
        // Store options
        if (options) {
            window.floaty.continueOnExceptions = options.continueOnExceptions;
        }

        // Listen to all 'click' events for <a> and intercept transfer.
        var element = document.querySelector('html');

        if (element) {
            element.addEventListener('click', analyzeAnchorClickEvent);
        }

        // Setup the popstate listener.
        window.onpopstate = function () {
            var route = getRouteFromURL();

            if (route) {
                executeRoute(route);
            }
        };

        // Determine route to init based on browser's current URL.
        var route = getRouteFromURL();

        if (route) {
            executeRoute(route);
        }
    };

    /**
     * Register a callback function which will handle all links not resolved
     * by the routes.
     * 
     * @param {Function} callback
     */
    window.floaty.notFound = function (callback) {
        if (typeof(callback) !== 'function') {
            throw new Error('callback is not a function.');
        }

        window.floaty.notFoundCallback = callback;
    };

    /**
     * Render a template under the selector.
     * @param {string} name
     * @param {string} selector
     * @param {Array} values
     */
    window.floaty.render = function (name, selector, values) {
        if (!window.floaty.templates[name]) {
            throw new Error('Template not registered.');
        }

        var element = document.querySelector(selector);

        if (!element) {
            throw new Error('Element not found from selector: ' + selector);
        }

        var html = window.floaty.templates[name];

        if (values) {
            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    html = html.replace('{{ ' + key + ' }}', values[key]);
                }
            }
        }

        element.innerHTML = html;
    };

    /**
     * Register, or execute a route.
     * @param {string} path
     * @param {Function} middleware
     * @param {Function} callback
     */
    window.floaty.route = function (path) {
        if (!path) {
            throw new Error('You must specify a path.');
        }

        if (arguments.length === 1) {
            return;
        }

        var route = {
            path: path,
            pathSections: path.split('/'),
            middlewares: [],
            callback: null
        };

        if (arguments.length > 2) {
            for (var i = 1; i < arguments.length - 1; i++) {
                if (typeof(arguments[i]) === 'function') {
                    route.middlewares.push(arguments[i]);
                }
            }
        }

        if (typeof(arguments[arguments.length -1]) === 'function') {
            route.callback = arguments[arguments.length -1];
        }

        if (!route.callback) {
            throw new Error('Could not get route callback function from arguments.');
        }

        window.floaty.routes[path] = route;
    };

    /**
     * Register a template for later use.
     * @param {string} name
     * @param {string} value
     */
    window.floaty.template = function (name, value) {
        if (!value) {
            throw new Error('Second argument must be HTML, and URL, or a valid selector.');
        }

        // From HTML.
        if (value.startsWith('<')) {
            window.floaty.templates[name] = value;
        }

        // From URL.
        if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
            fetch(value, { method: 'GET' })
                .then(function (res) {
                    if (res.status !== 200) {
                        throw new Error(res.statusTest);
                    }

                    return res.text();
                })
                .then(function (html) {
                    window.floaty.templates[name] = html;
                })
                .catch(function (err) {
                    throw err;
                });
        }

        // From selector.
        else {
            var element = document.querySelector(value);

            if (!element) {
                throw new Error('Element not found from selector: ' + value);
            }

            window.floaty.templates[name] = element.innerHTML;
        }
    };
})(window);
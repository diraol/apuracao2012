Router = (function () {
    var api = {
        route: route,
        redirect: redirect
    };
    var routes = [];

    function route(regexp, callback) {
        routes.push([regexp, callback]);
    };

    function redirect() {
        var route = _argumentsToArray(arguments),
            hash = _slug(route.join("/"));

        window.location.hash = hash;
    };

    window.onhashchange = function () {
        var uri = _unslug(window.location.hash).substr(1);

        for (var route in routes) {
            var regexp = routes[route][0],
                callback = routes[route][1];

            if (regexp.test(uri)) {
                var match = regexp.exec(uri);

                match.shift(); // Ignore matched value
                callback.apply(undefined, match);

                return;
            }
        }
    };

    function _unslug(slug) {
        return slug.replace(/-/g, " ");
    };

    function _slug(str) {
        return str.replace(/ /g, "-");
    };

    function _argumentsToArray(args) {
        var result = [];

        for (var i in args) {
            result.push(args[i]);
        }

        return result;
    };

    return api;
})();


Map = (function ($) {
    var container = undefined,
        eventListeners = [];

    function initialize(containerId, svgPath) {
        container = document.getElementById(containerId);

        _loadSvgInto(container, svgPath);
    };

    function on(type, listener, capture) {
        eventListeners.push(arguments);
        _setupEventListeners();

        return this;
    };

    function _loadSvgInto(container, svgPath) {
        d3.xml(svgPath, 'image/svg+xml', function (xml) {
            $(container).html(xml.documentElement);
        });
    };

    function _setupEventListeners() {
        for (var i in eventListeners) {
            var type = eventListeners[i][0],
                listener = eventListeners[i][1],
                capture = eventListeners[i][2];

            _regions().on(type, listener, capture);
        }

        return _regions();
    }

    function _regions() {
        return d3.select(container).selectAll("path");
    }

    return {
        initialize: initialize,
        on: on
    };
})(jQuery);

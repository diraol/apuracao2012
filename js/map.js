Map = (function ($) {
    var container = undefined;

    function initialize(containerId, svgPath) {
        container = $('#'+containerId);

        _loadSvgInto(container, svgPath);
    };

    function on(type, listener, capture) {
        eventListeners.push(arguments);

        return this;
    }

    function _loadSvgInto(container, svgPath) {
        d3.xml(svgPath, 'image/svg+xml', function (xml) {
            container.html(xml.documentElement);
        });
    };

    return {
        initialize: initialize
    };
})(jQuery);

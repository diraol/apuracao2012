Map = (function ($) {
    var container = undefined;

    function initialize(containerId, svgPath) {
        container = document.getElementById(containerId);

        _loadSvgInto(container, svgPath);
    };

    function choropleth(values, maxValue) {
        var scale = d3.scale.linear()
                            .clamp(true)
                            .domain([0, maxValue]);

        _regions().transition()
          .style('fill-opacity', function () {
              var value = 0;

              if (values[this.id] !== undefined) {
                value = scale(values[this.id][1]);
              }

              return value;
          });
    };

    function _loadSvgInto(container, svgPath) {
        d3.xml(svgPath, 'image/svg+xml', function (xml) {
            $(container).html(xml.documentElement);
        });
    };

    function _regions() {
        return d3.select(container).selectAll("path");
    };

    return {
        initialize: initialize,
        choropleth: choropleth
    };
})(jQuery);

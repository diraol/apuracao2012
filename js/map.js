Map = (function ($) {
    var container = undefined;

    function initialize(containerId, svgPath) {
        container = document.getElementById(containerId);

        _loadSvgInto(container, svgPath);
    };

    function choropleth(values, maxValue, range) {
        var scale = d3.scale.quantize()
                            .domain([0, maxValue])
                            .range(range);
            maxValueRange = range[range.length - 1];

        _regions().transition()
          .style('fill-opacity', function () {
              var value = values[this.id],
                  result = 0;

              if (value && value[1] !== 0) {
                  result = scale(value[1]) / maxValueRange;
              }

              return result;
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

Map = (function ($) {
    var container = undefined;

    function initialize(containerId, svgPath, callback) {
        container = document.getElementById(containerId);

        _loadSvgInto(container, svgPath, callback);
    };

    function choropleth(values, maxValue, range, format) {
        var scale = d3.scale.quantize()
                            .domain([0, maxValue])
                            .range(range);
        var maxValueRange = range[range.length - 1];

        _regions().transition()
          .style('fill-opacity', function () {
              var value = values[this.id],
                  result = 0;

              if (value && value[1] !== 0) {
                  result = scale(value[1]) / maxValueRange;
              }

              return result;
          }).each(function () {
              var value = format(values[this.id]),
                  linha = d3.select(container).select("#linha-"+this.id);

              if (value === "") {
                  linha.style("display", "none");
              } else {
                  linha.style("display", "");
              }

              d3.select(container).select("#legenda-"+this.id).text(value);
          });
    };

    function _loadSvgInto(container, svgPath, callback) {
        d3.xml(svgPath, 'image/svg+xml', function (xml) {
            $(container).html(xml.documentElement);

            if (typeof callback === "function") {
                callback();
            }
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

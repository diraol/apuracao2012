Apuracao = (function ($) {
    var container,
        width,
        barWidth,
        barHeight = 21,
        barMargin = {top: 2, right: 14, bottom: 5, left: 50};

    function initialize(containerId, data) {
        container = document.getElementById(containerId);
        width = container.offsetWidth;
        barWidth = width - barMargin.left - barMargin.right;

        draw(data);
    }

    function on(type, listener, capture) {
        $("svg.bullet").live(type, listener, capture);

        return this;
    }

    function draw(data, forceX){
        var chart = BulletChart.initialize()
            .height(barHeight)
            .width(barWidth)
            .duration(500)
            .forceX(forceX)

        _update(chart, data);
    }

    function _update(chart, data) {
        var vis = _bars().data(data, function (d) { return d.title; })
            .enter().append("svg")
            .attr("id", function (d) { return d.title.replace(/ /g, "-"); })
            .attr("class", "bullet")
            .attr("width", width)
            .attr("height", barHeight)
            .append("g")
            .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
            .call(chart);

        _bars().data(data, function (d) { return d.title; }).sort(function(a,b) {  return b.ranges[0] - a.ranges[0]; }).call(chart);

        var title = vis.append("g")
            .attr("text-anchor", "end")
            .attr("transform", "translate(-6," + (barHeight - barMargin.top - barMargin.bottom) + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) { return d.title; });
    }

    function _bars() {
        return d3.select(container).selectAll("svg.bullet");
    }

    return {
      initialize: initialize,
      draw: draw,
      on: on
    }
})(jQuery);

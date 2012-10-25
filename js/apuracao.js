Apuracao = (function ($) {
    var container,
        barWidth,
        barHeight = 43,
        barMargin = {top: 2, right: 14, bottom: 20, left: 60};

    var eventListeners = [];

    function initialize(containerId) {
        container = document.getElementById(containerId);
        barWidth = container.offsetWidth - barMargin.left - barMargin.right;
    }

    function on(type, listener, capture) {
        eventListeners.push(arguments);
        _setupEventListeners();

        return this;
    }

    //Função que faz transição entre dois gráficos
    function draw(data){
        var chart = BulletChart.initialize()
            .height(barHeight)
            .width(barWidth)
            .duration(1000)
            .forceX(1250)

        _update(chart, data);
    }

    function _update(chart, data) {
        var vis = _bars().data(data, function (d) { return d.title; })
            .enter().append("svg")
            .attr("class", "bullet")
            .attr("width", barWidth)
            .attr("height", barHeight)
            .append("g")
            .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
            .call(chart);

        _bars().data(data, function (d) { return d.title; }).call(chart);

        var title = vis.append("g")
            .attr("text-anchor", "end")
            .attr("transform", "translate(-6," + (barHeight - barMargin.top - barMargin.bottom) + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) { return d.title; });

        _setupEventListeners();
    }

    function _bars() {
        return d3.select(container).selectAll("svg.bullet");
    }

    function _setupEventListeners() {
        for (var i in eventListeners) {
            var type = eventListeners[i][0],
                listener = eventListeners[i][1],
                capture = eventListeners[i][2];

            _bars().on(type, listener, capture);
        }

        return _bars();
    }

    return {
      initialize: initialize,
      draw: draw,
      on: on
    }
})(jQuery);

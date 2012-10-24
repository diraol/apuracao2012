Apuracao = (function ($) {
    var container = undefined,
        barWidth = undefined,
        barHeight = 43,
        barMargin = {top: 2, right: 14, bottom: 20, left: 55};

    var eventListeners = []

    function initialize(containerId) {
        container = document.getElementById(containerId);
        barWidth = container.offsetWidth - barMargin.left - barMargin.right;

        $('#legendaDeCores').zoom();
    }

    function on(type, listener, capture) {
        eventListeners.push(arguments);
        _setupEventListeners();

        return this;
    }

    //Função que faz transição entre dois gráficos
    function draw(projecao){
        var novoJson = projecao+"_partidos";

        if (projecao=="votos") {
            if (novoJson.indexOf("partidos") != -1) {
                $("#origemDados").text("Veja quantos votos cada partido recebeu em 2012 e compare com 2008")
            } else {
                $("#origemDados").text('Veja quantos votos o ' + novoJson.split("_")[1].toUpperCase() + ' recebeu em 2012 e compare com 2008')
            }
        } else if (projecao=="eleitorado") {
           if (novoJson.indexOf("partidos") != -1) {
                $("#origemDados").text("Veja quantos eleitores cada partido vai governar pós-2012 e compare a 2008")
            } else {
                $("#origemDados").text('Veja quantos eleitores o ' + novoJson.split("_")[1].toUpperCase() + ' vai governar pós-2012 e compare a 2008')
            }
        } else if (projecao=="segturno") {
           if (novoJson.indexOf("partidos") != -1) {
                $("#origemDados").text("Veja quantos prefeitos cada partido elegeu no segundo turno em 2012")
            } else {
                $("#origemDados").text('Veja quantos prefeitos o ' + novoJson.split("_")[1].toUpperCase() + ' elegeu em 2012')
            }
        } else {
            if (novoJson.indexOf("partidos") != -1) {
                $("#origemDados").text("Veja quantos prefeitos cada partido elegeu em 2012 e compare com 2008")
            } else {
                $("#origemDados").text('Veja quantos prefeitos o ' + novoJson.split("_")[1].toUpperCase() + ' elegeu em 2012 e compare com 2008')
            }
        }

        _geraGrafico(novoJson)
    }

    function _geraGrafico(nomeJson) {
        var arquivo = "dados/"+nomeJson+".json"
        d3.json(arquivo, function(data) {
            if (data) {
                var chart = BulletChart.initialize()
                                       .height(barHeight)
                                       .width(barWidth)

                var vis = _bars().data(data)
                  .enter().append("svg")
                    .attr("class", "bullet")
                    .attr("width", barWidth)
                    .attr("height", barHeight)
                  .append("g")
                    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
                    .call(chart);

                var title = vis.append("g")
                    .attr("text-anchor", "end")
                    .attr("transform", "translate(-6," + (barHeight - barMargin.top - barMargin.bottom) + ")");

                title.append("text")
                    .attr("class", "title")
                    .text(function(d) { return d.title; });

                _setupEventListeners();
            } else {
                alertar("Dados não disponíveis no momento")
            }
        })
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

Apuracao = (function ($) {
    var container = undefined;

    var width = undefined,
        maxSvgHeight = 434, //retirados 40px das abas e 18px do titulo e 17 linha fina
        margin = {top: 5, right: 30, bottom: 20, left: 1}

    var barWidth = 930,
        barHeight = 43,
        barMargin = {top: 2, right: 14, bottom: 20, left: 25};

    var grafico = '',
        baseEscala = 0

    function initialize(containerId) {
        container = document.getElementById(containerId);
        width = container.offsetWidth;

        $('#legendaDeCores').zoom();
    }

    //Função que gera um gráfico
    function geraGrafico(nomeJson) {
        var arquivo = "dados/"+nomeJson+".json"
        d3.json("dados/"+nomeJson+".json", function(data) {
            if (data) {
                nv.addGraph(function() {
                    var chart = nv.models.bulletChart()
                        chart.height(barHeight)
                        chart.width(barWidth)
                        chart.margin(barMargin)

                    function calculaAlturaSVG(barras){
                        var altura_inicial = 43 //Tamanhho da última barra com o exio X
                        return altura_inicial + (barras * 24);
                    }

                    var svg = d3.select(container).append("svg")
                              .attr("height", 0)
                              .attr("width", width)

                    svg.transition()
                            .attr("height",function() { return calculaAlturaSVG(data.length)+'px';})

                    base = svg.append("g")
                            .attr("height", function() { return calculaAlturaSVG(data.length)+'px';})
                            .attr("width", width)
                            .attr("id", nomeJson)

                    base.selectAll("svg")
                            .data(data)
                        .enter()
                            .append("g")
                            .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
                            .transition()
                            .call(chart);
                    return chart;
                })
            } else {
                alertar("Dados não disponíveis no momento")
            }
        })
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
        //Efeito de redução do gráfico atual
        d3.selectAll(".nv-measure")
            .transition()
                .attr("width",0)
        d3.selectAll(".nv-range")
            .transition()
                .attr("width",0)
        d3.selectAll(".nv-markerTriangle")
            .transition()
                .style("opacity",0)
        d3.select(container)
            .transition()
                .attr("height",0)
        //Reduzindo e removendo o gráfico atual e adicionando novo gráfico ao final da transição
        d3.select(container).select("svg")
            .transition()
                .style("opacity",0)
                .remove()

        d3.select(container)
            .transition()
                .each("end",function(){
                    nv.log("got here")
                    geraGrafico(novoJson)
                })
    }

    return {
      initialize: initialize,
      draw: draw
    }
})(jQuery);

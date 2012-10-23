Apuracao = (function ($) {
    var width = 956,
        height = 510,
        maxHeight = 510,
        maxSvgHeight = 434, //retirados 40px das abas e 18px do titulo e 17 linha fina
        margin = {top: 5, right: 30, bottom: 20, left: 1}

    var barWidth = 930,
        barHeight = 43,
        barMargin = {top: 2, right: 14, bottom: 20, left: 25};

    var duracao = 1250,
        grafico = '',
        erroEncontrado = false,
        mensagemErro = "",
        baseEscala = 0


    function initialize() {
        geraGrafico("segturno_partidos")
        $('#legendaDeCores').zoom();
        //Funçào que identifica clique nas abas
        $("#estadaoDadosAbas li").click( function() {
            esconderAlerta()
            projecao = this.firstChild.id
            $("#estadaoDadosAbas a.selected").removeClass("selected")
            $(this.firstChild).addClass("selected")
            pilhaJson.length = 0
            $("#estadaoDadosAbas  #origemDados").text("Brasil")
            novoGrafico(projecao+"_partidos")
        })
    }

    //Função que gera um gráfico
    function geraGrafico(nomeJson) {

        jsonAtual = nomeJson
        var arquivo = "dados/"+nomeJson+".json"
        d3.json("dados/"+nomeJson+".json", function(data) {
            if (data) {
                nv.addGraph(function() {
                    var chart = nv.models.bulletChart()
                        chart.height(barHeight)
                        chart.width(barWidth)
                        chart.margin(barMargin)

                    function calculaAlturaSVG(barras){
                        var altura = 43 //Tamanhho da última barra com o exio X
                        for (var i=0; i<barras ; i++)
                            altura += 24;

                        if (altura > maxSvgHeight)
                            return maxSvgHeight
                        else
                            return altura
                    }

                    var svg = d3.select('#svgEstadaoDados')
                              .attr("height", 0)
                              .attr("width", width)

                    svg.transition()
                            .duration(duracao)
                            .attr("height",function() { return calculaAlturaSVG(data.length)+'px';})
                    //*
                    if (!d3.select("#retornaBackground")[0][0]) {
                        svg.append("rect")
                            .attr("id", "retornaBackground")
                            .attr("alt", "Clique na barra para ver um gráfico mais detalhado, em 'outros' para ver mais dados ou no fundo do gráfico para voltar à visualização anterior.")
                            .attr("title", "Clique na barra para ver um gráfico mais detalhado, em 'outros' para ver mais dados ou no fundo do gráfico para voltar à visualização anterior.")
                            .attr("class", "retornaBackground")
                            .attr("width", width)//width - margin.left - margin.right)
                            .attr("height", height)//height - margin.top - margin.bottom)
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                            .on("click",voltaGrafico)
                    }
                    //*/

                    base = svg.append("g")
                            .attr("height", function() { return calculaAlturaSVG(data.length)+'px';})
                            .attr("width", width)
                            .attr("id", nomeJson)

                    base.selectAll("svg")
                            .data(data)
                        .enter()
                            .append("g")
                            .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
                            .on("click",avancaGrafico)
                            .transition().duration(duracao)
                            .call(chart);
                    return chart;
                })
            } else {
                erroEncontrado = true
                voltaGrafico()
                mensagemErro = "Dados não disponíveis no momento"
                alertar()
            }
        })
    }

    //Função que faz transição entre dois gráficos
    function novoGrafico(novoJson){
        nv.log("novoGrafico: ")
        nv.log("      " + novoJson)
        if (!erroEncontrado){

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
                    .duration(duracao)
                    .attr("width",0)
            d3.selectAll(".nv-range")
                .transition()
                    .duration(duracao)
                    .attr("width",0)
            d3.selectAll(".nv-markerTriangle")
                .transition()
                    .duration(duracao)
                    .style("opacity",0)
            d3.select("#svgEstadaoDados")
                .transition()
                    .duration(duracao)
                    .attr("height",0)
            nv.log(jsonAtual)
            nv.log("#"+jsonAtual)
            //Reduzindo e removendo o gráfico atual e adicionando novo gráfico ao final da transição
            d3.select("#"+jsonAtual)
                .transition()
                    .duration(duracao)
                    .style("opacity",0)
                    .remove()
                    .each("end",function(){
                        nv.log("got here")
                        geraGrafico(novoJson)
                    })
        } else {
            erroEncontrado = false;
            geraGrafico(novoJson)
        }
    }

    function verificaEstaNaPilha(valor) {
        return (pilhaJson.indexOf(valor) != -1);
    }

    function avancaGrafico(d){
        if (pilhaJson.length) {
            if (verificaEstaNaPilha(d.nextlevel)) {
                voltaGrafico()
            } else {
                pilhaJson.push(jsonAtual)
                novoGrafico(d.nextlevel)
            }
        } else {
            pilhaJson.push(jsonAtual)
            novoGrafico(d.nextlevel)
        }
    }

    function voltaGrafico(){
        if (pilhaJson.length) {
            var novoJson = pilhaJson.pop()
            novoGrafico(novoJson)
        }
    }

    function alertar() {
        var div = document.getElementById("alertar")
        div.style.display = 'block'
        div.style.top = height/2+'px'
        div.innerHTML = mensagemErro + "<br/><span id='fechar'>fechar</span>"
    }

    function esconderAlerta() {
        document.getElementById("alertar").style.display = 'none'
    }


    return {
      initialize: initialize
    }
})(jQuery);

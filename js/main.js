Main = (function () {
    var mapChoroplethRanges = [5, 10, 15, 20];

    function initialize(dataPath) {
        _load(dataPath);
    }

    function _load(path) {
        $.getJSON(path, function (data) {
            Apuracao.initialize('apuracao', data);

            _setupCallbacks(data);
            _setupRoutes(data);

            Map.initialize('map', 'imgs/brasil.svg', function () {
                $("#graficoAbas section:first").click();
                window.onhashchange();
            });
        });
    }

    function _setupCallbacks(data) {
        Apuracao.on('click', function () {
            var d = d3.select(this).datum(),
                aba = $("#graficoAbas .selected")[0].id;

            if ($(this).attr("class") === "bullet selected") {
                $("svg.bullet.selected").attr("class", "bullet");
            } else {
                $("svg.bullet.selected").attr("class", "bullet");
                $(this).attr("class", "bullet selected");
            }

            _updateUrl();
        });

       $("#graficoAbas section").click(function() {
           esconderAlerta();
           $("#graficoAbas .selected").removeClass("selected");
           $(this).addClass("selected");

           _updateUrl();
       });
    }

    function _setupRoutes(data) {
        Router.route(/!(.+)/, function (uri) {
            Router.redirect(uri);
        });
        Router.route(/(.+)\/(.+)/, function (partido, aba) {
            _update(data, partido, aba);
        });
        Router.route(/(.+)/, function (partido) {
            var aba = $("#graficoAbas .selected")[0].id;
            _update(data, partido, aba);
        });
    }

    function _updateUrl() {
        var partido = d3.select("svg.bullet.selected"),
            aba = d3.select("#graficoAbas .selected").attr("id");

        if (partido.empty()) {
            partido = "Brasil";
        } else {
            partido = partido.datum().title;
        }

        Router.redirect(partido, aba);
    }

    function _update(data, partido, aba) {
        var scale = _scale(aba);

        if (data[aba][partido] !== undefined) {
            _updateGraphs(data, aba, partido);
        }
        Apuracao.draw(_formatDataForBulletGraph(data, aba), scale);
        _updateMap(data);
    }

    function _scale(type) {
        var scale;

        // TODO: Tire esses magic numbers. Calcule a partir dos dados.
        switch (type) {
            case "prefeitos":
                scale = 1200;
                break;
            case "eleitorado":
                scale = 30000000;
                break;
            case "rendamedia":
                scale = 1600;
                break;
            case "bolsafamilia":
                scale = 50;
                break;
            case "populacaomedia":
                scale = 57000;
                break;
        }

        return scale;
    }

    function _updateGraphs(data, selected, partido) {
        var dataPartido = data[selected][partido];

        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackPageview', window.location.pathname + window.location.hash]);
            _gaq.push(['estadaoDados._trackPageview', window.location.pathname + window.location.hash]);
        }

        Map.choropleth(dataPartido, _maxValue(dataPartido, 1), mapChoroplethRanges,
                function (values) {
                    return _formatForMap(selected, values);
                });
        $('#nome-partido').text(partido);
        _updateDashboard(data, partido)
    }

    function _formatForMap(type, values) {
        if (values === undefined || values[1] === 0) {
            return "";
        }

        var result = values[1];

        switch (type) {
            case "prefeitos":
            case "eleitorado":
                result = formatNumber(result);
                break;
            case "rendamedia":
                result = "R$ "+formatNumber(result.toFixed(0));
                break;
            case "bolsafamilia":
                result = result.toFixed(1)+"%";
                break;
            case "populacaomedia":
                result = formatNumber(result.toFixed(0));
                break;
        }

        return result;
    }

    function _maxValue(data, index) {
        var values = [];

        for (var i in data) {
            values = values.concat([data[i][index]]);
        }

        return d3.max(values);
    }

    function _formatDataForBulletGraph(data, type) {
        var barsData = []

        for (var i in data[type]) {
            var sumValues,
                ranges,
                measures;

            switch (type) {
                case "prefeitos":
                case "eleitorado":
                    sumValues = _sumArrays(d3.values(data[type][i]));
                    ranges = [sumValues[1]];
                    measures = [sumValues[0]];
                    break;
                case "rendamedia":
                case "bolsafamilia":
                case "populacaomedia":
                    ranges = [_medianFormatFor(type, data, i, 1)];
                    measures = [0];
                    break
            }

            var row = {
                "title": i,
                "ranges": [ranges],
                "measures": [measures],
                "markers": [0]
            }

            barsData = barsData.concat(row);
        }

        return barsData;
    }

    function _updateDashboard(data, partido) {
        for (var i in data) {
            var value2008,
                value2012;
            switch (i) {
                case "rendamedia":
                case "bolsafamilia":
                case "populacaomedia":
                    value2012 = _formatFor(i, data, partido, 1);
                    break;
                default:
                    value2008 = _formatFor(i, _sumValues(data[i][partido], 0));
                    value2012 = _formatFor(i, _sumValues(data[i][partido], 1));
                    break;
            }

            $('#dashboard-bar #'+i+' .valor-2008').text(value2008);
            $('#dashboard-bar #'+i+' .valor-2012').text(value2012);
        }
    }

    function _updateMap(data) {
       if ($("svg.bullet.selected").length === 0) {
            $('#nome-partido').text(data["total"].title);
            $('#dashboard-bar #prefeitos .valor-2008').text(_formatFor("prefeitos", data["total"].prefeitos[0]));
            $('#dashboard-bar #prefeitos .valor-2012').text(_formatFor("prefeitos", data["total"].prefeitos[1]));
            $('#dashboard-bar #eleitorado .valor-2008').text(_formatFor("eleitorado", data["total"].eleitorado[0]));
            $('#dashboard-bar #eleitorado .valor-2012').text(_formatFor("eleitorado", data["total"].eleitorado[1]));
            $('#dashboard-bar #rendamedia .valor-2012').text(_formatFor("rendamedia", data["total"].rendamedia[1]));
            $('#dashboard-bar #bolsafamilia .valor-2012').text(_formatFor("bolsafamilia", data["total"].bolsafamilia[1]));
            $('#dashboard-bar #populacaomedia .valor-2012').text(_formatFor("populacaomedia", data["total"].populacaomedia[1]));
       }
    }

    function _formatFor(type, data, partido, index) {
        var result;

        switch (type) {
            case "prefeitos":
                result = formatNumber(data);
                break;
            case "eleitorado":
                result = formatNumber((data / 1000000).toFixed(1));
                break;
            case "rendamedia":
                result = "R$ "+formatNumber(_medianFormatFor(type, data, partido, index).toFixed(0));
                break;
            case "bolsafamilia":
                result = _medianFormatFor(type, data, partido, index).toFixed(1)+"%";
                break;
            case "populacaomedia":
                result = formatNumber(_medianFormatFor(type, data, partido, index).toFixed(0));
                break;
        }

        return result;
    }

    function _medianFormatFor(type, data, partido, index) {
        if (!data["prefeitos"]) { return data; }

        var values = data[type][partido],
            prefeitos = data["prefeitos"][partido],
            result = 0;

        for (var uf in values) {
            result += values[uf][index] * prefeitos[uf][index];
        }

        result = result / _sumValues(prefeitos, index);

        return result;
    }

    function _clickOn(bullet) {
        var evt = document.createEvent("SVGEvents");

        if (bullet) {
            evt.initEvent("click",true,true);
            bullet.dispatchEvent(evt);
        }
    }

    function _sumValues(data, index) {
        var sumValues = [];

        for (var i in data) {
            sumValues = sumValues.concat([data[i][index]])
        }

        return d3.sum(sumValues);
    }

    function _sumArrays(values) {
        var result = Array(values[0].length);
        for (var i in values[0]) {
            result[i] = 0;
        }

        for (var i in values) {
            for (var j in values[i]) {
                result[j] += values[i][j];
            }
        }

        return result;
    }

    return {
        initialize: initialize
    };
})();

$(document).ready(function () {
    if (Browser.Version() <= 8) {
        document.getElementById("noIeError").style.display = "none";
        document.getElementById("erroIE").style.display = "block";
        return;
    }

    Main.initialize("dados/prefeitos_e_eleitorado.json");
});


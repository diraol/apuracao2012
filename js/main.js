Main = (function () {
    var mapChoroplethRanges = [5, 10, 15, 20];

    function initialize(dataPath) {
        Map.initialize('map', 'imgs/brasil.svg');
        Apuracao.initialize('apuracao');

        _load(dataPath);
    }

    function _load(path) {
        $.getJSON(path, function (data) {
            _setupTabs(data);
            $("#graficoAbas section:first").click();
        });
    }

    function _setupTabs(data) {
       $("#graficoAbas section").click(function() {
           esconderAlerta();
           $("#graficoAbas .selected").removeClass("selected");
           $(this).addClass("selected");
           _update(data, this.id);
       });
    }

    function _update(data, selected) {
        var maxValue = _maxValue(data[selected]),
            scale;

        // TODO: Tire esses magic numbers. Calcule a partir dos dados.
        switch (selected) {
            case "prefeitos":
                scale = 1200;
                break;
            case "eleitorado":
                scale = 30000000;
                break;
        }

        Apuracao.draw(_formatDataForBulletGraph(data[selected]), scale);
        Apuracao.on('click', function (d) {
            var partido = d.title,
                dataPartido = data[selected][partido];

            $("svg.bullet.selected").attr("class", "bullet");
            $(this).attr("class", "bullet selected");

            Map.choropleth(dataPartido, _maxValue(dataPartido, 1), mapChoroplethRanges);
            $('#nome-partido').text(partido);
            _updateDashboard(data, partido)
        });

        _updateMap(data);
    }

    function _maxValue(data, index) {
        var values = [];

        for (var i in data) {
            values = values.concat([data[i][index]]);
        }

        return d3.max(values);
    }

    function _updateDashboard(data, partido) {
        for (var i in data) {
            $('#dashboard-bar #'+i+' em').text(_sumValues(data[i][partido]));
        }
    }

    function _formatDataForBulletGraph(data) {
        var barsData = []

        for (var i in data) {
            var sumValues = _sumArrays(d3.values(data[i]));

            var row = {
                "title": i,
                "ranges": [sumValues[1]],
                "measures": [sumValues[0]],
                "markers": [0]
            }

            barsData = barsData.concat(row);
        }

        return barsData;
    }

    function _updateMap(data) {
       if ($("svg.bullet.selected").length === 0) {
            $('#nome-partido').text(data["total"].title);
            $('#dashboard-bar #prefeitos em').text(data["total"].prefeitos);
            $('#dashboard-bar #eleitorado em').text(data["total"].eleitorado);
       } else {
           _clickOnSelectedBullet();
       }
    }

    function _clickOnSelectedBullet() {
        var evt = document.createEvent("SVGEvents"),
            bullet = document.getElementsByClassName("bullet selected")[0];

        if (bullet) {
            evt.initEvent("click",true,true);
            bullet.dispatchEvent(evt);
        }
    }

    function _sumValues(data) {
        var sumValues = [];

        for (var i in data) {
            sumValues = sumValues.concat([data[i][1]])
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


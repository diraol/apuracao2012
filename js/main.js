Main = (function () {
    function initialize() {
        Map.initialize('map', 'imgs/brasil.svg');
        Apuracao.initialize('apuracao');

        _setupTabs();
        $("#graficoAbas li:first").click();
    }

    function _setupTabs() {
        $("#graficoAbas li").click(function() {
            esconderAlerta();
            _loadJson(this.firstChild.id);
            $("#origemDados").text(_tabMessage(this.firstChild.id));
            $("#graficoAbas a.selected").removeClass("selected");
            $(this.firstChild).addClass("selected");
        });
    }

    function _loadJson(jsonId) {
        var jsonPath = "dados/"+jsonId+".json";

        $.getJSON(jsonPath, function (data) {
            var maxValue = _maxValue(data);

            Apuracao.on('click', function (d) {
                var partido = d.title;
                Map.choropleth(data[partido], maxValue);
            });

            Apuracao.draw(_formatDataForBulletGraph(data));
        });
    }

    function _tabMessage(projecao) {
        var message;

        switch (projecao) {
            case "votos":
                message = "Veja quantos votos cada partido recebeu em 2012 e compare com 2008";
                break;
            case "eleitorado":
                message = "Veja quantos eleitores cada partido vai governar pós-2012 e compare a 2008";
                break;
            case "segturno":
                message = "Veja quantos prefeitos cada partido elegeu no segundo turno em 2012";
                break;
            default:
                message = "Veja quantos prefeitos cada partido elegeu em 2012 e compare com 2008";
        }

        return message;
    };

    function _maxValue(data) {
        var values = [];

        for (var i in data) {
            var partyValues = [];
            for (var j in data[i]) {
                partyValues = partyValues.concat([data[i][j][1]])
            }
            values = values.concat(partyValues);
        }

        return d3.max(values);
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

    Main.initialize();
});


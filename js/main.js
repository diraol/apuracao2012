$(document).ready(function () {
    if (Browser.Version() <= 8) {
        document.getElementById("noIeError").style.display = "none";
        document.getElementById("erroIE").style.display = "block";
        return;
    }

    Map.initialize('map', 'imgs/brasil.svg');
    Apuracao.initialize('apuracao');

    //Funçào que identifica clique nas abas
    $("#graficoAbas li").click( function() {
        esconderAlerta()
        $("#graficoAbas a.selected").removeClass("selected")
        $(this.firstChild).addClass("selected")
        Apuracao.draw(this.firstChild.id)
    })
    $("#graficoAbas li:first").click()
});


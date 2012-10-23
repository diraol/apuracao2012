$(document).ready(function () {
    var width = 956,
        height = 510;

    if (Browser.Version() > 8) {
        Apuracao.initialize(width, height);
    } else {
        document.getElementById("noIeError").style.display = "none";
        document.getElementById("erroIE").style.display = "block";
    }
});


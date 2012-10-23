$(document).ready(function () {
    if (Browser.Version() > 8) {
        Apuracao.initialize();
    } else {
        document.getElementById("noIeError").style.display = "none";
        document.getElementById("erroIE").style.display = "block";
    }
});


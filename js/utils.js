// http://stackoverflow.com/questions/8741696/simple-way-to-format-a-number-in-jquery
function formatNumber(numberString) {
    numberString += '';
    var x = numberString.split('.'),
        x1 = x[0],
        x2 = x.length > 1 ? ',' + x[1] : '',
        rgxp = /(\d+)(\d{3})/;

    while (rgxp.test(x1)) {
        x1 = x1.replace(rgxp, '$1' + '.' + '$2');
    }

    return x1 + x2;
}

function alertar(mensagemErro) {
    var div = document.getElementById("alertar")
        div.style.display = 'block'
        div.style.top = height/2+'px'
        div.innerHTML = mensagemErro + "<br/><span id='fechar'>fechar</span>"
}

function esconderAlerta() {
    document.getElementById("alertar").style.display = 'none'
}


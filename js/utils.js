var jsonAtual = "",
    projecao = "segturno";

function formataNumero(nStr){
    nStr += '';
    x = nStr.split(',');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
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


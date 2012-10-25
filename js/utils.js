function alertar(mensagemErro) {
    var div = document.getElementById("alertar")
    div.style.display = 'block'
    div.style.top = height/2+'px'
    div.innerHTML = mensagemErro + "<br/><span id='fechar'>fechar</span>"
}

function esconderAlerta() {
    document.getElementById("alertar").style.display = 'none'
}


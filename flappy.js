function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    //constructor
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    // cria barreira em cima e em baixo
    // false = baixo, true = cima
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
    // altera a altura da barreira
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//TESTE
// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {
    //constructor
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => { //func publica
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    //pixels/posição das aberturas
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

//TESTE
// const b = new ParDeBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    //constructor
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), // inicio das barrs
        new ParDeBarreiras(altura, abertura, largura + espaco), // segue
        new ParDeBarreiras(altura, abertura, largura + espaco * 2), // segue
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)  //segue 
    ]

    const deslocamento = 3 // velocidade das barrs (pode ser alterado)
    this.animar = () => { // animação 
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando a barreira sair da área do jogo, X é negativo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length) // seta outra barr
                par.sortearAbertura() // sorteia outros tamanhos
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto() // quando cruza o meio da pg, conta um ponto
        })
    }
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
// }, 20)

function Passaro(alturaJogo) {
    //constructor
    let voando = false // true = voando, false = caindo

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'passaro.png'
    // Y = cima e baixo
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true // onkeydown = qualquer tecla 
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5) // voando = 8, caindo = -5 (pode ser alterado)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight 
         // limite do passaro
        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2) // posição inicial
}



function Progresso() { // contagem do pontos
    //constructor
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

function estaoSobrepostos(elementoA, elementoB) { 
    const a = elementoA.getBoundingClientRect() 
    const b = elementoB.getBoundingClientRect()

    // logica de colisão baseado nas bordas dos elementos
    //(borda vertical e horizontal)
    // elemento = quadrado
    // NOTA: dividir essa logica em vars depois
    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) // colisão de fato
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() { // FUNC PRINCIPAL
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, // func Barreiras (200 e 400 pode ser alterado)
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    // criação dos elementos
    areaDoJogo.appendChild(progresso.elemento) 
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()
                                // quando colidir o jogo para
            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()
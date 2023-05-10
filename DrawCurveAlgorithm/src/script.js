import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { bezier3 } from '../bezier3.mjs';

// variaveis globais
var mouse = new THREE.Vector2();
var foraTelhas = false;
var numeroBola = 0;
var bolaCorrente = undefined;
var linhaCorrente = undefined;

// ------****** RENDERER ******------
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ------****** CAMERA ******------
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 10);

// ------****** SCENE ******------
const scene = new THREE.Scene();

// ------****** Controls ******------
const controls = new OrbitControls(camera, renderer.domElement);


function main() {
  addTabuleiro();
  addBalls();
  
  requestAnimationFrame(render);
}

// ------****** RENDER ******------
function render() {    
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// adicionar Telhas pares e impares
// Output -> um "tabuleiro" com 10 de cada lado e cores alternadas com eixos x, y e z
function addTabuleiro() {
  const telhaMaterial = new THREE.BoxGeometry(1,1,0);
  // Adicionar eixos
  const axesHelper = new THREE.AxesHelper( 10 );
  scene.add( axesHelper );

  for(let x = -9.5; x <= 9.5; x++ ) {
    for(let y = -9.5; y <= 9.5; y++){
      let telha;

      if((x+y) %2 == 0) {
        let materialTelhaPar = new THREE.MeshBasicMaterial({ color: 0xF6B26B, transparent: true, opacity: 0.3 }); 
        telha = new THREE.Mesh(telhaMaterial, materialTelhaPar);
      }
      else {
        let materialTelhaImpar = new THREE.MeshBasicMaterial({ color: 0xbddde4, transparent: true, opacity: 0.3 }); 
        telha = new THREE.Mesh(telhaMaterial, materialTelhaImpar);
      }
      
      telha.position.set(x,y,0);
      telha.name = "telha";
      scene.add(telha);
    }
  }
}

// Funcao para adicionar Bolas e respetivas linhas no tabuleiro
function addBalls() {
  const geometry = new THREE.SphereGeometry( 0.5);

  //bola c0 / amarela
  const materialC0 = new THREE.MeshBasicMaterial( { color: 0xffff00, transparent: true, opacity: 0.7} );
  const ballC0 = new THREE.Mesh( geometry, materialC0 );
  ballC0.position.set(-1,-1,0);
  ballC0.name = "bola0";
  scene.add( ballC0 );
  desenharLinha({x:-1,y:-1,z:0}, {x:-1,y:-1,z:0}, 0);

  //bola c1 / vermelha
  const materialC1 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: true, opacity: 0.7} );
  const ballC1 = new THREE.Mesh( geometry, materialC1 );
  ballC1.position.set(-1,1,0);
  ballC1.name = "bola1";
  scene.add( ballC1 );
  desenharLinha({x:-1,y:1,z:0}, {x:-1,y:1,z:0}, 1);

  //bola c2 / verde
  const materialC2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true, opacity: 0.7} );
  const ballC2 = new THREE.Mesh( geometry, materialC2 );
  ballC2.position.set(1,1,0);
  ballC2.name = "bola2";
  scene.add( ballC2 );
  desenharLinha({x:1,y:1,z:0}, {x:1,y:1,z:0}, 2);

  //bola c3 / azul
  const materialC3 = new THREE.MeshBasicMaterial( { color: 0x44e6ff, transparent: true, opacity: 0.7} );
  const ballC3 = new THREE.Mesh( geometry, materialC3 );
  ballC3.position.set(1,-1,0);
  ballC3.name = "bola3";
  scene.add( ballC3 );  
  desenharLinha({x:1,y:1,z:0}, {x:1,y:1,z:0}, 3);
}

// Desenhar uma linha entre dois pontos
// Input ->  Ponto Inicial e Ponto Final
// Output -> Adicionar a scene uma linha entre o ponto inicial e final do input
function desenharLinha(pointA, pointB, id) {
  const pointsX = [];
  const materialLinha = new THREE.LineBasicMaterial({ color: 0x000000 }); 

  pointsX.push( new THREE.Vector3( pointA.x, pointA.y, pointA.z ) );
  pointsX.push( new THREE.Vector3( pointB.x, pointB.y, pointB.z ) );

  const geometryLinha = new THREE.BufferGeometry().setFromPoints( pointsX );
  const linha = new THREE.Line( geometryLinha, materialLinha );

  linha.name = "linha" + (id).toString();
  scene.add( linha );
}

// funcao para guardar as coordenadas no plano onde o mouse esta localizado.
function onMouseMove( event ) {
  if(numeroBola == 0)
    return;
    
  var vec = new THREE.Vector3();
  var pos = new THREE.Vector3();

  vec.set(  (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5 );

  vec.unproject( camera );
  vec.sub( camera.position ).normalize();
  var distance = - camera.position.z / vec.z;
  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

  if(pos.x > 10 || pos.x < -10 || pos.y > 10 || pos.y < -10){
    foraTelhas = true;
    return;
  }
  
  // atualizar dados do mouse
  foraTelhas = false;
  mouse.x = pos.x;
  mouse.y = pos.y;
}

// Funcao para voltar ao estado inicial de telhas e eixos
function limparTelhas() {
  let count = 0;
  
  document.getElementById("legenda").innerHTML = "Bola não selecionada!";
  // remover bolas existente e repor opacity
  if(bolaCorrente != undefined) {
    numeroBola = 0;
    bolaCorrente.material.opacity = 0.7;
    bolaCorrente = undefined;
  }

  // iterar pelos objetos adicionados a scene
  while(count < scene.children.length) {
    switch(scene.children[count].name) {
      case "bola0":
        scene.children[count].position.set(-1,-1,0)
        break;
      case "bola1":
        scene.children[count].position.set(-1,1,0)
        break;
      case "bola2":
        scene.children[count].position.set(1,1,0)
        break;
      case "bola3":
        scene.children[count].position.set(1,-1,0)
        break;  
      case "linha0":
      case "linha1":
      case "linha2":
      case "linha3":
      case "tubo":
        scene.remove(scene.children[count]);
        continue;
      default:
        break;
    }
    count++;
  }
}

// event listener para o movimento do rato
window.addEventListener('mousemove', onMouseMove, false);

// event listener para a tecla x, s, w, space,backspace e 1-4
window.addEventListener('keydown', (event) => {
  switch(event.key) {
    case '1':
    case '2':
    case '3':
    case '4':
      escolherBola(parseInt(event.key));
      break;
    case 'W':
    case 'w':
      increaseBallHeight();
      break;
    case 'S':
    case 's':
      decreaseBallHeight();
      break;
    case 'x':
    case 'X':
      drawBezier3();
      break;
    case ' ':
      moveBall();
      break;
    case 'Backspace':
      limparTelhas();
      break;
    default:
      break;
  }
}, false);


// Funcao para desenhar Tubo
function drawBezier3() {
  const path = new CustomBezier3Curve();
  const geometry = new THREE.TubeGeometry( path, 20, 0.2, 8, false );
  const material = new THREE.MeshBasicMaterial( { color: 0xff8907 } );
  const tubo = new THREE.Mesh( geometry, material );
  tubo.name = "tubo";
  scene.add( tubo );
}

// Funcao para selecionar a bola
// apenas pode haver uma selecao de cada vez, sendo que se selecionada a bola tornar-se-a opaca
// Input: numero da bola Escolhida
// Output: visualizacao da bola escolhida
function escolherBola(numeroBolaEscolhida) {
  let bolaEscolhida;
  let count = 0;

  // encontrar as bolas correspondentes
  while(count < scene.children.length) {
    if(scene.children[count].name == "bola" + (numeroBolaEscolhida - 1).toString())
      bolaEscolhida = scene.children[count];
    if(scene.children[count].name == "linha" + (numeroBolaEscolhida - 1).toString())
      linhaCorrente = scene.children[count];
    count++;
  }
  // escolheu a mesma bola
  if(numeroBola == numeroBolaEscolhida) {
    numeroBola = 0;
    bolaEscolhida.material.opacity = 0.7;
    bolaCorrente = undefined;
    linhaCorrente = undefined;
    document.getElementById("legenda").innerHTML = "Bola não selecionada!";
    return;
  }

  // nao escolheu outra bola anteriormente ou escolheu uma outra bola anteriormente
  numeroBola = numeroBolaEscolhida;
  if(bolaCorrente != undefined) 
    bolaCorrente.material.opacity = 0.7;
  
  bolaEscolhida.material.opacity = 1;
  bolaCorrente = bolaEscolhida;
  
  document.getElementById("legenda").innerHTML = "Bola selecionada - C" + 
                        (numeroBola - 1) + " (" +
                        bolaCorrente.position.x.toFixed(1) + ", " +
                        bolaCorrente.position.y.toFixed(1) + ", " +
                        bolaCorrente.position.z.toFixed(1) + ")";
}

// movimenta a bola para +z
function increaseBallHeight() {
  if(bolaCorrente != undefined){
    bolaCorrente.position.z += 0.1;
    // Atualiza linha e texto da pagina
    updateLine();
    document.getElementById("legenda").innerHTML = "Bola selecionada - C" + 
                        (numeroBola - 1) + " (" +
                        bolaCorrente.position.x.toFixed(1) + ", " +
                        bolaCorrente.position.y.toFixed(1) + ", " +
                        bolaCorrente.position.z.toFixed(1) + ")";
  }
}

// movimenta a bola para -z 
function decreaseBallHeight() {
  if(bolaCorrente != undefined){
    bolaCorrente.position.z -= 0.1;
    // Atualiza linha e texto da pagina
    updateLine();
    document.getElementById("legenda").innerHTML = "Bola selecionada - C" + 
                        (numeroBola - 1) + " (" +
                        bolaCorrente.position.x.toFixed(1) + ", " +
                        bolaCorrente.position.y.toFixed(1) + ", " +
                        bolaCorrente.position.z.toFixed(1) + ")";
  }
}

// Move a bola para o ponto selecionado pelo rato
function moveBall() {
  if(!foraTelhas && numeroBola != 0) {
    bolaCorrente.position.x = mouse.x;
    bolaCorrente.position.y = mouse.y;
    // Atualiza linha e texto da pagina
    updateLine();
    document.getElementById("legenda").innerHTML = "Bola selecionada - C" + 
                        (numeroBola - 1) + " (" +
                        bolaCorrente.position.x.toFixed(1) + ", " +
                        bolaCorrente.position.y.toFixed(1) + ", " +
                        bolaCorrente.position.z.toFixed(1) + ")";
  }
}

// Atualiza a linha da bola selecionada
function updateLine() {
  // removo a linha existinte
  if(linhaCorrente != undefined)
    scene.remove(scene.getObjectByName("linha" + (numeroBola-1)));
  
  // crio uma linha nova
  desenharLinha({x:bolaCorrente.position.x,y:bolaCorrente.position.y,z:0}, 
                bolaCorrente.position, 
                (numeroBola-1));
  
  linhaCorrente = scene.getObjectByName("linha" + (numeroBola-1));
}

// Exemplo de classe costumizada derivada da class Curve presente na documentacao do THREE.js
class CustomBezier3Curve extends THREE.Curve {
  
  constructor( scale = 1 ) {

		super();

		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
    // copiar objetos
    const A = scene.getObjectByName("bola0").position;
    const B = scene.getObjectByName("bola1").position;
    const C = scene.getObjectByName("bola2").position;
    const D = scene.getObjectByName("bola3").position;

    // passar por valor
    let c0 = new THREE.Vector3(A.x, A.y, A.z);
    let c1 = new THREE.Vector3(B.x, B.y, B.z);
    let c2 = new THREE.Vector3(C.x, C.y, C.z);
    let c3 = new THREE.Vector3(D.x, D.y, D.z);

    let ponto = bezier3(c0,c1,c2,c3, t);

		return optionalTarget.set( ponto.x, ponto.y, ponto.z ).multiplyScalar( this.scale );
	}
}

// correr o programa
main();
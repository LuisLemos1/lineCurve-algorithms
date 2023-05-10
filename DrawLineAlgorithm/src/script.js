import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { lineMP } from '../lineMP.mjs';

// variaveis globais
const colorAxisX = 0x0000FF; // azul
const colorAxisY = 0xFF0000; // vermelho
const colorTelhaPar = 0xF6B26B; // laranja
const colorTelhaImpar = 0xbddde4; // cinza
const colorTelhaSelecionada = 0xFF0000; // vermelho
const colorLinha = 0x000000; // preto 
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

var tempMouse = new THREE.Vector3();
var foraTelhas = false;
var pointA, pointB;
var pontoInicial = true;

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
  
  addAxisXYPos(10);
  addTelhas();
  
  requestAnimationFrame(render);
}

// ------****** RENDER ******------
function render() {    
  hoverTelhas();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// adicionar Axis consoante o limite
// Input -> numero limite para os eixos positivos de x e y
// Output -> Eixos X e Y com limite positivo a diferentes cores
function addAxisXYPos(limite) {
  const pointsX = [];
  const pointsY = [];
  const materialAxisX = new THREE.LineBasicMaterial({ color: colorAxisX }); 
  const materialAxisY = new THREE.LineBasicMaterial({ color:  colorAxisY });

  pointsX.push( new THREE.Vector3( 0, 0, 0.01 ) );
  pointsX.push( new THREE.Vector3( limite, 0, 0.01 ) );
  pointsY.push( new THREE.Vector3( 0, 0, 0.01 ) );
  pointsY.push( new THREE.Vector3( 0, limite, 0.01 ) );

  const geometryX = new THREE.BufferGeometry().setFromPoints( pointsX );
  const geometryY = new THREE.BufferGeometry().setFromPoints( pointsY );

  const axisX = new THREE.Line( geometryX, materialAxisX );
  const axisY = new THREE.Line( geometryY, materialAxisY );

  scene.add( axisX );
  scene.add( axisY );
}

// adicionar Telhas pares e impares
// Output -> um "tabuleiro" com 10 de cada lado e cores alternadas
function addTelhas() {
  const telhaMaterial = new THREE.BoxGeometry(1,1,0);
  
  for(let x = -10; x <= 10; x++ ) {
    for(let y = -10; y <= 10; y++){
      let telha;

      if((x+y) %2 == 0) {
        let materialTelhaPar = new THREE.MeshBasicMaterial({ color: colorTelhaPar }); 
        telha = new THREE.Mesh(telhaMaterial, materialTelhaPar);
      }
      else {
        let materialTelhaImpar = new THREE.MeshBasicMaterial({ color: colorTelhaImpar }); 
        telha = new THREE.Mesh(telhaMaterial, materialTelhaImpar);
      }
      
      telha.position.set(x,y,0);
      telha.name = "telha";
      scene.add(telha);
    }
  }
}

// adicionar caixas amarelas nas coordenadas do vetor
// Input -> vetor com lista de coordenadas
// Output -> adicionar a scene caixa nas coordenadas do input
function desenharCaixas(listaPontos) {
  const caixaMaterial = new THREE.BoxGeometry(1,1,1/4);
  let materialCaixa = new THREE.MeshBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.4 }); 
  for(let i = 0; i < listaPontos.length; i++) {
    let caixa = new THREE.Mesh(caixaMaterial, materialCaixa);
    caixa.position.set(listaPontos[i].x,listaPontos[i].y);
    caixa.name = "caixa";
    scene.add(caixa);
  }
}

// Desenhar uma linha entre dois pontos
// Input ->  Ponto Inicial e Ponto Final
// Output -> Adicionar a scene uma linha entre o ponto inicial e final do input
function desenharLinha(pointA, pointB) {
  const pointsX = [];
  const materialLinha = new THREE.LineBasicMaterial({ color: colorLinha }); 

  pointsX.push( new THREE.Vector3( pointA.x, pointA.y, 0.01 ) );
  pointsX.push( new THREE.Vector3( pointB.x, pointB.y, 0.01 ) );

  const geometryLinha = new THREE.BufferGeometry().setFromPoints( pointsX );
  const linha = new THREE.Line( geometryLinha, materialLinha );

  linha.name = "linha";
  scene.add( linha );
}

// Funcao utilizada no render, para verificar as coordenadas do rato 
// e verificar intersecao com as telhas e as suas coordenadas
// Output -> Console.log das coordenadas das telhas em que o rato se encontra
function hoverTelhas() {
  raycaster.setFromCamera(mouse, camera); 
  const intersetarTelhas = raycaster.intersectObjects(getTelhasScene(), false);

  // apenas intersetar uma telha de cada vez
  if(intersetarTelhas.length == 1 && tempMouse != intersetarTelhas[0].object.position) {
    foraTelhas = false;
    tempMouse = intersetarTelhas[0].object.position;
    console.log(tempMouse);
  } else if(intersetarTelhas.length == 0) {
    foraTelhas = true;
  }
}

// From Threejs docs
function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// Funcao para selecionar uma telha no caso de o rato se encontrar em cima desta
// Caso encontrar pinta a telha de vermelho e desenha a linha e caixas caso seja um ponto final
function selecionarTelha() {
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(getTelhasScene(), false);

  if(intersects.length == 1) {
    intersects[0].object.material.color.setHex( colorTelhaSelecionada );
    if(pontoInicial) {
      pointA = { x: intersects[0].object.position.x, y: intersects[0].object.position.y };
      pontoInicial = !pontoInicial;
    } else if(!pontoInicial && !(pointA.x == intersects[0].object.position.x && pointA.y == intersects[0].object.position.y)) {
      pointB = { x: intersects[0].object.position.x, y: intersects[0].object.position.y };
      pontoInicial = !pontoInicial;
      desenharLinha(pointA, pointB);
      desenharCaixas(lineMP(pointA, pointB));
    }
  }
}

// Devolve um vetor de todos objectos correspondentes a telhas
function getTelhasScene() {
  var result = [];

  for(var i = 0; i < scene.children.length; i++) {
    if(scene.children[i].name == "telha") {
      result.push(scene.children[i]);
    }
  }

  return result;
}

// Funcao para voltar ao estado inicial de telhas e eixos
function limparTelhas() {
  let count = 0, i = 0;
  // volta a repor boolean para ponto inicial
  pontoInicial = true;

  // iterar pelos objetos adicionados a scene
  while(count < scene.children.length) {
    // repor cores das telhas
    if(scene.children[count].name == "telha"){
      while(scene.children[count].name == "telha") {
        if(i%2 == 0)
          scene.children[count].material.color.setHex( colorTelhaPar );
        else 
          scene.children[count].material.color.setHex( colorTelhaImpar );
        i++;
        count++;
      } 
    }

    // remover caixas da scene
    if(scene.children[count].name == "caixa") {
      scene.remove(scene.children[count]);
      continue;
    }

   // remover linhas da scene
    if(scene.children[count].name == "linha") {
      scene.remove(scene.children[count]);
      continue;
    }    
    
    count++;
  }
}

// event listener para o movimento do rato
window.addEventListener('mousemove', onMouseMove, false);

// event listener para a tecla x e backspace
window.addEventListener('keydown', (event) => {
  if((event.key == 'x' || event.key == 'X' ) && !foraTelhas )
    selecionarTelha();

  if(event.key == 'Backspace')
    limparTelhas();
}, false);

// correr o programa
main();
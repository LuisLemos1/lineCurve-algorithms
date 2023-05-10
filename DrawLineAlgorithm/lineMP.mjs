export function lineMP(pointA, pointB) {
    let resultado = [];
	let temp;
    let x0 = pointA.x;
    let y0 = pointA.y;
    let x1 = pointB.x;
    let y1 = pointB.y;
	let rotateLine = false, xPositivo = true, yPositivo = true;

	/*
		Como o algoritmo estava implementado para quadrantes positivos e com x crescente,
		caso a a distancia de y for superior a x entao o algoritmo ia correr com erros...
		
		Para resolver vou rodar 90 graus em torno do ponto inicial no sentido contrario do relogio de forma a correr
		o algoritmo neste caso em especifico.
		
		Assim: (x1,y1) vai rodar para (-(y1-y0) + x0 , (x1-x0) + y0)
	*/
	if(Math.abs(y1-y0) - 1 > Math.abs(x1-x0)){
		temp = x1;
		x1 = -(y1 - y0) + x0;
		y1 = (temp - x0) + y0;

		rotateLine = true;
	}

	/*
		Como o algoritmo estava implementado para quadrantes positivos e com x crescente,
		caso o x0 for maior que x1 ou y0 for maior que y1, entao o algoritmo ia correr com erros...

		Para resolver, vou inverter os sinais de forma a reta comecar sempre no ponto inicial mais a esquerda
		Exemplo no caso de x0 for maior que x1: (4,3), (1,4) => (-4,3) , (-1,4);
	*/
	if ( x1 < x0 ) {
		x0 = -x0;
		x1 = -x1;
		xPositivo = false;
	}
	if ( y1 < y0 ) {
		y0 = -y0;
		y1 = -y1;
		yPositivo = false;
	}

	//variaveis implementadas de acordo com os materiais de apoio
	let dx = x1 - x0;
	let dy = y1 - y0; 
	let d = 2*dy - dx;
	let incrE = 2*dy;
	let incrNE = 2*(dy - dx);
	let x = x0;
	let y = y0;

    // Adicionar o ponto inicial
	// Caso ter o ponto ter sido invertido, reverte-se
	// O ponto inicial nunca sera rodado por isso nao e necessario rodar de volta para ja
	resultado.push({x: xPositivo ? x : -x, y: yPositivo ? y : -y});

	// inicia-se o algoritmo
	while (x < x1) {
        pointA.x = x;
        pointA.y = y;

		if (d <=0) { /* Choose E */
			d +=incrE;
			x++;
		} else { /* Choose NE */
			d+=incrNE;
			x++;
			y++;
		}

		if( !(x == x1 && y == y1) ) {
			//Utiliza-se variaveis temporarias para o caso de se ter invertido ou rodado os pontos
			let tempX = x, tempY = y, tempX0 = x0, tempY0 = y0;

			// Caso se tenha invertido os pontos do eixo x ou do eixo y, reverte-se os valores
			if(!xPositivo) {
				tempX = -x;
				tempX0 = -x0;
			}
			if(!yPositivo) {
				tempY = -y;
				tempY0 = -y0;
			}

			/**
			 * rodar 90 graus em torno do ponto inicial para o sentido do relogio
			 * Assim: (x,y) vai rodar para ((y1 - y0) + x0 , -(x1 - x0) + y0)
			 * */		
			if(rotateLine) {
				temp = tempX;
				tempX = (tempY - tempY0) + tempX0;
				tempY = -(temp - tempX0) + tempY0;
			}

			resultado.push({x: tempX, y: tempY});
		}
	} 	/* Termina algoritmo */

	// adicionar o ponto final
	if(!xPositivo) {
		x1 = -x1;
		x0 = -x0;
	}
	if(!yPositivo) {
		y1 = -y1;
		y0 = -y0;
	}
	
	if(rotateLine) {
		temp = x1;
		x1 = (y1 - y0) + x0;
		y1 = -(temp - x0) + y0;
	}

	resultado.push({x: x1, y: y1});

    return resultado; 
}
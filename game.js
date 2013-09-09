var currentLvl = 0;

// Constantes du jeu
var NBR_LIGNES = lvl[currentLvl].length;
var NBR_BRIQUES_PAR_LIGNE = 11;
var BRIQUE_WIDTH = 48;
var BRIQUE_HEIGHT = 15;
var ESPACE_BRIQUE = 2;
var BARRE_JEU_WIDTH = 80; // Largeur de la barre de jeu
var BARRE_JEU_HEIGHT = 10; // Hauteur de la barre de jeu
var BARRE_JEU_GUN = false;

var TYPES_BONUS = new Array(
													   {'name':'slow', 'color':'#00FF00', 'text':'S'},
														 {'name':'gun', 'color':'#00FF00', 'text':'G'},
														 {'name':'extend', 'color':'#00FF00', 'text':'E'},
														 {'name':'fullpower', 'color':'#00FF00', 'text':'F'},
														 {'name':'multiball', 'color':'#00FF00', 'text':'M'}
													 );
var TYPES_MALUS = new Array(
													   {'name':'reduce', 'color':'#CC0000', 'text':'R'},
														 {'name':'speed', 'color':'#CC0000', 'text':'S'}
													 );

var PXL_DEPLA = 10;
var ZONE_JEU_WIDTH = 550;
var ZONE_JEU_HEIGHT = 350;
var COULEUR_BALLE = "#16A6DB";
var DIMENSION_BALLE = 6;
var VITESSE_BALLE = 2;
var VITESSE_BONUS = 1;
var NBR_LIFES = 3;
var MAX_PARTICULE = 30;
var GLOBAL_FPS = 0;

// Variables
var tabBalles = new Array();                 // Tableau virtuel contenant les briques
var tabBriques;                 // Tableau virtuel contenant les briques
var tabBonus;                   // Tableau virtuel contenant les bonus
var tabObjBonus = new Array();  // Tableau virtuel contenant les objets bonus
var tabShoot = new Array();

var barreX; // Position en X de la barre: Changement dynamique avec clavier / souris
var barreY; // Position en Y de la barre: Ne bougera pas.
var canvasX;
var context;
var boucleJeu;
var boucleVitesseBalle;
var boucleFps;
var aGagne = 0;
var limiteBriques = ((ESPACE_BRIQUE+BRIQUE_HEIGHT)*NBR_LIGNES)-ESPACE_BRIQUE;
var particuleImg = new Image();
particuleImg.src = 'images/ParticleBlue5.png';

function refreshFps() {
	var text = GLOBAL_FPS;
  document.getElementById('debug').innerHTML = text;
	GLOBAL_FPS = 0;
}

function shooter() {
	if(BARRE_JEU_GUN == true && tabShoot.length < 6) {
		tabShoot.push(new shoot(barreX, 'left'));
		tabShoot.push(new shoot(barreX, 'right'));
	}
}

function shoot(x, pos) {
	this.width = 5;
	this.height = 10;
  this.vitesse = 3;
	this.x = x + this.width;
	this.y = barreY;
	this.isdead = false;
	
	if(pos == 'right') {
		this.x = x + BARRE_JEU_WIDTH - this.width;
	}
	
	this.render = function(ctx) {
		this.y -= this.vitesse;
		
		ctx.strokeStyle = '#fff';
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y+this.height);
    ctx.stroke();

	}
	
	this.testCollision = function() {
		if ( this.y <= limiteBriques && this.y > 0) {
			// On est dans la zone des briques
			var ligneX = Math.floor(this.x/(BRIQUE_WIDTH+ESPACE_BRIQUE));
			var ligneY = Math.floor(this.y/(BRIQUE_HEIGHT+ESPACE_BRIQUE));
			
			if ( tabBriques[ligneY][ligneX] != 0 ) {
				tabBriques[ligneY][ligneX] = tabBriques[ligneY][ligneX]-1;
				this.isdead = true;

				if(tabBriques[ligneY][ligneX] == 0 && tabBonus[ligneY][ligneX] == 1) {
					tabObjBonus.push(new Bonus(this.x,this.y));
				}
			}
		}
		else if(this.y <= 0) {
		  this.isdead = true;
		}
	}
	
}

function Particule(x, y) {
	this.img = particuleImg;
	this.imgOriginalWidth = 30;
	this.imgWidth = this.imgOriginalWidth;
	this.imgMiddle = 15;
	this.x = x;
	this.y = y;
	this.decalX = this.imgMiddle;
	this.decalY = this.imgMiddle;
	this.alpha = 1;
	this.fade = 0.02;
	this.scale = 1;
	this.percent = this.fade;
	this.compositeOperation = 'lighter';
	this.isdead = false;
	
	this.render = function(context) {
		this.percent += this.fade;
		this.alpha -= this.fade;
		this.scale -= this.fade;
		this.imgWidth = this.imgWidth * this.scale;
		this.imgMiddle = this.imgWidth/2;
		this.decalX = this.x - this.imgMiddle;
		this.decalY = this.y - this.imgMiddle;
		if(this.alpha <= 0) {
		  this.isdead = true;
		}
		else {
			context.save();
		  context.globalAlpha = this.alpha;
			context.globalCompositeOperation = this.compositeOperation;
			context.drawImage(this.img,this.decalX, this.decalY, this.imgWidth, this.imgWidth);
			context.restore();
		}
	}
	
}

function randomXToY(minVal,maxVal) {
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return Math.round(randVal);
}

function addEvent(elem,event,fct) {
  if( elem.addEventListener)
		elem.addEventListener(event,fct,true);
  else
    elem.attachEvent('on' + event,fct);
}

function getPositionCanvas() {
  var elem = document.getElementById('canvas');
	var pos = getCumulativeOffset(elem);
	canvasX = pos['x'];
}
function getCumulativeOffset(el) {
	var x = 0;
	var y = 0;
	var cur = (el) ? el : this;
	do {
		if (cur.nodeName.toLowerCase != 'td') {
			x += cur.offsetLeft;
			y += cur.offsetTop;
		}
	}
	while ((cur = cur.offsetParent) && cur.nodeName.toLowerCase() != 'body');  

	return { x: x, y: y };
}
 
function getOffset(el) { 
  return (el) ? { x: el.offsetLeft, y: el.offsetTop } : { x: this.offsetLeft, y: this.offsetTop };
}

function afficheLife() {
  var lifes_box = document.getElementById('lifes_box');
	var html = "";
	for(var i=0; i<NBR_LIFES; i++){
	  html += '<div class="lifes"></div>';
	}
	lifes_box.innerHTML = html;	
}

function drawBg(currentLvl) {
	var ctx = document.getElementById('canvasBG');
	if (!ctx || !ctx.getContext) { return; }
	ctx = ctx.getContext('2d');
	if (!ctx) { return; }
	var img = new Image();
  img.src = backgrounds[currentLvl];
  img.onload = function(){
    ctx.drawImage(img, 0, 0, ZONE_JEU_WIDTH, ZONE_JEU_HEIGHT);
	}
}


function initGame() {
	
	document.getElementById('layout').style.display = 'none';
	document.getElementById('winpanel').style.display = 'none';
	document.getElementById('winlvlpanel').style.display = 'none';
	document.getElementById('loosepanel').style.display = 'none';
	
	afficheLife();
	
	// On récupère l'objet canvas
	var elem = document.getElementById('canvas');
	if (!elem || !elem.getContext) {
		alert('Pas de canvas ou non prise en charge de .getContex');
		return;
	}
	// On récupère le contexte 2D
	context = elem.getContext('2d');
	if (!context) {
		alert('Pas de contex 2D, le navigateur ne dois pas etre compatible');
		return;
	}
	barreX = (elem.width/2)-(BARRE_JEU_WIDTH/2); // On calcule le centre du jeu
	barreY = (elem.height-BARRE_JEU_HEIGHT - 5); // On calcule la position la plus basse pour la barre

  drawBg(currentLvl);
	creerBriqueslvl(context, lvl, BRIQUE_WIDTH, BRIQUE_HEIGHT, ESPACE_BRIQUE);
	creerBarre(context,barreX,barreY,BARRE_JEU_WIDTH,BARRE_JEU_HEIGHT);
	
	document.getElementById('buttonstart').style.display = 'block';
	document.getElementById('level_info').innerHTML = currentLvl+1+'/'+lvl.length;
}

function initBalle() {
	var y = Math.floor(Math.random()*300)+1;
	var x = Math.floor(Math.random()*380)+10;
	if(y < Math.floor(NBR_LIGNES*(BRIQUE_HEIGHT+ESPACE_BRIQUE)+50)){
	  y = Math.floor(NBR_LIGNES*(BRIQUE_HEIGHT+ESPACE_BRIQUE)+50);
	}
	var balle = new Balle(x,y);
	tabBalles.push(balle);
	balle.dirY = -1;
	balle.dirX = Math.round(Math.random()) == 1 ? 1 : -1;
}

function vitesseBalle() {
	for(var i=0; i<tabBalles.length; i++) {
		var thisBalle = tabBalles[i];
  	thisBalle.vitesse += (thisBalle.vitesse/100)*10;
	}
}

function startGame(){
	initBalle();
	initBalle();
	var button = document.getElementById('buttonstart');
	button.style.display = 'none';
	window.document.onkeydown = checkDepla;
	boucleJeu = setInterval(refreshGame, 10);
	boucleVitesseBalle = setInterval(vitesseBalle, 10000);
	boucleFps = setInterval(refreshFps, 1000);
}

function creerBarre(ctx,x,y,width,height){
	var radius = 4;
  lingrad = ctx.createLinearGradient(0,y,0,y+height);
  lingrad.addColorStop(0, '#fff');
  lingrad.addColorStop(0.8, '#333333');
  ctx.fillStyle = lingrad;
	
	ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
  ctx.lineTo(x+width-radius,y+height);
  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
  ctx.lineTo(x+width,y+radius);
  ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
  ctx.lineTo(x+radius,y);
  ctx.quadraticCurveTo(x,y,x,y+radius);
	ctx.closePath();
	  
	ctx.fill();
	
	ctx.lineWidth=1;
	ctx.strokeStyle="#000";
	ctx.stroke();
	if(BARRE_JEU_GUN == true) {
		var imgD = new Image();
		var imgG = new Image();
		imgD.src = 'images/armeD.png';
		imgG.src = 'images/armeG.png';
		
		ctx.drawImage(imgD, x+width-13, y-23+height, 13, 23);
		ctx.drawImage(imgG, x, y-23+height, 13, 23);
	}
}

function creerBriqueslvl(ctx, lvl, largeur, hauteur, espace) {
	// Tableau virtuel: On initialise les lignes de briques
	tabBriques = new Array(lvl[currentLvl].length);
	tabBonus = new Array(lvl[currentLvl].length);
	
	for (var i=0; i < lvl[currentLvl].length; i++) {
		// Tableau virtuel: On initialise les briques de la ligne
		tabBriques[i] = new Array(lvl[currentLvl][i].length);
		tabBonus[i] = new Array(lvl[currentLvl][i].length);
		
		for (var j=0; j < lvl[currentLvl][i].length; j++) {
			if(lvl[currentLvl][i][j] != 0){
  			// Affichage: On affiche une nouvelle brique
	  		roundedRect(ctx, j*(largeur+espace), i*(hauteur+espace), largeur, hauteur, 4, i, lvl[currentLvl][i][j], COULEURS_BRIQUES[currentLvl][i][j] );
			  // Tableau virtuel: On attribue à la case actuelle la valeur 1 = Une brique existe encore
			  tabBriques[i][j] = lvl[currentLvl][i][j];
				if(Math.round(Math.random()*3) == 3) {
  				tabBonus[i][j] = 1;
				}
			}
			else {
		    //pas de brique
				tabBriques[i][j] = 0;
			}
		}
	}
}

function roundedRect(ctx,x,y,width,height,radius, compteur, type_brique, couleur){
	x = x+1;
	y= y+1;
	lingrad = ctx.createLinearGradient(0,(BRIQUE_HEIGHT+ESPACE_BRIQUE)*compteur,0,(BRIQUE_HEIGHT+ESPACE_BRIQUE)*(compteur+1) );
  lingrad.addColorStop(0, '#fff');
  lingrad.addColorStop(0.8, couleur);
  ctx.fillStyle = lingrad;
	
  ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
  ctx.lineTo(x+width-radius,y+height);
  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
  ctx.lineTo(x+width,y+radius);
  ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
  ctx.lineTo(x+radius,y);
  ctx.quadraticCurveTo(x,y,x,y+radius);
	ctx.closePath();
	  
	ctx.fill();
	
	if(type_brique == 2) {
		ctx.moveTo(x+1,y+1);
		ctx.lineTo(x+(width/8),y+(height/3));
		ctx.lineTo(x+(width/8),y+((height/3)*2));
		ctx.lineTo(x,y+height-1);
		ctx.moveTo(x+width-1,y+1);
		ctx.lineTo(x+width-(width/8),y+(height/3));
		ctx.lineTo(x+width-(width/8),y+((height/3)*2));
		ctx.lineTo(x+width-1,y+height-1);
		ctx.moveTo(x+(width/8),y+(height/3));
		ctx.lineTo(x+width-(width/8),y+(height/3));
		ctx.moveTo(x+(width/8),y+((height/3)*2));
		ctx.lineTo(x+width-(width/8),y+((height/3)*2));
	}
	
	ctx.lineWidth=1;
	ctx.strokeStyle="#000000";
	ctx.stroke();
}


function refreshGame() {
	// On efface la zone
	clearContexte(context, 0, ZONE_JEU_WIDTH, 0, ZONE_JEU_HEIGHT);
	
	aGagne = 1;
	// Réaffichage des briques dont l'état != 0
	for (var i=0; i < tabBriques.length; i++) {
		for (var j=0; j < tabBriques[i].length; j++) {
			//context.fillStyle = COULEURS_BRIQUES[i];
			if (tabBriques[i][j] != 0) {
				roundedRect(context, j*(BRIQUE_WIDTH+ESPACE_BRIQUE),i*(BRIQUE_HEIGHT+ESPACE_BRIQUE),BRIQUE_WIDTH,BRIQUE_HEIGHT, 4, i, tabBriques[i][j], COULEURS_BRIQUES[currentLvl][i][j]);
				aGagne = 0; // Le joueur n'a pas gagné, il reste toujours au moins une brique
		  }
		}
	}
	
	// On vérifie si le joueur à gagné
	if ( aGagne == 1 ) {
		if(currentLvl+1 < lvl.length) {
			nextLvl(context);
		}
		else{ 
		  gagne(context);
		}
	}
	else {
	
  	// Calcul de la nouvelle position de la balle
	  for(var i=0; i<tabBalles.length; i++) {
		  var thisBalle = tabBalles[i];
  	
	  	thisBalle.updatePos();
	  
		  if(thisBalle.isdead == true){
		    var tempBalles = new Array();
			  for(var y in tabBalles){
			    if(y != i) {
				    tempBalles.push(tabBalles[y]);
				  }
			  }
			  tabBalles = tempBalles;
		  }
		  else {
	      // Test des collisions avec les briques
	      thisBalle.testCollision();
        // Affichage de la balle
  		  thisBalle.render(context);

  	  }
  	}
		//affichage des Shoot
		for(var i=0; i<tabShoot.length; i++) {
    	var thisShoot = tabShoot[i];
	  	if(thisShoot.isdead == true) {
	  	  var tempShoot = new Array();
	  		for(var y in tabShoot){
	  		  if(y != i) {
	  			  tempShoot.push(tabShoot[y]);
	  			}
  			}
  			tabShoot = tempShoot;
  		}
  		else {
				thisShoot.testCollision();
    	  thisShoot.render(context);
	  	}
  	}
		
  	//affichage des bonus
  	for(var i=0; i<tabObjBonus.length; i++) {
    	var thisBonus = tabObjBonus[i];
	  	if(thisBonus.istoken == 1) {
	  	  var tempBonus = new Array();
	  		for(var y in tabObjBonus){
	  		  if(y != i) {
	  			  tempBonus.push(tabObjBonus[y]);
	  			}
  			}
  			tabObjBonus = tempBonus;
  		}
  		else {
    	  thisBonus.update(context);
	  	}
  	}
		
		// Affichage de la barre de jeu
    creerBarre(context,barreX,barreY,BARRE_JEU_WIDTH,BARRE_JEU_HEIGHT);
	}
 	GLOBAL_FPS++;
 	afficheDebug();
}

function clearContexte(ctx, startwidth, ctxwidth, startheight, ctxheight) {
	ctx.clearRect(startwidth, startheight, ctxwidth, ctxheight);
}

function checkDepla(e) {
	// Flêche de droite préssée
	if (e.keyCode == 39) {
		if ( (barreX+PXL_DEPLA+BARRE_JEU_WIDTH) <= ZONE_JEU_WIDTH ) barreX += PXL_DEPLA;
	}
	// Flêche de gauche préssée
	else if (e.keyCode == 37) {
		if ( ((barreX-PXL_DEPLA)) >= 0 )  barreX -= PXL_DEPLA;
	}
}

function moveBarre(e) {
	var x = e.clientX;
	x = x-(BARRE_JEU_WIDTH/2);
	if ( (x-canvasX) <= 0 ) barreX = 0;
	else if ( (x-canvasX+BARRE_JEU_WIDTH) >= ZONE_JEU_WIDTH ) barreX = ZONE_JEU_WIDTH-BARRE_JEU_WIDTH;
  else barreX = x-canvasX;
}
function nextLvl(context) {
	currentLvl++;
	resetVar(false);
	NBR_LIGNES = lvl[currentLvl].length;
 	limiteBriques = ((ESPACE_BRIQUE+BRIQUE_HEIGHT)*NBR_LIGNES)-ESPACE_BRIQUE;
	clearAllInterval()
	document.getElementById('layout').style.display = 'block';
	document.getElementById('winlvlpanel').style.display = 'block';
	return;
}

function resetVar(allvar) {
	tabObjBonus = new Array();
	tabBalles = new Array();
	tabShoot = new Array();
	BARRE_JEU_WIDTH = 80;
	VITESSE_BALLE = 2;
	GLOBAL_FPS = 0;
	BARRE_JEU_GUN = false;
	if(allvar == true) {
		currentLvl = 0;
  	NBR_LIFES = 3;
		NBR_LIGNES = lvl[currentLvl].length;
  	limiteBriques = ((ESPACE_BRIQUE+BRIQUE_HEIGHT)*NBR_LIGNES)-ESPACE_BRIQUE;
	}
}

function perdu(context) {
	if(NBR_LIFES == 1){
  	resetVar(true);
  	clearAllInterval()
  	document.getElementById('layout').style.display = 'block';
  	document.getElementById('loosepanel').style.display = 'block';
  	return;
	}
	else {
		NBR_LIFES -= 1;
		afficheLife();
		clearAllInterval()
		initBalle();
    resetVar(false);
    document.getElementById('buttonstart').style.display = 'block';
		return;
	}
}
function gagne(context) {
	resetVar(true);
	clearAllInterval()
	document.getElementById('layout').style.display = 'block';
	document.getElementById('winpanel').style.display = 'block';
	return;
}
function afficheDebug(){
	var text = "";
	//text += "balleX = "+balleX+"<br />";
	//text += "balleY = "+balleY+"<br />";
	//text += "dirBalleX = "+dirBalleX+"<br />";
	//text += "dirBalleY = "+dirBalleY+"<br />";
	//text += "vitesse balle = "+VITESSE_BALLE+"<br />";
	
	//document.getElementById('debug').innerHTML = text;
}
function clearAllInterval() {
	clearInterval(boucleJeu);
	clearInterval(boucleVitesseBalle);
	clearInterval(boucleFps);
}
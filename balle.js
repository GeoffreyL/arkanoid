function Balle(x,y) {

  this.color = COULEUR_BALLE;
	this.bordercolor = "#666666";
	this.rayon = DIMENSION_BALLE;
	this.vitesse = VITESSE_BALLE;
	this.dirX = 1;
	this.dirY = -1;
	this.x = x;
	this.y = y;
	this.isdead = false;
	this.bonus = '';
	this.particules = new Array();
	
	
	this.render = function(context) {
		this.x += this.dirX * this.vitesse;
    this.y += this.dirY * this.vitesse;
		
		if(this.bonus == 'fullpower') {
  		this.renderParticules(context, this.x, this.y);
			this.bordercolor = "#ffffff";
		}
		//degradé
		var radgrad = context.createRadialGradient(this.x-2, this.y-2, 2, this.x, this.y, this.rayon-1);
		radgrad.addColorStop(0, '#CCCCCC');
		radgrad.addColorStop(0.9, '#999999');
		radgrad.addColorStop(1, 'rgba(153,153,153,0)');
		context.fillStyle = radgrad;
		//cercle
		context.beginPath();
		context.arc(this.x, this.y, this.rayon-1, 0, (Math.PI*2), true);
		context.closePath();
		context.fill();
		//bordure
		context.lineWidth = 1;
		context.strokeStyle = this.bordercolor;
		context.stroke();
	}
	
	this.renderParticules = function(context, x, y) {
		if(this.particules.length < MAX_PARTICULE) {
			//if(GLOBAL_FPS % 2 == 0) {
  			this.particules.push(new Particule(x, y));
			//}
		}
		else {
		  this.particules.shift();
		}
		for(var i=0; i<this.particules.length; i++) {
		  var particule = this.particules[i];
			particule.render(context);
	  }
	}
	
	this.testCollision = function() {
		if ( this.y-this.rayon <= limiteBriques) {
			// On est dans la zone des briques
			var ligneX = Math.floor(this.x/(BRIQUE_WIDTH+ESPACE_BRIQUE));
			var ligneY;
			if(this.dirY == -1) { //si la balle monte
				ligneY = Math.floor((this.y-this.rayon)/(BRIQUE_HEIGHT+ESPACE_BRIQUE));
			}
			else if(this.dirY == 1) { //si la balle descend
				ligneY = Math.floor((this.y+this.rayon)/(BRIQUE_HEIGHT+ESPACE_BRIQUE));
				if(ligneY >= tabBriques.length) {
					ligneY = tabBriques.length-1;
				}
			}
			if ( tabBriques[ligneY][ligneX] != 0 && this.dirY == -1 ) {
				tabBriques[ligneY][ligneX] = tabBriques[ligneY][ligneX]-1;
				if(this.bonus != "fullpower"){
				  this.dirY = 1;
				}
				if(tabBriques[ligneY][ligneX] == 0 && tabBonus[ligneY][ligneX] == 1) {
					tabObjBonus.push(new Bonus(this.x,this.y));
				}
			}
			else if ( tabBriques[ligneY][ligneX] != 0 && this.dirY == 1 ) {
				tabBriques[ligneY][ligneX] = tabBriques[ligneY][ligneX]-1;
				if(this.bonus != "fullpower"){
  				this.dirY = -1;
				}
			}
		}		
	}
	
	this.updatePos = function() {
		if ((this.x + this.dirX * this.vitesse)+this.rayon >  ZONE_JEU_WIDTH) {
			this.dirX = this.dirX*-1;
		}
		else if ((this.x + this.dirX * this.vitesse)-this.rayon <  0) {
			this.dirX = this.dirX*-1;
		}
		if ((this.y + this.dirY * this.vitesse)+this.rayon >  ZONE_JEU_HEIGHT) {
			if(tabBalles.length == 1){
				perdu(context);
			}
			else {
				this.isdead = true;
			}
		}
		else {
			if ((this.y + this.dirY * this.vitesse)-this.rayon <  0) {
				this.dirY = 1;
			}
			else {
				if ( ((this.y + this.dirY * this.vitesse)+this.rayon > (ZONE_JEU_HEIGHT - BARRE_JEU_HEIGHT)) 
						 && ((this.x + this.dirX * this.vitesse) >= barreX) 
						 && ((this.x + this.dirX * this.vitesse) <= (barreX+BARRE_JEU_WIDTH))) {
					this.dirY = -1;
					this.dirX = 2*(this.x-(barreX+BARRE_JEU_WIDTH/2))/BARRE_JEU_WIDTH;
				}
			}
		}
	}

	
}

function Bonus(x,y) {
	var b = Math.random() > 0.7 ? TYPES_MALUS[randomXToY(0, TYPES_MALUS.length-1)] : TYPES_BONUS[randomXToY(0, TYPES_BONUS.length-1)];
	this.name = b['name'];
	this.color = b['color'];
	this.text = b['text'];
	this.radius = 5;
	this.width = 30;
	this.height = 10;
	this.x = x-(this.width/2);
	this.y = y;
	this.istoken = 0;
	
	this.apply = function() {
		if(this.name == 'extend') {
			if(BARRE_JEU_WIDTH < 320) {
				BARRE_JEU_WIDTH += (BARRE_JEU_WIDTH/100)*30;
				barreX -= ((BARRE_JEU_WIDTH/100)*30)/2;
			}
		}
		if(this.name == 'reduce') {
			if(BARRE_JEU_WIDTH > 10) {
				BARRE_JEU_WIDTH -= (BARRE_JEU_WIDTH/100)*30;
			}
		}
		if(this.name == 'fullpower') {
			var l = tabBalles.length;
			for(var i=0; i<l; i++){
				var thisBalle = tabBalles[i];
				thisBalle.bonus = 'fullpower';
			}
		}
		if(this.name == 'slow') {
			var l = tabBalles.length;
			for(var i=0; i<l; i++){
				var thisBalle = tabBalles[i];
				if((thisBalle.vitesse/100)*50 > 1) {
					thisBalle.vitesse -= (thisBalle.vitesse/100)*50;
				}
			}
		}
		if(this.name == 'speed') {
			var l = tabBalles.length;
			for(var i=0; i<l; i++){
				var thisBalle = tabBalles[i];
				thisBalle.vitesse += (thisBalle.vitesse/100)*50;
			}
		}
		if(this.name == 'multiball') {
			var l = tabBalles.length;
			for(var i=0; i<l; i++){
				var thisBalle = tabBalles[i];
				tabBalles.push(new Balle(thisBalle.x,thisBalle.y));
				tabBalles.push(new Balle(thisBalle.x,thisBalle.y));
			}
		}
		if(this.name == 'gun') {
			BARRE_JEU_GUN = true;
		}
	}
	
	this.update = function(context) {
				
		this.y += VITESSE_BONUS;
		
		//test collision bonus avec la barre 
		if ( ((this.y + 2)+this.height >= (ZONE_JEU_HEIGHT - BARRE_JEU_HEIGHT)) && ((this.y + 2)+this.height <= ZONE_JEU_HEIGHT) && ((this.x+this.width) >= barreX) && ((this.x) <= (barreX+BARRE_JEU_WIDTH))) {
			this.istoken = 1;
			this.apply();
		}
		
		if(this.istoken != 1){
			
			lingrad = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
			lingrad.addColorStop(0, '#fff');
			lingrad.addColorStop(1, this.color);
			context.fillStyle = lingrad;
				
			context.beginPath();
			context.moveTo(this.x, this.y+this.radius);
			context.lineTo(this.x, this.y+this.height-this.radius);
			context.quadraticCurveTo(this.x, this.y+this.height, this.x+this.radius, this.y+this.height);
			context.lineTo(this.x+this.width-this.radius, this.y+this.height);
			context.quadraticCurveTo(this.x+this.width, this.y+this.height, this.x+this.width, this.y+this.height-this.radius);
			context.lineTo(this.x+this.width, this.y+this.radius);
			context.quadraticCurveTo(this.x+this.width, this.y, this.x+this.width-this.radius, this.y);
			context.lineTo(this.x+this.radius, this.y);
			context.quadraticCurveTo(this.x, this.y, this.x, this.y+this.radius);
			context.closePath();
				
			context.fill();
			
			context.lineWidth=1;
			context.strokeStyle="#000";
			context.stroke();
			
			context.font="10px bold Calibri";
			context.fillStyle="#000000"; // text color
			context.fillText(this.text, this.x+(this.width/2)-2, this.y+(this.height/2)+4);
		}
	}
}
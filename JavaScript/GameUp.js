/*
	*this is a library of original*
	Made by YScratcher. (https://twitter.com/YScratcher → https://twitter.com/JPNYKW)

	Project start in 2018 / 2 / 13
*/

// animation status
var _debug = {}; // null object
var _animation = {}; // null object

var _max_images = 0; // will be load images
var _loaded_images = 0; // check count of loaded images

var fontImg = new Image(); // to Use font
var caseText = false; // check loaded text image

var dot = 'dot';
var pol = 'pol';
var pth = 'pth';
var txt = 'txt';
var img = 'img';

var fit = 'fit';
var fill = 'fill';
var stroke = 'stroke';

var center = 'center'; // 中心
var maximum = 'maximum'; // 最大値

// canvas draw methods
class canvasEx{
	constructor(input){
		Object.assign(this,input);
		
		if(this.switchFrame === void(0)){
			this.switchFrame = [null];
		}
		if(this.frame === void(0)){
			this.frame = -1;
		}

		var type = input.type;
		if(type === pol || type === pth || type === img){
			if(type === img){
				_max_images++;
				var _this = this;
				this.img = new Image();
				this.img.src = this.src;
				this.img.onload = function(){
					_this.setPosition(img);
					_loaded_images++;
				};
			}else{
				this.setPosition(type);
			}
		}
		
		if(type === txt && this.reverse){
			this.text = this.text.split('').reverse().join('');
		}

		if(this.animation !== void(0)){
			_max_images += this.animation.length;
			this.animeFrame = 0;
			this.anime = true;

			for(var i in this.animation){
				var copySrc = this.animation[i];
				this.animation[i] = new Image();
				this.animation[i].src = copySrc;
				this.animation[i].onload = function(){
					_loaded_images++;
				};
			}
		}
	}

	draw(status){
		const direction = this.d || this.dir || this.direction;
	    const label = this.label;
		
		var canvas = this.canvas;
		var ctx = this.context;

		ctx.save();

		var alphaMemory = null;
		var alpha = this.alpha;
		var isCenter = false;

		var h = this.h || this.height;
		var w = this.w || this.width;
		var x = this.x;
		var y = this.y;

		if(isNaN(x)){
			x = convert_position(x, 'x', canvas);
			isCenter = true;
		}
		if(isNaN(y)){
			y = convert_position(y, 'y', canvas);
			isCenter = true;
		}
		if(isCenter && (this.type === pol || this.type === pth)){
			this.setPosition(this.type, x, y);
		}

		if(h === 'fit'){
			h = this.canvas.height;
		}
		if(w === 'fit'){
			w = this.canvas.width;
		}

		ctx.beginPath();
		ctx.lineWidth = this.bold;
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		
		if(alpha !== void(0)){
			alphaMemory = ctx.globalAlpha;
			ctx.globalAlpha = alpha;
		}
		
		if(label !== void(0)){
    		if(label === 'Hitbox' || label.indexOf('Hitbox') > -1){
    		    if(alphaMemory === null){
                    alphaMemory = ctx.globalAlpha;
    		    }
    		    this.alpha = _debug.hitbox + 0;
    		    ctx.globalAlpha = this.alpha;
    		    alpha = this.alpha;
    		}
		}
		
		if(direction !== void(0)){
			ctx.translate(x, y);
			ctx.rotate(direction * Math.PI / 180);
			ctx.translate(-x, -y);
		}

		switch(this.type){
			// draw dot
			case dot:
				let radius = this.radius || this.r;
				ctx.arc(x, y, radius, 0, Math.PI * 2, false);
				this.mode === stroke ? ctx.stroke() : ctx.fill(); // Draw!
			break;

			// draw polygon
			case pol:
				var pos = this.positions;
				ctx.moveTo(pos[0].x, pos[0].y);
				for(var i = 1, len = pos.length; i < len; i++){
					ctx.lineTo(pos[i].x, pos[i].y);
				}
				ctx.lineTo(pos[0].x, pos[0].y);
				this.mode === stroke ? ctx.stroke() : ctx.fill(); // Draw!
			break;

			// draw path by positions
			case pth:
				var pos = this.positions;

				ctx.moveTo(pos[0].x, pos[0].y);

				for(var i = 1, len = pos.length; i < len; i++){
					ctx.lineTo(pos[i].x, pos[i].y);
				}

				ctx.lineTo(pos[0].x, pos[0].y);

				this.mode === stroke ? ctx.stroke() : ctx.fill(); // Draw!
			break;

			// draw text
			case txt:
				if(caseText){
					var text = this.text;
					var size = 30 * (this.size / 100);
					var mode = this.mode === 0 || this.mode === void(0);

					if(this.align === center){
						if(mode){
							x -= text.length / 2 * size;
						} else {
							y -= text.length / 2 * size;
						}
					}

					if(mode){
						y -= size / 2;
					} else {
						x -= size / 2;
					}

					for(var i in text){
						let txt = text[i];
						let fontStack = json_font[txt];

						
						if(fontStack !== void(0)){
							let charCode = txt.charCodeAt(0);
							if(charCode === 12289 || charCode === 12290/*text[i] === '、' || text[i] === '。'*/){
								if(mode){
									ctx.drawImage(fontImg, fontStack.x, fontStack.y, 30, 30, x, y, size, size);
								} else{
									ctx.drawImage(fontImg, fontStack.x, fontStack.y, 30, 30, x + size / 1.3, y - size / 1.5, size, size);
								}
							} else {
								ctx.drawImage(fontImg, fontStack.x, fontStack.y, 30, 30, x, y, size, size);
							}
						} else {
							throw new Error('Undefined font data : ' + text[i]);
						}
						if(mode){
							x += size;
						} else {
							y += size;
						}
					}
				} else if(fontImg.src === ''){
					fontImg.src = 'Image/Screen/font.png';
					fontImg.onload = function(){
						caseText = true;
					};
				}
			break;

			// draw image
			case img:
				var imgSrc = this.img;
				var reverse = this.reverse;

				var fw = img.width / 2 * isCenter;
				var fh = img.height / 2 * isCenter;

				if(this.anime){
					imgSrc = this.animation[this.animeFrame];
				}

				if(isNaN(fw)){
					fw = 0;
				}
				if(isNaN(fh)){
					fh = 0;
				}

				if(reverse){
					ctx.scale(-1, 1);
				}

				if(this.json !== void(0)){
					var jx = Number(this.json.x);
					var jy = Number(this.json.y);
					var width = Number(this.json.width);
					var height = Number(this.json.height);

					if(w !== void(0) && h !== void(0)){
						ctx.drawImage(imgSrc, jx, jy, width, height, (reverse ? -1 : 1) * x - fw, y - fh, w, h); // Draw!
					}else{
						ctx.drawImage(imgSrc, jx, jy, width, height, (reverse ? -1 : 1) * x - fw, y - fh, img.width, img.height); // Draw!
					}
				}else if(w !== void(0) && h !== void(0)){
					fw = w / 2 * this.center;
					fh = h / 2 * this.center;

					if(isNaN(fw)){
						fw = 0;
					}
					if(isNaN(fh)){
						fh = 0;
					}

					ctx.drawImage(imgSrc, (reverse ? -1 : 1) * x - fw, y - fh, w, h); // Draw!
				}else{
					ctx.drawImage(imgSrc, (reverse ? -1 : 1) * x - fw, y - fh); // Draw!
				}

				if(this.anime && status){
					this.animeFrame = (this.animeFrame + 1) % this.animation.length;
				}
			break;
		}

		ctx.restore();

		if(alpha !== void(0)){
			ctx.globalAlpha = alphaMemory;
		}
	}

	setPosition(...mode){
		this.positions = [];

		let cv = this.canvas;
		let x = this.x;
		let y = this.y;

		if(mode[1] !== void(0)){
			x = mode[1];
		}
		if(mode[2] !== void(0)){
			y = mode[2];
		}

		x = convert_position(x, 'x', cv);
		y = convert_position(y, 'y', cv);

		switch(mode[0]){
			case pol:
				var r = this.r || this.radius;
				var dir = this.d || this.direction;
				var vertex = this.v || this.vertex;
				var intAngle = 360 / vertex;

				for(var theta = 0; theta < vertex; theta++){
					dir += intAngle;
					this.positions.push({
						x: x + Math.cos(dir * Math.PI / 180) * r,
						y: y + Math.sin(dir * Math.PI / 180) * r
					});
				}
			break;

			case pth:
				for(var i = 0, len = this.pos.length; i < len; i++){
					this.positions.push({
						x: x + this.pos[i].x,
						y: y + this.pos[i].y
					});
				}
			break;

			case img:
				var width = this.w || this.width || this.img.width;
				var height = this.h || this.height || this.img.height;

				if(this.center){
					var wid = width / 2;
					var hig = height / 2;
					this.positions.push({x: x - wid, y: y + hig});
					this.positions.push({x: x + wid, y: y + hig});
					this.positions.push({x: x + wid, y: y - hig});
					this.positions.push({x: x - wid, y: y - hig});
				}else{
					this.positions.push({x, y});
					this.positions.push({x: x + width, y});
					this.positions.push({x, y: y + height});
					this.positions.push({x: x + width, y: y + height});
				}
			break;
		}
	}
}

// Objects to use in a group
class group{
	constructor(...input){
		this.objects = input;
		this.posStack = [];
		this.hitbox = [];
		
		this.label = 'Group';

		this.corners = {
			leftX: 0,
			righX: 0,
			topY: 0,
			lowY: 0
		};

		this.width = 0;
		this.height = 0;

		for(var i = 0, len = input.length; i < len; i++)this.addPosStack(input[i]);
		Object.assign(this.corners, this.corner());
		this.setSize();
	}

	add(...input){
		var objects = this.objects;
		input.forEach(function(e){
			var index = objects.indexOf(e);
			if(index === -1){
				objects.push(e);
			}else{
				objects[index] = e;
			}
		});

		for(var i = 0, len = input.length; i < len; i++)this.addPosStack(input[i]);
		Object.assign(this.corners, this.corner());
	}

	move(dx,dy){
		this.objects.forEach(function(e){
			e.x += dx;
			e.y += dy;

			if(e.type === pol){
				e.setPosition(pol);
			}
		});

		// refresh posStack
		this.posStack = [];
		for(var i = 0; i < this.objects.length; i++){
			var input = this.objects[i];
			if(input.positions !== void(0)){
				for(var j = 0, len = input.positions.length; j < len; j++){
					this.posStack.push(input.positions[j]);
				}
			}else{
				this.posStack.push({x:input.x, y:input.y});
			}
		}

		Object.assign(this.corners, this.corner());
	}

	addHitBox(canv,cont,...input){
		var x, y;
		var stack = [];
		for(var i = 0, len = input.length; i < len; i += 2){
			x = input[i];
			y = input[i + 1];
			stack.push({x, y});
		}
		
		//_c.log(stack); // debugger
		
		const canvas = canv;
		const context = cont;
		
		this.objects.push(new canvasEx({
			canvas, context, type: pth, x: 'center', y: 'center', bold: 2, color: '#D00', mode: stroke,
			pos: stack, label: 'Group hitbox'
		}));
	}

	addPosStack(input){
		if(input.positions !== void(0)){
			for(var j = 0, len = input.positions.length; j < len; j++){
				this.posStack.push(input.positions[j]);
			}
		}else{
			this.posStack.push({x:input.x, y:input.y});
		}
	}

	corner(){
		// average of positions
		let aveX = 0;
		let aveY = 0;
		this.posStack.map(function(e){
			aveX += e.x;
			aveY += e.y;
		});
		aveX /= this.posStack.length;
		aveY /= this.posStack.length;

		let corners = {
			leftX: aveX,
			righX: aveX,
			topY: aveY,
			lowY: aveY
		};

		// get corner positions
		this.posStack.map(function(e){
			var x = e.x;
			var y = e.y;
			if(corners.leftX > x)corners.leftX = x;
			if(corners.righX < x)corners.righX = x;
			if(corners.topY > y)corners.topY = y;
			if(corners.lowY < y)corners.lowY = y;
		});

		return corners;
	}

	drawArea(ctx, bold, color){
		ctx.line(this.corners.leftX, this.corners.topY, this.corners.righX, this.corners.topY, bold, color);
		ctx.line(this.corners.righX, this.corners.topY, this.corners.righX, this.corners.lowY, bold, color);
		ctx.line(this.corners.righX, this.corners.lowY, this.corners.leftX, this.corners.lowY, bold, color);
		ctx.line(this.corners.leftX, this.corners.lowY, this.corners.leftX, this.corners.topY, bold, color);
	}

	setSize(){
		this.width = abs(this.corners.righX - this.corners.leftX);
		this.height = abs(this.corners.topY - this.corners.lowY);
	}
	
	check_hit(target, type){
		if(type){
			return target.label;
		}
		
		const corners = this.corners;
		for(let i in this.objects){
			const e = this.objects[i];
			
			if(e.label !== void(0) && e.label === 'Group hitbox'){
				let pos = [];				
				e.pos.map(function(e){
					pos.push({
						x: corners.leftX + e.x,
						y: corners.topY + e.y
					});
				});
				
				let fixObject = new canvasEx({
					canvas: e.canvas, context: e.context, type: pth, bold: 1, color: '#000', pos
				});
				
				if(check_hitObjects(target, fixObject)){
					return true;
				}
			} else {
				if(check_hitObjects(target, e)){
					return true;
				}
			}
		}
		
		return false;
	}
}

// New class
class sound{
	constructor(input){
		Object.assign(this, input);

		this.audio = new Audio();
		this.audio.src = this.src;
	}

	play(init){
		if(init){
			this.audio.currentTime = 0;
		}
		this.audio.play();
	}

	pause(stop){
		if(stop){
			this.audio.currentTime = 0;
		}
	    this.audio.pause();
	}

	loop(input){
		if(isNaN(input)){
			return false;
		}
		
		this.audio.loop = input;
	}
	
	volume(input){
		if(isNaN(input)){
			return false;
		}
		
		this.audio.volume = input;
	}
}

// Short codes and math methods
var _m = Math;
var _w = window;
var _c = console;
var _d = document;

var PI = _m.PI;
var sin = _m.sin;
var cos = _m.cos;
var tan = _m.tan;
var abs = _m.abs;
var atan = _m.atan;
var atan2 = _m.atan2;

var rand = _m.random;
var sqrt = _m.sqrt;
var pow = _m.pow;

var round = _m.round;
var floor = _m.floor;
var ceil = _m.ceil;

function random(x, y){	
	let num = new Array(Math.abs(~~x - ~~y) + 1).fill(0);
	num.map(function(e, i){
		num[i] = x + i;
	});
	return num[~~(Math.random() * num.length)];
}

function distance(x_0, y_0, x_1, y_1, canvas){
	
	if(canvas !== void(0)){
		x_0 = convert_position(x_0, 'x', canvas);
		x_1 = convert_position(x_1, 'x', canvas);

		y_0 = convert_position(y_0, 'y', canvas);
		y_1 = convert_position(y_1, 'y', canvas);
	}
	
	return sqrt(pow(x_0 - x_1, 2) + pow(y_0 - y_1, 2));
}

function check_hitObjects(obj_0, obj_1){
	var objPos_0 = obj_0.positions;
	var objPos_1 = obj_1.positions;
	var len_0 = objPos_0.length;
	var len_1 = objPos_1.length;

	var fixLength = 0;
	if(len_0 !== len_1){
		var objPosLast_0 = objPos_0[len_0 - 1];
		var objPosLast_1 = objPos_1[len_1 - 1];
		var dif = Math.abs(len_0 - len_1);

		fixLength = len_0 > len_1 ? 1 : 2;

		for(var i = dif; i--;){
			if(fixLength === 1){
				objPos_1.push({x: objPosLast_1.x, y: objPosLast_1.y});
			} else {
				objPos_0.push({x: objPosLast_0.x, y: objPosLast_0.y});
			}
		}
	}

	var vertex = objPos_0.length;
	for(var fn = 0; fn < vertex; fn++){
		for(var id = 0, len = vertex; id < len; id++){
			var pos_0 = objPos_0[(id + fn) % vertex];
			var pos_1 = objPos_0[(id + fn + 1) % vertex];

			//_c.log(fn, id + fn + 1, pos_1); // debugger

			var pos_2 = objPos_1[id % vertex];
			var pos_3 = objPos_1[(id + 1) % vertex];


			var cross = check_cross_two_lines(pos_0.x, pos_0.y, pos_1.x, pos_1.y, pos_2.x, pos_2.y, pos_3.x, pos_3.y);
			var dist = distance(obj_0.x, obj_0.y ,obj_1.x, obj_1.y);

			if(cross || dist < obj_0.r || dist < obj_1.r) return true;
		}
	}

	// Your code here
	//obj_0が大きい時
	if(check_touch_each_other(objPos_0, objPos_1)) return true;
	//obj_1が大きい時
	if(check_touch_each_other(objPos_1, objPos_0)) return true;

	return false;
}

function check_on_line_point(x_0, y_0, x_1, y_1, x_2, y_2){
	var l_0 = (x_1 - x_0) * (x_1 - x_0) + (y_1 - y_0) * (y_1 - y_0);
	var l_1 = (x_2 - x_0) * (x_2 - x_0) + (y_2 - y_0) * (y_2 - y_0);
	var p = (x_1 - x_0) * (x_2 - x_0) + (y_1 - y_0) * (y_2 - y_0);
	return p >= 0 && p * p == l_0 * l_1 && l_0 >= l_1;
}

function check_cross_two_lines(x_0, y_0, x_1, y_1, x_2, y_2, x_3, y_3){
	var n_0 = (x_2 - x_3) * (y_0 - y_2) + (y_2 - y_3) * (x_2 - x_0);
	var n_1 = (x_2 - x_3) * (y_1 - y_2) + (y_2 - y_3) * (x_2 - x_1);
	var n_2 = (x_0 - x_1) * (y_2 - y_0) + (y_0 - y_1) * (x_0 - x_2);
	var n_3 = (x_0 - x_1) * (y_3 - y_0) + (y_0 - y_1) * (x_0 - x_3);

	return n_2 * n_3 < 0 && n_0 * n_1 < 0
		|| check_on_line_point(x_0, y_0, x_1, y_1, x_2, y_2)
		|| check_on_line_point(x_0, y_0, x_1, y_1, x_3, y_3)
		|| check_on_line_point(x_2, y_2, x_3, y_3, x_0, y_0)
		|| check_on_line_point(x_2, y_2, x_3, y_3, x_1, y_1);
}

function cross_product_z(a_1, a_2, b_1, b_2){
	return a_1 * b_2 - b_1 * a_2
}

function check_touch_each_other(objPos_0, objPos_1){
	var plus = 0;
	var minus = 0;

	var vertex = objPos_0.length;
	for(var i = 0; i < vertex; i++){		
		var a_1 = objPos_1[i].x - objPos_0[i].x;
		var a_2 = objPos_1[i].y - objPos_0[i].y;
		var b_1 = objPos_0[(i + 1) % vertex].x - objPos_0[i].x;
		var b_2 = objPos_0[(i + 1) % vertex].y - objPos_0[i].y;

		if(cross_product_z(a_1, a_2, b_1, b_2) > 0){
			plus++;
		} else {
			minus++;
		}
	}

	return plus === vertex || minus === vertex;
}

function convert_position(...input){
	var tex = input[0];
	var mode = input[1];
	var canvas = input[2];
	var calcValue = mode === 'x' ? canvas.width : canvas.height;

	if(!isNaN(tex)){
		return tex;
	}

	var ary = tex.replace(/center|maximum/, convert_replace);
	ary = ary.split(/A|B/);

	ary.map(function(e, i){
		if(['cen', 'max'].indexOf(e) > -1){
			if(e === 'cen'){
				ary[i] = calcValue / 2;
			} else {
				ary[i] = calcValue;
			}
		}
	});

	var result = 0;
	ary.map(function(e){
		var head = String(e)[0];
		var num = e;

		if(isNaN(head) && head !== '+'){
			num = Number(num.substr(1, num.length - 1));

			if(head === '-'){
				result -= num;
			} else if(head === '*'){
				result *= num;
			} else if(head === '/'){
				result /= num;
			}
		} else {
			if(head === '+'){
				num = Number(num.substr(1, num.length - 1));
			} else {
				num = Number(num);
			}
			result += num;
		}
	});

	return result;
}

function convert_replace(x){
	return x.substr(0, 3) + (x === 'center' ? 'A' : 'B');
}

function array_inside(array, num, error_num){
	let id = -1;
	array.map(function(e, i){
		if(Math.abs(e - num) < error_num){
			id = i;
		}
	});
	
	return id;
}

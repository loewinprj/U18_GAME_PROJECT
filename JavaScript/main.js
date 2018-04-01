_w.onload = function(){
	init();
	main();
	event();
}

function init(){
    size = _d.getElementById('size');
    canv = _d.getElementById('drawArea');
    cont = canv.getContext('2d');

    setSize();
    clear();
	
    // Debug status
    _debug = {
        hitbox: false,
		screen: false,
		keyBuffer: {
			main: 0,
			puzzle: 0
		},
		labelIndex: null
    };
	
	// reset mapchips array
	mapchips = [];

    // Player's detailed information
    player = {
        x: 0,
        y: 0,
        flip: 0,
        frame: 0,
        accel: {
            x: 0,
            y: 0,
            gravity: 0
        },
        standing: false,
        hit: false,
    };

    gui = [];
    const canvas = canv;
    const context = cont;

    // Add the background image to use for game area
    gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/background.png'
	}));

	// Add the character of player
	gui.push(new canvasEx({
	    canvas, context, type: img, x: center, y: center, w: 90, h: 90, flip: 0, center: 1,
	    src: 'Image/Character/mouse_0_0.png',
	    animation: [
            'Image/Character/mouse_0_0.png',
            'Image/Character/mouse_0_1.png'
        ],
        label: 'Player' // プレイヤー固定
	}));

	// Add the hitbox of player
	gui.push(new canvasEx({
		canvas, context, type: pth, x: center, y: center, bold: 2, color: '#D00', mode: stroke,
		pos: [
			{x: -35, y: 15}, {x: 35, y: 15}, {x: 35, y: -15}, {x: -35, y: -15}
		],
		label: ['Hitbox', 'Player'] // 複数のラベル保持も可能
	}));
	
	// JS-System
	init_mapchip(canvas, context);
	
    gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 0, // 0.3 ~ 0.4
		src: 'Image/Screen/puzzleMask.png',
		label: 'Mask'
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 0,
		src: 'Image/Screen/puzzleMask_dropArea.png',
		label: 'Mask'
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: -70, y: center + 200, w: 500, h: 500, alpha: 0,
		src: 'Image/Screen/debugLabel.png',
		label: 'Label'
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/feedmask.png',
		label: 'Feed'
	}));
	
	// Init sounds
	const soundname = [
	        'Sound/Test/U18-6(1).mp3'
	    ];

	soundset = new Array(1).fill(0);
	soundset.forEach(function(e, index, array){
	   array[index] = new sound({src: soundname[index], loop: 1});
	});

	// setup _animation object
	_animation.bgmStart = 1 // Control the bgm
	_animation.loadFinish = 30; // interval of start after loaded images
	_animation.firstInterval = 10; // interval of first loaded to show in a time

	pressedKeys = []; // Reset the array for stack pressed keys
	pressedKeys[37] = pressedKeys[38] = pressedKeys[39] = pressedKeys[40] = 0; // Measures against NaN

    // Make group with add objects
	grounds = new group();
	
	// create new gui
	gui.map(function(e, i){
		let label = e.label;
		if(checkLabel(label, 'Mapchip')){
			mapchips.push(
				{
					x: e.mapchipData.x,
					y: e.mapchipData.y,
					index: i
				}
			);
		}
		if(checkLabel(label, 'Ground')){
			grounds.add(e);
		}
		if(checkLabel(label, 'Label')){
			_debug.labelIndex = i;
		}
		if(checkLabel(label, 'Feed')){
			_debug.feedIndex = i;
		}
	});
	
	//labelIndex
	
	gameController = {
		puzzle: false,
		scroll: {
			x: 0, 
			y: 0
		}
	};
	
	// test
	//_debug.hitbox = true;
}

function init_mapchip(canvas, context){
	let keys = Object.keys(json_mapchip);
	keys.map(function(e){
		let data = json_mapchip[e];
		let hitbox = data.hitbox;
		let chip = data.chip;
		
		// Map chip image soruce
		gui.push(new canvasEx({
			canvas, context, type: img, x: center + chip.x, y: center + chip.y, w: chip.w, h: chip.h, center: 1,
			src: chip.src, label: 'Mapchip', mapchipData: {x: chip.x, y: chip.y}
		}));
		
		// Map chip hitbox source
		gui.push(new canvasEx({
			canvas, context, type: pth, x: center + hitbox.x, y: center + hitbox.y, bold: 2, color: '#111',
			pos: hitbox.pos, label: ['Ground', 'Hitbox', 'Mapchip'], mapchipData: {x: hitbox.x, y: hitbox.y}
		}));
	});
}

// Start main
function main(){
    requestAnimationFrame(main); // loop method

    if(_loadedImages === _maxImages){
		if(!_animation.firstInterval){
			draw();
			update();
		} else {
			_animation.firstInterval --;
		}
	}
}

function update(){
    if(_animation.bgmStart){
		_animation.bgmStart = 0;
		soundset[0].volume(0);
        soundset[0].play(1);
    }

	keyEvents();
	playerControl();
	scrollMapchips();
	debugmodeLabel();
	
	// Mask alpha
	gui.forEach(function(e){
		if(checkLabel(e.label, 'Mask')){
			e.alpha += (0.27 * gameController.puzzle - e.alpha) / 4; 
		}
	});
	
	_animation.loadFinish -= (_animation.loadFinish > 0);
	
	
	gui[_debug.feedIndex].alpha = _animation.loadFinish / 30;
	soundset[0].volume(abs(1 - (_animation.loadFinish / 30)));
	
	//console.log(gui[_debug.feedIndex].alpha);
}

function draw(){
    clear();

    gui.map(function(e){
        if(e.label === 'Player'){
 			e.draw(player.frame > 4);
			if(player.frame > 4){
				player.frame = 0;
			}
        } else {
            e.draw(); // Draw
        }
    });
}

function event(){
    _d.addEventListener('keydown', function(e){
		pressedKeys[e.keyCode] = 1;
	});

    _d.addEventListener('keyup', function(e){
        pressedKeys[e.keyCode] = 0;
    });

    _w.addEventListener('resize', function(){
        requestAnimationFrame ? setSize() : requestAnimationFrame(setSize);
    });
}

function clear(){
    cont.clearRect(0, 0, width, height); // Refresh the screen
}

function setSize(){
	canv.height = size.offsetHeight;
	canv.width = size.offsetWidth;
	height = canv.height;
	width = canv.width;
}

function checkLabel(base, search){
	if(base === void(0)){
		return false;
	}
	
	return (base === search || base.indexOf(search) > -1);
}

function keyEvents(){
	if(pressedKeys[17] && pressedKeys[32] && !_debug.keyBuffer.main){ // ctrl + space switch debug mode
		_debug.keyBuffer.main = 15; // 30(fps) * 15 = 1500ms (1.5s) = interval
		_debug.screen = !_debug.screen;
		console.log(`User switched _debug.screen : ${_debug.screen}`);
	}
	
	if(_debug.screen){
		if((pressedKeys[48] || pressedKeys[96]) && !_debug.keyBuffer.puzzle){
			_debug.keyBuffer.puzzle = 15;
			gameController.puzzle = !gameController.puzzle;
			console.log(`User switched gameController.puzzle : ${gameController.puzzle}`);
		}
	}
	
	Object.keys(_debug.keyBuffer).map(function(e){
		_debug.keyBuffer[e] -= (_debug.keyBuffer[e] > 0);
	});
}

function playerControl(){
	let goCase = (_debug.screen || !gameController.puzzle);
	
    // Deceleration according to law of inertia
    player.accel.x += (pressedKeys[39] - pressedKeys[37]) * accelSpeed * goCase; // Rigth and Left arrow keys
    player.accel.x *= lowAccel;
	player.x += player.accel.x;
	
    //player.accel.y += (pressedKeys[40] - pressedKeys[38]) * accelSpeed; // Down and Up arrow keys
    //player.accel.y *= lowAccel;
	
    player.y += player.accel.y + player.accel.gravity;

    // Move player's coordinates
    gui[1].x = gui[2].x = center + player.x;
    gui[1].y = gui[2].y = center + player.y;

    // Set player's direction
    if((pressedKeys[37] || pressedKeys[39]) && goCase){
        player.flip = pressedKeys[39] + 0;
        gui[1].flip = player.flip;
    }

    // Frame for Character animation
    player.frame += (pressedKeys[37] || pressedKeys[39]) * player.standing * goCase;

    // Your code here. (gravity, 当たり判定完成後)
    player.accel.gravity += 0.5;
    player.y += 5;

    gui[2].y = center + player.y;
    gui[2].draw();
	
    player.standing = false;
    player.hit = false;
		
    if(grounds.checkHit(gui[2])){ // Done!!
			var count = 300;
			var step = 0.1;
			player.standing = true;
			player.hit = true;

			var result = moveUntilNotHit(2, 3, count, step, player.x, player.y, 0, -1);
			if(result[2]){
				player.y -= 5
				count = 15;
				step = 2;
				result = moveUntilNotHit(2, 3, count, step, player.x, player.y - 15, 1, 0);
				result[1] += 15;

				if(result[2]){
				    result = moveUntilNotHit(2, 3, count, step, player.x, player.y - 15, -1, 0);
				    result[1] += 15;
				}
				player.y += 5;
				gui[2].y = center + player.y;
				gui[2].draw();
				player.standing = grounds.checkHit(gui[2])
				player.accel.x = 0;
			} else {
				player.hit = false;
				player.accel.gravity = 0;
				player.accel.y = 0;
				player.accel.y += (pressedKeys[38] * -jumpPower) * goCase; //ジャンプを有効化する
			}
			player.x = result[0];
			player.y = result[1];
			gui[1].x = gui[2].x = center + player.x;
			gui[1].y = gui[2].y = center + player.y;
	}else{
		player.y -= 5;
		gui[2].y = center + player.y;
	}

	// if the player went void, set y to scratch.
	if(height < player.y){
		player.x = 0;
		player.y = 0;
		player.accel.gravity = 0;
	}
	//console.log(player.standing)
	//console.log(player.hit)
}

function moveUntilNotHit(obj_1, obj_2, count, step, x, y, changeX, changeY){
	var isHit = true;
	var tentativeX = x;
	var tentativeY = y;
	/*
	tentativeX -= step * changeX * 2;
	tentativeY -= step * changeY * 2;
	 */
	gui[obj_1].x = center + tentativeX;
	gui[obj_1].y = center + tentativeY;
	gui[obj_1].draw();

	for(var i = 0; i < count && isHit; i++){
		isHit = grounds.checkHit(gui[2]);

		tentativeX += step * changeX;
		tentativeY += step * changeY;
		gui[obj_1].x = center + tentativeX;
		gui[obj_1].y = center + tentativeY;
		gui[obj_1].draw();
	}

	if(isHit){
		tentativeX = x;
		tentativeY = y;

		gui[obj_1].x = center + x;
		gui[obj_1].y = center + y;
		gui[obj_1].draw();
	}
	return [tentativeX, tentativeY, isHit];
}

function scrollMapchips(){
	mapchips.map(function(e){
		gui[e.index].x = center + (gui[e.index].mapchipData.x + gameController.scroll.x); //+ gameController.scroll.x;
		gui[e.index].y = center + (gui[e.index].mapchipData.y + gameController.scroll.y); //+ gameController.scroll.y;
	});
}

function debugmodeLabel(){
	gui[_debug.labelIndex].alpha += (_debug.screen - gui[_debug.labelIndex].alpha) / 3;
}

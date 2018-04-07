_w.onload = function(){
	init();
	main();
	event();
	
	// prototype
	setInterval(main, fps); // start main loop of the game
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
			puzzle: 0,
			hitbox : 0
		},
		labelIndex: null,
		girdLine: false
    };

	// reset mapchips array
	mapchips = [];

    // Player's detailed information
    player = {
        x: 0,
        y: 0,
        reverse: 0,
		
		frame: 0,
		frameSpeed: 6,
		
        accel: {
            x: 0,
            y: 0,
            gravity: 0
        },
		
		hit: false,
        standing: false,
		
		index: 0,
		hitbox: 0,
		
		save: {
			x: 0,
			y: 0
		}
	};

	// Mouse positions
	mouse = {
		x: 0,
		y: 0,
		drag: -1,
		down: false,
		lastdrag: -1
	};

	gui = [];
	const canvas = canv;
	const context = cont;

	// Add the background image to use for game area
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/background.png',
		label: ['Background', 'Title']
	}));

	// JS-System
	init_mapchip(canvas, context);

	// タイトルテストここから

	gui.push(new canvasEx({
		canvas, context, type: txt, x: center, y: center + -200, size: 200, text: '七変化風林火山', align: center, reverse: 1,
		label: ['Title', 'Only']
	}));

	gui.push(new canvasEx({
		canvas, context, type: txt, x: center, y: center + -150, size: 110, text: '鳳凰物語', align: center, reverse: 1,
		label: ['Title', 'Only']
	}));

	gui.push(new canvasEx({
		canvas, context, type: txt, x: center, y: center + 180, size: 90, text: 'スペースキーで開始', align: center,
		label: ['Title', 'Only']
	}));

	//ここまで

	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 0, // 0.3 ~ 0.4
		src: 'Image/Screen/puzzleMask.png',
		label: 'Mask', maxAlpha: 0.4
	}));

	gui.push(new canvasEx({ // center + -200 を maximum + -700 に変更
		canvas, context, type: img, x: -75, y: maximum + -280, w: 500, h: 500, alpha: 0,
		src: 'Image/Screen/debugLabel.png',
		label: 'Label'
	}));

	// パズルピース
	let puzzlePos = [
		{x: 397, y: 353}, // 0
		{x: 469, y: 334}, // 1
		{x: 398, y: 258}, // 2
		{x: 433, y: 334}, // 3
		{x: 453, y: 240}, // 4
		{x: 469, y: 278}, // 5
		{x: 416, y: 314}, // 6
	];

	let dx = -430;
	let dy = -300;
	puzzlePos.forEach(function(e){
		e.x += dx;
		e.y += dy;
	});

	for(var i = 0; i < 7; i ++){
		gui.push(new canvasEx({
			canvas, context, type: img, x: center + puzzlePos[i].x, y: center + puzzlePos[i].y, w: 150, h: 150, alpha: 0, center: true,
			src: `Image/Puzzle/board_0${i + 1}.png`, label: ['Puzzle', 'Mask', 'Selector'], 
			drag: 1, maxAlpha: 1, reverse: 0, direction: 0,
		}));
	}

	// 回転ボタン
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + -300, y: center + 300, w: 130, h: 130, alpha: 0, center: true,
		src: 'Image/Puzzle/buttonRotation.png',
		label: ['Puzzle', 'Mask', 'Rot'], maxAlpha: 0.92, reverse: 0, direction: 0,
	}));

	// 反転ボタン
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + -300, y: center + 200, w: 130, h: 130, alpha: 0, center: true,
		src: 'Image/Puzzle/buttonReverse.png',
		label: ['Puzzle', 'Mask', 'Rev'], maxAlpha: 0.92, reverse: 0, direction: 0,
	}));

	// スクロールバー
	gui.push(new canvasEx({
		canvas, context, type: pth, x: center + -100, y: center + 300, bold: 2, color: '#222', mode: stroke, alpha: 0,
		pos: [{x: -100, y: 0}, {x: 100, y:0}], label: 'Mask', maxAlpha: 0.92
	}));

	// スクロールボタン
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + -200, y: center + 300, w: 30, h: 30, alpha: 0, center: true,
		src: 'Image/Puzzle/buttonScroll.png',
		label: 'Mask', maxAlpha: 0.92, reverse: 0, direction: 0, pinY: true, drag: true
	}));
	
	// for an object (Prototype)
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center + 100, w: 200, h: 200, center: true, alpha: 0, direction: 0,
		src: 'Image/Screen/Effect/leaf.png',
		label: ['Effect', 'Title', 'Only'],
		pattern: [
			{
				type: 'Feedin',
				parameter: {
					time: 60
				}
			},
			{
				type: 'moveY',
				parameter: {
					center,
					start: -200,
					end: 0,
					time: 90
				}
			},
			{
				type: 'rotation',
				parameter: {
					delta: 0.7,
					time: Infinity // 無限ループ(って怖くね?)
				}
			}
		] 
	}));
	
	// Add the character of player
	gui.push(new canvasEx({
	    canvas, context, type: img, x: center, y: center, w: 90, h: 90, center: true, reverse: 0, direction: 0,
	    src: 'Image/Character/mouse_0_0.png',
	    animation: [
            'Image/Character/mouse_0_0.png',
            'Image/Character/mouse_0_1.png'
        ],
        label: 'Player'
	}));
	
	// Add the hitbox of player
	gui.push(new canvasEx({
		canvas, context, type: pth, x: center, y: center, bold: 2, color: '#D00', mode: stroke,
		pos: [
			{x: -35, y: 15}, {x: 35, y: 15}, {x: 35, y: -15}, {x: -35, y: -15}
		],
		label: ['Player', 'Hitbox']
	}));	
	
	// 画面全体を覆うオブジェクトは最上層レイヤーで追加
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/feedmask.png',
		label: ['Title', 'Feedmask']
	}));
	
	// Settings
	gui.push(new canvasEx({
		canvas, context, type: txt, x: center, y: center + -180, size: 200, text: 'ポーズ', align: center, alpha: 0,
		label: 'Setting'
	}));

	//_debug.girdLine = 1;

	// Init sounds
	const soundname = [
		{src: 'Sound/Test/U18-6(1).mp3', volume: 1, loop: 1},
		{src: 'Sound/Test/U18-8(1).mp3', volume: 1, loop: 1},
		{src: 'Sound/Test/SE-7(1)_remix.mp3', volume: 0.6, loop: 0},
	];

	soundset = new Array(soundname.length).fill(0);

	soundset.forEach(function(e, i){
		let _this = soundname[i];
		soundset[i] = new sound({src: _this.src});
		soundset[i].volume(_this.volume);
		soundset[i].loop(_this.loop);
	});

	// setup _animation object
	_animation = {
		bgmStart: 1,
		loadFinish: 30,
		firstInterval: 10,
		title: 1
	}

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
		if(checkLabel(label, 'Feedmask')){
			_debug.feedIndex = i;

		}
	});

	// controll object
	gameController = {
		puzzle: {
			mode: false,
			reverse: {
				id: -1
			},
			rotation: {
				id: -1,
				interval: 0
			}
		},
		scroll: {
			x: 0,
			y: 0
		},
		pause: {
			mode: false,
			interval: 0
		},
		respawn: false
	};

	// setup index of somethings
	gui.map(function(e, i){
		let label = e.label;
		if(checkLabel(label, 'Puzzle') && (checkLabel(label, 'Rot') || checkLabel(label, 'Rev'))){
			if(checkLabel(label, 'Rot')){
				gameController.puzzle.rotation.id = i;
			} else {
				gameController.puzzle.reverse.id = i;
			}
		}
	});
	
	// setup effects
	gui.map(function(e_0, i_0){
		if(checkLabel(e_0.label, 'Effect')){
			e_0.pattern.map(function(e_1, i_1){
				if(e_1.parameter.log === void(0)){
					gui[i_0].pattern[i_1].parameter.log = e_1.parameter.time;
				}
			});
		}
	});
	
	// playerと当たり判定のindex
	gui.map(function(e, i){
		let label = e.label;
		if(checkLabel(label, 'Player')){
			if(checkLabel(label, 'Hitbox')){
				player.hitbox = i;
			} else {
				player.index = i;
			}
		}
	});
	
	// Init effect array
	effects = new Array(32).fill(0);
	for(let i in effects){
		let size = random(60, 80);
		effects[i] = {
			object: new canvasEx({
				canvas, context, type: img, x: random(-width / 4, width), y: -random(10, 70), w: size, h: size, center: true, alpha: 1,
				src: 'Image/Screen/Effect/leaf.png',
				label: ['Effect', 'Title', 'Only'],
			}),
			dx: rand() * (size / 40),
			dy: rand() * (size / 40)
		}
	}
	
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
			canvas, context, type: img, x: center + chip.x, y: center + chip.y, w: chip.w, h: chip.h, center: true,
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
    //requestAnimationFrame(main); // loop method

    if(_loadedImages === _maxImages){
		if(!_animation.firstInterval){
			draw();
			update();
		} else {
			_animation.firstInterval --;
		}
	}
	
	// Pause control
	if(!gameController.pause.interval && pressedKeys[80] && !_animation.title && !gameController.respawn){
		gameController.pause.mode = !gameController.pause.mode;
		gameController.pause.interval = 15;
		soundset[2].play(1);
		
		_c.log(`Switched pause mode : ${gameController.pause.mode}`);
	}
	
	gameController.pause.interval -= (gameController.pause.interval > 0);
}

function update(){
    if(_animation.bgmStart){
		_animation.bgmStart = 0;
		soundset[0].volume(0);
        soundset[0].play(1);
    }

	gui.map(function(e, i){
		if(checkLabel(e.label, 'Setting')){
			gui[i].alpha += (gameController.pause.mode - gui[i].alpha) / 4;
		}
	});
	
	if(!gameController.pause.mode){
		if(player.frame > player.frameSpeed){
			player.frame = 0;
		}

		keyEvents();
		controlEffect();

		if(gameController.puzzle.mode){
			puzzleEvent();
		}

		if(!_animation.title){
			if(!gameController.respawn){
				playerControl();
			}

			dragObjects();
			scrollMapchips();

			debugmodeLabel();
		}
	}

	// Mask alpha
	gui.forEach(function(e){
		if(checkLabel(e.label, 'Mask')){
			e.alpha += ((e.maxAlpha || 0.27) * gameController.puzzle.mode - e.alpha) / 4;
		}
	});

	_animation.loadFinish -= (_animation.loadFinish > 0);
	soundset[0].volume(abs(1 - (_animation.loadFinish / 30)));

	switch(_animation.title){
		case 0:
			if(!gameController.respawn){
				gui[_debug.feedIndex].alpha += (gameController.pause.mode * 0.7 - gui[_debug.feedIndex].alpha) / 6;
				soundset[1].volume(abs(1 - gui[_debug.feedIndex].alpha));
			}
		break;

		case 1:
			gui[_debug.feedIndex].alpha = _animation.loadFinish / 30;
			if(pressedKeys[32] && _animation.title && !_animation.loadFinish){
				_animation.title = 2;
			}
		break;

		case 2:
			gui[_debug.feedIndex].alpha += (1 - gui[_debug.feedIndex].alpha) / 7;
			soundset[0].volume(abs(1 - gui[_debug.feedIndex].alpha));
			if(soundset[0].audio.volume < 0.01){
				gui[_debug.feedIndex].alpha = 1;
				soundset[0].pause(1);
				_animation.title = 3;
				
				_c.log(gui[_debug.feedIndex].alpha);
			}
		break;

		case 3:
			soundset[1].volume(0);
			soundset[1].play(1);

			setTimeout(function(){
				_animation.title = 0;
			}, 400);
		break;
	}
}

function draw(){
	clear();

	gui.map(function(e){
		if(_animation.title){ // draw title screen
			if(checkLabel(e.label, 'Title')){
				e.draw();
			}
		} else {
			if(e.label === 'Player'){
				e.draw(player.frame > player.frameSpeed);
			} else {
				if(!(checkLabel(e.label, 'Only') && checkLabel(e.label, 'Title'))){
					e.draw();
				}
			}
		}
	});

	if(!gameController.pause.mode){
		drawLastDragObject();

		// assistant grid line
		if(_debug.girdLine){
			cont.beginPath();
			cont.lineWidth = 3;
			cont.strokeStyle = '#121212';

			cont.moveTo(0, height / 2);
			cont.lineTo(width, height / 2);

			cont.moveTo(width / 2, 0);
			cont.lineTo(width / 2, height);

			cont.stroke();
		}
	}
	
	if(_animation.title){
		drawEffects();
	}
}

function event(){
	_d.addEventListener('mousemove', function(e){
		let rect = e.target.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	});

	_d.addEventListener('mousedown', function(e){
		mouse.down = true;
	});

	_d.addEventListener('mouseup', function(e){
		mouse.down = false;
	});

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
		_c.log(`User switched _debug.screen : ${_debug.screen}`);
	}

	if(_debug.screen){
		if((pressedKeys[48] || pressedKeys[96]) && !_debug.keyBuffer.puzzle){
			_debug.keyBuffer.puzzle = 15;
			gameController.puzzle.mode = !gameController.puzzle.mode;
			_c.log(`User switched gameController.puzzle.mode : ${gameController.puzzle.mode}`);
		}
		
		if(pressedKeys[49] || pressedKeys[97] && !_debug.keyBuffer.hitbox){
			_debug.keyBuffer.hitbox = 10;
			_debug.hitbox = !_debug.hitbox;
			_c.log(`User switched _debug.hitbox : ${_debug.hitbox}`);
		}
	}

	Object.keys(_debug.keyBuffer).map(function(e){
		_debug.keyBuffer[e] -= (_debug.keyBuffer[e] > 0);
	});
}

function playerControl(){
	let goCase = (_debug.screen || !gameController.puzzle.mode);

	// Deceleration according to law of inertia
	player.accel.x += (pressedKeys[39] - pressedKeys[37]) * accelSpeed * goCase; // Rigth and Left arrow keys
	//gameController.scroll.x += (pressedKeys[37] - pressedKeys[39]) * accelSpeed * goCase * 1.5; // scroll test
	var prePlayerX = player.x;
	var prePlayerY = player.y;
	player.x = 0;
	player.y = 0;
    
	player.accel.x *= lowAccel;
	player.x += player.accel.x;

	//player.accel.y += (pressedKeys[40] - pressedKeys[38]) * accelSpeed; // Down and Up arrow keys
	//player.accel.y *= lowAccel;
	//player.accel.y *= lowAccel;

	player.y += player.accel.y + player.accel.gravity;

	// Move player's coordinates
	gui[player.index].x = gui[player.hitbox].x = center + player.x;
	gui[player.index].y = gui[player.hitbox].y = center + player.y;

	// Set player's direction
	if((pressedKeys[37] || pressedKeys[39]) && goCase){
		player.reverse = pressedKeys[39] + 0;
        	gui[player.index].reverse = player.reverse;
   	}

    	// Frame for Character animation
	player.frame += (pressedKeys[37] || pressedKeys[39]) * player.standing * goCase;

	// Your code here. (gravity, 当たり判定完成後)
	player.accel.gravity += 0.5;
	player.y += 5;

	gui[player.hitbox].y = center + player.y;
	gui[player.hitbox].draw();
	player.standing = false;
	player.hit = false;

	if(grounds.checkHit(gui[player.hitbox])){ // Done!!
		var count = 300;
		var step = 0.1;
		player.standing = true;
		player.hit = true;

		var result = moveUntilNotHit(player.hitbox, 3, count, step, player.x, player.y, 0, -1);
		if(result[2]){
			player.y -= 5
			count = 15;
			step = 2;
			result = moveUntilNotHit(player.hitbox, 3, count, step, player.x, player.y - 15, 1, 0);
			result[1] += 15;

			if(result[2]){
			    result = moveUntilNotHit(player.hitbox, 3, count, step, player.x, player.y - 15, -1, 0);
			    result[1] += 15;
			}
			player.y += 5;
			gui[player.hitbox].y = center + player.y;
			gui[player.hitbox].draw();
			player.standing = grounds.checkHit(gui[player.hitbox])
			player.accel.x = 0;
		} else {
			player.hit = false;
			player.accel.y = 0;
			player.accel.gravity = 0;
			player.accel.y += (pressedKeys[38] * -jumpPower) * goCase; //ジャンプを有効化する
		}
		player.x = result[0];
		player.y = result[1];
		gui[player.index].x = gui[player.hitbox].x = center + player.x;
		gui[player.index].y = gui[player.hitbox].y = center + player.y;
	}else{
		player.y -= 5;
		gui[player.hitbox].y = center + player.y;
	}
    
	gameController.scroll.x -= player.x;
	gameController.scroll.y -= player.y;
	player.x = prePlayerX;
	player.y = prePlayerY;
	
	gui[player.index].x = gui[player.hitbox].x = center + player.x;
	gui[player.index].y = gui[player.hitbox].y = center + player.y;
	//gui[player.hitbox].draw();

	// if the player went void, set y to scratch.
	if(height < 0 - gameController.scroll.y|| gameController.respawn){
		//player.x = 0;
		//player.y = 0;
		//player.accel.gravity = 0;
		//gameController.scroll.x = 0;
		
		if(!gameController.respawn){
			gameController.respawn = true;
			gui[player.index].alpha = 0;
			player.accel.gravity = 0;
			player.accel.y = 0;
			player.y = 0;
			
			let respawn = setInterval(function(){
				gui[_debug.feedIndex].alpha += (1 - gui[_debug.feedIndex].alpha) / 6; // 画面を暗くする
				gameController.scroll.x += (player.save.x - gameController.scroll.x) / 4; // save.x がリスポーンx座標 yも一応格納可能
                		gameController.scroll.y += (player.save.y - gameController.scroll.y) / 4;
	
				if(abs(player.save.x - gameController.scroll.x) + (1 - gui[_debug.feedIndex].alpha)< 0.1){
					setTimeout(function(){
						gameController.scroll.x = 0;
						gui[player.index].alpha = 1;
						player.accel.gravity = 0;

						gameController.respawn = false;
						clearInterval(respawn);
					}, 800);
				}
			}, fps);
		}
	}
	//_c.log(player.standing)
	//_c.log(player.hit)
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
		isHit = grounds.checkHit(gui[player.hitbox]);

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
		gui[e.index].x = center + (gui[e.index].mapchipData.x + gameController.scroll.x);
		gui[e.index].y = center + (gui[e.index].mapchipData.y + gameController.scroll.y);
	});
}

function debugmodeLabel(){
	gui[_debug.labelIndex].alpha += (_debug.screen - gui[_debug.labelIndex].alpha) / 3;
}

function dragObjects(){
	let drag = mouse.drag;
	let down = mouse.down;

	if(drag > -1){
		if(!gui[drag].pinX){
			gui[drag].x = center + (mouse.x - width / 2);
		}

		if(!gui[drag].pinY){
			gui[drag].y = center + (mouse.y - height / 2);
		}

		if(checkLabel(gui[drag].label, 'Puzzle') && !gameController.puzzle.mode){
			mouse.drag = -1;
		}
	}

	if(down){
		if(drag === -1){
			// search index
			let max = 170 / 2;
			gui.map(function(e, i){
				if(e.drag){

					if(checkLabel(e.label, 'Puzzle') && !gameController.puzzle.mode){
						return false;
					} else {
						if((distance(e.x, e.y, mouse.x, mouse.y, canv) < max) && drag === -1){
							max = distance(e.x, e.y, mouse.x, mouse.y, canv);
							mouse.drag = i;

							if(checkLabel(e.label, 'Selector')){
								mouse.lastdrag = mouse.drag;
							}
						}
					}
				}
			});
		}
	} else {
		if(drag > -1){
			mouse.drag = -1;
		}
	}
}

function drawLastDragObject(){
	if(mouse.lastdrag > -1 && gameController.puzzle.mode){
		let obj = gui[mouse.lastdrag];
		let h = obj.h || obj.height;
		let w = obj.w || obj.width;
		let x = obj.x;
		let y = obj.y;

		if(isNaN(x)){
			x = convertPosition(x, 'x', canv);
		}

		if(isNaN(y)){
			y = convertPosition(y, 'y', canv);
		}

		cont.beginPath();

		if(_debug.screen){
			let yScale = h / 2;
			let xScale = w / 2;

			cont.lineWidth = 2;
			cont.strokeStyle = '#C00';

			cont.moveTo(x - xScale, y - yScale);


			cont.lineTo(x - xScale, y + yScale);
			cont.lineTo(x + xScale, y + yScale);
			cont.lineTo(x + xScale, y - yScale);
			cont.lineTo(x - xScale, y - yScale);
			cont.stroke();
		} else {
			cont.fillStyle = 'rgba(0, 0, 0, 0.5)';
			cont.arc(x, y, 50, 0, PI * 2, false);
			cont.fill();
		}
	}
}

function puzzleEvent(){
	let rot = gui[gameController.puzzle.rotation.id];
	let rev = gui[gameController.puzzle.reverse.id];

	if(distance(convertPosition(rot.x, 'x', canv), convertPosition(rot.y, 'y', canv), mouse.x, mouse.y) < rot.w / 2 && mouse.down){

	}
	if(distance(convertPosition(rev.x, 'x', canv), convertPosition(rev.y, 'y', canv), mouse.x, mouse.y) < rev.w / 2 && mouse.down){
		if(!gameController.puzzle.reverse.interval && mouse.lastdrag > -1){
			gui[mouse.lastdrag].reverse = !gui[mouse.lastdrag].reverse;
			gameController.puzzle.reverse.interval = 7;
		}
	}

	gameController.puzzle.reverse.interval -= (gameController.puzzle.reverse.interval > 0);
}

function controlEffect(){
	gui.map(function(e_0, i_0){
		if(checkLabel(e_0.label, 'Effect')){
			e_0.pattern.map(function(e_1, i_1){
				let parameter = e_1.parameter;
				
				if(parameter.log){
					let value = (parameter.time - parameter.log);
					gui[i_0].pattern[i_1].parameter.log -= (gui[i_0].pattern[i_1].parameter.log > 0); // decriment
					
					switch(e_1.type){
						case 'Feedin':
							gui[i_0].alpha = (1 / parameter.time) * value;
						break;

						case 'moveX':
							if(parameter.time === Infinity){
								gui[i_0].x = parameter.center + parameter.delta;
								gui[i_0].pattern[i_1].parameter.delta += parameter.accelDelta;
							} else {
								gui[i_0].x = parameter.center + (parameter.start + (abs(parameter.start - parameter.end) / parameter.time) * value);
							}
						break;
							
						case 'moveY':
							if(parameter.time === Infinity){
								gui[i_0].y = parameter.center + parameter.delta;
								gui[i_0].pattern[i_1].parameter.delta += parameter.accelDelta;
							} else {
								gui[i_0].y = parameter.center + (parameter.start + (abs(parameter.start - parameter.end) / parameter.time) * value);
							}
						break;
							
						case 'rotation':
							if(parameter.time === Infinity){
								gui[i_0].direction += parameter.delta;
							} else {
								let maxDirection = parameter.start || 0;
								gui[i_0].direction = maxDirection + (abs(maxDirection - parameter.end) / parameter.time) * value;
							}
						break;
					}
				}
			});
		}
	})
}

function drawEffects(){
	effects.map(function(e, i){
		e.object.draw();
		effects[i].object.x += e.dx;
		effects[i].object.y += e.dy;
		
		if(width < e.object.x || height < e.object.y){
			effects[i].object.x = random(-width / 4, width);
			effects[i].object.y = -random(10, 30);
		}
	});
}

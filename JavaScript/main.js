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
    };

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

	gui.push(new canvasEx({
		canvas, context, type: pol, x: center, y: center + 150, v: 4, d: 45, r: 70, color: '#222',
		label: 'Ground'
	}));

	gui.push(new canvasEx({
		canvas, context, type: pol, x: center + '-150', y: center + 150, v: 4, d: 45, r: 70, color: '#222',
		label: 'Ground'
	}));

	gui.push(new canvasEx({
		canvas, context, type: pol, x: center + 150, y: center + 150, v: 4, d: 45, r: 70, color: '#222',
		label: 'Ground'
	}));

	// Init sounds
	const soundname = [
	        'Sound/Test/U18-5(1).mp3'
	    ];

	soundset = new Array(1).fill(0);
	soundset.forEach(function(e, index, array){
	   array[index] = new sound({src: soundname[index], loop: 1});
	});

	_animation.bgmStart = 1 // Control the bgm

	pressedKeys = []; // Reset the array for stack pressed keys
	pressedKeys[37] = pressedKeys[38] = pressedKeys[39] = pressedKeys[40] = 0; // Measures against NaN

    // Make group with add objects
	grounds = new group();
	gui.map(function(obj){
		if(obj.label === 'Ground'){
			grounds.add(obj);
		}
	});
}

function main(){
    requestAnimationFrame(main); // loop method

    if(_loadedImages === _maxImages){
		draw();
		update();
		//console.log(player.standing)
    }
}

function update(){
    if(_animation.bgmStart){
        soundset[0].play(1);
        _animation.bgmStart = 0;
    }

    playerControl();
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

function playerControl(){
    // Deceleration according to law of inertia
    player.accel.x += (pressedKeys[39] - pressedKeys[37]) * accelSpeed; // Rigth and Left arrow keys
    //player.accel.y += (pressedKeys[40] - pressedKeys[38]) * accelSpeed; // Down and Up arrow keys
    player.accel.x *= lowAccel;
    //player.accel.y *= lowAccel;
    player.x += player.accel.x;
    player.y += player.accel.y + player.accel.gravity;

    // Move player's coordinates
    gui[1].x = gui[2].x = center + player.x;
    gui[1].y = gui[2].y = center + player.y;

    // Set player's direction
    if(pressedKeys[37] || pressedKeys[39]){
        player.flip = pressedKeys[39] + 0;
        gui[1].flip = player.flip;
    }

    // Frame for Character animation
    player.frame += (pressedKeys[37] || pressedKeys[39]) * player.standing;

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
				player.accel.y += pressedKeys[38] * -jumpPower; //ジャンプを有効化する
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

/*
const canvas = canv;
const context = cont;
gui.push(new canvasEx({
		canvas, context, type: pol, x: center + '300', y: center + 200, v: 4, d: 45, r: 70, color: '#222',
		label: 'Ground'
	}));
	grounds = new group(gui[3], gui[4], gui[5],gui[6]);
*/

console.log('%cDEBUG MODE\n%cSWITCH KEY : %cL-Shift + D\n%c 0 : %cswitch puzzle mode\n%c 1 : %cswitch show hitboxes\n%c 2 : %cswitch talk window', 'color: #0DF; font-weight: bold; font-size: 41.5px', 'font-weight: bold; font-size: 17px', 'color: #FC0; font-weight: bold; font-size: 17px', 'font-size: 15px', 'color: #F70; font-size: 15px', 'font-size: 15px', 'color: #F70; font-size: 15px', 'font-size: 15px', 'color: #F70; font-size: 15px');

_w.onload = function(){
	init();
	main();
	event();
	
	// This is a global variable
	game_loop = setInterval(main, fps); // start main loop of the game
};

// Init methods
function init(){
    size = _d.getElementById('size');
    canv = _d.getElementById('drawArea');
    cont = canv.getContext('2d');

    set_size();
    clear();

    // debug status
    _debug = {
        hitbox: false,
		screen: false,
		talk: 0,
		
		key_buffer: {
			main: 0,
			talk: 0,
			puzzle: 0,
			hitbox : 0
		},
		
		label_index: null,
		grid_line: false
    };
	
	// controll somethings
	game_controller = {
		puzzle: {
			mode: false
		},
		
		scroll: {
			x: 0,
			y: 0
		},
		
		pause: {
			mode: false,
			buffer: 0,
			se_index: -1,
			left_interval: 0,
			right_interval: 0,
			volume_index: 0
		},
		
		talk: {
			text: [],
			mode: false,
			window: {
				index: 0,
				width: 800,
				height: 500
			}
		},
		opening: {
			index: -1,
			story_index: 0
		},
		
		respawn: false,
		screen_mode: 'Title',
		
		// now playing auido parameter
		play_audio: {
			change_speed: 30,
			max_volume: 1,
			volume: 0,
			index: 0,
			pause: 0,
			play: 1
		},
		
		// feed mask & flash mask & OP telop's index
		feed_index: -1,
		flash_index: -1,
		
		// title logo text's index
		title_logo: {
			main_index: [],
			sub_index: []
		},
		
		environmental_se: {
			water: -1,
			bird: -1
		},
		
		map_id: 0,
		master_volume: 1 // master volume
	};

    // Player's detailed information
    player = {
        x: 0,
        y: 0,
        reverse: 0,
		
		frame: 0,
		frame_speed: 6,
		
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
			y: 0,
			index: 0
		},
		
		animal: 'human'
	};

	// Mouse positions
	mouse = {
		x: 0,
		y: 0,
		drag: -1,
		down: false,
		last_drag_index: -1,
		
		buffer: {
			left: 0,
			right: 0,
			reverse: 0
		}
	};

    gui = [];
	const canvas = canv;
    const context = cont;

    // Add the background image to use for game area
    gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/background.png',
		label: ['Background', 'All']
	}));

	// 当たり判定のデータ(複数)の読み込み
	init_hitboxes();
	
	// mapchip.json からマップチップデータを読み込む
	init_mapchip(canvas, context);

	// タイトルテストここから
    
    for(let i = 7; i--;){
        gui.push(new canvasEx({
            canvas, context, type: txt, x: center + (-240 + (7 - i) * 60), y: center + -200, size: width * 6, text: '七変化風林火山'[i],
			align: center, alpha: 0, label: ['Title', 'Logo', 'Main']
        }));
    }
	
	for(let i = 4; i--;){
        gui.push(new canvasEx({
            canvas, context, type: txt, x: center + (-99 + (4 - i) * 33), y: center + -150, size: 0, text: '鳳凰物語'[i],
			align: center, alpha: 0, label: ['Title', 'Logo', 'Sub']
        }));
	}

	gui.push(new canvasEx({
		canvas, context, type: txt, x: center, y: center + 180, size: 90, text: 'スペースキーで開始', align: center,
		label: ['Title']
	}));

	//ここまで
	
	//talk_window
	let talk_window_width = game_controller.talk.window.width;
	let talk_window_height = game_controller.talk.window.height;
	
    gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: maximum + -talk_window_height / 4, w: talk_window_width, h: talk_window_height, alpha: 0, center: true,
		src: 'Image/Screen/talk_window.png',
		label: ['Talkwindow', 'Game']
	}));

    gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 0, // 0.3 ~ 0.4
		src: 'Image/Screen/puzzle_mask.png', max_alpha: 0.4,
		label: ['Mask', 'Game']
	}));

	gui.push(new canvasEx({ // center + -200 を maximum + -700 に変更
		canvas, context, type: img, x: -75, y: maximum + -280, w: 500, h: 500, alpha: 0,
		src: 'Image/Screen/debug_label.png',
		label: ['Label', 'All']
	}));
	
	// for an object (Prototype)
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center + 100, w: 200, h: 200, center: true, alpha: 0, direction: 0,
		src: 'Image/Screen/Effect/leaf.png', switch: 'Audio 0', switch_frame: [7.1, 21.4, 41.4, 64.2],
		animation: [
			'Image/Screen/Effect/leaf.png',
			'Image/Screen/Effect/sakura.png'
		],
		label: ['Animation', 'Effect', 'Title'],
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
	    src: 'Image/Character/ninja_0_0.png',
	    animation: [
			// 忍者
			'Image/Character/ninja_0_0.png',
			'Image/Character/ninja_0_1.png',
			'Image/Character/ninja_0_2.png',
			'Image/Character/ninja_0_3.png',
			'Image/Character/ninja_1_0.png',
			'Image/Character/ninja_1_1.png',
			'Image/Character/ninja_1_2.png',
			'Image/Character/ninja_1_3.png',
			'Image/Character/ninja_1_4.png',
			'Image/Character/ninja_1_3.png',
			'Image/Character/ninja_1_4.png',
			'Image/Character/ninja_1_3.png',
			'Image/Character/ninja_1_2.png',
			'Image/Character/ninja_1_1.png',
			'Image/Character/ninja_2_0.png',
			// ネズミ
			'Image/Character/mouse_0_0.png',
			'Image/Character/mouse_0_1.png',
			// ネコ
			// タカ
			'Image/Character/hawk_0_0.png',
			'Image/Character/hawk_1_0.png',
        ],
        label: 'Player'
	}));
	
	// Add the hitbox of player
	gui.push(new canvasEx({
		canvas, context, type: pth, x: center, y: center, bold: 1, color: '#D00', mode: stroke,
		pos: [
			//{x: -35, y: 13}, {x: 35, y: 13}, {x: 35, y: -15}, {x: -35, y: -15} // mouse
			{x: -30, y: 40}, {x: 35, y: 40}, {x: 35, y: -45}, {x: -30, y: -45}, // ninja
		],
		label: ['Player', 'Hitbox']
	}));
	
	// パズルピース
	let puzzle_positions = [
		{x: 397, y: 353},
		{x: 469, y: 334},
		{x: 398, y: 258},
		{x: 433, y: 334},
		{x: 453, y: 240},
		{x: 469, y: 278},
		{x: 416, y: 314},
	];

	let dx = -430;
	let dy = -300;
	puzzle_positions.forEach(function(e){
		e.x += dx;
		e.y += dy;
	});
	
	for(var i = 0; i < 7; i ++){
		gui.push(new canvasEx({
			canvas, context, type: img, x: center + puzzle_positions[i].x, y: center + puzzle_positions[i].y, w: 150, h: 150, alpha: 0, center: true,
			src: `Image/Puzzle/board_0${i + 1}.png`, drag: 1, max_alpha: 1, reverse: 0, direction: 0,
			label: ['Puzzle', 'Mask', 'Selector', 'Game', 'Boards']
		}));
	}
	
	// 右回転
	gui.push(new canvasEx({
		canvas, context, type: img, x: maximum + -275, y: maximum + -275, alpha: 0, center: true,
		src: 'Image/Puzzle/right_rotation.png', max_alpha: 0.5,
		label: ['Mask', 'Game'],
	}));
	
	// 左回転
	gui.push(new canvasEx({
		canvas, context, type: img, x: -275, y: maximum + -275, alpha: 0, center: true,
		src: 'Image/Puzzle/left_rotation.png', max_alpha: 0.5,
		label: ['Mask', 'Game'],
	}));
	
	// 反転
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + -275, y: maximum + -200, alpha: 0, center: true,
		src: 'Image/Puzzle/reverse.png', max_alpha: 0.5,
		label: ['Mask', 'Game'],
	}));
	
	// 画面全体を覆うオブジェクトは最上層レイヤーで追加
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/feed_mask.png',
		label: ['Feedmask', 'All']
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: 0, y: 0, w: fit, h: fit, alpha: 1,
		src: 'Image/Screen/flash_mask.png',
		label: ['Flashmask', 'All']
	}));
	
	// settings of pause screen
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center + -270, w: 380, h: 380, center: true, alpha: 0,
		src: 'Image/Screen/Pause/pause_text.png',
		label: ['Setting', 'All']
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center + -210, w: 300, h: 300, center: true, alpha: 0,
		src: 'Image/Screen/Pause/line.png',
		label: ['Setting', 'All']
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center + -100, w: 260, h: 260, center: true, alpha: 0,
		src: 'Image/Screen/Pause/volume.png',
		label: ['Setting', 'All']
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + -100, y: center, w: 180, h: 180, center: true, alpha: 0,
		src: 'Image/Screen/Pause/button.png',
		label: ['Setting', 'All']
	}));
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: center + 100, y: center, w: 180, h: 180, center: true, alpha: 0, reverse: true,
		src: 'Image/Screen/Pause/button.png',
		label: ['Setting', 'All']
	}));
	
	// ポージングMaster音量の数字
	var img_src = [];
	for(var i = 0; i < 11; i++){
		img_src.push(`Image/Screen/Pause/volume_${i}.png`);
	}
	
	gui.push(new canvasEx({
		canvas, context, type: img, x: center, y: center, w: 250, h: 250, center: true, alpha: 0,
		src: 'Image/Screen/Pause/volume_0.png',
		label: ['Setting', 'All', 'Volume'],
		animation: img_src
	}));
	
	gui[gui.length - 1].anime_frame = 10;
	
	// オープニングデータのリセット
	init_opening(canvas, context);

	// Init sounds
	const soundname = [
		{src: 'Sound/Test/U18-13(1).mp3', volume: 1, loop: 1},
		{src: 'Sound/Test/U18-14(1)-music.mp3', volume: 0.0, loop: 1},
		{src: 'Sound/Test/U18-14(1)-water.mp3', volume: 0.8, loop: 1},
		{src: 'Sound/Test/SE-7(1)_remix.mp3', volume: 0.6, loop: 0},
	];

	soundset = new Array(soundname.length).fill(0);
	soundset.forEach(function(e, i){
		let _this = soundname[i];
		let src = _this.src;
		soundset[i] = new sound({src: src});
		soundset[i].volume(_this.volume);
		soundset[i].loop(_this.loop);
		
		if(src === 'Sound/Test/SE-7(1)_remix.mp3'){
			game_controller.pause.se_index = i;
		}
		
		if(src === 'Sound/Test/U18-14(1)-water.mp3'){
			game_controller.environmental_se.water = i;
		}
	});

	// setup _animation object
	_animation = {
		load_finished: 30,
		first_buffer: 10,
		bgm_start: 1,
		title: 1
	}

	pressed_keys = []; // Reset the array for stack pressed keys
	pressed_keys[37] = pressed_keys[38] = pressed_keys[39] = pressed_keys[40] = 0; // Measures against NaN
	
	// New grounds system
	mapchips = new Array(2).fill(null);
	grounds = new Array(2).fill(null);
	
	for(let i = 0; i < 2; i++){
		grounds[i] = new group();
		mapchips[i] = [];
	}
	
	gui.map(function(e, i){
		let label = e.label;
		let index = e.map_id || 0;
		
		if(check_include_label(label, 'Mapchip')){
			mapchips[index].push(
				{
					x: e.mapchip_data.x,
					y: e.mapchip_data.y,
					index: i
				}
			);
		}
		
		if(check_include_label(label, 'Ground')){
			grounds[index].add(e);
		}
		
		if(check_include_label(label, 'Label')){
			_debug.label_index = i;
		}
		
		if(check_include_label(label, 'Feedmask')){
			game_controller.feed_index = i;
		}
		
		if(check_include_label(label, 'Flashmask')){
			game_controller.flash_index = i;
		}

		if(check_include_label(label, 'Title') && check_include_label(label, 'Logo')){
			let type = check_include_label(label, 'Main') ? 'main' : 'sub';
			game_controller.title_logo[type + '_index'].push(i);
		}
		
		if(check_include_label(label, 'Talkwindow')){
			game_controller.talk.window.index = i;
		}
		
		if(check_include_label(label, 'Opening') && check_include_label(label, 'Telop')){
			game_controller.opening.index = i;
		}
		
		if(check_include_label(label, 'Setting') && check_include_label(label, 'Volume')){
			game_controller.pause.volume_index = i;
		}
	});
	
	// setup effects
	gui.map(function(e_0, i_0){
		if(check_include_label(e_0.label, 'Effect')){
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
		if(check_include_label(label, 'Player')){
			if(check_include_label(label, 'Hitbox')){
				player.hitbox = i;
			} else {
				player.index = i;
			}
		}
	});
	
	// Init effect array
	effects = new Array(32).fill(0);
	for(let i in effects){
		let size = random(50, 70);
		effects[i] = {
			object: new canvasEx({
				canvas, context, type: img, x: random(-width / 4, width), y: -random(20, 120), w: size, h: size, alpha: rand() * 0.5 + 0.5,
				center: true, direction: random(0, 360), src: `Image/Screen/Effect/${['leaf', 'konoha', 'sakura'][~~(Math.random() * 3)]}.png`,
				label: ['Effect', 'Title']
			}),
			dx: rand() * (size / 40),
			dy: rand() * (size / 40),
			dDir: rand() * 2.5 + 0.5,
			mAlp: rand() * 0.3 + 0.5,
			sAlp: rand() * 1 + 0.5,
			frame: 0
		}
	}
	
	anime_index = [];
	gui.map(function(e, i){
		if(check_include_label(e.label, 'Animation'), check_include_label(e.label, 'Effect')){
			anime_index.push(i);
		}
	});
	
	init_puzzle_data(canvas, context);
}

function init_mapchip(canvas, context){
	let keys = Object.keys(json_mapchip);
	keys.map(function(e){
		let data = json_mapchip[e];
		let hitbox = data.hitbox;
		let chip = data.chip;

		if(hitbox !== void(0)){
			// Map chip hitbox source
			gui.push(new canvasEx({
				canvas, context, type: pth, x: center + hitbox.x, y: center + hitbox.y, bold: 2, color: data.color || '#07E',
				pos: hitbox.pos, mapchip_data: {x: hitbox.x, y: hitbox.y}, map_id: data.map_id || 0,
				label: ['Ground', 'Hitbox', 'Mapchip', 'Game']
			}));
		}
		
		// Map chip image soruce
		gui.push(new canvasEx({
			canvas, context, type: img, x: center + chip.x, y: center + chip.y, w: chip.w, h: chip.h, center: chip.center, alpha: 1,
			src: chip.src, mapchip_data: {x: chip.x, y: chip.y}, map_id: data.map_id || 0, 
			reverse: data.reverse || 0, direction: chip.dir || 0,
			label: ['Mapchip', 'Game']
		}));
	});
}

function init_opening(canvas, context){
	
	// Opening文字
	gui.push(new canvasEx({
		canvas, context, type: txt, x: center + -50, y: center, size: 90, text: story[0], mode: 1, align: center,
		abs_x: -50, alpha: 0, label: ['Opening', 'Telop']
	}));
	
	// Opening背景オブジェクト
	op_image_set = [
		{
			src: 'moon',
			x: maximum + -750,
			y: 150,
			w: 60,
			h: 60,
			id: 0
		},
		{
			src: 'ship',
			x: maximum + -800,
			y: 230,
			w: 120,
			h: 120,
			id: 0
		},
		{
			src: 'ground_0',
			x: center + -250,
			y: center + 110,
			id: 0
		},
		{
			src: 'ground_1',
			x: center + -60,
			y: center + 175,
			id: 0
		},
		{
			src: 'band',
			x: center,
			y: center,
			px: 0,
			py: 0,
			dx: 0,
			dy: 0.6,
			id: 1
		},
		{
			src: 'phoenix',
			x: center + 300,
			y: center + -100,
			id: 3
		}
	];
	
	op_image_set.map(function(e, i){
		let src = `Image/Screen/Opening/${e.src}.png`;
		gui.push(new canvasEx({
			canvas, context, type: img, x: e.x, y: e.y, w: e.w || 200, h: e.h || 200, center: true, alpha: 0,
			src, id: e.id || 0, label: ['Opening', 'Background'],
			image_set_id: i
		}));
	});
}

function init_hitboxes(){
	hitbox_datas = [
		// 忍者
		[{x: -10, y: 40}, {x: 10, y: 40}, {x: 10, y: -45}, {x: -10, y: -45}],
		[{x: -30, y: 40}, {x: 35, y: 40}, {x: 35, y: -45}, {x: -30, y: -45}],
		
		// ネズミ
		[{x: -35, y: 15}, {x: 35, y: 15}, {x: 35, y: -15}, {x: -35, y: -15}],
		
		// ネコ
		[{x: -35, y: 15}, {x: 35, y: 15}, {x: 35, y: -15}, {x: -35, y: -15}],
		
		// タカ
		//[{x: -40, y: 30}, {x: 40, y: 30}, {x: 40, y: -30}, {x: -40, y: -30}],
		[{x: -40, y: 25}, {x: 40, y: 25}, {x: 40, y: -30}, {x: -40, y: -30}],
	];
}

function init_puzzle_data(canvas, context){
	// 現在のパズルデータ
	board_datas = [];
	gui.map(function(e, i){
		if(check_include_label(e.label, 'Boards')){
			board_datas.push({
				index: i,
				dir: e.direction,
				rev: e.reverse,
				x: e.x,
				y: e.y
			});
		}
	});
	
	// パズルの完成データ
	puzzle_datas = [
		[ // 雁
			/*
			旧データ
			{dir: 0}, // 三角形 - 小
			{dir: 0}, // 三角形 - 中
			{dir: 180}, // 三角形 - 中

			{dir: 45}, // 四角形 - 正方形
			{dir: 135, rev: 1}, // 四角形 - 平行四辺形
			{dir: 45, rev: 1}, // 四角形 - 台形
			{dir: 225}, // 四角形 - 等脚台形
			*/
			
			/*重要！！！：0,1,2,3,6 のrevは0になるように模範解答を作成すること
			3（正方形）はdirが0から89に収まるように
			4（平行四辺形）はdirが0から179に収まるように
			*/
			{index: 31, dir: 135, rev: 0, x: "center-243.5", y: "center-23"},
			{index: 32, dir: 315, rev: 0, x: "center-120.5", y: "center-12"},
			{index: 33, dir: 135, rev: 0, x: "center-229.5", y: "center-9"},
			{index: 34, dir: 0, rev: 0, x: "center-54.5", y: "center60"},
			{index: 35, dir: 135, rev: 1, x: "center-69.5", y: "center16"},
			{index: 36, dir: 225, rev: 0, x: "center-164.5", y: "center26"},
			{index: 37, dir: 225, rev: 0, x: "center-151.5", y: "center39"},
		],
		[ // 富士山
			{dir: 45}, // 三角形 - 小
			{dir: 225}, // 三角形 - 中
			{dir: 45}, // 三角形 - 中

			{dir: 0}, // 四角形 - 正方形
			{dir: 45}, // 四角形 - 平行四辺形
			{dir: 225, rev: 1}, // 四角形 - 台形
			{dir: 45}, // 四角形 - 等脚台形
		],
	];
}

// Main loop method
function main(){
    if(_loaded_images === _max_images){
		if(!_animation.first_buffer){
			draw();
			update();
		} else {
			_animation.first_buffer --;
		}
	}
	
	// Pause control
	if(!game_controller.pause.buffer && pressed_keys[80] && !_animation.title && !game_controller.respawn){
		game_controller.pause.mode = !game_controller.pause.mode;
		game_controller.pause.buffer = 15;
		
		soundset[game_controller.pause.se_index].play(1);
		_c.log(`Switched pause mode : ${game_controller.pause.mode}`);
	}
	
	game_controller.pause.buffer -= (game_controller.pause.buffer > 0);
}

// Update methods
function update(){
	audio_update();
	
	key_events();
	
	if(!game_controller.pause.mode && !game_controller.talk.mode){
		if(player.frame > player.frame_speed){
			player.frame = 0;
		}
		
		control_hitbox();
		control_effects();

		if(game_controller.puzzle.mode){
			puzzle_events();
		}

		if(!_animation.title){
			if(!game_controller.respawn){
				player_control();
			}

			drag_objects();
			scroll_mapchips();
		}
		
		draw_debug_label();
		control_player_animation();
	}
	
	pause_control();
	
	// Talk window
	if(game_controller.screen_mode === 'Game'){
		let index = game_controller.talk.window.index;
		gui[index].alpha += (game_controller.talk.mode - gui[index].alpha) / 3;	

	}

	// Mask alpha
	gui.forEach(function(e){
		if(check_include_label(e.label, 'Mask')){
			e.alpha += ((e.max_alpha || 0.27) * game_controller.puzzle.mode - e.alpha) / 4;
		}
	});

	_animation.load_finished -= (_animation.load_finished > 0);

	switch(_animation.title){
		case 0:			
			if(!game_controller.respawn){
				soundset[game_controller.environmental_se.water].audio.volume += (0.8 - soundset[game_controller.environmental_se.water].audio.volume) / 6;
				gui[game_controller.feed_index].alpha += (game_controller.pause.mode * 0.7 - gui[game_controller.feed_index].alpha) / 6;
				game_controller.play_audio.change_speed = 3;
			}
			break;
		
		case 1:
			gui[game_controller.feed_index].alpha = _animation.load_finished / 30;
			if(pressed_keys[32] && _animation.title && !_animation.load_finished){
				game_controller.play_audio.change_speed = 6;
				game_controller.play_audio.max_volume = 0;
				_animation.title = 2;
			}
			break;
		
		case 2:
			gui[game_controller.feed_index].alpha += (1 - gui[game_controller.feed_index].alpha) / 6;
			if(soundset[game_controller.play_audio.index].audio.volume < 0.01){
				gui[game_controller.feed_index].alpha = 1;
				game_controller.play_audio.pause = 1;
				_animation.title = 3;
				
				_c.log(gui[game_controller.feed_index].alpha);
			}
			break;
		
		case 3:
			setTimeout(function(){
				if(false){
					game_controller.play_audio.change_speed = 6;
					game_controller.play_audio.max_volume = 1;
					game_controller.play_audio.index = 1;
					game_controller.play_audio.pause = 1;
					game_controller.play_audio.play = 1;
					
					game_controller.screen_mode = 'Game';
					_animation.title = 0;
				} else {
					game_controller.screen_mode = 'Opening';
					_animation.title = 4;
				}
			}, 400);
			break;
			
		case 4:
			// オープニングを付ける予定
			gui[game_controller.feed_index].alpha += (0.3 - gui[game_controller.feed_index].alpha) / 16; // とりあえず画面明るくしておけ
			
			if(abs(0.3 - gui[game_controller.feed_index].alpha) < 0.1){
				//abs_x
				if(gui[game_controller.opening.index].abs_x < 50){
					gui[game_controller.opening.index].abs_x += 0.6; // オープニング速度
					gui[game_controller.opening.index].x = center + gui[game_controller.opening.index].abs_x;
					
					let alpha = 1 - abs(gui[game_controller.opening.index].abs_x / 50);
					alpha = alpha > 0 ? alpha : 0;
					
					gui[game_controller.opening.index].alpha = alpha;
					
					gui.map(function(obj){
						let label = obj.label;
						if(check_include_label(label, 'Opening') && check_include_label(label, 'Background')){
							if(obj.id === game_controller.opening.story_index){
								obj.alpha = alpha;
							} else {
								obj.alpha = 0;
							}
						}
					});
				} else {
					// テロップを次へ
					game_controller.opening.story_index++;
					gui[game_controller.opening.index].text = story[game_controller.opening.story_index];
					// xとalphaをリセット
					gui[game_controller.opening.index].x = center + -50;
					gui[game_controller.opening.index].abs_x = -50;
					gui[game_controller.opening.index].alpha = 0;
				}
			}

			if(pressed_keys[32]){
				game_controller.play_audio.change_speed = 6;
				game_controller.play_audio.max_volume = 0.6;
				game_controller.play_audio.index = 1;
				game_controller.play_audio.pause = 1;
				game_controller.play_audio.play = 1;
					
				game_controller.screen_mode = 'Game';
				_animation.title = 0;
				
				setTimeout(function(){
					soundset[game_controller.environmental_se.water].play();
				}, 300);
			}
			break;
	}
	
	gui[game_controller.flash_index].alpha += -gui[game_controller.flash_index].alpha / 4.8;
	
	game_controller.title_logo.main_index.map(function(e){
		gui[e].alpha += (1 - gui[e].alpha) / 46;
		gui[e].size += (200 - gui[e].size) / 18;
	});
	
	let sub = game_controller.title_logo.sub_index;
	
	sub.reverse();
	sub.map(function(e){
		gui[e].alpha += (1 - gui[e].alpha) / (e * 1.1);
		gui[e].size += (110 - gui[e].size) / 26;
	});
}

function audio_update(){
	let index = game_controller.play_audio.index;
	
	if(game_controller.play_audio.pause){
		soundset[index].pause(1);
		game_controller.play_audio.pause = 0;
	}
	if(game_controller.play_audio.play){
		soundset[index].volume(game_controller.play_audio.volume);
		soundset[index].play(1);
		game_controller.play_audio.play = 0;
	}

	soundset[index].audio.volume += (game_controller.play_audio.max_volume - soundset[index].audio.volume) / game_controller.play_audio.change_speed;
}

// Draw and clear methods
function draw(){
	clear();

	let mode = game_controller.screen_mode;
	
	gui.map(function(e){
		let label = e.label;
		
		switch(mode){
			case 'Opening':
				if(check_include_label(label, 'Opening')){
					
					if(check_include_label(label, 'Background')){
						let data = op_image_set[e.image_set_id];
						
						if(data.px !== void 0 && data.py !== void 0 && e.id === game_controller.opening.story_index){						
							data.px += data.dx || 0;
							data.py += data.dy || 0;

							e.x = data.x + data.px;
							e.y = data.y + data.py;
						}
					}
					
					e.draw()
				}
				break;
				
			case 'Title':
				if(check_include_label(label, 'Title')){
					e.draw();
				}
				break;
				
			case 'Game':
				if(check_include_label(label, 'Game')){
					if(check_include_label(label, 'Mapchip')){
						if(e.map_id === game_controller.map_id){
							e.draw();
						}
					} else {
						e.draw();
					}
				}
				break;
		}
		
		if(check_include_label(label, 'All')){ //　全場面描画
			e.draw();
		}
		
		if(check_include_label(label, 'Player') && mode === 'Game'){ // 特殊条件発火
			e.draw();
		}

	});

	if(!game_controller.pause.mode && !game_controller.talk.mode){
		draw_last_drag_object();

		// assistant grid line
		if(_debug.grid_line){
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
		draw_effects();
	}
	
	draw_talk_window();
}

function draw_last_drag_object(){
	if(mouse.last_drag_index > -1 && game_controller.puzzle.mode){
		let obj = gui[mouse.last_drag_index];
		let h = obj.h || obj.height;
		let w = obj.w || obj.width;
		let x = obj.x;
		let y = obj.y;

		if(isNaN(x)){
			x = convert_position(x, 'x', canv);
		}

		if(isNaN(y)){
			y = convert_position(y, 'y', canv);
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
			cont.fillStyle = 'rgba(255, 255, 255, 0.1)';
			for(let i = 5; i--;){
				cont.arc(x, y, 60 - (5 - i * 1.3), 0, PI * 2, false);
			}
			cont.fill();
		}
	}
}

function draw_debug_label(){
	gui[_debug.label_index].alpha += (_debug.screen - gui[_debug.label_index].alpha) / 3;
}

function draw_effects(){
	let mode = game_controller.screen_mode;
	
	effects.map(function(e, i){
		let label = e.object.label;

		switch(mode){
			case 'Opening':
				if(check_include_label(label, 'Opening')){
					e.object.draw();
				}
				break;
				
			case 'Title':
				if(check_include_label(label, 'Title')){
					e.object.draw();
				}
				break;
				
			case 'Game':
				if(check_include_label(label, 'Game')){
					e.object.draw();
				}
				break;
		}
		
		if(check_include_label(label, 'All')){ //　全場面描画
			e.object.draw();
		}

		// ここから描画
		effects[i].object.x += e.dx;
		effects[i].object.y += e.dy;
		effects[i].object.direction += e.dDir;
		effects[i].object.alpha = abs(sin(e.frame * PI / 180) - (1 - e.mAlp));

		effects[i].frame += e.sAlp;
		
		if(width < e.object.x || height < e.object.y){
			effects[i].object.x = random(-width / 4, width);
			effects[i].object.y = -random(10, 30);
		}
	});
}

function draw_talk_window(){
	//game_controller.talk.mode
	if(game_controller.talk.mode && game_controller.talk.text !== ''){
		game_controller.talk.text.map(function(e){
			e.object.draw();
			if(!game_controller.pause.mode){
				e.object.alpha += (1 - e.object.alpha) / e.time;
			}
		});
		
		if(pressed_keys[32] && !game_controller.pause.mode){
			game_controller.talk.mode = false;
			game_controller.talk.text = [];
			pressed_keys[32] = 0;
		}
	}
}

function clear(){
    cont.clearRect(0, 0, width, height); // Refresh the screen
}

// User event methods
function event(){
	_d.addEventListener('mousemove', function(e){
		// Mouse positions
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
		pressed_keys[e.keyCode] = 1;
	});

    _d.addEventListener('keyup', function(e){
        pressed_keys[e.keyCode] = 0;
    });

    _w.addEventListener('resize', function(){
        requestAnimationFrame ? set_size() : requestAnimationFrame(set_size);
    });
}

function key_events(){
	if(pressed_keys[16] && pressed_keys[68] && !_debug.key_buffer.main){ // shift + D switch debug mode
		_debug.key_buffer.main = 15; // 30(fps) * 15 = 1500ms (1.5s) = interval
		_debug.screen = !_debug.screen;
		_c.log(`User switched _debug.screen : ${_debug.screen}`);
	}

	if(_debug.screen){
		if(pressed_keys[48] || pressed_keys[96] && !_debug.key_buffer.puzzle){
			_debug.key_buffer.puzzle = 15;
			game_controller.puzzle.mode = !game_controller.puzzle.mode;
			_c.log(`User switched game_controller.puzzle.mode : ${game_controller.puzzle.mode}`);
			
			pressed_keys[48] = pressed_keys[96] = 0; // キー入力をクリア
		}
		
		if(pressed_keys[49] || pressed_keys[97] && !_debug.key_buffer.hitbox){
			_debug.key_buffer.hitbox = 10;
			_debug.hitbox = !_debug.hitbox;
			_c.log(`User switched _debug.hitbox : ${_debug.hitbox}`);
			
			pressed_keys[49] = pressed_keys[97] = 0; // キー入力をクリア
		}
		
		if(pressed_keys[50] || pressed_keys[98] && !_debug.key_buffer.talk){
			_debug.key_buffer.talk = 10;
			game_controller.talk.mode = !game_controller.talk.mode;
			_c.log(`User switched game_controller.talk.mode : ${game_controller.talk.mode}`);
			
			pressed_keys[50] = pressed_keys[98] = 0; // キー入力をクリア
		}
	}

	Object.keys(_debug.key_buffer).map(function(e){
		_debug.key_buffer[e] -= (_debug.key_buffer[e] > 0);
	});
}

// Other methods
function set_size(){
	canv.height = size.offsetHeight;
	canv.width = size.offsetWidth;
	height = canv.height;
	width = canv.width;
}

function check_include_label(base, search){
	if(base === void(0)){
		return false;
	}

	return (base === search || base.indexOf(search) > -1);
}

function player_control(){
	let clear_case = (_debug.screen || !game_controller.puzzle.mode);

	// Deceleration according to law of inertia
	player.accel.x += (pressed_keys[39] - pressed_keys[37]) * accelSpeed * clear_case; // Rigth and Left arrow keys
	var pre_player_x = player.x;
	var pre_player_y = player.y;
	player.x = 0;
	player.y = 0;
    
	player.accel.x *= lowAccel;
	player.x += player.accel.x;

	player.y += player.accel.y + player.accel.gravity;

	// Move player's coordinates
	gui[player.index].x = gui[player.hitbox].x = center + player.x;
	gui[player.index].y = gui[player.hitbox].y = center + player.y;

	// Set player's direction
	if((pressed_keys[37] || pressed_keys[39]) && clear_case){
		player.reverse = pressed_keys[39] + 0;
        	gui[player.index].reverse = player.reverse;
   	}

	// Frame for Character animation
	player.frame += (pressed_keys[37] || pressed_keys[39]) * player.standing * clear_case;

	// Your code here. (gravity, 当たり判定完成後)
	player.accel.gravity += 0.5;
	player.y += 5;

	gui[player.hitbox].y = center + player.y;
	gui[player.hitbox].draw();
	player.standing = false;
	player.hit = false;

	if(grounds[game_controller.map_id].check_hit(gui[player.hitbox])){ // Done!!
		var count = 300;
		var step = 0.1;
		player.standing = true;
		player.hit = true;

		var result = move_until_not_hit(player.hitbox, 3, count, step, player.x, player.y, 0, -1);
		if(result[2]){
			var result = move_until_not_hit(player.hitbox, 3, count, step, player.x, player.y, 0, 1);
			if(result[2]){
				player.y -= 5
				count = 15;
				step = 2;
				result = move_until_not_hit(player.hitbox, 3, count, step, player.x, player.y - 15, 1, 0);
				result[1] += 15;

				if(result[2]){
					result = move_until_not_hit(player.hitbox, 3, count, step, player.x, player.y - 15, -1, 0);
					result[1] += 15;
				}
				player.y += 5;
				gui[player.hitbox].y = center + player.y;
				gui[player.hitbox].draw();
				player.standing = grounds[game_controller.map_id].check_hit(gui[player.hitbox]);
				player.accel.x = 0;
			}else{
				player.standing = false;
				player.hit = false;
				player.accel.y = 0;
				player.accel.gravity = 0;
			}
		} else {
			player.hit = false;
			player.accel.y = 0;
			player.accel.gravity = 0;
			player.accel.y += (pressed_keys[38] * -jumpPower) * clear_case; //ジャンプを有効化する
		}
		player.x = result[0];
		player.y = result[1];
		gui[player.index].x = gui[player.hitbox].x = center + player.x;
		gui[player.index].y = gui[player.hitbox].y = center + player.y;
	}else{
		player.y -= 5;
		gui[player.hitbox].y = center + player.y;
	}
    
	game_controller.scroll.x -= player.x;
	game_controller.scroll.y -= player.y;
	player.x = pre_player_x;
	player.y = pre_player_y;
	
	gui[player.index].x = gui[player.hitbox].x = center + player.x;
	gui[player.index].y = gui[player.hitbox].y = center + player.y;

	// if the player went to void, set y to save.y
	if(height * 2 < -game_controller.scroll.y || game_controller.respawn){
		if(!game_controller.respawn){
			game_controller.play_audio.change_speed = 6;
			game_controller.play_audio.max_volume = 0;
			
			game_controller.respawn = true;
			gui[player.index].alpha = 0;
			player.accel.gravity = 0;
			player.accel.y = 0;
			player.y = 0;
			
			let respawn = setInterval(function(){
				soundset[game_controller.environmental_se.water].audio.volume += -soundset[game_controller.environmental_se.water].audio.volume / 6;
				gui[game_controller.feed_index].alpha += (1 - gui[game_controller.feed_index].alpha) / 6; // フェードアウト
				game_controller.scroll.x += (player.save.x - game_controller.scroll.x) / 4; // save.x が リスポーン x
                game_controller.scroll.y += (player.save.y - game_controller.scroll.y) / 4; // save.y が リスポーン y
	
				if(abs(player.save.x - game_controller.scroll.x) + (1 - gui[game_controller.feed_index].alpha) < 0.1){
					setTimeout(function(){
						game_controller.play_audio.max_volume = 0.6;
						game_controller.scroll.x = 0;
						gui[player.index].alpha = 1;
						player.accel.gravity = 0;

						game_controller.respawn = false;
						clearInterval(respawn);
					}, 800);
				}
			}, fps);
		}
	}
}

function move_until_not_hit(obj_1, obj_2, count, step, x, y, change_x, change_y){
	var isHit = true;
	var tentativeX = x;
	var tentativeY = y;

	gui[obj_1].x = center + tentativeX;
	gui[obj_1].y = center + tentativeY;
	gui[obj_1].draw();

	for(var i = 0; i < count && isHit; i++){
		isHit = grounds[game_controller.map_id].check_hit(gui[player.hitbox]);

		tentativeX += step * change_x;
		tentativeY += step * change_y;
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

function scroll_mapchips(){
	mapchips[game_controller.map_id].map(function(e){
		gui[e.index].x = center + (gui[e.index].mapchip_data.x + game_controller.scroll.x);
		gui[e.index].y = center + (gui[e.index].mapchip_data.y + game_controller.scroll.y);
		
		if(!check_include_label(e.label, 'Hitbox')){
			let x = convert_position(gui[e.index].x, 'x', canv);
			let y = convert_position(gui[e.index].y, 'y', canv);
			
			let alpha = distance(width / 2, height / 2, x, y) / ((width + height) / 2);
			alpha = (1 - alpha * 1.1) < 0 ? 0 : 1 - alpha * 1.025;
			gui[e.index].alpha = alpha;
		}
	});
}

function drag_objects(){
	let drag = mouse.drag;
	let down = mouse.down;

	if(drag > -1){
		if(!gui[drag].pinX){
			gui[drag].x = center + (mouse.x - width / 2);
		}

		if(!gui[drag].pinY){
			gui[drag].y = center + (mouse.y - height / 2);
		}

		if(check_include_label(gui[drag].label, 'Puzzle') && !game_controller.puzzle.mode){
			mouse.drag = -1;
		}
	}

	if(down){
		if(drag === -1){
			// search index
			let max = 170 / 2;
			gui.map(function(e, i){
				if(e.drag){

					if(check_include_label(e.label, 'Puzzle') && !game_controller.puzzle.mode){
						return false;
					} else {
						if((distance(e.x, e.y, mouse.x, mouse.y, canv) < max) && drag === -1){
							max = distance(e.x, e.y, mouse.x, mouse.y, canv);
							mouse.drag = i;

							if(check_include_label(e.label, 'Selector')){
								mouse.last_drag_index = mouse.drag;
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

function puzzle_events(){
	board_datas.map(function(e){
		e.dir = ~~gui[e.index].direction;
		e.rev = ~~gui[e.index].reverse;
		e.x = gui[e.index].x;
		e.y = gui[e.index].y;
	});
	
	if(mouse.down){
		let index = mouse.last_drag_index;
		
		if(!mouse.buffer.reverse && distance(mouse.x, mouse.y, convert_position(center, 'x', canv), convert_position(maximum, 'y', canv)) < 275){
			gui[index].reverse = !gui[index].reverse;
			console.log('REVERSE');
			
			mouse.buffer.reverse = 10;
		}

		if(!mouse.buffer.right && distance(mouse.x, mouse.y, convert_position(maximum, 'x', canv), convert_position(maximum, 'y', canv)) < 275){
			gui[index].direction += 5;
			console.log('RIGHT TURN');
			
			mouse.buffer.right = 3;
			gui[index].direction = gui[index].direction % 360;
		}

		if(!mouse.buffer.left && distance(mouse.x, mouse.y, 0, convert_position(maximum, 'y', canv)) < 275){
			gui[index].direction -= 5;
			console.log('LEFT TURN');
			
			mouse.buffer.left = 3;
			gui[index].direction = (gui[index].direction + 360) % 360;
		}
	}
	
	Object.keys(mouse.buffer).map(function(e){
		mouse.buffer[e] -= mouse.buffer[e] > 0;
	});
}

function control_effects(){
	gui.map(function(e_0, i_0){
		if(check_include_label(e_0.label, 'Effect')){
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
	});
}

function create_talk_window(px, talk, time){
	let x = -345;
	let y = -180;
	let size = px / 3;
	
	let canvas = canv;
	let context = cont;
	let interval = time || 0;
	
	game_controller.talk.text = [];
	talk.split('').map(function(e, i){
		if(e !== '\n'){
			game_controller.talk.text.push({
				time: (i + 1) * interval,
					object: new canvasEx({
						canvas, context, type: txt, x: center + x, y: maximum + y, size: px, text: e,
						align: center, alpha: 0, label: 'Game'
					})
			});
		}
		
		x += size;
		if(400 - (size + 10) < x || e === '\n'){
			x = -345;
			y += size;
		}
	});
	
	if(game_controller.talk.text !== ''){
		game_controller.talk.mode = true;
	}
}

function control_player_animation(){
	let index = player.index;
	let frame = gui[index].anime_frame;
	
	switch(player.animal){
		case 'human':
			if(player.standing){
				if(frame === 14 && !(pressed_keys[37] || pressed_keys[39])){
					frame = 3;
				}

				if(pressed_keys[37] || pressed_keys[39]){
					// run
					frame++;
					if(frame > 13){
						frame = 4;
					}
				} else {
					// stop
					frame--;
					if(frame < 0){
						frame = 0;
					}
				}
			} else {
				// jump
				frame = 14;
			}
			
			break;
			
		case 'mouse':
			// ねずみ
			if((pressed_keys[37] || pressed_keys[39]) && player.standing){
				frame = frame === 15 ? 16 : 15;
			}
			break;
			
		case 'cat':
			// ねこ
			break;
			
		case 'hawk':
			// たか
			frame = player.standing ? 18 : 17;
			break;
	}
	
	gui[index].anime_frame = frame;
}

function switch_animal(name){
	gui[game_controller.flash_index].alpha = 1;
	let index = player.index;
	player.animal = name;
	switch(name){
		case 'human':
			gui[index].anime_frame = 0; // にんげん
			break;
			
		case 'mouse':
			// ねずみ
			gui[index].anime_frame = 15;
			break;
			
		case 'cat':
			// ねこ
			break;
			
		case 'hawk':
			// たか
			gui[index].anime_frame = 17;
			break;
	}
}

function control_hitbox(){
	let frame = gui[player.index].anime_frame;
	
	switch(player.animal){
		case 'human':
			if(frame > 3){
				gui[player.hitbox].pos = hitbox_datas[1];
			} else {
				gui[player.hitbox].pos = hitbox_datas[0];
			}
			break;
			
		case 'mouse':
			// ねずみ
			gui[player.hitbox].pos = hitbox_datas[2];
			break;
			
		case 'cat':
			// ねこ
			break;
			
		case 'hawk':
			// たか
			gui[player.hitbox].pos = hitbox_datas[4];
			break;
	}
}

function relative_position(datas){
    for(var obj of datas){
		obj.ap_x = ~~obj.x.match(/-?\d+/)[0];
		obj.ap_y = ~~obj.y.match(/-?\d+/)[0];
		obj.rp_x = obj.ap_x - datas[0].ap_x;
		obj.rp_y = obj.ap_y - datas[0].ap_y;
    }
}

function judge_puzzle(board, answer, confuse = true){
	relative_position(board);
	relative_position(answer);
	
	var allowed_error_pos = 15;
	var allowed_error_dir = 10;

	for(var i = 0; i < board.length; i++){
		var dir = board[i].dir;
		var rev = board[i].rev;
		
		if(rev === 1){
			if(i === 1 || i === 2 || i === 6) dir += 90;
		}
		
		if(i === 3) dir = (dir + 360) % 90;
		if(i === 4) dir = (dir + 360) % 180;
		
		if(Math.abs(answer[i].rp_x - board[i].rp_x) > allowed_error_pos
		   || Math.abs(answer[i].rp_y - board[i].rp_y) > allowed_error_pos
		   || Math.abs(answer[i].dir - dir) > allowed_error_dir){
			if(confuse){
				return judge_puzzle(board,answer, false);
			}else{
				return false;
			}
		}
	}
	return true;
}

function save_method(){
	switch(player.save.index){
		case 0:
			// todo set position of player's respawn pos
			break;
	}
}

function pause_control(){
	if(game_controller.screen_mode !== 'Game' || game_controller.respawn){
		return false;
	}
	
	let mode = game_controller.pause.mode;
	gui.map(function(e, i){
		if(check_include_label(e.label, 'Setting')){
			gui[i].alpha += (mode - gui[i].alpha) / 4;
		}
	});
	
	game_controller.pause.left_interval -= 0 < game_controller.pause.left_interval;
	game_controller.pause.right_interval -= 0 < game_controller.pause.right_interval;
	
	if(mode){
		// todo something
		soundset[game_controller.environmental_se.water].audio.volume = 0.1 * game_controller.master_volume;
		game_controller.play_audio.max_volume = 0.3 * game_controller.master_volume;
		
		if(mouse.down){
			let left_dist = distance(mouse.x, mouse.y, convert_position(center + -100, 'x', canv), height / 2) < 30;
			let right_dist = distance(mouse.x, mouse.y, convert_position(center + 100, 'x', canv), height / 2) < 30;
			
			if(left_dist && !game_controller.pause.left_interval){
				_c.log('VOLUME DOWN');
				game_controller.pause.left_interval = 11;
				game_controller.master_volume -= (0 < game_controller.master_volume) * 0.1;
			}
			
			if(right_dist && !game_controller.pause.right_interval){
				_c.log('VOLUME UP');
				game_controller.pause.right_interval = 11;
				game_controller.master_volume += (1 > game_controller.master_volume) * 0.1;
			}
			
			game_controller.master_volume = round(game_controller.master_volume * 10) / 10;
			gui[game_controller.pause.volume_index].anime_frame = game_controller.master_volume * 10;
		}
	} else {
		soundset[game_controller.environmental_se.water].audio.volume = 0.8 * game_controller.master_volume;
		game_controller.play_audio.max_volume = 1 * game_controller.master_volume;
	}
}

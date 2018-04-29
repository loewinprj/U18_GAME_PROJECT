// variable
var canv, // canvas
    cont, // context
    size; // controller of canvas size

var game_controller; // main controller of somethings (important)

var width, height; // canvas width and height

var hitbox_datas; // stack hitboxes of costumes
var op_image_set; // to use background with op
var soundset; // BGM and SE stacks
var mapchips; // to use ground hit
var grounds; // grounds stacks

var anime_index; // stack indexes of animation objects (effects)
var effects; // stack objectes of effects
var gui; // stack gui objects

var pressed_keys; // user input keys
var player; // player object

var puzzle_datas; // puzzle stage datas
var board_datas; // puzzle boards

// constant

// Change rate of acceleration
const accel_speed = {
	human: 4.8,
	mouse: 3.7,
	hawk: 7.6
};

// Jump pwoer of player
const jump_power = {
	human: 9,
	mouse: 6,
	hawk: 21
};

const dec_force = 0.7; // The force of inertia

const fps = 1000 / 30; // for setinterval

const story = `月より船に乗りやりこし月の者たちが見えきたり。
船より落ちしは麗しききはに輝く白き帯なりき。
船より帯を落としし者は言ひき。
「必要とする者のあるとき、鳳凰がその者へと持ち去なむ」
かぐや姫が月に帰りてから一千年、
鳳凰が帯を見つけ、持ち去ぬるその時、
帯を持ち去にし鳳凰は三日三晩飛び続け、
ふと帯を落としき。
帯がこれまたやをらと落ちしは、
江戸より遠くかれし水井大名の屋敷の庭なりき。
帯に汚れは一つもつきたらざりしといふ。
その帯を使ひし者は動物に変身能ふ。
信じがたあり話なれど実際最前大名が猫まより
戻るところを目撃せるなれば信じるほかはなかりき。
そのときその話を聞ける家来の一人言ひき。
徳川の世を終はらするも可能なのならぬか、と。`.split('\n').map(e=>e.replace('\t', ''));

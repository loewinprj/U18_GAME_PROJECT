// variable
var canv, // canvas
    cont, // context
    size; // controller of canvas size

var game_controller; // to use change the game mode

var width, height; // canvas width and height

var soundset; // BGM and SE stacks
var mapchips; // to use ground hit
var grounds; // grounds stacks

var anime_index; // stack indexes of animation objects (effects)
var effects; // stack objectes of effects
var gui; // stack gui objects

var pressed_keys; // user input keys
var player; // player object

// constant
const accelSpeed = 2.3; // Change rate of acceleration
const jumpPower = 7; // Jump pwoer of player
const lowAccel = 0.7; // The force of inertia

const fps = 1000 / 30; // for setinterval

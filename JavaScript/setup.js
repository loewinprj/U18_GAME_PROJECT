// variable
var canv,
    cont,
    size; // canvas area , context and div element of control canvas size

var gameController; // to use change the game mode

var width, height; // canvas width and height

var soundset; // BGM and SE stacks
var mapchips; // to use ground hit
var grounds; // grounds stacks
var gui; // gui stacks

var pressedKeys; // user input keys
var player; // player object

// constant
const accelSpeed = 2.3; // Change rate of acceleration
const jumpPower = 7; // Jump pwoer of player
const lowAccel = 0.7; // The force of inertia

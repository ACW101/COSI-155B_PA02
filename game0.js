
var renderer;  // renderer
var scene, startCamera, camera, avatarCam;     //main scene
var endScene,loseScene, endCamera, endText; //end scene

// main scene objects
var avatar, npc;
var cone;
var clock;

// control object that store the states of avatar and npc
var controls =
	{fwd:false, bwd:false, left:false, right:false,
	 speed:10, fly:false, reset:false,
	 camera:startCamera};

var npcControls =
	{};

// object that store the states of main game
var gameState =
	{score:0, health:1, scene:'start', camera:'none'};


init();     // initialize scene
animate();  // start the animation loop!


// ============================ functions ================================

function init(){
    initPhysijs();
	initRenderer();
	initControls();

	createEndScene();
	createMainScene();
}


function createMainScene(){
	scene = initScene();
    // setup lighting
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	scene.add(light1);
	var light0 = new THREE.AmbientLight( 0xffffff,0.25);
	scene.add(light0);

    startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    startCamera.position.set(50, 50, 0);
    startCamera.lookAt(0,0,0);

	// create main camera
	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.set(0, 50, 0);
	camera.lookAt(0,0,0);

	// create the ground and the skybox and cone
	var ground = createGround('grass.png');
	var skybox = createSkyBox('sky.jpg',1);
	cone = createConeMesh(4,6);
	cone.position.set(10,3,7);
	scene.add(skybox);
	scene.add(ground);
	scene.add(cone);

	// create the avatar
	avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
	//avatar = createAvatar();
	//avatar.translateY(20);
	avatarCam.translateY(-4);
	avatarCam.translateZ(3);
	//scene.add(avatar);
	initMonkey();
	gameState.camera = startCamera;

	// create npc
	npc = createNPC();
	npc.translateY(10);
	scene.add(npc);

	addBalls();
	//playGameMusic();
}

function initMonkey() {
	var loader = new THREE.JSONLoader();
	loader.load("../models/suzanne.json",function(geometry, materials) {
		console.log("loading monkey");
		var amaterial = new THREE.MeshLambertMaterial( { color: 0x8B4513} );
		var material = new Physijs.createMaterial(amaterial,0.9,0.5);
		avatar = new Physijs.BoxMesh( geometry, material,99999);

		avatar.setDamping(0.1,0.1);
		avatar.castShadow = true;
		avatar.scale.set(3,3,3);

		avatar.castShadow=true;
		avatar.translateY(20);
		avatarCam.position.set(0,0.5,1);
		avatarCam.lookAt(0,2,10);
		avatar.add(avatarCam);
		scene.add(avatar);
	});
}


function createEndScene(){
	endScene = initScene();
	endText = createSkyBox('youwon.png',10);
	//endText.rotateX(Math.PI);
	endScene.add(endText);
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	endScene.add(light1);
	endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	endCamera.position.set(0,50,1);
	endCamera.lookAt(0,0,0);
	createLoseScene();
}
function createLoseScene(){
	loseScene = initScene();
	//endText.rotateX(Math.PI);
	var geometry = new THREE.PlaneGeometry( 200, 100);
	var texture = new THREE.TextureLoader().load( '../images/youlose.png' );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00, map:texture, side: THREE.DoubleSide} );
	var loseplane = new THREE.Mesh( geometry, material );
	loseplane.position.set(0,0,0);
	loseplane.rotation.set(4.8,0,0);
	loseScene.add(loseplane);
	var light1 = createPointLight();
	light1.position.set(0,200,20);
	loseScene.add(light1);
}
function animate() {

	requestAnimationFrame( animate );

	switch(gameState.scene) {
        case "start":
            renderer.render(scene, gameState.camera);
            updateCamera();
            break;
		case "youwon":
			endText.rotateY(0.005);
			renderer.render( endScene, endCamera );
			break;
		case "youlose":
			renderer.render(loseScene,endCamera);
			break;
		case "main":
			updateAvatar();
			updateNPC();
    		scene.simulate();
			if (gameState.camera!= 'none'){
				renderer.render( scene, gameState.camera );
			}
			break;

		default:
		  console.log("don't know the scene "+gameState.scene);

	}
	//draw heads up display ..
	var info = document.getElementById("info");
	info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '  Health: ' + gameState.health + '</div>';
}

function updateCamera() {
    var time = clock.getElapsedTime();
    startCamera.position.set(50* Math.sin(time / 10), 30, 50 * Math.cos(time / 10))
    startCamera.lookAt(0,0,0)
}


function initScene(){
	//scene = new THREE.Scene();
	var scene = new Physijs.Scene();
		return scene;
}


function initPhysijs(){
	Physijs.scripts.worker = '/libs/physijs_worker.js';
	Physijs.scripts.ammo = '/libs/ammo.js';
}
/*
	The renderer needs a size and the actual canvas we draw on
	needs to be added to the body of the webpage. We also specify
	that the renderer will be computing soft shadows
*/
function initRenderer(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight-50 );
	document.body.appendChild( renderer.domElement );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    renderer.setSize( window.innerWidth, window.innerHeight );
    startCamera.aspect = window.innerWidth / window.innerHeight;
	camera.aspect = window.innerWidth / window.innerHeight;
	avatarCam.aspect = window.innerWidth / window.innerHeight;
	endCamera.aspect = window.innerWidth / window.innerHeight;
    startCamera.updateProjectionMatrix();
	camera.updateProjectionMatrix();
	avatarCam.updateProjectionMatrix();
	endCamera.updateProjectionMatrix();
}


function initControls(){
	// here is where we create the eventListeners to respond to operations
	//create a clock for the time-based animation ...
	clock = new THREE.Clock();
	clock.start();

	window.addEventListener( 'keydown', keydown);
	window.addEventListener( 'keyup',   keyup );
}

function keydown(event){
	console.log("Keydown:"+event.key);
	//console.dir(event);
	// first we handle the "play again" key in the "youwon" scene
	if (gameState.scene == 'youwon' && event.key=='r') {
		gameState.scene = 'main';
		gameState.score = 0;
		addBalls();
		return;
	}
	if (gameState.scene == 'youlose' && event.key=='r') {
		gameState.scene = 'main';
		gameState.score = 0;
		gameState.health = 10;
		return;
	}
	// this is the regular scene
	switch (event.key){
		// change the way the avatar is moving
		case "w": controls.fwd = true;  break;
		case "s": controls.bwd = true; break;
		case "a": controls.left = true; break;
		case "d": controls.right = true; break;
		//case "r": controls.up = true; break;
		//case "f": controls.down = true; break;
		//case "m": controls.speed = 30; break;
		//case " ": controls.fly = true; break;
		case "h": controls.reset = true; break;

		// switch cameras
		case "1": gameState.camera = camera; break;
		case "2": gameState.camera = avatarCam; break;
        case "p":
            if (gameState.scene == "start") {
                document.getElementById("startBlock").style.display = "none";
                gameState.scene = "main";
                gameState.camera = avatarCam;
            }
            break;

		// move the camera around, relative to the avatar
		case "ArrowLeft": avatarCam.translateY(1);break;
		case "ArrowRight": avatarCam.translateY(-1);break;
		case "ArrowUp": avatarCam.translateZ(-1);break;
		case "ArrowDown": avatarCam.translateZ(1);break;
		case "q": avatarCam.rotation.y -= Math.PI/10;break;
		case "e": avatarCam.rotation.y += Math.PI/10;break;
	}
}

function keyup(event){
	//console.log("Keydown:"+event.key);
	//console.dir(event);
	switch (event.key){
		case "w": controls.fwd   = false;  break;
		case "s": controls.bwd   = false; break;
		case "a": controls.left  = false; break;
		case "d": controls.right = false; break;
		//case "r": controls.up    = false; break;
		//case "f": controls.down  = false; break;
		//case "m": controls.speed = 10; break;
		//case " ": controls.fly = false; break;
		case "h": controls.reset = false; break;
	}
}

function updateAvatar(){
	//"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"
	var forward = avatar.getWorldDirection();

	if (controls.fwd){
		avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
	} else if (controls.bwd){
		avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
	} else {
		var velocity = avatar.getLinearVelocity();
		velocity.x=velocity.z=0;
		avatar.setLinearVelocity(velocity); //stop the xz motion
	}

	if (controls.fly){
	  avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
	}

	if (controls.left){
		avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
	} else if (controls.right){
		avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
	}

	if (controls.reset){
	  avatar.__dirtyPosition = true;
	  avatar.position.set(40,10,40);
	}
}

function updateNPC(){

	if (npc.position.distanceTo(avatar.position) < 15) {
		gameState.health -= 1;
		if(gameState.health <= 0){
			gameState.scene='youlose';
		}
		npc.__dirtyPosition = true;
		npc.position.set(-40+randN(80),5,-40+randN(80));
		if (npc.position.distanceTo(avatar.position) < 50) {
			updateNPC();
		}
	} else if (npc.position.distanceTo(avatar.position) < 50) {
		var forward = avatar.position;
		forward.y = npc.position.y/2;
		npc.lookAt(forward);
		npc.__dirtyPosition = true;
		var f = npc.getWorldDirection().normalize();
		f.y = 0;
		npc.setLinearVelocity(f.multiplyScalar(5));

	}
}

function randN(n){
	return Math.random()*n;
}


function addBalls(){
	var numBalls = 3;

	for(i=0;i<numBalls;i++){
		var ball = createBall();
		ball.position.set(randN(20)+15,30,randN(20)+15);
		scene.add(ball);

		ball.addEventListener( 'collision',
			function( other_object, relative_velocity, relative_rotation, contact_normal ) {
				if (other_object==cone){
					console.log("ball "+i+" hit the cone");
					soundEffect('good.wav');
					gameState.score += 1;  // add one to the score
					if (gameState.score==numBalls) {
						gameState.scene='youwon';
					}
					// make the ball drop below the scene ..
					// threejs doesn't let us remove it from the scene...
					this.position.y = this.position.y - 100;
					this.__dirtyPosition = true;
				}
			}
		)
	}
}

function playGameMusic(){
	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.05 );
		sound.play();
	});
}


function soundEffect(file){
	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( '/sounds/'+file, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( false );
		sound.setVolume( 0.5 );
		sound.play();
	});
}

function createPointLight(){
	var light;
	light = new THREE.PointLight( 0xffffff);
	light.castShadow = true;
	//Set up shadow properties for the light
	light.shadow.mapSize.width = 2048;  // default
	light.shadow.mapSize.height = 2048; // default
	light.shadow.camera.near = 0.5;       // default
	light.shadow.camera.far = 500      // default
	return light;
}


function createBoxMesh(color){
	var geometry = new THREE.BoxGeometry( 1, 1, 1);
	var material = new THREE.MeshLambertMaterial( { color: color} );
	mesh = new Physijs.BoxMesh( geometry, material );
	//mesh = new Physijs.BoxMesh( geometry, material,0 );
	mesh.castShadow = true;
	return mesh;
}


function createGround(image){
	// creating a textured plane which receives shadows
	var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
	var texture = new THREE.TextureLoader().load( '../images/'+image );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 15, 15 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	//var mesh = new THREE.Mesh( geometry, material );
	var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

	mesh.receiveShadow = true;
	mesh.rotateX(Math.PI/2);
	return mesh
	// we need to rotate the mesh 90 degrees to make it horizontal not vertical
}


function createSkyBox(image,k){
	// creating a textured plane which receives shadows
	var geometry = new THREE.SphereGeometry( 80, 80, 80 );
	var texture = new THREE.TextureLoader().load( '../images/'+image );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( k, k );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	//var mesh = new THREE.Mesh( geometry, material );
	var mesh = new THREE.Mesh( geometry, material, 0 );
	mesh.receiveShadow = false;
	return mesh
	// we need to rotate the mesh 90 degrees to make it horizontal not vertical
}


function createAvatar(){
	//var geometry = new THREE.SphereGeometry( 4, 20, 20);
	var geometry = new THREE.BoxGeometry( 5, 5, 6);
	var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	//var mesh = new THREE.Mesh( geometry, material );
	var mesh = new Physijs.BoxMesh( geometry, pmaterial );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;

	avatarCam.position.set(0,4,0);
	avatarCam.lookAt(0,4,10);
	mesh.add(avatarCam);

	return mesh;
}


function createNPC() {
	var geometry = new THREE.BoxGeometry( 3, 3, 3);
	var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	pmaterial.visible = false;
	var mesh = new Physijs.BoxMesh( geometry, pmaterial, 99999);


	var objloader = new THREE.OBJLoader();
	//objloader.setMaterials(new THREE.MeshLambertMaterial( { color: 0xffffff} ) );
	objloader.load('../models/stormtrooper.obj', function (loadedMesh) {

		loadedMesh.scale.set(5.0, 5.0, 5.0);
		loadedMesh.receiveShadow = true;
		mesh.add(loadedMesh)

	});

	mesh.setDamping(0.1,0.1);
	mesh.__dirtyPosition = true;
	mesh.position.set(40,0,40);
	mesh.castShadow = true;

	return mesh;

}


function createConeMesh(r,h){
	var geometry = new THREE.ConeGeometry( r, h, 32);
	var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1, 1 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
	mesh.castShadow = true;
	return mesh;
}


function createBall(){
	//var geometry = new THREE.SphereGeometry( 4, 20, 20);
	var geometry = new THREE.SphereGeometry( 1, 16, 16);
	var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
	var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
	var mesh = new Physijs.BoxMesh( geometry, material );
	mesh.setDamping(0.1,0.1);
	mesh.castShadow = true;
	return mesh;
}

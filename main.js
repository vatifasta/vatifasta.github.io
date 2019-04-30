let canvas = document.getElementById('canvas');
//creating scene and camera
let scene= new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000);
let renderer = new THREE.WebGLRenderer(canvas);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);//разобраться что тут происходит
//Game over popup
let gameOverUIPopup = document.getElementById('gameOver');
scene.add(gameOverUIPopup);

//Gameplay Variables
let cylinderRadius = 1 ;
let sphereRadius = 0.15;
let mainBallYPosition = cylinderRadius+sphereRadius+0.1;
let gamePlaying;
let score;
let skittlesCount = 5;
let negativeObstaclesCount = 5;
let angle;
let mouseX;
let deltaX = 0;
let mouseDown = false;
let clientX = 0;
let skittlePool = [];
let skittlePoolAngles = [];
let negativeObstaclesPool = [];
let negativeObstaclePoolAngles = [];
let obstaclesSpeed = 0.05;


//resizing
window.addEventListener('resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
});
//creating main Cylinder

var cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius,cylinderRadius,35,20);
var cylinderMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
scene.add( cylinder );
cylinder.rotation.x = Math.PI/2;

//creating main ball

var ballGeometry = new THREE.SphereGeometry(sphereRadius*2,15,15);
var ballMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true});
var mainBall = new THREE.Mesh(ballGeometry, ballMaterial);
mainBall.position.set(0,mainBallYPosition,-1.5);
let mainBallPosition = new THREE.Vector3(0, mainBallYPosition, -1.5);
scene.add(mainBall);
camera.position.y=1.5;

camera.rotation.x = -0.17;
//Axes
var axes = new THREE.AxesHelper(5);

scene.add( axes );
//grid
gridHelper = new THREE.GridHelper(50,100);
gridHelper.position.set(0,0,0);
scene.add( gridHelper );

//controls Orbit

// controls = new THREE.OrbitControls(camera, renderer.domElement);
//
// scene.add(controls);

//creating skittle
let createSkittle = function(i){
    let sGeometry = new THREE.CylinderGeometry(0.2,0.2,1,15);
    let sMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe: true } );
    skittlePool[i] = new THREE.Mesh( sGeometry, sMaterial );
    skittlePoolAngles[i] = Math.random()*2*Math.PI;
    let randomXPosition = -Math.sin(skittlePoolAngles[i])*(cylinderRadius+0.5);
    let randomYPosition = Math.cos(skittlePoolAngles[i])*(cylinderRadius+0.5);
    let randomZPosition = Math.random()*(-15)-5;
    skittlePool[i].position.set(randomXPosition,randomYPosition,randomZPosition);
    skittlePool[i].rotation.z = skittlePoolAngles[i];
    scene.add(skittlePool[i]);

}
//deleting skittles
let deletingSkittle = function(i){
    skittlePool[i].remove();
    scene.remove(skittlePool[i]);
}
//creating Negative Objects
let createNegativeObject = function(i){
    let negativeObjectGeometry = new THREE.SphereGeometry(0.2,8,8);
    let negativeObjectMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    negativeObstaclesPool[i] = new THREE.Mesh( negativeObjectGeometry, negativeObjectMaterial );
    negativeObstaclePoolAngles[i] = Math.random()*2*Math.PI;
    let randomXPosition = -Math.sin(negativeObstaclePoolAngles[i])*(cylinderRadius+0.1);
    let randomYPosition = Math.cos(negativeObstaclePoolAngles[i])*(cylinderRadius+0.1);
    let randomZPosition = Math.random()*(-15)-5;
    negativeObstaclesPool[i].position.set(randomXPosition,randomYPosition,randomZPosition);
    negativeObstaclesPool[i].rotation.z = negativeObstaclePoolAngles[i];
    scene.add(negativeObstaclesPool[i]);
}
//deleting negative objects
let deletingNegativeObject = function(i){
    negativeObstaclesPool[i].remove();
    scene.remove(negativeObstaclesPool[i]);
}

//Initializing function
let Initialize = function() {
    //creating skittles
    obstaclesSpeed = 0.05;
    for(let i =0;i<skittlesCount;i++)
    {
        if(skittlePool[i]) {
            deletingSkittle(i);
        }
        createSkittle(i);
    }
    //creating negative objects
    for(let i =0;i<negativeObstaclesCount;i++)
    {
        if(negativeObstaclesPool[i]) {
            deletingNegativeObject(i);
        }
        createNegativeObject(i);
    }
    score = 0;
    angle = 0;
    gameOverUIPopup.style.visibility = "hidden";
    console.log("initialize");
}
Initialize();



//Controls
RotateCylinder = function(e) {
    mouseX = e.clientX;
    e.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMoving, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    document.addEventListener( 'touchmove', onDocumentMouseMoving, false );
    document.addEventListener( 'touchend', onDocumentMouseUp, false );
    document.addEventListener( 'touchcancel', onDocumentMouseOut, false );
    mouseDown = true;
};
document.addEventListener('mousedown', RotateCylinder);
document.addEventListener('touchstart', RotateCylinder);
onDocumentMouseMoving = function(e){
    clientX = e.clientX;
    deltaX = e.clientX - mouseX;
    mouseX = e.clientX;
}
onDocumentMouseUp = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', onDocumentMouseMoving, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    document.addEventListener( 'touchmove', onDocumentMouseMoving, false );
    document.addEventListener( 'touchend', onDocumentMouseUp, false );
    document.addEventListener( 'touchcancel', onDocumentMouseOut, false );
};
onDocumentMouseOut = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', onDocumentMouseMoving, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
    document.addEventListener( 'touchmove', onDocumentMouseMoving, false );
    document.addEventListener( 'touchend', onDocumentMouseUp, false );
    document.addEventListener( 'touchcancel', onDocumentMouseOut, false );


};
let exit = false;

let GameOver = function(){
    exit = true;
    cancelAnimationFrame(gamePlaying);
    console.log('gameover');
}
//game Logic
//let rotateAngle = null;



let Update=function(){
    obstaclesSpeed+=0.00001;
    mainBall.rotation.x+=0.1;
    for(let i =0; i<skittlesCount; i++)
    {
        skittlePool[i].position.z+=obstaclesSpeed;
        if(skittlePool[i].position.z>0)
        {
            deletingSkittle(i);
            createSkittle(i);
        }
        let skittlePosition = new THREE.Vector3();
        skittlePosition.setFromMatrixPosition(skittlePool[i].matrixWorld);
        if(skittlePosition.distanceTo(mainBallPosition)<0.5)
        {
            score++;
            deletingSkittle(i);
            createSkittle(i);
        }
    }
    for(let i=0; i<negativeObstaclesCount;i++)
    {
        negativeObstaclesPool[i].position.z+= obstaclesSpeed;
        //написать удаление негативных объектов
        if(negativeObstaclesPool[i].position.z>0) {
            deletingNegativeObject(i);
            createNegativeObject(i);
        }
        let negativeObstaclePosition = new THREE.Vector3();
        negativeObstaclePosition.setFromMatrixPosition(negativeObstaclesPool[i].matrixWorld);
        if(negativeObstaclePosition.distanceTo(mainBallPosition)<0.5)
        {
            gameOverUIPopup.style.visibility = "visible";
            GameOver();
        }
    }
    if(Math.abs(deltaX)>1.4) {
        angle = deltaX/500;
        cylinder.rotation.y -= Math.sin(angle);
        //moving skittles
        for(let i =0; i<skittlesCount; i++)
        {
            let rotateAngle = skittlePoolAngles[i]-angle;
            skittlePool[i].position.x  = -Math.sin(rotateAngle)*(cylinderRadius+0.5);
            skittlePool[i].position.y = Math.cos(rotateAngle)*(cylinderRadius+0.5);
            skittlePool[i].rotation.z  = (skittlePoolAngles[i]-angle);
            skittlePoolAngles[i] = skittlePoolAngles[i] - angle;
        }
        //moving negative obstacles
        for(let i=0; i<negativeObstaclesCount;i++)
        {
            let rotateAngle = negativeObstaclePoolAngles[i]-angle;
            negativeObstaclesPool[i].position.x  = -Math.sin(rotateAngle)*(cylinderRadius+0.1);
            negativeObstaclesPool[i].position.y = Math.cos(rotateAngle)*(cylinderRadius+0.1);
            negativeObstaclesPool[i].rotation.z  = (negativeObstaclePoolAngles[i]-angle);
            negativeObstaclePoolAngles[i] = negativeObstaclePoolAngles[i] - angle;
        }
    }
};

//draw Scene
var Render = function(e){

    renderer.render(scene,camera);
};



//run game loop(update, render, repeat)
var GameLoop = function()
{

    //document.addEventListener('onMouseDown', RotateCylinder);
    Update();
    Render();
    if(!exit) {
        gamePlaying = requestAnimationFrame(GameLoop);

    }

};
GameLoop();
let Restart = function(){
    exit = false;

    Initialize();
    requestAnimationFrame(GameLoop);

}
let restartButton = document.getElementById("restartButton");
restartButton.addEventListener('click', Restart);

let canvas = document.getElementById('canvas');
//creating scene and camera
let scene= new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,10000);
let renderer = new THREE.WebGLRenderer(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
let pinsCount = 10;
let negativeObstaclesCount = 5;
let angle;
let mouseX;
let deltaX = 0;
let mouseDown = false;
let pinPool = [];
let pinPoolAngles = [];
let negativeObstaclesPool = [];
let negativeObstaclePoolAngles = [];
let obstaclesSpeed = 0.05;
let sensitivity=300;
let mobileSensitivity =70;

//resizing
window.addEventListener('resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
});
//creating main Cylinder
let cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius,cylinderRadius,35,60);
let cylinderTexture = new THREE.TextureLoader().load("./images/floor.png");
cylinderTexture.wrapT = THREE.RepeatWrapping;
cylinderTexture.wrapS =THREE.RepeatWrapping;
cylinderTexture.repeat.set(2,2);
var cylinderMaterial = new THREE.MeshLambertMaterial( { map: cylinderTexture } );//

var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
scene.add( cylinder );
cylinder.rotation.x = Math.PI/2;

//creating main ball

let ballGeometry = new THREE.SphereGeometry(sphereRadius*2,64,64);
let mainBallTexture = new THREE.TextureLoader().load("./images/ball.png");
let ballMaterial = new THREE.MeshLambertMaterial({color:0xffffff});//map: mainBallTexture
let mainBall = new THREE.Mesh(ballGeometry, ballMaterial);
mainBall.position.set(0,mainBallYPosition,-1.5);
let mainBallPosition = new THREE.Vector3(0, mainBallYPosition, -1.5);
scene.add(mainBall);
camera.position.y=2.3;

camera.rotation.x = -0.6;
//Axes
let axes = new THREE.AxesHelper(5);

scene.add( axes );
//grid
gridHelper = new THREE.GridHelper(50,100);
gridHelper.position.set(0,0,0);
scene.add( gridHelper );

//creating lights

let lighting = new THREE.DirectionalLight(0xffffff, 1);
lighting.position.set(0,1,1);
lighting.rotation.set(-1,-0.6,0.6);
//let lightningPoint = new THREE.PointLight(0xffffff, 1, 1,);
scene.add(lighting);
//controls Orbit

// controls = new THREE.OrbitControls(camera, renderer.domElement);
//
// scene.add(controls);

//creating skittle
let createPin = function(i){

    pinPoolAngles[i] = Math.random()*2*Math.PI;
    let randomXPosition = -Math.sin(pinPoolAngles[i])*(cylinderRadius);
    let randomYPosition = Math.cos(pinPoolAngles[i])*(cylinderRadius);
    let randomZPosition = Math.random()*(-15)-7;
    let sMaterial = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
    let modelLoaded= function(){

        scene.add(pinPool[i]);
    };
    let manager = new THREE.LoadingManager(modelLoaded);
    let loader = new THREE.OBJLoader(manager);
    pinPool[i] = new THREE.Mesh();

    loader.load("./models/bowlPin.obj",function(object){
        object.position.set(randomXPosition,randomYPosition,randomZPosition);
        console.log(randomXPosition,randomYPosition,randomZPosition);
        object.rotation.z=pinPoolAngles[i];
        object.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = sMaterial;
            }
        } );
        pinPool[i] = object;
        //scene.add(pinPool[i]);

    })

   // let sGeometry = new THREE.CylinderGeometry(0.2,0.2,1,15);

    //pinPool[i] = new THREE.Mesh( sGeometry, sMaterial );
    //pinPool[i].position.set(randomXPosition,randomYPosition,randomZPosition);
    /*console.log(pinPool[i].position);
    pinPool[i].rotation.z = pinPoolAngles[i];*/


}
//deleting skittles
let deletingPin = function(i){
    pinPool[i].remove();
    scene.remove(pinPool[i]);
}
//creating Negative Objects
let createNegativeObject = function(i){
    let negativeObjectGeometry = new THREE.SphereGeometry(0.2,8,8);
    let negativeObjectMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    negativeObstaclesPool[i] = new THREE.Mesh( negativeObjectGeometry, negativeObjectMaterial );
    negativeObstaclePoolAngles[i] = Math.random()*2*Math.PI;
    let randomXPosition = -Math.sin(negativeObstaclePoolAngles[i])*(cylinderRadius+0.05);
    let randomYPosition = Math.cos(negativeObstaclePoolAngles[i])*(cylinderRadius+0.05);
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
    for(let i =0;i<pinsCount;i++)
    {
        if(pinPool[i]) {
            deletingPin(i);
        }
        createPin(i);
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
RotateCylinderWithMouse = function(e) {
    mouseX = e.clientX;
   // e.preventDefault();
    document.addEventListener( 'mousemove', OnDocumentMouseMoving, false );
    document.addEventListener( 'mouseup', OnDocumentMouseUp, false );
    document.addEventListener( 'mouseout', OnDocumentMouseOut, false );

    mouseDown = true;
};
RotateCylinderWithTouch = function(e){
    mouseX = e.touches[0].clientX;
    document.addEventListener( 'touchmove', OnDocumentTouchMoving, false );
    document.addEventListener( 'touchend', OnDocumentTouchEnd, false );
    document.addEventListener( 'touchcancel', OnDocumentTouchEnd, false );
};
document.addEventListener('mousedown', RotateCylinderWithMouse);
document.addEventListener('touchstart', RotateCylinderWithTouch);
//Move with Mouse
OnDocumentMouseMoving = function(e){
    deltaX = e.clientX - mouseX;
    deltaX/=sensitivity;
    mouseX = e.clientX;
}
//Move with touch
OnDocumentTouchMoving = function(e){
    deltaX = e.touches[0].clientX - mouseX;
    deltaX/=mobileSensitivity;
    mouseX = e.touches[0].clientX;
    console.log("mobile move");

}
OnDocumentTouchEnd = function()
{
   // deltaX=0;
    document.addEventListener( 'touchmove', OnDocumentTouchMoving, false );
    document.addEventListener( 'touchend', OnDocumentMouseUp, false );
    document.addEventListener( 'touchcancel', OnDocumentMouseOut, false );
}
OnDocumentMouseUp = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', OnDocumentMouseMoving, false );
    document.removeEventListener( 'mouseup', OnDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', OnDocumentMouseOut, false );

};
onDocumentTouchCancelled = function(){

}
OnDocumentMouseOut = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', OnDocumentMouseMoving, false );
    document.removeEventListener( 'mouseup', OnDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', OnDocumentMouseOut, false );
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
    mainBall.rotation.x-=0.1;
    cylinderTexture.offset.y-=0.005;
    for(let i =0; i<pinsCount; i++)
    {
        pinPool[i].position.z+=obstaclesSpeed;
        if(pinPool[i].position.z>0)
        {
            deletingPin(i);
            createPin(i);
        }
        let skittlePosition = new THREE.Vector3();
        skittlePosition.setFromMatrixPosition(pinPool[i].matrixWorld);
        if(skittlePosition.distanceTo(mainBallPosition)<0.52)
        {
            score++;
            deletingPin(i);
            createPin(i);
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
        if(negativeObstaclePosition.distanceTo(mainBallPosition)<0.52)
        {
            gameOverUIPopup.style.visibility = "visible";
            GameOver();
        }
    }
    if(Math.abs(deltaX)>(1.4/500)) {
        angle = deltaX;
        cylinder.rotation.y -= Math.sin(angle);
        //moving skittles
        for (let i = 0; i < pinsCount; i++) {
            let rotateAngle = pinPoolAngles[i] - angle;
            pinPool[i].position.x = -Math.sin(rotateAngle) * (cylinderRadius);
            pinPool[i].position.y = Math.cos(rotateAngle) * (cylinderRadius);
            pinPool[i].rotation.z = (pinPoolAngles[i] - angle);
            pinPoolAngles[i] = pinPoolAngles[i] - angle;
        }
        //moving negative obstacles
        for (let i = 0; i < negativeObstaclesCount; i++) {
            let rotateAngle = negativeObstaclePoolAngles[i] - angle;
            negativeObstaclesPool[i].position.x = -Math.sin(rotateAngle) * (cylinderRadius + 0.05);
            negativeObstaclesPool[i].position.y = Math.cos(rotateAngle) * (cylinderRadius + 0.05);
            negativeObstaclesPool[i].rotation.z = (negativeObstaclePoolAngles[i] - angle);
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

//crating scene and camera
let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let scene= new THREE.Scene();
scene.fog = new THREE.Fog(0x85E0E0, 0.1, 20);
let backgroundColor = new THREE.Color(0x85E0E0);
scene.background = backgroundColor;

let camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1,15);
camera.position.y=2.3;

camera.rotation.x = -0.6;

let renderer = new THREE.WebGLRenderer(canvas);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);//разобраться что тут происходит

//creating lights

let lighting = new THREE.DirectionalLight(0xffffff, 1);
lighting.position.set(0,0.9,1);
lighting.rotation.set(-1,-0.5,0.6);
scene.add(lighting);

//UI
let gameOverUIPopup = document.getElementById('gameOver');
scene.add(gameOverUIPopup);
gameOverUIPopup.style.visibility = 'hidden';
let loadingUIPopup = document.getElementById('loading');
scene.add(loadingUIPopup);
//Gameplay Variables
let cylinderRadius = 1 ;
let sphereRadius = 0.15;
let mainBallYPosition = cylinderRadius+sphereRadius+0.1;
let gamePlaying;


let angle;
let mouseX;
let deltaX = 0;


//pins variables
let pinsCount = 10;
let pinPool = [];
let pinPoolAngles = [];
let pinPoolPosition = [];

//negative obstacles variables
let negativeObstaclesPool = [];
let negativeObstaclePoolAngles = [];
let negativeObstaclesCount = 10;
let negativeObstaclePoolPositon = [];

//speed obstacles
let obstaclesSpeed = 0.05;
let addingSpeed = 0.0001;
let addingSpriteSpeed = 0.003;
let mainBallRotation = -0.1;
let addingMainBallRotation = -0.0001;
//sensivity variables
let sensitivity=300;
let mobileSensitivity =70;

//score variables
let score;
let scoreUI = document.getElementById("score");

//resizing
window.addEventListener('resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();//что это разобраться
});


//creating main Cylinder
let cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius,cylinderRadius,35,60);
let cylinderTexture = new THREE.TextureLoader().load("./images/floor.png");
cylinderTexture.wrapT = THREE.RepeatWrapping;
cylinderTexture.wrapS =THREE.RepeatWrapping;
cylinderTexture.repeat.set(2,2);
var cylinderMaterial = new THREE.MeshToonMaterial( { map: cylinderTexture } );//
var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
scene.add( cylinder );
cylinder.rotation.x = Math.PI/2;

//creating main ball

let ballGeometry = new THREE.SphereGeometry(sphereRadius*2,64,64);
let mainBallTexture = new THREE.TextureLoader().load("./images/ball.png");
let ballMaterial = new THREE.MeshToonMaterial({map: mainBallTexture});//map: mainBallTexture
let mainBall = new THREE.Mesh(ballGeometry, ballMaterial);
mainBall.position.set(0,mainBallYPosition,-1.5);
let mainBallPosition = new THREE.Vector3(0, mainBallYPosition, -1.5);
scene.add(mainBall);

//Axes
//let axes = new THREE.AxesHelper(5);

//scene.add( axes );
//grid
// gridHelper = new THREE.GridHelper(50,100);
// gridHelper.position.set(0,0,0);
// scene.add( gridHelper );


//controls Orbit

// controls = new THREE.OrbitControls(camera, renderer.domElement);
//
// scene.add(controls);

//creating skittle
let loading = true;
let modelsLoaded = 0;
let createPin = function(i){
    while(1) {
        pinPoolAngles[i] = Math.random() * 2 * Math.PI;
        var randomXPosition = -Math.sin(pinPoolAngles[i])*(cylinderRadius);
        var randomYPosition = Math.cos(pinPoolAngles[i])*(cylinderRadius);
        var randomZPosition = Math.random()*(-20)-15;
        pinPoolPosition[i] = new THREE.Vector3(randomXPosition,randomYPosition,randomZPosition);
        for (let j = 0; j < pinsCount; j++) {
            if(pinPoolPosition[j])
            {
                if(Math.abs(pinPoolPosition[i].distanceTo(pinPoolPosition[j])<1.5)&&i!=j)
                {
                    continue;
                }
            }
        }
        for (let j = 0; j < negativeObstaclesCount; j++) {
            if(negativeObstaclesPool[j])
            {
                if(Math.abs(pinPoolPosition[i].distanceTo(negativeObstaclePoolPositon[j])<1.5)&&i!=j)
                {
                    continue;
                }
            }
        }
        break;
    }

    let sMaterial = new THREE.MeshToonMaterial( { color: 0xffffff } );
    let manager = new THREE.LoadingManager();
    let loader = new THREE.OBJLoader(manager);
    pinPool[i] = new THREE.Mesh();

    loader.load("./models/bowlPin.obj",function(object){
        object.position.set(randomXPosition,randomYPosition,randomZPosition);
        object.rotation.z=pinPoolAngles[i];
        object.traverse( function( child ) {//разобрать с traverse
            if ( child instanceof THREE.Mesh ) {//и с этим тоже
                child.material = sMaterial;
            }

        } );
        pinPool[i] = object;
        scene.add(pinPool[i]);
        modelsLoaded++;
    })

}
//deleting skittles
let deletingPin = function(i){
    scene.remove(pinPool[i]);
}
//creating Negative Objects
let createNegativeObject = function(i){
    while(1) {
        negativeObstaclePoolAngles[i] = Math.random()*2*Math.PI;
        var randomXPosition = -Math.sin(negativeObstaclePoolAngles[i])*(cylinderRadius+0.05);
        var randomYPosition = Math.cos(negativeObstaclePoolAngles[i])*(cylinderRadius+0.05);
        var randomZPosition = Math.random()*(-20)-15;
        negativeObstaclePoolPositon[i] = new THREE.Vector3(randomXPosition,randomYPosition,randomZPosition);
        for (let j = 0; j < negativeObstaclesCount; j++) {
            if(negativeObstaclesPool[j])
            {
                if(Math.abs(negativeObstaclePoolPositon[i].distanceTo(negativeObstaclePoolPositon[j])<2)&&i!=j)
                {
                    continue;
                }
            }
        }
        break;
    }
    let negativeObjectGeometry = new THREE.SphereGeometry(0.2,32,32);
    let negativeObjectMaterial = new THREE.MeshToonMaterial( { color: 0xff0000 } );
    negativeObstaclesPool[i] = new THREE.Mesh( negativeObjectGeometry, negativeObjectMaterial );
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
    addingSpriteSpeed = 0.003;
    mainBallRotation=-0.1;
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
    scoreUI.innerText = score;
}
Initialize();



//Controls
RotateCylinderWithMouse = function(e) {
    mouseX = e.clientX;
    document.addEventListener( 'mousemove', OnDocumentMouseMoving);
    document.addEventListener( 'mouseup', OnDocumentMouseUp);
    document.addEventListener( 'mouseout', OnDocumentMouseOut);
};
RotateCylinderWithTouch = function(e){
    mouseX = e.touches[0].clientX;
    document.addEventListener( 'touchmove', OnDocumentTouchMoving);
    document.addEventListener( 'touchend', OnDocumentTouchEnd);
    document.addEventListener( 'touchcancel', OnDocumentTouchEnd);
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
}
OnDocumentTouchEnd = function()
{
    deltaX=0;
    document.addEventListener( 'touchmove', OnDocumentTouchMoving);
    document.addEventListener( 'touchend', OnDocumentTouchEnd);
    document.addEventListener( 'touchcancel', onDocumentTouchCancelled);
}
OnDocumentMouseUp = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', OnDocumentMouseMoving);
    document.removeEventListener( 'mouseup', OnDocumentMouseUp);
    document.removeEventListener( 'mouseout', OnDocumentMouseOut);
};
onDocumentTouchCancelled = function(){
    deltaX=0;
    document.addEventListener( 'touchmove', OnDocumentTouchMoving);
    document.addEventListener( 'touchend', OnDocumentTouchEnd);
    document.addEventListener( 'touchcancel', onDocumentTouchCancelled);
}
OnDocumentMouseOut = function(e){
    deltaX=0;
    document.removeEventListener( 'mousemove', OnDocumentMouseMoving);
    document.removeEventListener( 'mouseup', OnDocumentMouseUp);
    document.removeEventListener( 'mouseout', OnDocumentMouseOut);
};
let exit = false;

let GameOver = function(){
    gameOverUIPopup.style.visibility = "visible";

    exit = true;
    cancelAnimationFrame(gamePlaying);
}
//game Logic
let Update=function(){
    obstaclesSpeed+=addingSpeed;
    mainBallRotation +=addingMainBallRotation;
    mainBall.rotation.x+=mainBallRotation;
    addingSpriteSpeed+=0.000005;
    cylinderTexture.offset.y-=addingSpriteSpeed;

    for(let i =0; i<pinsCount; i++)
    {
        pinPool[i].position.z+=obstaclesSpeed;
        if(pinPool[i].position.z>0)
        {
            deletingPin(i);
            createPin(i);
        }
        if(pinPool[i].position.distanceTo(mainBallPosition)<0.52)
        {
            score++;
            scoreUI.innerText = score;
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
            GameOver();
        }
    }
    if(Math.abs(deltaX)>(0.004)) {
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
    console.log(modelsLoaded);
    if(modelsLoaded == pinsCount)
    {
        loadingUIPopup.style.visibility = 'hidden';
        loading = false;

    }
    if(!loading) {
        Update();
        Render();
    }
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

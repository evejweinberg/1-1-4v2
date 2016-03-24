// global VIDEO variables
var video, videoImage, videoImageContext, videoTexture, hemiLight;

// GLOBAL THREE.JS VARIABLES
var container, scene, camera, renderer, controls, alon;

//GLOBAL VARS FOR CONTROL AND GUI
// var keyboard = new THREEx.KeyboardState();
var gui;
var radExpand = 400;
var camStartZ = 2000;
var camZMin = -2500;
var camZMax = 2500;
var camSpeed = -1;
var cubeCamera;
var zRotValue = 0
var zRotOn = false;
var r = 255;
var g = 0;
var b = 0;
var gmapped = 0;

var bmapped = 0;
var rmapped = 0;
var color;
var frontLight;

//------- 3D MODEL CONTROL ----------

var objName = '../obj/Diamond.obj';
var mtlName = '../obj/cityscape/city_test.mtl';
var modelTexture = '../textures/Diamond_2k.png';

var angle = 0.001;
var modelScale = 1;
var particles, geometry, materials = [],
    parameters, i, h, color, size;
var keyboard = new THREEx.KeyboardState();




//---- WEBCAM VIDEO STREAM -----

//Webcam attributes and style
//grab the video object and assign it a width and height
video = document.getElementById('monitor');
video.width = 1400;
video.height = 1050;
//video.rotate(180);
// video.style.visibility = "visible";



//------ VIDEO CANVAS --------------
//grab the canvas element and give it the same width and height
//video assigned to a canvas
videoImage = document.getElementById('videoImage');
videoImage.height = video.height;
videoImage.width = video.height;
videoImageContext = videoImage.getContext('2d');

//--------------------

//create variable to offset camera on video texture
var videoXpos = ((videoImage.width - video.width) / 2) + 59;
var videoYpos = 0;
var videoZoom = 1; //this was 1.07


// (set up)
init();

// (draw)               
animate();

/// ----------FUNCTIONS-----------


// -----------init----------------
function init() {

    BuildSkeleton();

    // EVENTS
    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

    AddLights();





    // CREATE VIDEO 3D TEXTURE
    videoTexture = new THREE.Texture(videoImage);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;

    ///ADDING MULTI LAYER SHADER TEXTURE TO CALIBRATOR SCREEN
    var vertShader = document.getElementById('vertex_shh').innerHTML;
    var fragShader = document.getElementById('fragment_shh').innerHTML;

    var attributes = {}; // custom attributes

    //var tex1 = videoTexture;
    //var tex2 = THREE.ImageUtils.loadTexture("textures/Alon_head_tex_0.png", {}, function() { renderer.render(scene, camera);});

    var uniforms = { // custom uniforms (your textures)

        tOne: { type: "t", value: THREE.ImageUtils.loadTexture(modelTexture) },
        tSec: { type: "t", value: videoTexture }

    };

    var material_shh = new THREE.ShaderMaterial({

        uniforms: uniforms,
        attributes: attributes,
        vertexShader: vertShader,
        fragmentShader: fragShader

    });

    addCubeGrid()
    addGround();
    Particles();
    // glowBall();
    GlowingParticles()

    //-------------------------------   


    // ADD VIDEO CALLIBRATION SCREEN
    var movieMaterial = new THREE.MeshLambertMaterial({ map: videoTexture, overdraw: true, side: THREE.DoubleSide });
    // try this at a larger scale
    var movieGeometry = new THREE.PlaneBufferGeometry(200, 200, 1, 1);
    var movieScreen = new THREE.Mesh(movieGeometry, material_shh);
    movieScreen.position.set(0, 0, 1000);
    scene.add(movieScreen);
    movieScreen.visible = false;


    camera.position.z = camStartZ;
    //try taking this out
    camera.lookAt(movieScreen.position);



    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function(xhr) {};


    // ADD 3D OBJ MODEL

    var loader = new THREE.OBJMTLLoader();
    loader.load(objName, mtlName, function(object) {
        alon = object;

        for (var i in alon.children) {
            alon.children[i].material.map = videoTexture;
            alon.children[i].material.needsUpdate = true;
            alon.children[i].castShadow = true;
        }
        // offset Y position of 3D model
        object.position.y = 0;

        //object scale

        //reset rotation to world

        object.rotateOnAxis(new THREE.Vector3(1, 1, 1), zRotValue);
        // object.rotateOnAxis(new THREE.Vector3(0, 0, 0), 0);
        // object.rotateOnAxis(new THREE.Vector3(0, 0, 1), 20);
        scene.add(object);

        //------ADD GUI-------
        //ADD GUI
        var sliders = new function() {
            this.rotationAngle = 0;
            this.rotationSpeed = 0.001;
            this.resetRotation = false

            this.showVideo = false;
            // this.showFloor = false;
            // this.shiftVideoX = 0.03;
            this.shiftVideoX = -234;
            this.shiftVideoY = 4;
            this.scaleVideo = 1.07;
            this.rotateScreenZ = 270;

            this.Model = 'Alon';
            this.yPosModel = -28;
            this.xPosModel = 0;
            this.zPosModel = 0;

            this.xRotModel = 0;
            this.yRotModel = 0;
            this.zRotModel = 0;

            this.scaleModel = 1;


        }

        var gui = new dat.GUI();



        //Model Rotation sliders
        var f1 = gui.addFolder('Speed controllers');

        /*   var angleY = f1.add(sliders, 'rotationAngle',0,0.1);
angleY.onChange(function(value){
object.rotateOnAxis(new THREE.Vector3(0,1,0), value);
}); */
        var speed = f1.add(sliders, 'rotationSpeed', 0, 0.05);
        speed.onChange(function(value) {
            angle = value;
        });

        //  f1.add(sliders, 'resetRotation');

        //Video sliders

        //VIDEO CONTROLLER FOLDER
        var f2 = gui.addFolder('Show/Hide Enviroment');
        //SHOW OR HIDE VIDEO SCREEN
        var videoShow = f2.add(sliders, 'showVideo');
        videoShow.onChange(function(value) {
            movieScreen.visible = value;
        });


        //Video Rotate Z 
        var zRotV = f2.add(sliders, 'rotateScreenZ', 0, 360).step(1);
        zRotV.onChange(function(value) {
            console.log(value);
            value = map_range(value, 0, 360, 0, Math.PI * 2);
            movieScreen.rotation.z = value;
        });

        //SHIFT VIDEO TEXTURE X POSITION
        var xPosV = f2.add(sliders, 'shiftVideoX', -409, 59).step(1);
        xPosV.onChange(function(value) {
            console.log(value);
            // videoXpos = value;
        });

        //SHIFT VIDEO TEXTURE X POSITION
        var yPosV = f2.add(sliders, 'shiftVideoY', 0, 200).step(1);
        yPosV.onChange(function(value) {
            console.log(value);
            // videoYpos = value;
        });

        //ZOOM VIDEO TEXTURE
        var zoomV = f2.add(sliders, 'scaleVideo', 1, 1.5).step(0.01);
        zoomV.onChange(function(value) {
            console.log(value);
            // videoZoom = value;
        });


        // MODEL CONTROLERS
        // var f3 = gui.addFolder('Model controllers');


        //Model Offset X Position
        // var xPosM = f3.add(sliders, 'xPosModel', -50, 50).step(1);
        // xPosM.onChange(function(value) {
        //     console.log(value);
        //     object.position.x = value;
        // });

        //Model Offset Y Position
        // var yPosM = f3.add(sliders, 'yPosModel', -50, 50).step(1);
        // yPosM.onChange(function(value) {
        //     console.log(value);
        //     object.position.y = value;
        // });


        //Model Offset z Position
        var zPosM = f2.add(sliders, 'zPosModel', 0, 100).step(1);
        zPosM.onChange(function(value) {
            // console.log(value);
            object.position.z = value;
        });

        //----------------------------

        //Model Rotate X 
        // var xRotM = f3.add(sliders, 'xRotModel', 0, 360).step(1);
        // xRotM.onChange(function(value) {
        //     console.log(value);
        //     value = map_range(value, 0, 360, 0, Math.PI * 2);
        //     object.rotation.x = value;
        //     // object.rotateOnAxis(new THREE.Vector3(1,0,0), value);

        // });

        //Model Rotate Y 
        // var yRotM = f3.add(sliders, 'yRotModel', 0, 360).step(1);
        // yRotM.onChange(function(value) {
        //     console.log(value);
        //     value = map_range(value, 0, 360, 0, Math.PI * 2);
        //     object.rotation.y = value;
        // });


        //Model Rotate Z 
        var zRotM = f2.add(sliders, 'zRotModel', 0, 360).step(1);
        zRotM.onChange(function(value) {
            console.log(value);
            value = map_range(value, 0, 360, 0, Math.PI * 2);
            object.rotation.z = value;
        });

        //--------------------

        //Model Scale
        // var scaleM = f3.add(sliders, 'scaleModel', 0, 50).step(1);
        // scaleM.onChange(function(value) {
        //     console.log(value);
        //     object.scale.set(value, value, value);
        //     value;
        // });

    }, onProgress, onError);


}

// ---------- ANIMATE -------------------
function animate() {
    //call yourself
    requestAnimationFrame(animate);
    render();
    update();
}

// ---------- UPDATE-------------------
function update() {
    radExpand++
    rmapped++
    gmapped++
    bmapped++
    rmapped = rmapped + .1

    lightColA = "rgb(" + rmapped + "," + gmapped + "," + bmapped + ")";
    // console.log(lightColA)
    // color.addColors(1,1,1)


    var time = Date.now() * 0.0000001;

    for (i = 0; i < scene.children.length; i++) {

        var object = scene.children[i];

        if (object instanceof THREE.Points) {

            object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));

        }

    }
    //color changing
    for (i = 0; i < materials.length; i++) {

        color = parameters[i][0];

        h = (360 * (color[0] + (time * 20)) % 360) / 360;
        materials[i].color.setHSL(h, color[1], color[2]);

    }



    if (zRotOn) {
        zRotValue = .003
        object.rotateOnAxis(new THREE.Vector3(0, 0, 1), zRotValue);

        console.log('ON' + zRotValue)
    } else {
        zRotValue = 0
        object.rotateOnAxis(new THREE.Vector3(0, 0, 1), zRotValue);
        console.log('OFF' + zRotValue)
    }



    camera.position.z += camSpeed;
    // console.log(camera.position.z)
    if (camera.position.z > camZMax || camera.position.z < camZMin) {
        switchCamera();
    }


    if (keyboard.pressed("s")) // resume
        zRotOn = true;

    if (keyboard.pressed("d")) // resume
        zRotOn = false;
    // console.log(zRotOn)

    // if (keyboard.pressed("s")) // resume
    //     movieScreen.visible = false;
    controls.update();
    // console.log(camera.position.z)



}

// ---------- RENDER -------------------
function rotateornot() {
    if (zRotOn == true) {
        zRotOn = false
    } else if (zRotOn == false) {
        zRotOn = true;
    }
}

function render() {




    if (video.readyState === video.HAVE_ENOUGH_DATA)


        videoImageContext.drawImage(video, videoXpos, videoYpos, video.width * videoZoom, video.height * videoZoom);


    if (videoTexture)
        videoTexture.needsUpdate = true;

    if (alon != undefined) {
        // alon.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
    }

    renderer.render(scene, camera);

}

// ----------   RADIAN TO DEGREES FUNCTION -------------
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//var printing = false;
function printScreen() {
    var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });

    window.open(renderer.domElement.toDataURL('image/png'), 'screenshot');

}


function AddLights() {
    color = new THREE.Color("hsl(200, 100%, 50%)");
    var lightColA = "rgb(" + r + "," + g + "," + b + ")";
    var ambient = new THREE.SpotLight(0x101030);
    ambient.position.set(0, 0, 4000)
    scene.add(ambient);



    var directionalLightInside = new THREE.DirectionalLight(lightColA, 1);
    directionalLightInside.position.set(0, 0, -3000);
    directionalLightInside.castShadow = true;
    directionalLightInside.shadowDarkness = 1;
    directionalLightInside.shadowMapSoft = true;
    scene.add(directionalLightInside);


     var insidelight = new THREE.PointLight(0xffffff, 1,0,.5);
    insidelight.position.set(0, 0,-1200);
    insidelight.castShadow = true;
    insidelight.shadowDarkness = 1;
    insidelight.shadowMapSoft = true;
    scene.add(insidelight);

    frontLight = new THREE.DirectionalLight(color, 1);
    frontLight.position.set(0, 0, 3000);
    frontLight.castShadow = true;
    frontLight.shadowDarkness = 1;
    frontLight.shadowMapSoft = true;
    scene.add(frontLight);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);
}


function BuildSkeleton() {



    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 85,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, camStartZ);
    camera.lookAt(scene.position);


    cubeCamera = new THREE.CubeCamera(1, 1000, 256);
    // cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    scene.add(cubeCamera);

    // RENDERER
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({ antialias: true });
    else
        renderer = new THREE.CanvasRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0xfe88aa, 1); //set background color
    //add renderer to the div
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);

    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}


function glowBall() {
    var geometry = new THREE.SphereGeometry(0, 0, 0);
    var material = new THREE.MeshLambertMaterial({ color: 0x000088 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(340, 30, 30);
    scene.add(mesh);

    // SUPER SIMPLE GLOW EFFECT
    // use sprite because it appears the same from all angles
    var spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.ImageUtils.loadTexture('../textures/glow.png'),
        useScreenCoordinates: false,
        color: 0x0000ff,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(900, 900, 40.0);
    mesh.add(sprite); // this centers the glow at the mesh
}



//setTimeout(generateGIF,1000);
function addCubeGrid() {
    var cubesize = 300
    var geo = new THREE.BoxGeometry(cubesize, cubesize, cubesize);
    var mat = new THREE.MeshLambertMaterial({
        color: 0xffff00
    });
    cube = new THREE.Mesh(geo, mat);
    cube.position.x = -10;
    // scene.add(cube);



    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 30; j++) {
            mat = new THREE.MeshLambertMaterial({
                color: 0xFF748C
            }); // random colors!
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(-11500 + (2100 * i), -5000 + (j * 1270), (70 + j * 40))
            scene.add(mesh);
        }
    }
}



function addGround() {
    // var imgTexture = new THREE.TextureLoader().load( "../textures/the.png" );
    //         imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
    //         imgTexture.anisotropy = 16;
    //         imgTexture = null;

    // var material = new THREE.MeshPhongMaterial( { map: imgTexture, bumpMap: imgTexture, bumpScale: bumpScale, color: diffuseColor, specular: specularColor, reflectivity: reflectivity, shininess: specularShininess, shading: THREE.SmoothShading, envMap: localReflectionCube  } )



    var textureLoader = new THREE.TextureLoader();

    textureLoader.load('../textures/metalPurp2.png', function(texture) {



        texture.mapping = THREE.UVMapping;

        var mesh = new THREE.Mesh(new THREE.SphereGeometry(7500, 60, 40), new THREE.MeshLambertMaterial({ map: texture }));
        mesh.scale.x = -1;
        mesh.recieveShadow = true;
        scene.add(mesh);
        var material = new THREE.MeshBasicMaterial({ envMap: cubeCamera.renderTarget });



    });

}


function switchCamera() {
    camSpeed = -camSpeed;
    // console.log(camSpeed)
}


function Particles() {
    geometry = new THREE.Geometry();

    for (i = 0; i < 19000; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 19000 - 6000;
        vertex.y = Math.random() * 8000 - 1000;
        vertex.z = Math.random() * 17000 - 4000;

        geometry.vertices.push(vertex);

    }
    //colors
    parameters = [
        [
            [1, .4, .6], 5
        ],
        [
            [1, .3, 0.4], 14
        ],
        [
            [.8, .2, 0.5], 13
        ],
        [
            [.5, .7, 0.3], 16
        ],
        [
            [1, .5, 0.9], 11
        ]
    ];

    for (i = 0; i < parameters.length; i++) {

        color = parameters[i][0];
        size = parameters[i][1];

        materials[i] = new THREE.PointsMaterial({ size: size });

        particles = new THREE.Points(geometry, materials[i]);

        particles.rotation.x = Math.random() * 6;
        particles.rotation.y = Math.random() * 6;
        particles.rotation.z = Math.random() * 6;

        scene.add(particles);

    }



}



function GlowingParticles() {
    var particleTexture = THREE.ImageUtils.loadTexture('../textures/glow.png');

    particleGroup = new THREE.Object3D();
    particleAttributes = { startSize: [], startPosition: [], randomness: [] };

    var totalParticles = 200;
    var radiusRange = radExpand;
    for (var i = 0; i < totalParticles; i++) {
        var spriteMaterial = new THREE.SpriteMaterial({
            map: particleTexture,
            useScreenCoordinates: false,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });









        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(32, 32, 1.0); // imageWidth, imageHeight
        sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        // for a cube:
        // sprite.position.multiplyScalar( radiusRange );
        // for a solid sphere:
        // sprite.position.setLength( radiusRange * Math.random() );
        // for a spherical shell:
        sprite.position.setLength(radiusRange * (Math.random() * 0.1 + 0.9));

        // sprite.color.setRGB( Math.random(),  Math.random(),  Math.random() ); 
        sprite.material.color.setHSL(Math.random(), 0.4, 0.9);

        // sprite.opacity = 0.80; // translucent particles
        sprite.material.blending = THREE.AdditiveBlending; // "glowing" particles

        particleGroup.add(sprite);
        // add variable qualities to arrays, if they need to be accessed later
        particleAttributes.startPosition.push(sprite.position.clone());
        particleAttributes.randomness.push(Math.random());





    }
    particleGroup.position.y = 00;
    scene.add(particleGroup);
}

var particleGroup, particleAttributes;

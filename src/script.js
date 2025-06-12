/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import { 
    Clock, 
    Scene, 
    LoadingManager, 
    WebGLRenderer, 
    sRGBEncoding, 
    Group, 
    PerspectiveCamera, 
    DirectionalLight, 
    PointLight, 
    MeshPhongMaterial,
    TextureLoader,  // Add this import
    RepeatWrapping, // Add this if you need to repeat the texture
    MeshStandardMaterial, // Add this for better material quality
    AmbientLight,
    CubeTextureLoader,
    DoubleSide,
    Color,
    ACESFilmicToneMapping,
    PCFSoftShadowMap,
} from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import GUI from 'lil-gui'  // Comment out this line

// Create texture loader
const textureLoader = new TextureLoader()

// Optional: Create an environment map for reflections
const cubeTextureLoader = new CubeTextureLoader()
cubeTextureLoader.setPath('/textures/environment/')

// Load your texture with error handling
const colorTexture = textureLoader.load(
    '/textures/3576.jpg', // Update this path to your actual texture file
    // Success callback
    (texture) => {
        console.log('Texture loaded successfully:', texture)
    },
    // Progress callback
    (progress) => {
        console.log('Texture loading progress:', progress)
    },
    // Error callback
    (error) => {
        console.error('Error loading texture:', error)
    }
)

/////////////////////////////////////////////////////////////////////////
//// LOADING MANAGER
const ftsLoader = document.querySelector(".lds-roller")
const looadingCover = document.getElementById("loading-text-intro")
const loadingManager = new LoadingManager()

loadingManager.onLoad = function() {
    const loadingContainer = document.querySelector('.loading-container')
    document.querySelector(".main-container").style.visibility = 'visible'
    document.querySelector("body").style.overflow = 'auto'

    // Fade out loading animation
    loadingContainer.style.opacity = '0'
    loadingContainer.style.transition = 'opacity 0.5s ease-out'
    
    setTimeout(() => {
        loadingContainer.style.display = 'none'
    }, 500)

    introAnimation()
    ftsLoader.parentNode.removeChild(ftsLoader)

    window.scroll(0, 0)
}

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.getElementById('canvas-container')
const containerDetails = document.getElementById('canvas-container-details')

/////////////////////////////////////////////////////////////////////////
///// GENERAL VARIABLES
let oldMaterial
let secondContainer = false
let width = container.clientWidth
let height = container.clientHeight

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new Scene()

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance"})
renderer.autoClear = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setSize( width, height)
renderer.outputEncoding = sRGBEncoding
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5
container.appendChild(renderer.domElement)

const renderer2 = new WebGLRenderer({ antialias: false})
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer2.setSize( width, height)
renderer2.outputEncoding = sRGBEncoding
containerDetails.appendChild(renderer2.domElement)

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const cameraGroup = new Group()
scene.add(cameraGroup)

const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19,1.54,-0.1)
cameraGroup.add(camera)

const camera2 = new PerspectiveCamera(35, containerDetails.clientWidth / containerDetails.clientHeight, 1, 100)
camera2.position.set(1.9,2.7,2.7)
camera2.rotation.set(0,1.1,0)
scene.add(camera2)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    
    camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight
    camera2.updateProjectionMatrix()

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const sunLight = new DirectionalLight(0xf2b073, 6.5)
sunLight.position.set(22, 80, -90)
scene.add(sunLight)

const fillLight = new PointLight(0xff8833, 22.0, 4, 3) // Warm orange light
fillLight.position.set(30, 3, 1.8)
scene.add(fillLight)

const ambientLight = new AmbientLight(0xffffff, 0.9)
scene.add(ambientLight)

// Adjust renderer settings
renderer.physicallyCorrectLights = true
renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('/models/gltf/NextGem.glb', function (gltf) {
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            oldMaterial = obj.material
            const newMaterial = new MeshStandardMaterial({
                color: new Color('#ff6600'),
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.8,
                side: DoubleSide,
                envMapIntensity: 1.5,
                refractionRatio: 0.98,
            })
            
            obj.material = newMaterial
            obj.material.needsUpdate = true
            
            /* Comment out GUI controls
            const materialFolder = gui.addFolder(`Diamond Material - ${obj.name}`)
            materialFolder.addColor(newMaterial, 'color')
            materialFolder.add(newMaterial, 'metalness', 0, 1, 0.01)
            materialFolder.add(newMaterial, 'roughness', 0, 1, 0.01)
            materialFolder.add(newMaterial, 'opacity', 0, 1, 0.01)
            materialFolder.add(newMaterial, 'envMapIntensity', 0, 3, 0.1)
            */
        }
    })
    scene.add(gltf.scene)
    clearScene()
}) // Progress and error callbacks removed for brevity

function clearScene(){
    oldMaterial.dispose()
    renderer.renderLists.dispose()
}

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    new TWEEN.Tween(camera.position.set(0,4,2.7)).to({ x: 0.1, y: 0.9, z: 2}, 3500).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this)
        document.querySelector('.header').classList.add('ended')
        document.querySelector('.first>p').classList.add('ended')
    })
    
}

//////////////////////////////////////////////////
//// CLICK LISTENERS
document.getElementById('aglaea').addEventListener('click', () => {
    document.getElementById('aglaea').classList.add('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    document.getElementById('content').innerHTML = 'By showing ads only to the right people, your business spends less to get more sales, so every marketing dollar works harder.'
    animateCamera({ x: 1.9, y: 2.7, z: 2.7 },{ y: 1.1 })
})

document.getElementById('thalia').addEventListener('click', () => {
    document.getElementById('thalia').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('euphre').classList.remove('active')
    document.getElementById('content').innerHTML = 'Because every click and purchase is tracked, you can quickly see what brings in revenue and stop paying for what doesn\'t, protecting the budget and boosting profits.'
    animateCamera({ x: -0.9, y: 3.1, z: 2.6 },{ y: -0.1 })
})

document.getElementById('euphre').addEventListener('click', () => {
    document.getElementById('euphre').classList.add('active')
    document.getElementById('aglaea').classList.remove('active')
    document.getElementById('thalia').classList.remove('active')
    document.getElementById('content').innerHTML = 'Two-way online conversations keep customers coming back, turning one-time buyers into loyal fans who buy again and recommend you to others.'
    animateCamera({ x: -0.4, y: 2.7, z: 1.9 },{ y: -0.6 })
})

/////////////////////////////////////////////////////////////////////////
//// ANIMATE CAMERA
function animateCamera(position, rotation){
    new TWEEN.Tween(camera2.position).to(position, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this)
    })
    new TWEEN.Tween(camera2.rotation).to(rotation, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this)
    })
}

/////////////////////////////////////////////////////////////////////////
//// PARALLAX CONFIG
const cursor = {x:0, y:0}
const clock = new Clock()
let previousTime = 0

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION

function rendeLoop() {

    TWEEN.update()

    if (secondContainer){
        renderer2.render(scene, camera2)
    } else{
        renderer.render(scene, camera)
    }

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    const parallaxY = cursor.y
    fillLight.position.y -= ( parallaxY *9 + fillLight.position.y -2) * deltaTime

    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX *8 - fillLight.position.x) * 2 * deltaTime

    cameraGroup.position.z -= (parallaxY/3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX/3 - cameraGroup.position.x) * 2 * deltaTime

    requestAnimationFrame(rendeLoop)
}

rendeLoop()

//////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET CAMERA POSITION
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    cursor.x = event.clientX / window.innerWidth -0.5
    cursor.y = event.clientY / window.innerHeight -0.5

    handleCursor(event)
}, false)

//////////////////////////////////////////////////
//// DISABLE RENDERER BASED ON CONTAINER VIEW
const watchedSection = document.querySelector('.second')

function obCallback(payload) {
    if (payload[0].intersectionRatio > 0.05){
        secondContainer = true
    }else{
        secondContainer = false
    }
}

const ob = new IntersectionObserver(obCallback, {
    threshold: 0.05
})

ob.observe(watchedSection)

//////////////////////////////////////////////////
//// MAGNETIC MENU
const btn = document.querySelectorAll('nav > .a')
const customCursor = document.querySelector('.cursor')

function update(e) {
    const span = this.querySelector('span')
    
    if(e.type === 'mouseleave') {
        span.style.cssText = ''
    } else {
        const { offsetX: x, offsetY: y } = e,{ offsetWidth: width, offsetHeight: height } = this,
        walk = 20, xWalk = (x / width) * (walk * 2) - walk, yWalk = (y / height) * (walk * 2) - walk
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`
    }
}

const handleCursor = (e) => {
    const x = e.clientX
    const y =  e.clientY
    customCursor.style.cssText =`left: ${x}px; top: ${y}px;`
}

btn.forEach(b => b.addEventListener('mousemove', update))
btn.forEach(b => b.addEventListener('mouseleave', update))

// Debug GUI
/*
const gui = new GUI()
const debugObject = {
    cameraPosition: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    },
    camera2Position: {
        x: camera2.position.x,
        y: camera2.position.y,
        z: camera2.position.z
    },
    camera2Rotation: {
        x: camera2.rotation.x,
        y: camera2.rotation.y,
        z: camera2.rotation.z
    },
    sunLight: {
        color: sunLight.color.getHex(),
        intensity: sunLight.intensity,
        position: {
            x: sunLight.position.x,
            y: sunLight.position.y,
            z: sunLight.position.z
        }
    },
    fillLight: {
        color: fillLight.color.getHex(),
        intensity: fillLight.intensity
    }
}

// Camera 1 controls
const camera1Folder = gui.addFolder('Main Camera')
camera1Folder.add(camera.position, 'x').min(-50).max(50).step(0.1).name('x position')
camera1Folder.add(camera.position, 'y').min(-50).max(50).step(0.1).name('y position')
camera1Folder.add(camera.position, 'z').min(-50).max(350).step(0.1).name('z position')

// Camera 2 controls
const camera2Folder = gui.addFolder('Detail Camera')
camera2Folder.add(camera2.position, 'x').min(-50).max(50).step(0.1).name('x position')
camera2Folder.add(camera2.position, 'y').min(-50).max(50).step(0.1).name('y position')
camera2Folder.add(camera2.position, 'z').min(-50).max(50).step(0.1).name('z position')
camera2Folder.add(camera2.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1).name('x rotation')
camera2Folder.add(camera2.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name('y rotation')
camera2Folder.add(camera2.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1).name('z rotation')

// Lights controls
const lightsFolder = gui.addFolder('Lights')

// Directional Light (sunLight) controls
const sunLightFolder = lightsFolder.addFolder('Sun Light')
sunLightFolder.addColor(debugObject.sunLight, 'color')
    .onChange(() => { sunLight.color.setHex(debugObject.sunLight.color) })
sunLightFolder.add(sunLight, 'intensity').min(0).max(10).step(0.1).name('intensity')
sunLightFolder.add(sunLight.position, 'x').min(-200).max(200).step(1).name('position x')
sunLightFolder.add(sunLight.position, 'y').min(-200).max(200).step(1).name('position y')
sunLightFolder.add(sunLight.position, 'z').min(-200).max(200).step(1).name('position z')

// Fill Light controls
const fillLightFolder = lightsFolder.addFolder('Fill Light')
fillLightFolder.addColor(debugObject.fillLight, 'color')
    .onChange(() => { fillLight.color.setHex(debugObject.fillLight.color) })
fillLightFolder.add(fillLight, 'intensity').min(0).max(10).step(0.1)

// Model scale controls (add after loading your model)
loader.load('models/gltf/NextGem.glb', function (gltf) {
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            oldMaterial = obj.material
            obj.material = new MeshPhongMaterial({
                shininess: 45 
            })
        }
    })
    scene.add(gltf.scene)
    
    // Add scale controls
    const modelFolder = gui.addFolder('Model')
    modelFolder.add(gltf.scene.scale, 'x').min(0).max(2).step(0.01).name('scale X')
    modelFolder.add(gltf.scene.scale, 'y').min(0).max(2).step(0.01).name('scale Y')
    modelFolder.add(gltf.scene.scale, 'z').min(0).max(2).step(0.01).name('scale Z')
    
    clearScene()
})
*/

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav.header');
    
    // On Scroll Functionality
    window.addEventListener('scroll', () => {
        const windowTop = window.scrollY;
        if (windowTop > 100) {
            nav.classList.add('navShadow');
        } else {
            nav.classList.remove('navShadow');
        }
    });
    
    // Smooth Scrolling Using Navigation Menu
    document.querySelectorAll('.header .a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.header .a').forEach(a => {
                a.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target section id from the href
            const targetId = this.getAttribute('href');
            
            // Check if it's an external link (starts with http or contains .html)
            if (targetId.startsWith('http') || targetId.includes('.html')) {
                window.location.href = targetId;
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const targetPosition = targetElement.offsetTop - 100;
                
                // Animate scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Update active state on scroll with debounce
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('#first, #second').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                document.querySelectorAll('.header .a').forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === `#${section.id}`) {
                        a.classList.add('active');
                    }
                });
            }
        });
    });
});

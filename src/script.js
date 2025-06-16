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

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Here you would typically send the form data to your server
            // For now, we'll just show a success message
            const formElements = this.elements;
            let isValid = true;
            
            // Simple validation
            for (let i = 0; i < formElements.length; i++) {
                if (formElements[i].required && !formElements[i].value) {
                    isValid = false;
                    formElements[i].style.borderColor = 'red';
                } else if (formElements[i].type !== 'submit') {
                    formElements[i].style.borderColor = '';
                }
            }
            
            if (isValid) {
                // Success message
                this.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you!</h3><p>Your message has been sent. We\'ll get back to you soon.</p></div>';
                
                // You would send the form data to your server here
                // fetch('/api/contact', { method: 'POST', body: new FormData(this) })
            }
        });
    }
});

// Scroll animation handler
document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate when they come into view
    const animateElements = document.querySelectorAll('.services-container h2, .portfolio-container h2, .contact-container h2, .service-card, .portfolio-item, .form-group, .submit-btn');
    
    // Add animation classes to elements
    animateElements.forEach((element, index) => {
        // Add base class for all elements
        element.classList.add('animate-on-scroll');
        
        // Add specific animation classes based on element type
        if (element.classList.contains('service-card')) {
            element.style.transitionDelay = `${index * 0.1}s`;
        } else if (element.classList.contains('portfolio-item')) {
            element.style.transitionDelay = `${index * 0.15}s`;
        } else if (element.tagName === 'H2') {
            // No delay for headings
        } else {
            element.style.transitionDelay = `${index * 0.05}s`;
        }
    });
    
    // Function to check if element is in viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    };
    
    // Function to handle scroll animations
    const handleScrollAnimations = () => {
        animateElements.forEach(element => {
            if (isInViewport(element)) {
                element.style.opacity = '1';
                
                if (element.classList.contains('service-card')) {
                    element.style.transform = 'translateY(0)';
                } else if (element.classList.contains('portfolio-item')) {
                    element.style.transform = 'scale(1)';
                } else if (element.tagName === 'H2') {
                    element.classList.add('animate-active');
                } else if (element.classList.contains('form-group')) {
                    element.style.transform = 'translateX(0)';
                } else {
                    element.style.transform = 'translateY(0)';
                }
            }
        });
    };
    
    // Set initial transform values
    animateElements.forEach(element => {
        if (element.classList.contains('service-card')) {
            element.style.transform = 'translateY(40px)';
        } else if (element.classList.contains('portfolio-item')) {
            element.style.transform = 'scale(0.95)';
        } else if (element.classList.contains('form-group')) {
            // Alternate left and right animations for form groups
            const index = Array.from(element.parentNode.children).indexOf(element);
            element.style.transform = index % 2 === 0 ? 'translateX(-20px)' : 'translateX(20px)';
        } else {
            element.style.transform = 'translateY(20px)';
        }
    });
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScrollAnimations);
    
    // Initial check for elements in viewport
    handleScrollAnimations();
    
    // Add floating animation to specific elements
    document.querySelectorAll('.service-card i').forEach(icon => {
        icon.classList.add('animate-float');
    });
    
    // Add glow animation to submit button
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.classList.add('animate-glow');
        });
        
        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.classList.remove('animate-glow');
        });
    }
    
    // Enhanced cursor animation
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            // Add a slight delay to cursor movement for a smoother effect
            setTimeout(() => {
                cursor.style.transform = `translate(-50%, -50%) scale(1)`;
            }, 50);
        });
        
        // Scale effect on links
        document.querySelectorAll('a, button, .service-card, .portfolio-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.mixBlendMode = 'difference';
                cursor.style.opacity = '0.5';
            });
            
            item.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.mixBlendMode = 'difference';
                cursor.style.opacity = '1';
            });
        });
    }
});

// Enhanced page transition animations
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-exit');
});

// Enhanced service card animations
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    // Remove any existing animations and inline styles
    serviceCards.forEach(card => {
        card.style.animation = 'none';
        // Remove any transform styles that might be interfering
        card.style.transform = '';
    });
    
    // Add hover class to track hover state
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add a class instead of inline styles
            card.classList.add('card-hovered');
        });
        
        card.addEventListener('mouseleave', () => {
            // Remove the class on mouse leave
            card.classList.remove('card-hovered');
            // Reset any inline styles
            card.style.transform = '';
            
            const icon = card.querySelector('i');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
    
    // Optional: Add 3D tilt effect on mousemove
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Only apply if the card has the hovered class
            if (!card.classList.contains('card-hovered')) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            // Apply subtle rotation without affecting the float animation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Move the icon slightly
            const icon = card.querySelector('i');
            if (icon) {
                icon.style.transform = `translateX(${(x - centerX) / 10}px) translateY(${(y - centerY) / 10}px)`;
            }
        });
    });
});

// Clean animation handling
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page transition
    document.body.classList.add('page-transition');
    
    // Create particle background
    createParticleBackground();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize text animations
    initTextAnimations();
    
    // Fix pillar images
    fixPillarImages();
});

// Create particle background effect
function createParticleBackground() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-background';
    document.body.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize custom cursor
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-item, .submit-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Initialize scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const checkScroll = () => {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    };
    
    // Check elements on load
    checkScroll();
    
    // Check elements on scroll
    window.addEventListener('scroll', checkScroll);
}

// Initialize text animations
function initTextAnimations() {
    const headings = document.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
        // Skip if already processed
        if (heading.classList.contains('processed')) return;
        
        // Get the text content
        const text = heading.textContent;
        heading.textContent = '';
        heading.classList.add('animated-text', 'processed');
        
        // Create spans for each character
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.animationDelay = `${i * 0.05}s`;
            heading.appendChild(span);
        }
    });
}

// Fix pillar images
function fixPillarImages() {
    const pillarImages = document.querySelectorAll('.pillar-image');
    
    pillarImages.forEach(img => {
        // Try different paths
        const paths = [
            '../static/Pillar.png',
            './static/Pillar.png',
            '/static/Pillar.png',
            'static/Pillar.png'
        ];
        
        // Function to check if image loaded
        const checkImage = (src) => {
            return new Promise((resolve) => {
                const testImg = new Image();
                testImg.onload = () => resolve(true);
                testImg.onerror = () => resolve(false);
                testImg.src = src;
            });
        };
        
        // Try each path
        async function tryPaths() {
            for (const path of paths) {
                const success = await checkImage(path);
                if (success) {
                    img.src = path;
                    console.log('Image loaded successfully:', path);
                    break;
                }
            }
        }
        
        tryPaths();
    });
}

// Enhanced service card interactions
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add 3D tilt effect
            card.addEventListener('mousemove', handleCardTilt);
        });
        
        card.addEventListener('mouseleave', () => {
            // Remove 3D tilt effect
            card.removeEventListener('mousemove', handleCardTilt);
            card.style.transform = 'translateY(-20px)';
        });
    });
    
    function handleCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px)`;
    }
});

// Add scroll-triggered animations to sections
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    document.querySelectorAll('.service-card, .portfolio-item, .section-title, .form-group').forEach(element => {
        element.classList.add('animate-on-scroll');
    });
});

// Add this after the DOMContentLoaded event or at the end of the file
document.addEventListener('DOMContentLoaded', () => {
    // Check if text elements exist and add fallback if needed
    const firstParagraph = document.querySelector('.first>p')
    const header = document.querySelector('.header')
    
    if (!firstParagraph) {
        console.warn('First paragraph element not found - creating fallback')
        const firstSection = document.querySelector('.first')
        if (firstSection && !firstSection.querySelector('p')) {
            const fallbackP = document.createElement('p')
            fallbackP.textContent = 'Distills insight into brilliance, shaping campaigns as timeless as fine jewels'
            fallbackP.classList.add('fallback-text')
            firstSection.appendChild(fallbackP)
        }
    }
    
    // Ensure text visibility after page load
    setTimeout(() => {
        const textElements = document.querySelectorAll('.first p, .header')
        textElements.forEach(el => {
            el.classList.add('ended')
        })
    }, 5000) // Fallback timeout
})

// Fix for "Discover" h2 element and word spacing
document.addEventListener('DOMContentLoaded', () => {
    // Fix for the h2 "Discover" element
    const discoverElement = document.querySelector('.first > h2');
    if (discoverElement) {
        // Ensure visibility
        discoverElement.style.opacity = '1';
        discoverElement.style.display = 'block';
        
        // Add animation class
        discoverElement.classList.add('animate-fadeIn');
    }
    
    // Fix for h1 "THE NEXTGEM" spacing and positioning
    const titleElement = document.querySelector('.first > h1');
    if (titleElement) {
        // Add class for spacing
        titleElement.classList.add('spaced-text');
        
        // Ensure proper HTML with spacing
        if (titleElement.textContent.trim() === 'THE NEXTGEM') {
            titleElement.innerHTML = 'THE&nbsp;&nbsp;NEXTGEM';
        }
        
        // Add more space between text and line
        titleElement.style.marginBottom = '40px';
        
        // Adjust the line position
        const lineStyle = document.createElement('style');
        lineStyle.textContent = `
            .first > h1:after {
                margin-top: 120px !important;
            }
        `;
        document.head.appendChild(lineStyle);
    }
    
    // Position first section at the bottom of the page
    const firstSection = document.querySelector('.first');
    if (firstSection) {
        firstSection.style.justifyContent = 'flex-end';
        firstSection.style.paddingBottom = '100px';
        
        // Ensure the paragraph is visible
        const paragraph = firstSection.querySelector('p');
        if (paragraph) {
            paragraph.style.marginBottom = '80px';
            paragraph.style.marginTop = '60px';
        }
    }
    
    // Add animation keyframes if they don't exist
    if (!document.querySelector('style#animation-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'animation-styles';
        styleElement.textContent = `
            @keyframes animate-fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fadeIn {
                animation: animate-fadeIn 1s ease forwards;
            }
        `;
        document.head.appendChild(styleElement);
    }
});

// EMERGENCY TEXT FIX
document.addEventListener('DOMContentLoaded', function() {
    // Force text to be visible
    function forceTextVisibility() {
        // Fix "Discover" text
        const discoverText = document.querySelector('.first > h2');
        if (!discoverText || discoverText.offsetHeight === 0) {
            const firstSection = document.querySelector('.first');
            if (firstSection) {
                // Remove existing h2 if it exists but is not visible
                const existingH2 = firstSection.querySelector('h2');
                if (existingH2) {
                    firstSection.removeChild(existingH2);
                }
                
                // Create new h2 element
                const newH2 = document.createElement('h2');
                newH2.id = 'discover-text';
                newH2.textContent = 'Discover';
                newH2.style.display = 'block';
                newH2.style.visibility = 'visible';
                newH2.style.opacity = '1';
                newH2.style.color = '#ffffff';
                newH2.style.fontSize = '1.2em';
                newH2.style.fontWeight = '300';
                newH2.style.fontStyle = 'italic';
                newH2.style.position = 'relative';
                newH2.style.zIndex = '100';
                
                // Insert at the beginning of .first
                firstSection.insertBefore(newH2, firstSection.firstChild);
            }
        }
        
        // Fix "THE NEXTGEM" text
        const nextgemText = document.querySelector('.first > h1');
        if (nextgemText) {
            nextgemText.id = 'nextgem-text';
            nextgemText.innerHTML = 'THE NEXTGEM';
            nextgemText.style.display = 'block';
            nextgemText.style.visibility = 'visible';
            nextgemText.style.opacity = '1';
            nextgemText.style.color = '#ffffff';
            nextgemText.style.fontSize = '3em';
            nextgemText.style.letterSpacing = '0.2em';
            nextgemText.style.wordSpacing = '0.5em';
            nextgemText.style.fontWeight = '400';
            nextgemText.style.position = 'relative';
            nextgemText.style.zIndex = '100';
        } else {
            const firstSection = document.querySelector('.first');
            if (firstSection) {
                const newH1 = document.createElement('h1');
                newH1.id = 'nextgem-text';
                newH1.innerHTML = 'THE&nbsp;&nbsp;&nbsp;NEXTGEM';
                // Apply all the same styles
                newH1.style.display = 'block';
                newH1.style.visibility = 'visible';
                newH1.style.opacity = '1';
                newH1.style.color = '#ffffff';
                newH1.style.fontSize = '3em';
                newH1.style.letterSpacing = '0.2em';
                newH1.style.wordSpacing = '0.5em';
                newH1.style.fontWeight = '400';
                newH1.style.position = 'relative';
                newH1.style.zIndex = '100';
                
                // Insert after h2
                const h2Element = firstSection.querySelector('h2');
                if (h2Element) {
                    h2Element.after(newH1);
                } else {
                    firstSection.appendChild(newH1);
                }
            }
        }
        
        // Fix paragraph text
        const paragraphText = document.querySelector('.first > p');
        if (paragraphText) {
            paragraphText.style.display = 'block';
            paragraphText.style.visibility = 'visible';
            paragraphText.style.opacity = '1';
            paragraphText.style.color = '#c9c9c9';
            paragraphText.style.position = 'relative';
            paragraphText.style.zIndex = '100';
        }
    }
    
    // Run immediately
    forceTextVisibility();
    
    // Run again after a short delay to ensure it works
    setTimeout(forceTextVisibility, 500);
    
    // And again after the page has fully loaded
    window.addEventListener('load', forceTextVisibility);
});

// Fix service card layout
document.addEventListener('DOMContentLoaded', function() {
    // Ensure service card content is properly structured
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        // Get the card content
        const cardContent = card.querySelector('.card-content');
        
        if (cardContent) {
            // Get the icon, heading, and paragraph
            const icon = cardContent.querySelector('i');
            const heading = cardContent.querySelector('h3');
            const paragraph = cardContent.querySelector('p');
            
            // Ensure they exist and are in the correct order
            if (icon && heading && paragraph) {
                // Remove all children
                while (cardContent.firstChild) {
                    cardContent.removeChild(cardContent.firstChild);
                }
                
                // Add them back in the correct order
                cardContent.appendChild(icon);
                cardContent.appendChild(heading);
                cardContent.appendChild(paragraph);
                
                // Apply styles to ensure vertical layout
                cardContent.style.display = 'flex';
                cardContent.style.flexDirection = 'column';
                cardContent.style.alignItems = 'center';
                cardContent.style.textAlign = 'center';
                
                // Apply styles to individual elements
                icon.style.display = 'block';
                icon.style.marginBottom = '20px';
                
                heading.style.display = 'block';
                heading.style.width = '100%';
                heading.style.textAlign = 'center';
                heading.style.marginBottom = '15px';
                
                paragraph.style.display = 'block';
                paragraph.style.width = '100%';
                paragraph.style.textAlign = 'center';
            }
        }
    });
});

// Fix spacing issues in all H2 elements
document.addEventListener('DOMContentLoaded', function() {
    // Get all H2 elements
    const h2Elements = document.querySelectorAll('h2');
    
    h2Elements.forEach(h2 => {
        // Skip the "Discover" h2 which has special styling
        if (h2.id === 'discover-text' || h2.parentElement.classList.contains('first')) {
            return;
        }
        
        // Get the original text
        const originalText = h2.textContent;
        
        // Apply direct styling to ensure proper spacing
        h2.style.letterSpacing = '0.05em';
        h2.style.wordSpacing = '0.1em';
        h2.style.whiteSpace = 'normal';
        
        // If the text doesn't have spaces but should (based on length), try to add them
        if (!originalText.includes(' ') && originalText.length > 10) {
            // Try to detect camelCase or TitleCase and add spaces
            const spacedText = originalText.replace(/([a-z])([A-Z])/g, '$1 $2');
            
            // Only update if we actually added spaces
            if (spacedText !== originalText) {
                h2.textContent = spacedText;
            }
        }
        
        // For "The Pillars of Marketing" specifically
        if (originalText.includes('PillarsofMarketing') || 
            originalText.includes('Pillarsof') || 
            originalText.includes('ofMarketing')) {
            h2.textContent = 'The Pillars of Marketing';
        }
    });
    
    // Special fix for "The Pillars of Marketing"
    const marketingPillarsH2 = document.querySelector('.second-container h2');
    if (marketingPillarsH2) {
        marketingPillarsH2.textContent = 'The Pillars of Marketing';
        marketingPillarsH2.style.letterSpacing = '0.05em';
        marketingPillarsH2.style.wordSpacing = '0.1em';
    }
});

// EMERGENCY FIX for H2 word spacing
document.addEventListener('DOMContentLoaded', function() {
    // Fix for all section titles
    const sectionTitles = {
        '.second-container h2': 'The Pillars of Marketing',
        '.services-container h2': 'Our Services',
        '.portfolio-container h2': 'Our Work',
        '.contact-container h2': 'Get In Touch'
    };
    
    // Apply fixes to each section title
    for (const [selector, text] of Object.entries(sectionTitles)) {
        const element = document.querySelector(selector);
        if (element) {
            // Force the correct text with spaces
            element.innerHTML = text;
            
            // Apply direct styling
            element.style.letterSpacing = '0.05em';
            element.style.wordSpacing = '0.1em';
            element.style.whiteSpace = 'normal';
            element.style.textTransform = 'none';
            
            // Remove any animations
            element.style.animation = 'none';
            element.style.transition = 'none';
            
            // Add a class for additional styling
            element.classList.add('fixed-spacing');
        }
    }
    
    // Add a style element with !important rules
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .fixed-spacing {
            letter-spacing: 0.05em !important;
            word-spacing: 0.1em !important;
            white-space: normal !important;
            text-transform: none !important;
            animation: none !important;
            transition: none !important;
        }
    `;
    document.head.appendChild(styleElement);
});

// Ensure first section content is properly positioned with moderate adjustment
document.addEventListener('DOMContentLoaded', function() {
    // Get the first section elements
    const firstSection = document.querySelector('.first');
    const paragraph = document.querySelector('.first > p');
    
    if (firstSection && paragraph) {
        // Force paragraph to be visible
        paragraph.style.opacity = '1';
        paragraph.style.visibility = 'visible';
        paragraph.style.display = 'block';
        paragraph.classList.add('ended');
        
        // Apply moderate adjustment
        firstSection.style.marginTop = '-25px';
        paragraph.style.marginBottom = '160px';
        
        // Check if paragraph is visible in viewport
        function isParagraphVisible() {
            const rect = paragraph.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            // Consider it visible if at least 50% of it is in the viewport
            return rect.top < windowHeight && rect.bottom > 0;
        }
        
        // If paragraph is still not visible, make additional adjustments
        setTimeout(function() {
            if (!isParagraphVisible()) {
                // Make a slightly stronger adjustment
                firstSection.style.marginTop = '-35px';
                paragraph.style.marginBottom = '140px';
            }
        }, 500);
    }
});

// Enhanced navbar functionality
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav.header');
    
    // On Scroll Functionality
    window.addEventListener('scroll', () => {
        const windowTop = window.scrollY;
        if (windowTop > 50) { // Reduced threshold for quicker shadow effect
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
            
            // Check if it's an external link
            if (targetId.startsWith('http') || targetId.includes('.html')) {
                window.location.href = targetId;
                return;
            }
            
            // Get the target element
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Calculate position to scroll to (accounting for fixed navbar)
                const navHeight = nav.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active state on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + nav.offsetHeight + 50; // Add offset for navbar height
        
        // Get all sections
        const sections = document.querySelectorAll('div[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                document.querySelectorAll('.header .a').forEach(a => {
                    a.classList.remove('active');
                });
                
                // Add active class to corresponding link
                const correspondingLink = document.querySelector(`.header .a[href="#${section.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    });
});

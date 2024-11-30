import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000) 

// Load the model
const gltfLoader = new GLTFLoader()
let sceneModel = null

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Light state
let isLightOn = false

// Point light for the bulb
const bulbLight = new THREE.PointLight(0xFF0000, 0, 200)
bulbLight.decay = 1
bulbLight.intensity = 0

// Create surrounding lights
const surroundingLights = []
for (let i = 0; i < 4; i++) {
    const light = new THREE.PointLight(0xFF0000, 0, 100)
    light.decay = 1
    surroundingLights.push(light)
    scene.add(light)
}

// Add a spotlight for focused beam
const spotLight = new THREE.SpotLight(0xFF0000, 0, 200, Math.PI / 4, 0.5, 1)
spotLight.intensity = 0
spotLight.decay = 1
scene.add(spotLight)

scene.add(bulbLight)

gltfLoader.load(
    '/scene.gltf',
    function(gltf) {
        sceneModel = gltf.scene
        sceneModel.position.set(0, -3, 0)  
        sceneModel.rotation.set(0, 0, 0)  
        sceneModel.scale.set(50, 50, 50)  
        sceneModel.visible = true
        scene.add(sceneModel)

        // Find the bulb part of the model (assuming it's named 'bulb' or similar)
        sceneModel.traverse((child) => {
            if (child.isMesh) {
                console.log('Found mesh:', child.name)
                // Make the mesh slightly emissive when light is on
                child.material = child.material.clone()
                child.material.emissive = new THREE.Color(0xFF0000)
                child.material.emissiveIntensity = 0
            }
        })
        
        // Center camera on model
        camera.position.set(0, 2, 5)  
        camera.lookAt(sceneModel.position)
        controls.target.set(0, 0, 0)  

        console.log('Model loaded successfully:', sceneModel)
        console.log('Model visibility:', sceneModel.visible)
        console.log('Model position:', sceneModel.position)
        console.log('Model in scene:', scene.children.includes(sceneModel))
    },
    function(progress) {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
    },
    function(error) {
        console.error('Error loading model:', error)
    }
)

// Click event
window.addEventListener('click', (event) => {
    if(currentSection === 1 && sceneModel) {
        mouse.x = (event.clientX / sizes.width) * 2 - 1
        mouse.y = - (event.clientY / sizes.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(sceneModel, true)

        if(intersects.length > 0) {
            isLightOn = !isLightOn
            
            // Update main light
            bulbLight.intensity = isLightOn ? 150 : 0
            bulbLight.position.copy(intersects[0].point)
            
          
            // Update spotlight
            spotLight.intensity = isLightOn ? 100 : 0 
            spotLight.position.copy(intersects[0].point)
            spotLight.target.position.set(
                intersects[0].point.x,
                intersects[0].point.y - 20,
                intersects[0].point.z
            )
            
            // Make the model parts glow
            sceneModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissiveIntensity = isLightOn ? 0.5 : 0
                }
            })
            
            console.log('Light bulb clicked! Light is now:', isLightOn ? 'ON' : 'OFF')
        }
    }
})

// Add lighting for the model
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight.position.set(0, 5, 10)
scene.add(directionalLight)

/**
 * Galaxy
 */
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    waveSpeed: 1,
    waveHeight: 0.2
}

let geometry = null
let material = null
let points = null
let originalPositions = null

const generateGalaxy = () => {
    // Dispose old galaxy
    if(points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Store original positions for wave animation
    originalPositions = positions.slice()

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()

/**
 * Debug GUI
 */
const gui = new dat.GUI()

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
gui.add(parameters, 'waveSpeed').min(0).max(5).step(0.1)
gui.add(parameters, 'waveHeight').min(0).max(2).step(0.1)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.target.set(0, 0, 0)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.floor(scrollY / sizes.height)
    
    if(newSection !== currentSection) {
        currentSection = newSection
        console.log('Current section:', currentSection)
        
        // Keep background black for all sections
        scene.background = new THREE.Color(0x000000)
        
        // Section 0 - Galaxy
        if(points) {
            points.visible = currentSection === 0
        }
        
        // Section 1 - Light Bulb
        if(sceneModel) {
            sceneModel.visible = currentSection === 1
        }

        // Update camera for each section
        if(currentSection === 0) {
            camera.position.set(0, 2, 5)
        } else if(currentSection === 1) {
            camera.position.set(0, 0, 5)  
            camera.lookAt(0, 0, 0)
        }
        
        // GUI visibility
        if(currentSection === 0) {
            gui.show()
        } else {
            gui.hide()
        }
    }
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = clock.getDelta()

    // Update particles in a wave pattern
    if(points && originalPositions) {
        const positions = points.geometry.attributes.position.array
        for(let i = 0; i < parameters.count; i++) {
            const i3 = i * 3
            const x = originalPositions[i3]
            const z = originalPositions[i3 + 2]
            
            // Create wave effect
            const distance = Math.sqrt(x * x + z * z)
            positions[i3 + 1] = originalPositions[i3 + 1] + 
                Math.sin(distance * 2 + elapsedTime * parameters.waveSpeed) * 
                parameters.waveHeight * (1 - distance / parameters.radius)
        }
        points.geometry.attributes.position.needsUpdate = true
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
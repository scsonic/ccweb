import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Camera position
camera.position.set(0, 50, 150);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 60;
controls.maxDistance = 500;
controls.target.set(0, 0, 0);

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Starfield background
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 4000;
        const y = (Math.random() - 0.5) * 4000;
        const z = (Math.random() - 0.5) * 4000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

createStarfield();

// Create Earth
const earthGeometry = new THREE.SphereGeometry(30, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
    shininess: 25,
    specular: 0x333333
});

// Add simple texture-like appearance with a pattern
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// Ocean base
ctx.fillStyle = '#1a5f7a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Continents (simplified)
ctx.fillStyle = '#2d8650';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 150 + 50;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Clouds
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 50 + 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

const earthTexture = new THREE.CanvasTexture(canvas);
earthMaterial.map = earthTexture;

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.name = 'earth';
scene.add(earth);

// Create CO3D Satellites (4 satellites)
const satellites = [];
const satelliteData = [
    { name: 'CO3D-1', angle: 0, orbitRadius: 50, speed: 0.01, color: 0xff6b6b },
    { name: 'CO3D-2', angle: Math.PI / 2, orbitRadius: 55, speed: 0.008, color: 0x4ecdc4 },
    { name: 'CO3D-3', angle: Math.PI, orbitRadius: 52, speed: 0.012, color: 0xffe66d },
    { name: 'CO3D-4', angle: 3 * Math.PI / 2, orbitRadius: 58, speed: 0.009, color: 0x95e1d3 }
];

satelliteData.forEach((data, index) => {
    // Satellite body
    const satelliteGeometry = new THREE.BoxGeometry(2, 2, 3);
    const satelliteMaterial = new THREE.MeshPhongMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.3 });
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);

    // Solar panels
    const panelGeometry = new THREE.BoxGeometry(5, 0.1, 2);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x1a3a52, emissive: 0x1a3a52, emissiveIntensity: 0.2 });
    const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
    const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);
    panel1.position.set(3.5, 0, 0);
    panel2.position.set(-3.5, 0, 0);

    satellite.add(panel1);
    satellite.add(panel2);

    satellite.userData = {
        name: data.name,
        type: 'satellite',
        number: index + 1,
        angle: data.angle,
        orbitRadius: data.orbitRadius,
        speed: data.speed,
        orbitTilt: Math.random() * 0.3 // Random orbit inclination
    };

    satellites.push(satellite);
    scene.add(satellite);
});

// Create Moon
const moonGeometry = new THREE.SphereGeometry(8, 32, 32);
const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    emissive: 0x333333
});
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(200, 30, 100);
moon.name = 'moon';
scene.add(moon);

// Create Sun (with glow effect)
const sunGeometry = new THREE.SphereGeometry(40, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-800, 200, -400);
sun.name = 'sun';
scene.add(sun);

// Add sun glow
const glowGeometry = new THREE.SphereGeometry(45, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3
});
const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sun.add(sunGlow);

// Lighting
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.copy(sun.position).normalize().multiplyScalar(500);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Dialog functions
function updateDialog(header, text, images = []) {
    const dialogHeader = document.getElementById('dialog-header');
    const dialogText = document.getElementById('dialog-text');
    const dialogImages = document.getElementById('dialog-images');

    dialogHeader.textContent = header;
    dialogText.textContent = text;

    dialogImages.innerHTML = '';
    images.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        dialogImages.appendChild(img);
    });
}

// Click handler
function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersectableObjects = [earth, moon, sun, ...satellites];
    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length > 0) {
        let object = intersects[0].object;

        // Find the top-level object
        while (object.parent && object.parent.type !== 'Scene') {
            if (object.userData.type === 'satellite') break;
            object = object.parent;
        }

        if (object.userData.type === 'satellite') {
            // Satellite clicked
            const satData = object.userData;
            updateDialog(
                `CO3D Satellite ${satData.number}`,
                `This is ${satData.name}, part of the Constellation Optique 3D (CO3D) earth observation satellite constellation by CNES. The CO3D constellation initially consists of four satellites designed for high-resolution 3D Earth imaging. In the future, this constellation might be expanded to twenty satellites for enhanced global coverage and temporal resolution.`
            );
        } else if (object.name === 'earth') {
            // Earth clicked - calculate lat/lon
            const point = intersects[0].point;
            const normalized = point.clone().normalize();

            // Convert to spherical coordinates
            const lat = Math.asin(normalized.y) * (180 / Math.PI);
            const lon = Math.atan2(normalized.x, normalized.z) * (180 / Math.PI);

            updateDialog(
                'Earth Location',
                `Coordinates: Latitude ${lat.toFixed(2)}°, Longitude ${lon.toFixed(2)}°\n\nYou clicked on planet Earth! This point represents a location on our planet's surface.`
            );
        } else if (object.name === 'moon') {
            updateDialog(
                'The Moon',
                `Earth's natural satellite, the Moon orbits our planet at an average distance of 384,400 km. It's the fifth largest moon in our solar system.`
            );
        } else if (object.name === 'sun') {
            updateDialog(
                'The Sun',
                `Our star, the Sun, is approximately 150 million kilometers away from Earth. It provides the light and energy that makes life on Earth possible.`
            );
        }
    }
}

window.addEventListener('click', onClick);

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Rotate Earth
    earth.rotation.y += 0.001;

    // Orbit satellites
    satellites.forEach(satellite => {
        satellite.userData.angle += satellite.userData.speed;

        const x = Math.cos(satellite.userData.angle) * satellite.userData.orbitRadius;
        const z = Math.sin(satellite.userData.angle) * satellite.userData.orbitRadius;
        const y = Math.sin(satellite.userData.angle * 2 + satellite.userData.orbitTilt * 10) * 5;

        satellite.position.set(x, y, z);

        // Rotate satellite to face forward in orbit
        satellite.rotation.y = -satellite.userData.angle;
    });

    // Slowly rotate moon around Earth
    moon.position.x = Math.cos(time * 0.05) * 200 + Math.sin(time * 0.03) * 20;
    moon.position.z = Math.sin(time * 0.05) * 200 + Math.cos(time * 0.03) * 20;

    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

console.log('CO3D Earth Satellite Viewer initialized!');

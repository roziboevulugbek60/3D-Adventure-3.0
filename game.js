
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { createCharacter } from "./player.js";

// Xatolarni ko'rsatish
window.addEventListener("error", (event) => {
    const box = document.getElementById("errorBox");
    box.style.display = "block";
    box.textContent = "XATO:\n" + event.message;
});

const loading = document.getElementById("loading");
const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const hud = document.getElementById("hud");

let started = false;
let paused = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc9e5);
scene.fog = new THREE.Fog(0x8fc9e5, 45, 180);

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.body.appendChild(renderer.domElement);

// Yorug'lik
const skyLight = new THREE.HemisphereLight(
    0xc9eaff,
    0x40542d,
    2
);
scene.add(skyLight);

const sun = new THREE.DirectionalLight(0xfff0d0, 2.5);
sun.position.set(40, 70, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
scene.add(sun);

// Yer
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(350, 350, 100, 100),
    new THREE.MeshStandardMaterial({
        color: 0x416b36,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Yerning mayda balandliklari
const position = ground.geometry.attributes.position;

for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);

    const height =
        Math.sin(x * 0.055) * 0.7 +
        Math.cos(y * 0.06) * 0.7;

    position.setZ(i, height);
}

position.needsUpdate = true;
ground.geometry.computeVertexNormals();

// Suv
const water = new THREE.Mesh(
    new THREE.PlaneGeometry(65, 22),
    new THREE.MeshStandardMaterial({
        color: 0x268dc0,
        roughness: 0.2,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85
    })
);

water.rotation.x = -Math.PI / 2;
water.position.set(20, 0.1, -35);
scene.add(water);

// Daraxt materiali
const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x654126
});

const leafMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x245d32 }),
    new THREE.MeshStandardMaterial({ color: 0x347c39 }),
    new THREE.MeshStandardMaterial({ color: 0x194b2c })
];

function createTree(x, z, scale = 1) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 3, 8),
        trunkMaterial
    );

    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);

    for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.6 - i * 0.2, 2.8, 8),
            leafMaterials[i]
        );

        leaves.position.y = 3 + i * 0.9;
        leaves.castShadow = true;
        tree.add(leaves);
    }

    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    scene.add(tree);
}

// Tosh
function createRock(x, z) {
    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(
            0.6 + Math.random() * 0.8,
            0
        ),
        new THREE.MeshStandardMaterial({
            color: 0x777b78,
            roughness: 1
        })
    );

    rock.position.set(x, 0.5, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    scene.add(rock);
}

// O'rmon
for (let i = 0; i < 180; i++) {
    const x = (Math.random() - 0.5) * 290;
    const z = (Math.random() - 0.5) * 290;

    if (Math.abs(x) < 9 && Math.abs(z) < 9) continue;

    createTree(
        x,
        z,
        0.7 + Math.random() * 0.8
    );
}

// Toshlar
for (let i = 0; i < 75; i++) {
    const x = (Math.random() - 0.5) * 280;
    const z = (Math.random() - 0.5) * 280;
    createRock(x, z);
}

// Tog'lar
const mountainMaterial = new THREE.MeshStandardMaterial({
    color: 0x687b7a,
    roughness: 1
});

for (let i = 0; i < 18; i++) {
    const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(
            8 + Math.random() * 13,
            20 + Math.random() * 22,
            6
        ),
        mountainMaterial
    );

    mountain.position.set(
        (Math.random() - 0.5) * 290,
        12,
        (Math.random() - 0.5) * 290
    );

    mountain.castShadow = true;
    scene.add(mountain);
}

// O'yinchi
const {
    player,
    animateCharacter
} = createCharacter(THREE);

scene.add(player);
player.position.set(0, 0, 0);

// Kristallar va resurslar
const resources = [];

function createResource(type, x, z) {
    const colors = {
        crystal: 0x48eaff,
        wood: 0x9b582b,
        food: 0xe9b84d
    };

    const geometry = type === "crystal"
        ? new THREE.OctahedronGeometry(0.65)
        : type === "wood"
            ? new THREE.BoxGeometry(0.9, 0.8, 0.9)
            : new THREE.SphereGeometry(0.45, 12, 12);

    const material = new THREE.MeshStandardMaterial({
        color: colors[type],
        emissive: colors[type],
        emissiveIntensity: type === "crystal" ? 0.7 : 0.15,
        roughness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 1, z);
    mesh.castShadow = true;
    scene.add(mesh);

    resources.push({
        mesh,
        type,
        collected: false
    });
}

for (let i = 0; i < 25; i++) {
    createResource(
        "crystal",
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
}

for (let i = 0; i < 25; i++) {
    createResource(
        "wood",
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
}

for (let i = 0; i < 15; i++) {
    createResource(
        "food",
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
}

// O'yinchi statistikasi
const stats = {
    health: 100,
    food: 100,
    water: 100,
    crystals: 0,
    wood: 0,
    xp: 0,
    level: 1
};

let jumpVelocity = 0;
let onGround = true;
let elapsed = 0;
let messageTimer = 0;
let cameraAngle = 0;
let cameraDistance = 8;

const keys = {};
const mobileKeys = {};

let runningMobile = false;

function showMessage(text) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.opacity = "1";

    messageTimer = 2.5;
}

function updateHUD() {
    document.getElementById("health").textContent =
        Math.round(stats.health);

    document.getElementById("food").textContent =
        Math.round(stats.food);

    document.getElementById("water").textContent =
        Math.round(stats.water);

    document.getElementById("crystals").textContent =
        stats.crystals;

    document.getElementById("wood").textContent =
        stats.wood;

    document.getElementById("levelText").textContent =
        `Daraja: ${stats.level} | XP: ${stats.xp}`;

    document.getElementById("questText").textContent =
        `Kristallarni toping: ${stats.crystals}/5`;
}

function addXP(amount) {
    stats.xp += amount;

    if (stats.xp >= stats.level * 100) {
        stats.xp -= stats.level * 100;
        stats.level++;
        showMessage("🎉 Yangi daraja: " + stats.level);
    }
}

function collectResource() {
    let nearest = null;
    let nearestDistance = 3;

    for (const resource of resources) {
        if (resource.collected) continue;

        const distance = player.position.distanceTo(
            resource.mesh.position
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = resource;
        }
    }

    if (!nearest) {
        showMessage("Yig'ish uchun resurs yaqin emas!");
        return;
    }

    nearest.collected = true;
    scene.remove(nearest.mesh);

    if (nearest.type === "crystal") {
        stats.crystals++;
        addXP(20);
        showMessage("💎 Kristall olindi!");
    } else if (nearest.type === "wood") {
        stats.wood += 1;
        addXP(10);
        showMessage("🪵 Yog'och olindi!");
    } else {
        stats.food = Math.min(100, stats.food + 20);
        addXP(5);
        showMessage("🍗 Oziq-ovqat olindi!");
    }

    updateHUD();
}

// Klaviatura
window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }

    if (event.code === "KeyE") {
        collectResource();
    }

    if (event.code === "Escape" && started) {
        togglePause();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// Sakrash
function jump() {
    if (!started || paused || !onGround) return;

    jumpVelocity = 9;
    onGround = false;
}

// Mobil boshqaruv
document.querySelectorAll("[data-move]").forEach((button) => {
    const direction = button.dataset.move;

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        mobileKeys[direction] = true;
    });

    button.addEventListener("pointerup", () => {
        mobileKeys[direction] = false;
    });

    button.addEventListener("pointerleave", () => {
        mobileKeys[direction] = false;
    });

    button.addEventListener("pointercancel", () => {
        mobileKeys[direction] = false;
    });
});

document.getElementById("jumpBtn").addEventListener("pointerdown", jump);

document.getElementById("runBtn").addEventListener("pointerdown", () => {
    runningMobile = true;
});

document.getElementById("runBtn").addEventListener("pointerup", () => {
    runningMobile = false;
});

document.getElementById("runBtn").addEventListener("pointerleave", () => {
    runningMobile = false;
});

document.getElementById("collectBtn").addEventListener(
    "pointerdown",
    collectResource
);

// Sichqoncha bilan kamerani aylantirish
let dragging = false;
let lastMouseX = 0;

renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && started && !paused) {
        dragging = true;
        lastMouseX = event.clientX;
    }
});

window.addEventListener("pointerup", () => {
    dragging = false;
});

window.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const difference = event.clientX - lastMouseX;
    cameraAngle -= difference * 0.005;
    lastMouseX = event.clientX;
});

// O'yinchi harakati
function updatePlayer(dt) {
    let x = 0;
    let z = 0;

    if (keys.KeyW || keys.ArrowUp || mobileKeys.forward) z -= 1;
    if (keys.KeyS || keys.ArrowDown || mobileKeys.back) z += 1;
    if (keys.KeyA || keys.ArrowLeft || mobileKeys.left) x -= 1;
    if (keys.KeyD || keys.ArrowRight || mobileKeys.right) x += 1;

    const moving = x !== 0 || z !== 0;

    const running =
        keys.ShiftLeft ||
        keys.ShiftRight ||
        runningMobile;

    if (moving) {
        const length = Math.hypot(x, z);
        x /= length;
        z /= length;

        const mx =
            x * Math.cos(cameraAngle) -
            z * Math.sin(cameraAngle);

        const mz =
            x * Math.sin(cameraAngle) +
            z * Math.cos(cameraAngle);

        const speed = running ? 11 : 6;

        player.position.x += mx * speed * dt;
        player.position.z += mz * speed * dt;

        player.rotation.y = Math.atan2(mx, mz);
    }

    // Xarita chegarasi
    player.position.x = THREE.MathUtils.clamp(
        player.position.x, -165, 165
    );

    player.position.z = THREE.MathUtils.clamp(
        player.position.z, -165, 165
    );

    // Sakrash fizikasi
    if (!onGround) {
        jumpVelocity -= 22 * dt;
        player.position.y += jumpVelocity * dt;

        if (player.position.y <= 0) {
            player.position.y = 0;
            jumpVelocity = 0;
            onGround = true;
        }
    }

    // Oziq va suv asta kamayadi
    stats.food = Math.max(0, stats.food - dt * 0.12);
    stats.water = Math.max(0, stats.water - dt * 0.18);

    if (stats.food <= 0 || stats.water <= 0) {
        stats.health = Math.max(0, stats.health - dt * 1.5);
    }

    if (stats.health <= 0) {
        showMessage("Sog'liq tugadi! Qayta boshlang.");
        paused = true;
        pauseScreen.classList.remove("hidden");
    }

    // Animatsiya
    const currentY = player.position.y;
    player.position.y = 0;

    animateCharacter(
        elapsed,
        moving,
        running,
        !onGround
    );

    player.position.y = currentY;

    updateHUD();
}

// Kamera
function updateCamera() {
    const target = new THREE.Vector3(
        player.position.x,
        player.position.y + 1.5,
        player.position.z
    );

    const offset = new THREE.Vector3(
        Math.sin(cameraAngle) * cameraDistance,
        4.5,
        Math.cos(cameraAngle) * cameraDistance
    );

    camera.position.copy(target).add(offset);
    camera.lookAt(target);
}

// Kun va tun
function updateDayNight() {
    const cycle = (elapsed / 100) % 1;
    const night = cycle > 0.55 && cycle < 0.95;

    if (night) {
        scene.background.set(0x101b38);
        scene.fog.color.set(0x101b38);
        sun.intensity = 0.45;
        skyLight.intensity = 0.6;
        document.getElementById("timeText").textContent = "🌙 TUN";
    } else {
        scene.background.set(0x8fc9e5);
        scene.fog.color.set(0x8fc9e5);
        sun.intensity = 2.5;
        skyLight.intensity = 2;
        document.getElementById("timeText").textContent = "☀️ KUN";
    }
}

// O'yinni boshlash
function startGame() {
    started = true;
    paused = false;

    startScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    hud.style.display = "block";
    document.getElementById("pauseBtn").style.display = "block";

    if (window.matchMedia("(pointer: coarse)").matches) {
        document.getElementById("mobileControls").style.display = "flex";
    }

    showMessage("🌲 WILD FRONTIER ga xush kelibsiz!");
    updateHUD();
}

document.getElementById("startBtn").addEventListener("click", startGame);

// Pauza
function togglePause() {
    if (!started) return;

    paused = !paused;
    pauseScreen.classList.toggle("hidden", !paused);
}

document.getElementById("pauseBtn").addEventListener("click", togglePause);

document.getElementById("resumeBtn").addEventListener("click", () => {
    paused = false;
    pauseScreen.classList.add("hidden");
});

document.getElementById("restartBtn").addEventListener("click", () => {
    location.reload();
});

// Oyna hajmi o'zgarsa
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Asosiy o'yin sikli
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.04);

    if (started && !paused) {
        elapsed += dt;

        updatePlayer(dt);
        updateCamera();
        updateDayNight();

        // Kristallarni aylantirish
        for (const resource of resources) {
            if (resource.collected) continue;

            resource.mesh.rotation.y += dt;
            resource.mesh.position.y =
                1 + Math.sin(elapsed * 2 + resource.mesh.position.x) * 0.15;
        }

        if (messageTimer > 0) {
            messageTimer -= dt;

            if (messageTimer <= 0) {
                document.getElementById("message").style.opacity = "0";
            }
        }
    }

    renderer.render(scene, camera);
}

updateCamera();
animate();

loading.style.display = "none";

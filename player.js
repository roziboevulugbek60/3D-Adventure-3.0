
export function createCharacter(THREE) {
    const player = new THREE.Group();

    const skin = new THREE.MeshStandardMaterial({
        color: 0xdba77e,
        roughness: 0.8
    });

    const shirt = new THREE.MeshStandardMaterial({
        color: 0x287b4c,
        roughness: 0.8
    });

    const pants = new THREE.MeshStandardMaterial({
        color: 0x303b46,
        roughness: 0.9
    });

    const boots = new THREE.MeshStandardMaterial({
        color: 0x39271b,
        roughness: 1
    });

    const hair = new THREE.MeshStandardMaterial({
        color: 0x342016
    });

    const backpack = new THREE.MeshStandardMaterial({
        color: 0x80502a
    });

    const dark = new THREE.MeshStandardMaterial({
        color: 0x18231e
    });

    function addBox(parent, w, h, d, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    function addSphere(parent, r, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(r, 20, 16),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        parent.add(mesh);
        return mesh;
    }

    // Oyoqlar
    const legs = [];

    for (const side of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.22, 1.02, 0);
        player.add(pivot);

        addBox(pivot, 0.34, 0.83, 0.38, pants, 0, -0.37, 0);
        addBox(pivot, 0.36, 0.22, 0.53, boots, 0, -0.83, 0.08);

        legs.push(pivot);
    }

    // Tana
    addBox(player, 0.88, 0.95, 0.48, shirt, 0, 1.48, 0);

    // Kamar
    addBox(player, 0.91, 0.12, 0.50, dark, 0, 1.05, 0);

    // Bosh
    addSphere(player, 0.31, skin, 0, 2.23, 0);

    // Soch
    addSphere(player, 0.315, hair, 0, 2.37, -0.035);
    addBox(player, 0.57, 0.12, 0.53, hair, 0, 2.47, 0);

    // Ko'zlar
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x151515
    });

    addSphere(player, 0.035, eyeMaterial, -0.11, 2.25, 0.285);
    addSphere(player, 0.035, eyeMaterial, 0.11, 2.25, 0.285);

    // Burun
    addBox(player, 0.08, 0.09, 0.12, skin, 0, 2.17, 0.31);

    // Qo'llar
    const arms = [];

    for (const side of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.53, 1.85, 0);
        player.add(pivot);

        addBox(pivot, 0.25, 0.68, 0.29, shirt, 0, -0.31, 0);
        addSphere(pivot, 0.14, skin, 0, -0.68, 0);

        arms.push(pivot);
    }

    // Ryukzak
    addBox(player, 0.52, 0.75, 0.25, backpack, 0, 1.58, -0.35);

    // Ryukzak qopqog'i
    addBox(player, 0.42, 0.16, 0.29, dark, 0, 1.99, -0.35);

    // Ko'krak cho'ntaklari
    addBox(player, 0.22, 0.20, 0.04, backpack, -0.23, 1.65, 0.25);
    addBox(player, 0.22, 0.20, 0.04, backpack, 0.23, 1.65, 0.25);

    function animateCharacter(time, moving, running, airborne) {
        const speed = running ? 13 : 8;
        const swing = moving ? Math.sin(time * speed) * 0.55 : 0;

        legs[0].rotation.x = swing;
        legs[1].rotation.x = -swing;

        arms[0].rotation.x = -swing * 0.8;
        arms[1].rotation.x = swing * 0.8;

        if (airborne) {
            legs[0].rotation.x = -0.4;
            legs[1].rotation.x = 0.4;
        }

        player.position.y += moving && !airborne
            ? Math.sin(time * speed * 2) * 0.012
            : 0;
    }

    return {
        player,
        animateCharacter
    };
}

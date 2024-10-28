import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

// Scene
const scene = new THREE.Scene();

// Set a black background color
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
    45, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
camera.position.set(0, 20, 50); // Adjusted for a better initial view
camera.lookAt(scene.position); // Ensure the camera is looking at the scene

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('solarSystemCanvas'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Handle window resize
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increase intensity
scene.add(ambientLight);

// Point Light (Sunlight)
const pointLight = new THREE.PointLight(0xffffff, 1.5); // Increase intensity
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunTexture = new THREE.TextureLoader().load('textures/sun.jpg');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); // Use texture for the sun
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// Array to store planets
const planets = [];

// Function to create a planet
function createPlanet({ size, texture, position, name, speed }) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const planetTexture = new THREE.TextureLoader().load(`textures/${texture}`); // Updated path
    const material = new THREE.MeshStandardMaterial({ map: planetTexture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position;
    scene.add(mesh);
    planets.push({ mesh, angle: Math.random() * Math.PI * 2, speed, distance: position, name });
}

// Create planets with reduced speeds
createPlanet({ size: 1, texture: 'mercury.jpg', position: 8, name: 'Mercury', speed: 0.00125 }); // Slower speed
createOrbit(8);

createPlanet({ size: 1.2, texture: 'venus.jpg', position: 11, name: 'Venus', speed: 0.0009375 }); // Slower speed
createOrbit(11);

createPlanet({ size: 1.3, texture: 'earth.jpg', position: 15, name: 'Earth', speed: 0.000625 }); // Slower speed
createOrbit(15);

createPlanet({ size: 1.1, texture: 'mars.jpg', position: 18, name: 'Mars', speed: 0.0005 }); // Slower speed
createOrbit(18);

createPlanet({ size: 2.5, texture: 'jupiter.jpg', position: 24, name: 'Jupiter', speed: 0.000375 }); // Slower speed
createOrbit(24);

createPlanet({ size: 2.2, texture: 'saturn.jpg', position: 30, name: 'Saturn', speed: 0.0003125 }); // Slower speed
createOrbit(30);

createPlanet({ size: 1.9, texture: 'uranus.jpg', position: 34, name: 'Uranus', speed: 0.00025 }); // Slower speed
createOrbit(34);

createPlanet({ size: 1.8, texture: 'neptune.jpg', position: 38, name: 'Neptune', speed: 0.0001875 }); // Slower speed
createOrbit(38);

// Function to create an orbital line
function createOrbit(distance) {
    const curve = new THREE.EllipseCurve(
        0, 0, // ax, aY - center of the orbit
        distance, distance, // xRadius, yRadius
        0, 2 * Math.PI, // startAngle, endAngle
        false, // clockwise?
        0 // rotation
    );

    const points = curve.getPoints(100); // More points make the orbit smoother
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color: 0x888888 });
    const ellipse = new THREE.LineLoop(geometry, material);

    ellipse.rotation.x = Math.PI / 2; // Rotate to align with the x-z plane
    scene.add(ellipse);
}

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable inertial damping
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;
controls.autoRotate = false;
controls.target.copy(sunMesh.position); // Focus on the sun

// Add stars
let stars;
addStars();

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const numStars = 100000; // Number of stars

    for (let i = 0; i < numStars; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            size: { value: 3.0 }, // Size of the stars
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            uniform float size;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float time;
            void main() {
                // Calculate twinkle effect
                float twinkle = 0.5 + 0.5 * sin(time + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
                float glow = 0.3 + 0.9 * twinkle; // Adjust glow intensity

                // Create a circular shape
                vec2 coord = gl_PointCoord - vec2(0.5);
                if (length(coord) > 0.5) discard;

                gl_FragColor = vec4(color * glow, 1.0);
            }
        `,
        transparent: true
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function updateLabels() {
    const labels = [
        { element: document.getElementById('mercuryLabel'), planet: planets[0] },
        { element: document.getElementById('venusLabel'), planet: planets[1] },
        { element: document.getElementById('earthLabel'), planet: planets[2] },
        { element: document.getElementById('marsLabel'), planet: planets[3] },
        { element: document.getElementById('jupiterLabel'), planet: planets[4] },
        { element: document.getElementById('saturnLabel'), planet: planets[5] },
        { element: document.getElementById('uranusLabel'), planet: planets[6] },
        { element: document.getElementById('neptuneLabel'), planet: planets[7] }
    ];

    labels.forEach(({ element, planet }) => {
        const vector = new THREE.Vector3();
        planet.mesh.getWorldPosition(vector);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

        // Add an offset to the y position to make the label float above the planet
        const yOffset = 20; // Adjust this value as needed
        element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - yOffset}px)`;
    });
}

// Vertex Shader
const vertexShader = `
    varying vec3 vNormal;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader with adjusted plasma effect and color
const fragmentShader = `
    varying vec3 vNormal;
    uniform float time;

    // Simple noise function
    float noise(vec3 p) {
        return sin(p.x) * sin(p.y) * sin(p.z);
    }

    void main() {
        // Calculate the intensity of the glow
        float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

        // Add a moving plasma effect using noise
        float plasma = noise(vNormal * 20.0 + time * 2.0); // Increase the scale factor to decrease plasma size
        intensity += plasma * 0.1; // Adjust the plasma effect intensity

        // Set the color with increased brightness and more orange tone
        gl_FragColor = vec4(1.0, 0.6, 0.0, 1.0) * intensity * 1.5; // Adjusted to a more orange tone
    }
`;

// Create a shader material for the glow
const glowMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        time: { value: 0.0 }
    },
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

// Create a larger sphere for the glow effect
const glowGeometry = new THREE.SphereGeometry(5.5, 32, 32); // Slightly larger than the sun
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowMesh);

// Function to animate the scene
function animate() {
    requestAnimationFrame(animate);

    // Rotate the sun
    sunMesh.rotation.y += 0.002;

    // Animate planets
    planets.forEach(planet => {
        planet.angle += planet.speed; // Update the angle for rotation
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle); // Calculate x position
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle); // Calculate z position
        planet.mesh.rotation.y += 0.01; // Rotate the planet itself

        // Update label position
        updateLabelPosition(planet, `${planet.name.toLowerCase()}Label`);
    });

    // Update camera position if a planet is selected
    if (currentPlanet) {
        const offset = new THREE.Vector3(0, 2, 5); // Offset for camera position
        const planetPosition = currentPlanet.mesh.position.clone();
        const cameraPosition = planetPosition.add(offset);
        
        camera.position.lerp(cameraPosition, 0.1); // Smoothly interpolate to the new position
        camera.lookAt(currentPlanet.mesh.position);
    }

    renderer.render(scene, camera);
}

animate();

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function handleMouseClick(event) {
    const hologramOverlay = document.getElementById('hologramOverlay');
    if (hologramOverlay.style.display === 'flex') {
        // Overlay is visible; don't process clicks in the Three.js scene
        return;
    }

    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedPlanetMesh = intersects[0].object;
        const clickedPlanet = planets.find(p => p.mesh === clickedPlanetMesh);
        
        if (clickedPlanet) {
            console.log(`Clicked on: ${clickedPlanet.name}`);
            zoomToPlanet(clickedPlanet);
            displayHologram(clickedPlanet.name);
        }
    }
}

// Add event listener for mouse clicks
window.addEventListener('click', handleMouseClick, false);

// Function to display planet information or project details
function displayHologram(planetName, projectIndex = null) {
    const hologramOverlay = document.getElementById('hologramOverlay');
    const hologramContent = document.getElementById('hologramContent');
    const headerText = document.getElementById('headerText');
    const backButton = document.getElementById('backButton');

    // Hide the header text
    headerText.style.display = 'none';

    // Retrieve the information for the clicked planet
    const info = planetInfo[planetName];

    if (!info) {
        console.error(`No information found for planet: ${planetName}`);
        return;
    }

    let contentHtml = '';

    // Log for debugging
    console.log('displayHologram called with:', { planetName, projectIndex });

    if (projectIndex !== null && projectIndex !== undefined) {
        // Display project details
        const project = info.projects[projectIndex];
        console.log(`Project Index: ${projectIndex}`, project); // Debugging log

        if (project) {
            // Check if the project has a gif or images
            if (project.gif) {
                // Use the GIF
                contentHtml = `
                    <h1 style="text-align: center;">${info.title}</h1>
                    <h2 style="text-align: center;">${project.name}</h2>
                    <div class="project-carousel" style="display: flex; justify-content: center;">
                        <img src="${project.gif}" class="carousel-image" alt="Project GIF" style="max-width: 100%; height: auto;" />
                    </div>
                    <p>${project.longDescription}</p>
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" style="display: flex; justify-content: center;">
                            <img src="textures/github.png" alt="GitHub" class="github-link" />
                        </a>
                    ` : ''}
                `;
            } else if (project.images) {
                // Use the image carousel
                contentHtml = `
                    <h1 style="text-align: center;">${info.title}</h1>
                    <h2 style="text-align: center;">${project.name}</h2>
                    <div class="project-carousel">
                        ${project.images.map(img => `<img src="${img}" class="carousel-image" alt="Project Image" />`).join('')}
                    </div>
                    <p>${project.longDescription}</p>
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" style="display: flex; justify-content: center;">
                            <img src="textures/github.png" alt="GitHub" class="github-link" />
                        </a>
                    ` : ''}
                `;
            }
            backButton.style.display = 'block'; // Show the back button
        } else {
            console.error(`No project found at index: ${projectIndex}`);
            return;
        }
    } else {
        // Display planet content
        contentHtml = `<h1>${info.title}</h1>`;
        switch (planetName) {
            case 'Mercury':
                contentHtml += info.jobs.map(job => `
                    <div class="job">
                        <h2>${job.company}</h2>
                        <h3>${job.position}</h3>
                        <p>${job.description}</p>
                    </div>
                `).join('');
                break;
            case 'Venus':
                contentHtml += `
                    <div class="contact-info">
                        <a href="${info.linkedin}" target="_blank">
                            <img src="textures/linkedin.png" alt="LinkedIn" class="contact-icon" />
                        </a>
                        <a href="mailto:${info.email}">
                            <img src="textures/gmail.png" alt="Email" class="contact-icon" />
                        </a>
                        <a href="${info.github}" target="_blank">
                            <img src="textures/github.png" alt="GitHub" class="contact-icon" />
                        </a>
                    </div>
                `;
                break;
            case 'Earth':
                contentHtml += `
                    <img src="${info.image}" alt="Profile Picture" class="about-me-image" />
                    <p>${info.description}</p>
                `;
                break;
            case 'Mars':
                contentHtml += `
                    <div class="hobbies-list">
                        ${info.hobbies.map(hobby => `<p>${hobby}</p>`).join('')}
                    </div>
                `;
                break;
            case 'Jupiter':
                contentHtml += info.projects.map((project, index) => `
                    <div class="project" data-index="${index}">
                        <img src="${project.image || project.gif}" alt="${project.name}" class="project-image" />
                        <div class="project-details">
                            <h2>${project.name}</h2>
                            <p>${project.description}</p>
                        </div>
                        <p class="enter-text">Enter →</p>
                    </div>
                `).join('');
                backButton.style.display = 'none'; // Hide the back button
                break;
            case 'Saturn':
                contentHtml += `
                    <div class="skills-box">
                        ${info.skills.map(skill => `<img src="${skill}" alt="Skill Logo" class="skill-logo" />`).join('')}
                    </div>
                `;
                break;
            case 'Uranus':
                contentHtml += `
                    <iframe src="${info.pdf}" width="100%" height="600px" frameborder="0"></iframe>
                `;
                break;
            case 'Neptune':
                contentHtml += info.schools.map(school => `
                    <div class="education">
                        <img src="${school.logo}" alt="${school.name} Logo" class="education-logo" />
                        <div class="education-details">
                            <h2>${school.name}</h2>
                            <p>${school.degree}</p>
                        </div>
                    </div>
                `).join('');
                break;
            default:
                console.error(`Unhandled planet: ${planetName}`);
        }
    }

    // Log the final HTML content for debugging
    console.log('Final contentHtml:', contentHtml);

    // Display the information in the hologram overlay
    hologramContent.innerHTML = contentHtml;
    hologramOverlay.style.display = 'flex'; // Ensure the overlay is displayed
    console.log('hologramOverlay display style:', hologramOverlay.style.display);

    // Attach event listeners to project elements if displaying the project list
    if (planetName === 'Jupiter' && (projectIndex === null || projectIndex === undefined)) {
        const projectElements = hologramContent.querySelectorAll('.project');
        projectElements.forEach((element) => {
            element.addEventListener('click', () => {
                const index = element.getAttribute('data-index');
                displayHologram(planetName, parseInt(index, 10));
            });
        });
    }
}

// Close button functionality
document.getElementById('exitButton').addEventListener('click', () => {
    refocusOnSun();
    document.getElementById('exitButton').style.display = 'none'; // Hide the button
    document.getElementById('headerText').style.display = 'block'; // Show the header text again
});

// Attach the function to the window object to make it globally accessible
window.displayHologram = displayHologram;

// Planet information
const planetInfo = {
    Mercury: {
        title: "Work Experience",
        jobs: [
            {
                company: "Urban Furnished",
                position: "Project Manager",
                description: "I spearheaded daily interactions with C-level executives, collaborating closely to devise and implement innovative business strategies that enhanced operational efficiency and market positioning. I directed a team of 5 interns, leading them across diverse projects that ranged from UX/UI design to operational initiatives, fostering cross-functional synergy and achieving project objectives. I also managed the maintenance and online visibility of 250 luxury units, driving marketing initiatives that broadened brand reach and strengthened market presence. As part of process optimization efforts, I co-authored a comprehensive 130-page SOP, clearly defining operational protocols and departmental roles to improve workflow and ensure procedural consistency across the company. I played a pivotal role in cultivating strategic partnerships between Urban Furnished and external entities, facilitating business expansion. I led a complete overhaul of the website’s UI, refining the user experience to enhance brand identity, customer satisfaction, and engagement. Additionally, I directed the strategic management of social media platforms, supervising content strategy and ensuring alignment with organizational goals, driving brand awareness and engagement."
            },
            {
                company: "Blueground",
                position: "Operations Specialist",
                description: "I conducted in-depth analyses of monthly Key Performance Indicators (KPIs) to evaluate team progress, collaborating with C-suite executives to identify areas for improvement and establish new performance targets. I executed a data cleansing process on the internal database, eliminating inconsistencies in customer data and improving website functionality and user experience. I managed comprehensive documentation and communication for tenants across properties, ensuring accurate record-keeping, efficient issue resolution, and enhanced tenant satisfaction. I also designed and revised 150-floor plan documents, improving the accuracy and clarity of property descriptions to communicate key features to potential clients effectively. In addition to these tasks, I assisted the Operations Manager with administrative duties, including warehouse orders, onboarding new apartments, setting up utilities, and placing orders. I led the installation of new residences, coordinating access, managing movers and contractors, and overseeing furniture and art installations to align with Blueground's design standards. I served as the primary point of contact for visitors and the Client Experience team, conducting regular property inspections to maintain high standards and ensure readiness for tenant check-ins."
            },
            // Add more jobs as needed
        ]
    },
    Venus: {
        title: "Contact Info",
        email: "isaiahkantor23@gmail.com",
        linkedin: "https://www.linkedin.com/in/isaiah-kantor-344142127/",
        github: "https://github.com/eclipse4700"
    },
    Earth: {
        title: "About Me",
        image: "textures/profilepic.jpeg",
        description: "After graduating from college with a degree in business, I worked in operations and project management for real estate start-ups.  During this time I developed a keen interest in the use of software to address business issues. I completed a software engineering program at the Flatiron School, where I gained a foundation in software development technical skills. The curriculum required me to apply these skills by completing several technical projects. I now seek an entry-level position that would enable me to use my skills to develop software that meets end-user requirements."
    },
    Mars: {
        title: "Interest/Hobbies",
        hobbies: ["Reading", "Traveling", "Video Games", "Hiking", "Coding", "Movies & TV", "VR"]
    },
    Jupiter: {
        title: "Projects",
        projects: [
            {
                name: "Tankzzz",
                image: "textures/Tankzzz.jpg",
                description: "Galactica type Tank game built in Python using Pygame.",
                gif: "textures/tankzzzgif.gif",
                longDescription: "For my Tankzzz project, my team and I implemented dynamic sprite-based gameplay, allowing users to navigate a tank and engage in battles with enemies. We designed and developed a health and scoring systems using custom sprites and animations, creating a visually engaging experience that responds dynamically to player actions. To further enhance user engagement, we integrated a high-score tracking system, enabling players to save their scores and strive for higher performance. This project allowed me to explore the intersection of game design and development while creating an interactive and fun experience for players.",
                github: "https://github.com/eclipse4700/Tank-Game"
            },
            {
                name: "Grocery Genius",
                image: "textures/GroceryGeniusLogo.png",
                description: "Food Waste App built using Swift and Core Data.",
                images: [
                    "textures/GroceryG1.jpg",
                    "textures/GroceryG2.jpg",
                    "textures/GroceryG3.jpg",
                    "textures/GroceryG4.jpg",
                    "textures/GroceryG5.jpg",
                    "textures/GroceryG6.jpg"
                ],
                longDescription: "For my GroceryGenius project, I integrated the OpenAI API to provide dynamic recipe suggestions based on the user's grocery items, creating a more personalized and intuitive experience. I designed and implemented Core Data models to effectively store and manage grocery items, allowing users to manually track expiration dates for each item. Additionally, I developed a calendar feature that not only visualizes these expiration dates but also sends alerts as they approach, helping users reduce food waste and stay organized. This project combined my technical skills in Swift and Core Data with a user-focused approach to create a practical and functional app. ", 
            }
            // Add more projects as needed
        ]
    },
    Saturn: {
        title: "Skills",
        skills: [
            "https://cdn-icons-png.flaticon.com/512/5968/5968350.png", // Python
            "https://cdn-icons-png.flaticon.com/512/732/732212.png", // HTML 5
            "https://cdn-icons-png.flaticon.com/512/919/919851.png", // React
            "https://cdn-icons-png.flaticon.com/512/732/732190.png", // CSS 3
            "https://cdn-icons-png.flaticon.com/512/5968/5968292.png", // JavaScript
            "textures/sql-server.png", // SQL
            "textures/swift.png", // Swift icon
            "https://cdn-icons-png.flaticon.com/512/733/733553.png", // GitHub
            "https://cdn-icons-png.flaticon.com/512/5968/5968705.png", // Figma
            "https://cdn-icons-png.flaticon.com/512/906/906324.png" // Other skills
        ]
    },
    Uranus: {
        title: "Resume",
        pdf: "textures/Software Engineer Resume V3.pdf"
    },
    Neptune: {
        title: "Education",
        schools: [
            {
                logo: "textures/flatironlogo.png",
                name: "Flatiron School",
                degree: "Full Stack Software Engineering"
            },
            {
                logo: "textures/scranton.png",
                name: "The University of Scranton",
                degree: "Bachelor of Science in Business Management"
            }
        ]
    }
};

// Function to zoom into a planet
function zoomToPlanet(planet) {
    console.log(`Zooming to planet: ${planet.name}`);
    console.log(`Planet position: x=${planet.mesh.position.x}, y=${planet.mesh.position.y}, z=${planet.mesh.position.z}`);

    // Hide all labels
    document.querySelectorAll('.label').forEach(label => {
        label.style.display = 'none';
    });

    // Show the exit button
    document.getElementById('exitButton').style.display = 'block';

    // Disable auto-rotation and focus on the planet
    controls.autoRotate = false;
    controls.target.copy(planet.mesh.position);

    currentPlanet = planet; // Set the current planet

    gsap.to(camera.position, {
        duration: 2,
        x: planet.mesh.position.x,
        y: planet.mesh.position.y + 2, // Adjust for a better view
        z: planet.mesh.position.z + 5, // Adjust for a better view
        onUpdate: () => {
            camera.lookAt(planet.mesh.position);
        },
        onComplete: () => {
            camera.lookAt(planet.mesh.position);
        }
    });
}

// Add event listener for planet clicks
planets.forEach(planet => {
    planet.mesh.userData = { name: planet.name };
    planet.mesh.onClick = () => {
        displayHologram(planet.name);
    };
});

function refocusOnSun() {
    console.log('Refocusing on the sun');

    // Hide the hologram overlay
    document.getElementById('hologramOverlay').style.display = 'none';

    // Show all labels
    document.querySelectorAll('.label').forEach(label => {
        label.style.display = 'block';
    });

    // Reset current planet
    currentPlanet = null;

    // Enable auto-rotation and focus on the initial target
    controls.autoRotate = true;
    controls.target.copy(initialCameraTarget);

    gsap.to(camera.position, {
        duration: 2,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,
        z: initialCameraPosition.z,
        onUpdate: () => {
            camera.lookAt(initialCameraTarget);
        },
        onComplete: () => {
            camera.lookAt(initialCameraTarget);
        }
    });
}

// Ensure the close functionality is only tied to the exit button
document.getElementById('exitButton').addEventListener('click', () => {
    document.getElementById('hologramOverlay').style.display = 'none';
    refocusOnSun();
});

let currentPlanet = null;

function updateLabelPosition(planet, labelId) {
    const vector = new THREE.Vector3();
    planet.mesh.getWorldPosition(vector);
    vector.project(camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

    // Increase the yOffset to position the label higher above the planet
    const yOffset = 40; // Adjust this value as needed
    const label = document.getElementById(labelId);
    label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - yOffset}px)`;
}

document.getElementById('exitButton').addEventListener('click', () => {
    refocusOnSun();
    document.getElementById('exitButton').style.display = 'none'; // Hide the button
});

// Store initial camera position and target
const initialCameraPosition = new THREE.Vector3(0, 20, 50);
const initialCameraTarget = new THREE.Vector3(0, 0, 0);

// Set initial camera position and target
camera.position.copy(initialCameraPosition);
camera.lookAt(initialCameraTarget);

const hologramOverlay = document.getElementById('hologramOverlay');

// Prevent click events from propagating to the underlying scene
hologramOverlay.addEventListener('click', (event) => {
    event.stopPropagation();
});

// Modify the click event listener for the window
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    const hologramOverlay = document.getElementById('hologramOverlay');
    if (hologramOverlay.style.display === 'flex') {
        // Overlay is visible; don't process clicks in the Three.js scene
        return;
    }

    // ... existing raycasting and interaction code ...
}

// Disable controls when the overlay is open
function animateScene() {
    requestAnimationFrame(animate);
    if (hologramOverlay.style.display === 'flex') {
        controls.enabled = false;
    } else {
        controls.enabled = true;
    }
    controls.update();
    renderer.render(scene, camera);
}

animateScene();

// Back button functionality
document.getElementById('backButton').addEventListener('click', () => {
    displayHologram('Jupiter'); // Reload the project list for Jupiter
});


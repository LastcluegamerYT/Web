const password = "2468";
const serverURL = "https://prashantytt34.pythonanywhere.com"; // Use your server URL
let currentApp = "homeScreen";

// Function to unlock the phone
function unlockPhone() {
    const inputPassword = document.getElementById("passwordInput").value;
    if (inputPassword === password) {
        document.getElementById("lockScreen").style.display = "none";
        document.getElementById("homeScreen").style.display = "block";
        loadInstalledApps(); // Fetch installed apps from the server when phone unlocks
        loadGalleryImages(); // Fetch saved images from the server to display in the gallery
    } else {
        document.getElementById("lockError").textContent = "Incorrect password.";
    }
}

// Function to open an app
function openApp(appId) {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById(appId).style.display = 'block';
    currentApp = appId;
}

// Function to go to the home screen
function goHome() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById('homeScreen').style.display = 'block';
    currentApp = 'homeScreen';
}

// Function to go back to the previous screen
function goBack() {
    if (currentApp !== 'homeScreen') {
        document.getElementById(currentApp).style.display = 'none';
        document.getElementById('homeScreen').style.display = 'block';
        currentApp = 'homeScreen';
    }
}

// Function to show recent apps (Not implemented)
function showRecent() {
    alert("Recent Apps functionality not implemented.");
}

// Function to search for apps
function searchApp(event) {
    const query = event.target.value.toLowerCase();
    const apps = document.querySelectorAll('.app-icon');
    apps.forEach(app => {
        const appName = app.textContent.toLowerCase();
        if (appName.includes(query)) {
            app.style.display = 'block';
        } else {
            app.style.display = 'none';
        }
    });
}

// Function to take a photo using the camera
function takePhoto() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/png');

    const gallery = document.getElementById('photoGallery');
    const img = document.createElement('img');
    img.src = photo;
    img.className = 'gallery-item';
    gallery.appendChild(img);

    // Upload the photo to the server
    uploadImage(photo);
}

// Function to upload an image to the server
function uploadImage(photo) {
    const formData = new FormData();
    formData.append("image", photo);

    fetch(`${serverURL}/upload_image`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Image uploaded:", data);
        loadGalleryImages(); // Reload gallery after uploading the image
    })
    .catch(error => {
        console.error("Error uploading image:", error);
    });
}

// Function to handle file uploads
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'gallery-item';
            document.getElementById('photoGallery').appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// Function to load gallery images from the server
function loadGalleryImages() {
    fetch(`${serverURL}/images`)
        .then(response => response.json())
        .then(data => {
            const gallery = document.getElementById('photoGallery');
            gallery.innerHTML = ''; // Clear current gallery
            data.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'gallery-item';
                gallery.appendChild(img);
            });
        })
        .catch(error => {
            console.error("Error loading images:", error);
        });
}

// Function to open the install app screen
function openInstallApp() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById('installAppScreen').style.display = 'block';
}

// Function to install an app
function installApp() {
    const appName = document.getElementById('newAppName').value;
    const appFile = document.getElementById('appFileInput').files[0];

    if (!appName || !appFile) {
        document.getElementById('installError').textContent = "Please provide both app name and file.";
        return;
    }

    const formData = new FormData();
    formData.append("name", appName);
    formData.append("file", appFile);

    fetch(`${serverURL}/install_app`, {
        method: "POST",
        body: formData
    })
    .then(response => {
        // Check if the response is JSON, otherwise handle it as text (likely HTML)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(`Unexpected response: ${text}`); });
        }
    })
    .then(data => {
        document.getElementById('installError').textContent = "";
        document.getElementById('installSuccess').textContent = "App installed successfully!";
        loadInstalledApps(); // Reload apps after installation
    })
    .catch(error => {
        document.getElementById('installError').textContent = `Error installing app: ${error.message}`;
        console.error("Error installing app:", error);
    });
}

// Function to load installed apps from the server
function loadInstalledApps() {
    fetch(`${serverURL}/apps`)
        .then(response => response.json())
        .then(data => {
            const appsContainer = document.getElementById('appsContainer');
            appsContainer.innerHTML = ''; // Clear current apps

            // Add default apps back
            const defaultApps = `
                <div class="app-icon" onclick="openApp('cameraApp')">📷 Camera</div>
                <div class="app-icon" onclick="openApp('galleryApp')">🖼️ Gallery</div>
                <div class="app-icon" onclick="openApp('searchApp')">🔍 Search</div>
                <div class="app-icon" onclick="openApp('musicApp')">🎵 Music</div>
                <div class="app-icon" onclick="openApp('calculatorApp')">🧮 Calculator</div>
                <div class="app-icon" onclick="openInstallApp()">📥 Install App</div>
                <div class="app-icon">💬 Messages (Fake)</div>
                <div class="app-icon">📞 Phone (Fake)</div>
                <div class="app-icon">🌍 Browser (Fake)</div>
            `;
            appsContainer.innerHTML += defaultApps;

            // Add installed apps from the server
            data.apps.forEach(app => {
                const appDiv = document.createElement('div');
                appDiv.className = 'app-icon';
                appDiv.textContent = app.name;
                appDiv.onclick = () => {
                    window.open(app.url); // Opens the app in a new tab
                };
                appsContainer.appendChild(appDiv);
            });
        })
        .catch(error => {
            console.error("Error loading apps:", error);
        });
}

// CALCULATOR FUNCTIONALITY
let currentInput = '';
let previousInput = '';
let operator = '';
let shouldResetScreen = false;

// Function to append number to the calculator input
function appendNumber(number) {
    if (shouldResetScreen) {
        resetCalculatorScreen();
    }
    currentInput += number;
    updateCalculatorScreen();
}

// Function to set an operator for the calculator
function setOperation(selectedOperator) {
    if (currentInput === '') return;
    if (previousInput !== '') {
        calculate();
    }
    operator = selectedOperator;
    previousInput = currentInput;
    currentInput = '';
    shouldResetScreen = false;
}

// Function to reset the calculator screen
function resetCalculatorScreen() {
    currentInput = '';
    shouldResetScreen = false;
    updateCalculatorScreen();
}

// Function to update the calculator screen with the current input
function updateCalculatorScreen() {
    const screen = document.getElementById('calculatorScreen');
    screen.textContent = currentInput || '0';
}

// Function to clear the calculator
function clearCalculator() {
    currentInput = '';
    previousInput = '';
    operator = '';
    shouldResetScreen = false;
    updateCalculatorScreen();
}

// Function to perform the calculation
function calculate() {
    if (previousInput === '' || currentInput === '') return;
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert("Cannot divide by zero");
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = '';
    previousInput = '';
    shouldResetScreen = true;
    updateCalculatorScreen();
}

// Event listeners for calculator buttons
document.querySelectorAll('.calculator-btn').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (!isNaN(value)) {
            appendNumber(value);
        } else if (value === 'C') {
            clearCalculator();
        } else if (value === '=') {
            calculate();
        } else {
            setOperation(value);
        }
    });
});

const chatlog = document.getElementById('chatlog');
const fontMap = {
    "Arial, sans-serif": {
        name: "Roboto",
        src: "url('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf')"
    },
    "Times New Roman": {
        name: "Merriweather",
        src: "url('https://fonts.gstatic.com/s/merriweather/v28/u-4n0qyriQwlOrhSvowK_l52xwNZWMf_.ttf')"
    },
};



async function loadFontFace(fontKey) {
    const fontInfo = fontMap[fontKey];
    if (!fontInfo) return;

    const fontFace = new FontFace(fontInfo.name, fontInfo.src, {
        display: 'swap'
    });

    try {
        await fontFace.load();
        document.fonts.add(fontFace);
        document.body.style.fontFamily = `'${fontInfo.name}', ${fontKey}`;
    } catch (error) {
        console.error(`Failed to load font "${fontInfo.name}":`, error);
    }
}


// Initialize Socket.io connection
const socket = io('https://testname.mooo.com', {
    withCredentials: true,
    secure: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
});

// Listen for new messages
socket.on('new_message', (message) => {
    loadMessages();
    showNotification(message.username, message.message);
});
socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    // Fallback to polling if websocket fails
    socket.io.opts.transports = ['polling', 'websocket'];
});
socket.on('reconnect_attempt', () => {
    console.log('Attempting to reconnect...');
});

async function login(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            credentials: 'include', // Needed for cookies
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(result.user));
            updateUIAfterLogin(result.user.username);
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

async function logout() {
    try {
        // Clear the HTTP-only cookie
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

        // Clear local storage
        localStorage.removeItem('user');

        // Reset UI
        document.getElementById('login-form').style.display = 'inline-flex';
        document.getElementById('register-form').style.display = 'inline-flex';
        document.getElementById('chat-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('font-selector').style.display = 'none';
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateUIAfterLogin(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('chat-form').style.display = 'block';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('font-selector').style.display = 'block';

    const welcomeMsg = document.getElementById('welcome-msg');
    welcomeMsg.textContent = `Welcome, ${username}!`;

    // Show/hide notification button based on stored preference
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    document.getElementById('notification-button').style.display =
        (Notification.permission === "granted" || notificationsEnabled) ? 'none' : 'inline-block';

    loadMessages();
}

async function register(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    console.log(`Register: ${username}, ${password}`);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Registration successful!');
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
}

async function sendMessage(event) {
    event.preventDefault();
    const messageInput = document.getElementById('msg');
    const message = messageInput.value.trim();

    if (!message) {
        alert('Please enter a message');
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            credentials: 'include', // Essential for cookies
            headers: {
                'Content-Type': 'application/json',
                // No need for Authorization header since we're using cookies
            },
            body: JSON.stringify({ message })
        });

        messageInput.value = '';
        loadMessages();

    } catch (error) {
        console.error('Message send error:', error);
        handleApiError(error);
    }
}

function handleApiError(error) {
    const errorMsg = error.message || 'An error occurred';
    alert(errorMsg);

    // Handle specific error cases
    if (error.message.includes('Unauthorized') ||
        error.message.includes('Forbidden') ||
        error.message.includes('Invalid token')) {
        logout();
    }
}

async function renderMessages(messages) {
    chatlog.innerHTML = '';

    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username">${msg.username}</span>
                <span class="timestamp">${new Date(msg.timestamp).toLocaleString()}</span>
            </div>
            <div class="message-content">${msg.message}</div>
        `;
        chatlog.appendChild(messageElement);
    });

    chatlog.scrollTop = chatlog.scrollHeight;
}

async function loadMessages() {
    try {
        const response = await fetch('/api/messages', {
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error('Message load error:', error);
        // If unauthorized, force logout
        if (error.message.includes('401')) {
            logout();
        }
    }
}

// Notification permission and handling
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Notifications enabled! You'll receive alerts for new messages.");
            localStorage.setItem('notificationsEnabled', 'true');
        } else {
            localStorage.setItem('notificationsEnabled', 'false');
        }
    });
}

function showNotification(username, message) {
    // Create notification
    new Notification(`New message from ${username}`, {
        body: message,
        icon: '/path/to/icon.png' // Optional
    });
}


// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', register);
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('chat-form').addEventListener('submit', sendMessage);
    document.getElementById('notification-button').addEventListener('click', requestNotificationPermission);
    const fontSelector = document.getElementById("font-family");

    if (fontSelector) {
        fontSelector.addEventListener("change", (e) => {
            const selectedFont = e.target.value;
            loadFontFace(selectedFont);
        });

        // Load initial font if needed
        loadFontFace(fontSelector.value);
    }


    loadMessages();
});
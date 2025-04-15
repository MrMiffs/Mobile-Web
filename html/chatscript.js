const chatlog = document.getElementById('chatlog');

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
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('chat-form').style.display = 'none';
        document.getElementById('welcome-msg')?.remove();
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateUIAfterLogin(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('chat-form').style.display = 'block';

    const welcomeMsg = document.createElement('p');
    welcomeMsg.id = 'welcome-msg';
    welcomeMsg.textContent = `Welcome, ${username}!`;
    document.getElementById('intro').appendChild(welcomeMsg);

    loadMessages();
    setInterval(loadMessages, 5000); // Refresh every 5 seconds
}

// Check if user is already logged in on page load
function checkAuthStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        updateUIAfterLogin(JSON.parse(user).username);
    }
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

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }

        const newMessage = await response.json();
        messageInput.value = '';
        addMessageToUI(newMessage);

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

function addMessageToUI(message) {
    const chatlog = document.getElementById('chatlog');
    const placeholder = document.getElementById('log-placeholder');

    if (placeholder) {
        chatlog.removeChild(placeholder);
    }

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="username">${message.username}</span>
            <span class="timestamp">${new Date(message.timestamp).toLocaleString()}</span>
        </div>
        <div class="message-content">${message.message}</div>
    `;

    chatlog.appendChild(messageElement);
    chatlog.scrollTop = chatlog.scrollHeight;
}

// Update loadMessages to handle errors better
async function loadMessages() {
    try {
        const response = await fetch('/api/messages', {
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load messages');
        }

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


// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', register);
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('chat-form').addEventListener('submit', sendMessage);

    // Load messages if logged in
    if (localStorage.getItem('user')) {
        loadMessages();
        setInterval(loadMessages, 5000); // Refresh every 5 seconds
    }
});
 let currentUser = null;

    // Show/hide password
    document.getElementById('showPassword').addEventListener('change', e => {
    document.getElementById('password').type = e.target.checked ? 'text' : 'password';
});

    // Handle login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const loginRes = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
});

    if (loginRes.status === 200) {
    currentUser = username;
    alert(`Welcome back, ${username}!`);
} else {
    // Auto-register if not found
    const registerRes = await fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
});

    if (registerRes.status === 200) {
    currentUser = username;
    alert(`Account created for ${username}!`);
} else {
    alert('Login or registration failed.');
    return;
}
}

    document.getElementById('login-form').style.display = 'none';
    document.getElementById('msg').focus();
});

    // Load chat messages
    async function loadMessages() {
    const res = await fetch('/api/messages');
    const messages = await res.json();
    const chatlog = document.getElementById('chatlog');
    chatlog.innerHTML = ''; // Clear old logs

    if (!messages.length) {
    chatlog.innerHTML = '<p id="log-placeholder">No messages...</p>';
    return;
}

    messages.forEach(msg => {
    const p = document.createElement('p');
    const time = new Date(msg.timestamp).toLocaleTimeString();
    p.textContent = `[${time}] ${msg.sender}: ${msg.text}`;
    chatlog.appendChild(p);
});
}

    loadMessages();
    setInterval(loadMessages, 5000); // Auto-refresh every 5s

    // Send chat
    document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
    alert('You must be logged in to chat.');
    return;
}

    const msg = document.getElementById('msg').value.trim();
    if (!msg) return;

    const res = await fetch('/api/send', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ sender: currentUser, text: msg })
});

    if (res.status === 200) {
    document.getElementById('msg').value = '';
    loadMessages();
} else {
    alert('Failed to send message.');
}
});
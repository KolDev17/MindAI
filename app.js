// ================
// APP STATE
// ================
let currentMode = 'memory';
let currentPersonality = 'friendly';
let messages = [];
let memories = JSON.parse(localStorage.getItem('mind-ai-memories')) || [];
let isThinking = false;

// ================
// CORE FUNCTIONS
// ================
function initApp() {
    loadMessages();
    loadPersonality();
    setupEventListeners();
    renderMemories();
}

function setupEventListeners() {
    // Send button
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    
    // Input field
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
}

// ================
// MESSAGE SYSTEM
// ================
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || isThinking) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Process AI response
    isThinking = true;
    const aiResponse = await generateAIResponse(message);
    addMessage('ai', aiResponse);
    isThinking = false;
}

// ================
// AI INTEGRATION
// ================
async function generateAIResponse(userMessage) {
    // WebLLM API (Free)
    try {
        const response = await fetch('https://webllm.mlc.ai/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: buildPrompt(userMessage),
                model: 'Mistral-7B'
            })
        });
        return await response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return "I'm having trouble thinking right now. Please try again later.";
    }
}

function buildPrompt(userMessage) {
    return `You are Mind.AI in ${currentMode} mode. Personality: ${currentPersonality}.
    
    ${currentMode === 'memory' ? `Relevant memories:\n${getRelevantMemories(userMessage)}` : ''}
    
    User: ${userMessage}
    AI:`;
}

// ================
// MEMORY SYSTEM
// ================
function getRelevantMemories(query) {
    return memories
        .filter(m => m.text.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(m => `- ${m.text}`)
        .join('\n');
}

// ================
// UI FUNCTIONS
// ================
function addMessage(sender, content) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);

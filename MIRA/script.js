const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');

const SYSTEM_INSTRUCTIONS = `ROLE DEFINITION
MIRA is a highly specialized AI assistant dedicated exclusively to marketing, branding, advertising, communications, and business growth strategy.
Her core mission is to deliver expert-level insights, structured recommendations, and actionable strategies that empower businesses and professionals to build, position, and scale their brands effectively across all markets.

MIRA operates with discipline, precision, and professional integrity, ensuring that every interaction aligns with the highest standards of marketing excellence and strategic business consulting.

MANDATORY RESPONSIBILITIES

Professionalism

Maintain a polished, authoritative, and executive tone at all times.

Communicate with clarity, conciseness, and confidence, avoiding informal or speculative phrasing.

Deliver all insights using industry-standard frameworks, marketing logic, and data-driven reasoning.

Relevance

Address only subjects directly related to:
• Marketing and branding strategy
• Advertising and communications
• Customer engagement and retention
• Business growth, sales optimization, and positioning
• Market research, consumer psychology, and digital presence

Politely decline or redirect any question that falls outside these domains, maintaining a professional explanation.

Actionability

Provide structured, step-by-step, or framework-based recommendations.

Support strategies with examples, reasoning, and industry best practices.

Whenever applicable, present methods that can be implemented immediately by startups, SMEs, or corporate teams.

Adaptability

Adjust tone, vocabulary, and examples according to context (startup, luxury brand, corporate, B2B, digital-native brand, etc.).

Communicate with full fluency and the same professional tone in:
• English (default professional mode)
• French (for francophone markets and North African businesses)
• Algerian Darja (for local engagement, adapted to professional contexts while remaining culturally relevant).

Switch seamlessly between languages when required by user context or business environment.

ABSOLUTE RESTRICTIONS

Out-of-Scope Topics
MIRA must never respond to:

Politics, religion, entertainment, or personal life topics

Health, coding, or technology outside its marketing/business relevance

Speculative, fictional, or casual conversation

Non-business or non-strategic queries

Integrity

Never fabricate data or case studies.

Avoid unverifiable claims, vague assumptions, or speculative projections.

When data or certainty is limited, state boundaries clearly and guide based on verified principles or best practices.

Character Discipline

Always act as a marketing and business strategist, never as a general-purpose AI.

Maintain a professional persona with no casual tone, humor, or emotional expression.

Avoid self-reference or meta-discussion; focus entirely on the user’s marketing or business goal.

COMMUNICATION PRINCIPLES

Clarity: Communicate in a structured, logical format (lists, sections, frameworks).

Authority: Present advice confidently, using marketing and business terminology.

Brevity with Depth: Deliver comprehensive insights without unnecessary verbosity.

Neutrality: Remain objective and focused on strategic outcomes, avoiding bias or opinion.

Vision: Provide guidance that demonstrates foresight, innovation, and measurable business impact.

LANGUAGE OPERATING MODES

English (EN): Default language for global strategy, consulting, and business communication.
Use for corporate strategy reports, brand positioning, and campaign frameworks.

French (FR): Professional francophone mode, for North African and European business environments.
Example: “Proposez une stratégie de communication pour un lancement de produit B2B.”

MIRA automatically maintains professionalism even in Darja, ensuring clarity, business focus, and linguistic balance with French or English as needed.

CORE OPERATING PRINCIPLE
MIRA is not a general chatbot.
She is a dedicated marketing and business intelligence system, designed to deliver strategic, actionable, and high-value insights for professionals, agencies, and enterprises.

Every interaction must drive measurable business value, strengthen brand positioning, or support market growth objectives — without exception.`;

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    
    // Enable/disable send button
    sendBtn.disabled = this.value.trim() === '';
});

// Send message on Enter (Shift+Enter for new line)
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendBtn.addEventListener('click', sendMessage);

// Suggestion cards click
document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', function() {
        const text = this.querySelector('p').textContent;
        chatInput.value = text;
        chatInput.focus();
        chatInput.dispatchEvent(new Event('input'));
    });
});

async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (message === '') return;

    // Hide welcome screen on first message
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Add user message
    addMessage(message, 'user');

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Show typing indicator while waiting for assistant
    addTypingIndicator();

    try {
        const assistantText = await sendToOpenRouter(message);
        removeTypingIndicator();
        addMessage(assistantText, 'assistant');
    } catch (err) {
        removeTypingIndicator();
        console.error('Error fetching assistant response:', err);
        addMessage('Sorry — there was an error contacting the assistant. Please try again.', 'assistant');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? 'YOU' : 'MIRA';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = markdownToHtml(text);
    
    content.appendChild(messageText);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'MIRA';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    content.appendChild(indicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendToOpenRouter(userMessage) {
    // Keep chat history for this session (clears on page reload)
    window.chatHistory = window.chatHistory || [
        { role: 'system', content: SYSTEM_INSTRUCTIONS }
    ];

    // Add the user's message
    window.chatHistory.push({ role: 'user', content: userMessage });

    try {
        const response = await fetch('/api/mira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'nvidia/nemotron-nano-9b-v2:free',
                messages: window.chatHistory
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Extract assistant reply
        const assistantContent = data?.choices?.[0]?.message?.content ||
                                 data?.choices?.[0]?.text ||
                                 "No response";

        // Save assistant message to history
        window.chatHistory.push({ role: 'assistant', content: assistantContent });

        return assistantContent;

    } catch (error) {
        console.error("Error fetching assistant response:", error);
        throw error;
    }
}


// Markdown rendering
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function markdownToHtml(md) {
    if (md === null || md === undefined) return '';
    const text = String(md).replace(/\r\n?/g, '\n');
    let html = '';
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockLang = '';
    let listType = null;

    function closeList() {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const codeFenceMatch = line.match(/^```\s*(\S+)?/);
        if (codeFenceMatch) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockLang = codeFenceMatch[1] || '';
                closeList();
                html += `<pre><code class="lang-${escapeHtml(codeBlockLang)}">`;
            } else {
                inCodeBlock = false;
                html += `</code></pre>`;
            }
            continue;
        }

        if (inCodeBlock) {
            html += escapeHtml(line) + '\n';
            continue;
        }

        const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch) {
            closeList();
            const level = hMatch[1].length;
            html += `<h${level}>${inlineMd(hMatch[2])}</h${level}>`;
            continue;
        }

        if (/^\s*[-*+]\s+/.test(line)) {
            if (listType !== 'ul') {
                closeList();
                listType = 'ul';
                html += '<ul>';
            }
            const item = line.replace(/^\s*[-*+]\s+/, '');
            html += `<li>${inlineMd(item)}</li>`;
            continue;
        }

        if (/^\s*\d+\.\s+/.test(line)) {
            if (listType !== 'ol') {
                closeList();
                listType = 'ol';
                html += '<ol>';
            }
            const item = line.replace(/^\s*\d+\.\s+/, '');
            html += `<li>${inlineMd(item)}</li>`;
            continue;
        }

        if (/^\s*$/.test(line)) {
            closeList();
            html += '<p></p>';
            continue;
        }

        closeList();
        html += `<p>${inlineMd(line)}</p>`;
    }

    if (listType) html += `</${listType}>`;
    html = html.replace(/<p><\/p>/g, '');
    return html;

    function inlineMd(str) {
        let s = escapeHtml(str);
        s = s.replace(/`([^`]+)`/g, (_, p1) => `<code>${escapeHtml(p1)}</code>`);
        s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
        s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
        s = s.replace(/_(.+?)_/g, '<em>$1</em>');
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, p1, p2) => {
            const url = escapeHtml(p2);
            if (/^\s*javascript:/i.test(p2)) return escapeHtml(p1);
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${inlineMd(p1)}</a>`;
        });
        return s;
    }
}

// Initialize
sendBtn.disabled = true;

// Splash screen logic
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');
    const container = document.querySelector('.container');
    if (!splash) return;
    splash.addEventListener('click', () => hideSplash(splash));
    const AUTO_HIDE_MS = 2600 + 600;
    setTimeout(() => hideSplash(splash), AUTO_HIDE_MS);

    function hideSplash(el) {
        if (!el || el.classList.contains('hide')) return;
        el.classList.add('hide');
        el.addEventListener('animationend', () => {
            try { el.remove(); } catch(e) {}
            if (container) container.style.visibility = 'visible';
            document.body.style.overflow = '';
        }, { once: true });
    }
});



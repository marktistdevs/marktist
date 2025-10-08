const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messages');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');

// ====== Hardcoded API key and system instructions (from instructions.txt) ======
// NOTE: You provided the API key file and instructions file in the workspace. They are
// intentionally hardcoded here per your request. Keep this file private.
const OPENROUTER_API_KEY = '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';

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

Darja (DZ): Contextual, culturally adapted Algerian Darja for marketing localization or brand voice adaptation.
Example: “Kifach n9adro nkhademo brand yji proche men jeunesse fi l’Algérie ?”

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
    // Render markdown safely for both user and assistant messages
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
    // Prepare payload: include system instructions on every request as requested
    const payload = {
        model: 'nvidia/nemotron-nano-9b-v2:free',
        messages: [
            { role: 'system', content: SYSTEM_INSTRUCTIONS },
            { role: 'user', content: userMessage }
        ]
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter API error: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Typical OpenRouter response structure mirrors OpenAI: choices[0].message.content
    const assistantContent = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);

    return assistantContent;
}

// Simple, safe markdown-to-HTML converter (supports headings, bold, italic,
// inline code, fenced code blocks, links, unordered/ordered lists, and paragraphs).
// It escapes HTML to prevent XSS, then converts markdown constructs.
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
    // Normalize line endings
    const text = String(md).replace(/\r\n?/g, '\n');

    let html = '';
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockLang = '';
    let listType = null; // 'ul' or 'ol'

    function closeList() {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Fenced code blocks ```
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

        // Headings
        const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch) {
            closeList();
            const level = hMatch[1].length;
            html += `<h${level}>${inlineMd(hMatch[2])}</h${level}>`;
            continue;
        }

        // Unordered list
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

        // Ordered list
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

        // Blank line -> paragraph separation
        if (/^\s*$/.test(line)) {
            closeList();
            html += '<p></p>';
            continue;
        }

        // Regular paragraph line
        closeList();
        html += `<p>${inlineMd(line)}</p>`;
    }

    // Close any open list at end
    if (listType) html += `</${listType}>`;

    // Remove empty paragraph placeholders for consecutive blank lines
    html = html.replace(/<p><\/p>/g, '');
    return html;

    // Inline-level markdown (bold, italic, links, inline code)
    function inlineMd(str) {
        let s = escapeHtml(str);
        // Inline code: `code`
        s = s.replace(/`([^`]+)`/g, function(m, p1) { return `<code>${escapeHtml(p1)}</code>`; });
        // Bold **text** or __text__
        s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
        // Italic *text* or _text_
        s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
        s = s.replace(/_(.+?)_/g, '<em>$1</em>');
        // Links [text](url)
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, p1, p2) {
            const url = escapeHtml(p2);
            const text = p1;
            // Basic URL validation to avoid javascript: pseudo-protocols
            if (/^\s*javascript:/i.test(p2)) return escapeHtml(p1);
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${inlineMd(text)}</a>`;
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

    // Allow click to skip splash
    splash.addEventListener('click', () => hideSplash(splash));

    // Auto-hide after 2.6s + small buffer to let animations finish
    const AUTO_HIDE_MS = 2600 + 600;
    setTimeout(() => hideSplash(splash), AUTO_HIDE_MS);

    // Ensure container is visible after splash hides
    function hideSplash(el) {
        if (!el || el.classList.contains('hide')) return;
        el.classList.add('hide');
        // After animation ends remove it from the DOM flow and reveal app
        el.addEventListener('animationend', () => {
            try { el.remove(); } catch(e) {}
            if (container) container.style.visibility = 'visible';
            // Allow scrolling now that splash is gone
            document.body.style.overflow = '';
        }, { once: true });
    }
});
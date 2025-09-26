const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

let apiKey = '';
let INSTRUCTIONS = '';

// Conversation storage (kept in-memory for now; easy to persist later)
const conversation = [];

// Tiny helper to create accessible message nodes
function createMessageNode(text, who = 'mira') {
  const row = document.createElement('div');
  row.className = 'msg-row';

  const avatar = document.createElement('div');
  avatar.className = 'avatar ' + (who === 'user' ? 'user' : 'mira');
  avatar.setAttribute('aria-hidden', 'true');
  avatar.innerText = who === 'user' ? 'U' : 'M';

  const bubble = document.createElement('div');
  bubble.className = 'msg ' + (who === 'user' ? 'user' : 'mira');
  bubble.setAttribute('role', who === 'user' ? 'article' : 'note');
  if (who === 'user') {
    bubble.innerText = text;
  } else {
    // Render Markdown for assistant/AI messages
    if (window.marked) {
      bubble.innerHTML = window.marked.parse(text);
    } else {
      bubble.innerText = text;
    }
  }

  const ts = document.createElement('div');
  ts.className = 'msg-ts';
  ts.style.fontSize = '12px';
  ts.style.opacity = '0.6';
  ts.innerText = new Date().toLocaleTimeString();

  if (who === 'user') {
    row.appendChild(bubble);
    row.appendChild(avatar);
    bubble.appendChild(ts);
  } else {
    row.appendChild(avatar);
    row.appendChild(bubble);
    bubble.appendChild(ts);
  }

  return row;
}

// Incremental rendering control
let lastRenderedIndex = 0;
let userScrolledUp = false; // whether user has scrolled away from bottom

function isNearBottom() {
  if (!chatWindow) return true;
  // treat within 120px of bottom as "near bottom" to allow some slack for mobile toolbars
  return (chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight) < 120;
}

function appendMessageNode(message) {
  const node = createMessageNode(message.content, message.role === 'user' ? 'user' : 'mira');
  // ensure node takes full width flow and doesn't cause overflow issues
  node.style.width = '100%';
  chatWindow.appendChild(node);
}

function renderNewMessages() {
  if (!chatWindow) return;
  // append any new messages since lastRenderedIndex
  const shouldAuto = !userScrolledUp && isNearBottom();
  for (let i = lastRenderedIndex; i < conversation.length; i++) {
    appendMessageNode(conversation[i]);
  }
  lastRenderedIndex = conversation.length;
  if (shouldAuto) chatWindow.scrollTop = chatWindow.scrollHeight;
}

// track user scroll to avoid fighting scroll position
if (chatWindow) {
  chatWindow.addEventListener('scroll', () => {
    userScrolledUp = !isNearBottom();
  });
}

function showTyping() {
  // Append typing indicator as a DOM node (only one)
  if (document.getElementById('typingRow')) return;
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.id = 'typingRow';

  const avatar = document.createElement('div');
  avatar.className = 'avatar mira';
  avatar.innerText = 'M';

  const bubble = document.createElement('div');
  bubble.className = 'msg mira typing';
  const dots = document.createElement('span');
  dots.className = 'typing-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
  bubble.appendChild(dots);

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  // Only autoscroll typing if user is near bottom; otherwise leave user's manual scroll alone
  if (!userScrolledUp && isNearBottom()) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typingRow');
  if (t) t.remove();
}

function showToast(text, timeout = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = text;
  toast.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => (toast.hidden = true), timeout);
}

async function loadInstructionsAndKey() {
  try {
    const [instr, keyResp] = await Promise.all([fetch('./instructions.txt'), fetch('./api_key.txt')]);
    INSTRUCTIONS = instr.ok ? await instr.text() : '';
    apiKey = keyResp.ok ? (await keyResp.text()).trim() : '';
  } catch (err) {
    console.warn('Could not load resources', err);
  }
}

async function callOpenRouter(messages) {
  // messages: [{role:'system'|'user'|'assistant', content:''}, ...]
  const body = {
    model: 'nvidia/nemotron-nano-9b-v2:free',
    messages
  };

  // Use only allowed headers to avoid CORS preflight issues. Instructions are included in the request body.
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.innerText = 'Connecting…';
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (statusEl) statusEl.innerText = 'Ready';

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Try common shapes
  if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content || '';
  if (data.result) return data.result;
  if (data.output) return data.output;
  return JSON.stringify(data);
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // optimistic UI: add user message and render incrementally
  conversation.push({ role: 'user', content: text });
  renderNewMessages();
  chatInput.value = '';
  chatInput.disabled = true;

  // prepare payload: include instructions as system role AND embed them as a header inside the latest user message
  // Embedding instructions inside the user message as a header avoids using custom HTTP headers (which trigger CORS preflights).
  const MAX_INSTR_LEN = 8000; // safeguard: trim instruction size if extremely large
  let instrForHeader = INSTRUCTIONS || '';
  if (instrForHeader.length > MAX_INSTR_LEN) {
    instrForHeader = instrForHeader.slice(0, MAX_INSTR_LEN) + '\n\n[TRUNCATED INSTRUCTIONS]';
    showToast('Instructions were trimmed for this request to avoid oversized payload.');
  }

  // Build API messages array. We keep the system role for compatibility, and also prepend a header block to the last user message
  const apiMessages = conversation.map((m, idx) => {
    if (m.role === 'user' && idx === conversation.length - 1) {
      const header = `[INSTRUCTIONS_START]\n${instrForHeader}\n[INSTRUCTIONS_END]\n\n`;
      return { role: 'user', content: header + m.content };
    }
    return { role: m.role, content: m.content };
  });

  const messages = [{ role: 'system', content: INSTRUCTIONS }, ...apiMessages];

  try {
    showTyping();
    const reply = await callOpenRouter(messages);
    hideTyping();
    conversation.push({ role: 'assistant', content: reply });
    renderNewMessages();
    showToast('Reply received');
  } catch (err) {
    hideTyping();
    conversation.push({ role: 'assistant', content: 'Error: ' + err.message });
    renderNewMessages();
    showToast('Error: ' + err.message);
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

// Enter to send
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

// Autosize textarea
function autosizeTextarea(el) {
  el.style.height = 'auto';
  const newH = Math.min(el.scrollHeight, 220);
  el.style.height = newH + 'px';
  el.style.overflow = 'hidden';
}
chatInput.addEventListener('input', (e) => autosizeTextarea(e.target));
autosizeTextarea(chatInput);

// Init
(async () => {
  await loadInstructionsAndKey();
  // welcome
  conversation.push({ role: 'assistant', content: 'Hello — I am Mira, your marketing & branding assistant. Ask me a focused question.' });
  renderNewMessages();
  chatInput.focus();
})();

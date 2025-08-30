import cors from 'cors';

app.use(cors({
  origin: "https://bitbuddy-sigma.vercel.app"
}));



const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBtn = document.querySelector('#ask');

input?.addEventListener('keyup', handleEnter);
askBtn?.addEventListener('click', handleAsk);

const loading = document.createElement('div');
loading.className = 'my-4 text-gray-400 animate-pulse';
loading.textContent = 'Thinking...';

async function generate(text) {
  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'my-2 bg-blue-600 text-white p-3 rounded-xl ml-auto max-w-xs';
  userMsg.textContent = text;
  chatContainer?.appendChild(userMsg);
  input.value = '';

  // Show loading
  chatContainer?.appendChild(loading);
  scrollToBottom();

  try {
    const assistantMessage = await callServer(text);

    const moviMsg = document.createElement('div');
    moviMsg.className = 'my-2 bg-gray-700 text-white p-3 rounded-xl mr-auto max-w-xs';
    moviMsg.textContent = assistantMessage;

    loading.remove();
    chatContainer?.appendChild(moviMsg);
    scrollToBottom();
  } catch (err) {
    loading.remove();
    const errorElem = document.createElement('div');
    errorElem.className = 'text-red-400 my-2';
    errorElem.textContent = '⚠️ Failed to get response from server';
    chatContainer?.appendChild(errorElem);
    scrollToBottom();
  }
}

async function callServer(inputText) {
  const response = await fetch('https://ai-rag-chatbot-one.vercel.app/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: inputText }),
  });

  if (!response.ok) throw new Error('Error generating the response.');

  const result = await response.json();
  return result.message;
}

async function handleAsk() {
  const text = input?.value.trim();
  if (!text) return;
  await generate(text);
}

async function handleEnter(e) {
  if (e.key === 'Enter') {
    const text = input?.value.trim();
    if (!text) return;
    await generate(text);
  }
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector('#input');
  const chatContainer = document.querySelector('#chat-container');
  const askBtn = document.querySelector('#ask');

  // Loading indicator
  const loading = document.createElement('div');
  loading.className = 'my-4 text-gray-400 animate-pulse';
  loading.textContent = 'Thinking...';

  // Event listeners
  input?.addEventListener('keydown', handleEnter);
  askBtn?.addEventListener('click', handleAsk);

  // Generate chat message
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

      const botMsg = document.createElement('div');
      botMsg.className = 'my-2 bg-gray-700 text-white p-3 rounded-xl mr-auto max-w-xs';
      botMsg.textContent = assistantMessage;

      loading.remove();
      chatContainer?.appendChild(botMsg);
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

  // Call backend API
  async function callServer(inputText) {
    const response = await fetch('https://ai-rag-chatbot-one.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message: inputText }),
    });

    if (!response.ok) throw new Error('Error generating the response.');

    const result = await response.json();
    return result.message;
  }

  // Handle send button
  async function handleAsk(e) {
    e.preventDefault(); // Prevent form refresh
    const text = input?.value.trim();
    if (!text) return;
    await generate(text);
  }

  // Handle Enter key
  async function handleEnter(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form refresh
      const text = input?.value.trim();
      if (!text) return;
      await generate(text);
    }
  }

  // Auto scroll to bottom
  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});

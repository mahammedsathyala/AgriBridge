import { t, getLocale } from '../i18n/index.js';
import { advisoryService } from '../services/advisoryService.js';

export function renderChatBot(container) {
  const currentLocale = getLocale();
  let defaultBotGreeting = "Namaste Farmer! I am AgriAI, your agronomic assistant. How can I help you today with your crop in Andhra Pradesh?";
  let defaultDisclaimer = "Decision-support AI guidance.";
  if (currentLocale === 'te') {
    defaultBotGreeting = "నమస్కారం రైతు గారు! నేను AgriAI వ్యవసాయ సహాయకుడిని. నీటిపారుదల, ఎరువులు లేదా చీడపీడల గురించి మీకు ఏవైనా సందేహాలు ఉంటే నన్ను అడగవచ్చు.";
    defaultDisclaimer = "ఇది కేవలం నిర్ణయ సహాయక వ్యవస్థ మాత్రమే.";
  } else if (currentLocale === 'hi') {
    defaultBotGreeting = "नमस्ते किसान भाई! मैं AgriAI कृषि सहायक हूँ। आप अपनी फसल, सिंचाई, खाद-उर्वरक या कीट-रोग नियंत्रण के बारे में कोई भी प्रश्न पूछ सकते हैं।";
    defaultDisclaimer = "यह केवल निर्णय-सहायता प्रणाली है।";
  }

  let messages = [
    {
      sender: 'bot',
      text: defaultBotGreeting,
      sources: ["ICAR Agro-Advisory Knowledge Graph", "BRICS AgriN Knowledge Base"],
      disclaimer: defaultDisclaimer
    }
  ];

  function render() {
    container.innerHTML = `
      <div class="card chat-container">
        <div class="chat-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">🤖</span>
            <div>
              <div style="font-weight: 700; color: var(--color-primary-900); font-size: 0.95rem;">
                ${t('advisory.chatTitle')}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">
                ${t('advisory.chatSub')}
              </div>
            </div>
          </div>
          <span class="badge badge-success">● Active Model</span>
        </div>

        <!-- Messages stream -->
        <div class="chat-messages" id="chat-stream">
          ${messages.map(m => `
            <div class="chat-msg ${m.sender}">
              <div>${m.text}</div>
              ${m.sources ? `
                <div class="chat-source-citation">
                  <strong>📚 ${t('advisory.sourcesLabel')}:</strong> ${m.sources.join(' • ')}
                </div>
              ` : ''}
              ${m.disclaimer ? `
                <div class="chat-safety-disclaimer">
                  ⚠️ ${m.disclaimer}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Suggested Prompt Chips -->
        <div class="chat-suggested-prompts">
          <span style="font-size: 0.75rem; color: var(--text-muted); align-self: center;">${t('advisory.suggestedTitle')}</span>
          <button class="prompt-chip" data-prompt="${t('advisory.q1')}">${t('advisory.q1')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q2')}">${t('advisory.q2')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q3')}">${t('advisory.q3')}</button>
          <button class="prompt-chip" data-prompt="${t('advisory.q4')}">${t('advisory.q4')}</button>
        </div>

        <!-- Input Box -->
        <form class="chat-input-row" id="chat-form">
          <input 
            type="text" 
            id="chat-user-input" 
            class="chat-input" 
            placeholder="${t('advisory.chatPlaceholder')}" 
            autocomplete="off"
          />
          <button type="submit" class="btn btn-primary btn-sm" style="padding: 0 16px;">
            ${t('advisory.send')}
          </button>
        </form>
      </div>
    `;

    // Scroll to bottom
    const stream = container.querySelector('#chat-stream');
    if (stream) stream.scrollTop = stream.scrollHeight;

    // Attach listeners
    const form = container.querySelector('#chat-form');
    const input = container.querySelector('#chat-user-input');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';

      messages.push({ sender: 'user', text: val });
      render();

      // Show typing indicator
      messages.push({ sender: 'bot', text: t('common.loading') });
      render();

      const res = await advisoryService.askAgriAI(val, getLocale());
      messages.pop(); // Remove loading
      messages.push({
        sender: 'bot',
        text: res.answer,
        sources: res.sources,
        disclaimer: res.disclaimer
      });
      render();
    });

    container.querySelectorAll('.prompt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt');
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
    });
  }

  render();
}

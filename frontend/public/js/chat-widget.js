/* ===== Elite AI Setup Chat Widget — Fixed & Enhanced ===== */
(function() {
  'use strict';

  const CONFIG = {
    apiBase: '/api',
    questions: [
      { step: 1, question: "What's the name of your business?", field: 'business_name', type: 'text' },
      { step: 2, question: "What type of business is it?", field: 'industry', type: 'options-multi', options: ['Beauty salon / spa','Clinic / dental / medical','Real estate','Restaurant / hospitality','Home services','Gym / wellness','Agency / consulting','Ecommerce','Other'] },
      { step: 3, question: "Do you have a website, Instagram, or Google Maps link? Please paste the URL.", field: 'business_links', type: 'link' },
      { step: 4, question: "Where is your business located, and do you serve clients locally, online, or both?", field: 'location_service_area', type: 'text' },
      { step: 5, question: "What are the main services your business offers?", field: 'main_services', type: 'text' },
      { step: 6, question: "Do you want the AI to mention prices or price ranges? If yes, please add them here.", field: 'pricing_info', type: 'text' },
      { step: 7, question: "What are your opening hours?", field: 'opening_hours', type: 'text' },
      { step: 8, question: "Which languages should your AI speak? (Choose up to 2)", field: 'languages', type: 'options-limited', options: ['English','Portuguese','Ukrainian','Russian','Spanish','French','Other'], maxSelect: 2 },
      { step: 9, question: "What should your AI employee mainly do? (Choose all that apply)", field: 'main_ai_goal', type: 'options-multi', options: ['Answer common questions','Book appointments','Qualify leads','Handle missed calls','Take messages','Transfer urgent calls','Follow up on leads','Other'] },
      { step: 10, question: "How should bookings work?", field: 'booking_method', type: 'options-multi', options: ['Calendar link','WhatsApp confirmation','Phone confirmation','Manual approval','CRM integration','I don\'t know yet','No booking needed'] },
      { step: 11, question: "What information should the AI collect from your customers? (Choose all that apply)", field: 'customer_info_to_collect', type: 'options-multi', options: ['Name','Phone number','Email','Service needed','Preferred date/time','Budget','Location','Urgency','Notes / special request'] },
      { step: 12, question: "What questions do customers usually ask before booking or buying?", field: 'common_customer_questions', type: 'text' },
      { step: 13, question: "When should the AI transfer or escalate to a human? (e.g. urgent cases, angry customer, special request)", field: 'escalation_rules', type: 'text' },
      { step: 14, question: "Where should new leads or call summaries be sent?", field: 'lead_destination', type: 'options-multi', options: ['Email','WhatsApp','Telegram','CRM','Google Sheet','Other'] },
      { step: 15, question: "Please add the destination detail — e.g. email address, WhatsApp number, or Telegram username.", field: 'lead_destination_detail', type: 'text', skipCondition: function(answers) { return !answers.lead_destination; } },
      { step: 16, question: "How should your AI sound?", field: 'tone_of_voice', type: 'options-multi', options: ['Professional','Warm','Luxury','Friendly','Calm','Direct','Energetic'] },
      { step: 17, question: "Is there anything your AI must never say, promise, or do?", field: 'restrictions', type: 'text' },
      { step: 18, question: "Any special rules? (cancellation policy, deposits, emergency cases, service limits)", field: 'special_business_rules', type: 'text' },
      { step: 19, question: "Where should we send your AI receptionist preview? Please provide your name, email, and WhatsApp/phone.", field: 'contact_details', type: 'contact', fields: ['contact_name','contact_email','contact_phone'] },
      { step: 20, question: "Perfect. Do you want to submit this setup for Elite AI review?", field: 'submission_status', type: 'final' }
    ]
  };

  let sessionId = '';
  let questionIndex = 0; // integer index into CONFIG.questions
  let answers = {};
  let history = []; // stack of answered questions for Back button
  let isOpen = false;
  let isProcessing = false;

  function generateSessionId() { return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
  function timeStr() { return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }

  function getQuestion() {
    return CONFIG.questions[questionIndex] || null;
  }

  function addMessage(text, type, html) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-' + type;
    div.innerHTML = '<div class="chat-msg-bubble">' + (html || text.replace(/\n/g, '<br>')) + '</div><div class="chat-msg-time">' + timeStr() + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.id = 'chat-typing-indicator';
    div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chat-typing-indicator');
    if (el) el.remove();
  }

  function updateProgress() {
    const bar = document.getElementById('chat-progress-bar');
    const text = document.getElementById('chat-progress-text');
    if (!bar || !text) return;
    const q = getQuestion();
    const currentStep = q ? q.step : CONFIG.questions.length;
    const total = CONFIG.questions.length;
    const pct = Math.round((currentStep / (total + 1)) * 100);
    bar.style.width = pct + '%';
    text.textContent = 'Step ' + currentStep + ' of ' + total;
  }

  // Show option buttons
  function showOptions(options, multi, maxSelect, callback) {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-options';
    const selected = [];
    let otherValue = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;
      btn.dataset.value = opt;

      btn.onclick = () => {
        if (opt === 'Other') {
          // Show text input for Other
          const existing = wrapper.querySelector('.other-input-wrap');
          if (existing) { existing.remove(); return; }
          const wrap = document.createElement('div');
          wrap.className = 'other-input-wrap';
          wrap.style.cssText = 'width:100%;display:flex;gap:6px;margin-top:6px;';
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.placeholder = 'Type your answer...';
          inp.style.cssText = 'flex:1;padding:8px 12px;border:1px solid var(--line);border-radius:999px;font-size:13px;outline:none;';
          inp.onfocus = () => inp.style.borderColor = 'var(--accent)';
          inp.onblur = () => inp.style.borderColor = 'var(--line)';
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') { otherValue = inp.value.trim(); callback(otherValue || 'not specified'); wrapper.remove(); } });
          const okBtn = document.createElement('button');
          okBtn.textContent = '✓';
          okBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;';
          okBtn.onclick = () => { otherValue = inp.value.trim(); callback(otherValue || 'not specified'); wrapper.remove(); };
          wrap.appendChild(inp);
          wrap.appendChild(okBtn);
          wrapper.appendChild(wrap);
          inp.focus();
          return;
        }

        if (multi) {
          const idx = selected.indexOf(opt);
          if (idx >= 0) {
            selected.splice(idx, 1);
            btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = '';
          } else {
            if (maxSelect && selected.length >= maxSelect) {
              const first = selected.shift();
              const firstBtn = wrapper.querySelector('.chat-option-btn[data-value="' + first + '"]');
              if (firstBtn) { firstBtn.style.background = ''; firstBtn.style.color = ''; firstBtn.style.borderColor = ''; }
            }
            selected.push(opt);
            btn.style.background = 'var(--accent)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--accent)';
          }
        } else {
          selected.length = 0; selected.push(opt);
          wrapper.querySelectorAll('.chat-option-btn').forEach(b => { b.style.background = ''; b.style.color = ''; b.style.borderColor = ''; });
          btn.style.background = 'var(--accent)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--accent)';
          callback(opt); return;
        }
      };
      wrapper.appendChild(btn);
    });

    // Done button for multi-select
    if (multi) {
      const doneBtn = document.createElement('button');
      doneBtn.className = 'chat-option-btn';
      doneBtn.textContent = 'Done ✓';
      doneBtn.style.fontWeight = '700';
      doneBtn.style.background = 'rgba(236,28,140,.15)';
      doneBtn.onclick = () => {
        if (otherValue) { callback(otherValue); }
        else if (selected.length === 0) { callback('not specified'); }
        else { callback(selected.join(', ')); }
        wrapper.remove();
      };
      wrapper.appendChild(doneBtn);
    }

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  function askQuestion() {
    const q = getQuestion();
    if (!q) { showSummary(); return; }
    if (q.skipCondition && q.skipCondition(answers)) {
      questionIndex++;
      askQuestion();
      return;
    }

    updateProgress();
    addMessage(q.question, 'bot');

    if (q.type === 'options-multi' || q.type === 'options-limited') {
      showOptions(q.options, true, q.maxSelect || 0, (val) => submitAnswer(val));
    } else if (q.type === 'link') {
      enableInput();
      document.getElementById('chat-input').placeholder = 'Paste your URL here...';
      setTimeout(() => addMessage(' Please paste the actual link. This helps us build a better AI for you.', 'bot'), 1200);
    } else if (q.type === 'contact') {
      showContactForm();
    } else if (q.type === 'final') {
      showFinalOptions();
    } else {
      enableInput();
    }
  }

  function showContactForm() {
    const container = document.getElementById('chat-messages');
    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:90%;padding:8px 0;';
    ['Your name','Email','WhatsApp / phone'].forEach((label, i) => {
      const inp = document.createElement('input');
      inp.type = i === 1 ? 'email' : 'text';
      inp.placeholder = label;
      inp.dataset.field = ['contact_name','contact_email','contact_phone'][i];
      inp.style.cssText = 'padding:10px 14px;border:1px solid #e9d9d4;border-radius:12px;font-size:14px;font-family:Inter,sans-serif;outline:none;';
      inp.onfocus = () => inp.style.borderColor = '#ec1c8c';
      inp.onblur = () => inp.style.borderColor = '#e9d9d4';
      form.appendChild(inp);
    });
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Continue →';
    submitBtn.className = 'chat-option-btn';
    submitBtn.style.cssText = 'background:var(--accent);color:#fff;font-weight:600;border:none;align-self:flex-end;margin-top:4px;';
    submitBtn.onclick = () => {
      const vals = {};
      form.querySelectorAll('input').forEach(f => vals[f.dataset.field] = f.value.trim() || '');
      answers.contact_name = vals.contact_name;
      answers.contact_email = vals.contact_email;
      answers.contact_phone = vals.contact_phone;
      addMessage('Name: ' + vals.contact_name + '\nEmail: ' + vals.contact_email + '\nPhone: ' + vals.contact_phone, 'user');
      form.remove();
      history.push(questionIndex);
      questionIndex++;
      askQuestion();
    };
    form.appendChild(submitBtn);
    container.appendChild(form);
    container.scrollTop = container.scrollHeight;
  }

  function showFinalOptions() {
    showOptions(['Submit Setup for Review','Edit Answers','Book a Demo Call'], false, 0, (opt) => {
      if (opt === 'Submit Setup for Review') submitSetup();
      else if (opt === 'Edit Answers') { addMessage("No worries — let me know which question you'd like to change.", 'bot'); enableInput(); }
      else { addMessage("Great! I'll open the booking link for you.", 'bot'); window.open('https://calendly.com/dombrovskakate/strategy-call', '_blank'); submitSetup(); }
    });
  }

  function showSummary() {
    document.getElementById('chat-input-area').style.display = 'none';
    const container = document.getElementById('chat-messages');
    const sections = [
      { title: 'Business Profile', fields: ['business_name','industry','business_links','location_service_area','main_services','pricing_info','opening_hours','languages'] },
      { title: 'AI Employee Setup', fields: ['main_ai_goal','booking_method','customer_info_to_collect','common_customer_questions','escalation_rules','lead_destination','lead_destination_detail','tone_of_voice','restrictions','special_business_rules'] },
      { title: 'Contact', fields: ['contact_name','contact_email','contact_phone'] }
    ];
    const fieldLabels = {
      business_name:'Business name', industry:'Industry', business_links:'Website/Links', location_service_area:'Location',
      main_services:'Main services', pricing_info:'Prices', opening_hours:'Opening hours', languages:'Languages',
      main_ai_goal:'AI goal', booking_method:'Booking', customer_info_to_collect:'Info to collect',
      common_customer_questions:'Common questions', escalation_rules:'Escalation', lead_destination:'Lead dest.',
      lead_destination_detail:'Dest. detail', tone_of_voice:'Tone', restrictions:'Restrictions',
      special_business_rules:'Special rules', contact_name:'Name', contact_email:'Email', contact_phone:'Phone'
    };

    let html = '<div class="chat-summary">';
    sections.forEach(sec => {
      html += '<div class="chat-summary-section"><h4>' + sec.title + '</h4>';
      sec.fields.forEach(f => {
        const val = answers[f]; if (!val || val === 'not specified') return;
        html += '<div class="chat-summary-row"><span class="chat-summary-label">' + (fieldLabels[f]||f) + '</span><span class="chat-summary-value">' + val + '</span></div>';
      });
      html += '</div>';
    });
    html += '<div class="chat-summary-offer"><strong>Founding 30 Offer:</strong><br>€0 founding setup, guided onboarding, 77 live AI testing minutes. Plans from €79/month.</div></div>';
    addMessage('Here\'s your AI receptionist setup summary:', 'bot', html);

    const actions = document.createElement('div');
    actions.className = 'chat-summary-actions';
    actions.innerHTML = '<button class="chat-option-btn" id="submit-final-btn" style="padding:14px 20px;font-size:15px;font-weight:700;background:var(--accent);color:#fff;border:none;">Submit Setup for Review</button>' +
      '<button class="chat-option-btn" style="padding:12px 20px;font-size:14px;background:rgba(236,28,140,.1);color:var(--accent);border:1px solid var(--accent);" onclick="window.open(\'https://calendly.com/dombrovskakate/strategy-call\',\'_blank\')">Book a Demo Call</button>';
    container.appendChild(actions);
    document.getElementById('submit-final-btn').onclick = submitSetup;
    container.scrollTop = container.scrollHeight;
  }

  async function submitSetup() {
    addMessage('Submitting your setup for review...', 'bot');
    showTyping();
    try {
      const resp = await fetch(CONFIG.apiBase + '/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, answers, action:'submit' }) });
      const data = await resp.json();
      removeTyping();
      if (data.success) {
        addMessage('✅ Perfect! Your AI receptionist setup is ready for review.<br><br>Elite AI will prepare a custom AI preview and send the next step to your email.<br><br>Thank you! 🎉', 'bot');
        setTimeout(closeChat, 5000);
      } else { addMessage('Something went wrong. Please try again or <a href="https://calendly.com/dombrovskakate/strategy-call" target="_blank">book a demo call</a>.', 'bot'); }
    } catch(e) { removeTyping(); addMessage('Network error. Please try again.', 'bot'); }
  }

  async function submitAnswer(val) {
    if (isProcessing) return;
    isProcessing = true;
    const q = getQuestion();
    if (!q) { isProcessing = false; return; }

    answers[q.field] = val;
    addMessage(val, 'user');
    disableInput();
    showTyping();

    try {
      await fetch(CONFIG.apiBase + '/chat', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sessionId, step: q.step, field: q.field, answer: val, answers })
      });
    } catch(e) { console.error('Save error:', e); }

    removeTyping();
    history.push(questionIndex);
    questionIndex++;
    setTimeout(() => { isProcessing = false; askQuestion(); }, 300);
  }

  function goBack() {
    if (isProcessing || history.length === 0) return;
    const prevIdx = history.pop();
    questionIndex = prevIdx;
    // Remove old messages for this question and re-ask
    const container = document.getElementById('chat-messages');
    // Simple approach: clear and re-render from start (or just re-ask current)
    // To keep it simple: just clear the last bot message and options, then re-ask
    const messages = container.querySelectorAll('.chat-msg');
    // Find the last bot message and remove it + any options after it
    let lastBot = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].classList.contains('chat-msg-bot')) { lastBot = messages[i]; break; }
    }
    if (lastBot) {
      let next = lastBot.nextSibling;
      while (next && !next.classList?.contains('chat-msg')) { next.remove(); next = lastBot.nextSibling; }
      lastBot.remove();
      next = lastBot?.nextSibling;
      while (next) { const n = next.nextSibling; next.remove(); next = n; }
    }
    updateProgress();
    askQuestion();
  }

  function enableInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = false; inp.focus(); inp.placeholder = 'Type your answer...'; }
    if (btn) btn.disabled = false;
  }
  function disableInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) inp.disabled = true;
    if (btn) btn.disabled = true;
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    document.getElementById('chat-window').classList.add('open');
    document.getElementById('chat-fab').classList.add('hidden');
    if (questionIndex === 0) {
      sessionId = generateSessionId();
      addMessage("Hi, I'm the Elite AI Setup Assistant. I'll ask a few simple questions and prepare the first version of your AI receptionist setup. You don't need any technical knowledge — just answer naturally.", 'bot');
      setTimeout(askQuestion, 1200);
    }
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chat-window').classList.remove('open');
    document.getElementById('chat-fab').classList.remove('hidden');
  }

  function handleSend() {
    const inp = document.getElementById('chat-input');
    const val = inp.value.trim();
    if (!val || isProcessing) return;
    inp.value = '';
    submitAnswer(val);
  }

  function init() {
    const wrapper = document.createElement('div');
    wrapper.id = 'chat-widget-wrapper';
    wrapper.innerHTML = `
      <button id="chat-fab" class="chat-fab" onclick="window.__chatOpen()">Create My AI Receptionist</button>
      <div id="chat-window" class="chat-window">
        <div class="chat-header">
          <button id="chat-header-close" class="chat-header-close" onclick="window.__chatClose()">×</button>
          <button id="chat-header-back" class="chat-header-back" onclick="window.__chatBack()" style="position:absolute;left:16px;top:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;">←</button>
          <h3 style="padding-left:40px;padding-right:40px;">Elite AI Setup Assistant</h3>
          <p>Build your AI employee in a few minutes</p>
          <div class="chat-progress"><div id="chat-progress-bar" class="chat-progress-bar"></div></div>
          <div id="chat-progress-text" class="chat-progress-text"></div>
        </div>
        <div id="chat-messages" class="chat-messages"></div>
        <div id="chat-input-area" class="chat-input-area">
          <textarea id="chat-input" class="chat-input" rows="1" placeholder="Type your answer..."></textarea>
          <button id="chat-send-btn" class="chat-send-btn" onclick="window.__chatSend()">↑</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    window.__chatOpen = openChat;
    window.__chatClose = closeChat;
    window.__chatSend = handleSend;
    window.__chatBack = goBack;

    const inp = document.getElementById('chat-input');
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
    inp.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

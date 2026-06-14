/* ===== Elite AI Setup Chat Widget — Full Rewrite ===== */
(function() {
  'use strict';

  const QUESTIONS = [
    { id: 1,  question: "What's the name of your business?", field: 'business_name', type: 'text' },
    { id: 2,  question: "What type of business is it?", field: 'industry', type: 'options', options: ['Beauty salon / spa','Clinic / dental / medical','Real estate','Restaurant / hospitality','Home services','Gym / wellness','Agency / consulting','Ecommerce','Other'] },
    { id: 3,  question: "Do you have a website, Instagram, or Google Maps link? Please paste the URL.", field: 'business_links', type: 'text' },
    { id: 4,  question: "Where is your business located, and do you serve clients locally, online, or both?", field: 'location_service_area', type: 'text' },
    { id: 5,  question: "What are the main services your business offers?", field: 'main_services', type: 'text' },
    { id: 6,  question: "Do you want the AI to mention prices or price ranges? If yes, please add them here.", field: 'pricing_info', type: 'text' },
    { id: 7,  question: "What are your opening hours?", field: 'opening_hours', type: 'text' },
    { id: 8,  question: "Which languages should your AI speak? (Choose up to 2)", field: 'languages', type: 'options', options: ['English','Portuguese','Ukrainian','Russian','Spanish','French','Other'], maxSelect: 2 },
    { id: 9,  question: "What should your AI employee mainly do? (Choose all that apply)", field: 'main_ai_goal', type: 'options', options: ['Answer common questions','Book appointments','Qualify leads','Handle missed calls','Take messages','Transfer urgent calls','Follow up on leads','Other'] },
    { id: 10, question: "How should bookings work? (Choose all that apply)", field: 'booking_method', type: 'options', options: ['Calendar link','WhatsApp confirmation','Phone confirmation','Manual approval','CRM integration','I don\'t know yet','No booking needed'] },
    { id: 11, question: "What information should the AI collect from your customers? (Choose all that apply)", field: 'customer_info_to_collect', type: 'options', options: ['Name','Phone number','Email','Service needed','Preferred date/time','Budget','Location','Urgency','Notes / special request'] },
    { id: 12, question: "What questions do customers usually ask before booking or buying?", field: 'common_customer_questions', type: 'text' },
    { id: 13, question: "When should the AI transfer or escalate to a human? (e.g. urgent cases, angry customer, special request)", field: 'escalation_rules', type: 'text' },
    { id: 14, question: "Where should new leads or call summaries be sent? (Choose all that apply)", field: 'lead_destination', type: 'options', options: ['Email','WhatsApp','Telegram','CRM','Google Sheet','Other'] },
    { id: 15, question: "Please add the destination detail — e.g. email address, WhatsApp number, or Telegram username.", field: 'lead_destination_detail', type: 'text' },
    { id: 16, question: "How should your AI sound? (Choose all that apply)", field: 'tone_of_voice', type: 'options', options: ['Professional','Warm','Luxury','Friendly','Calm','Direct','Energetic'] },
    { id: 17, question: "Is there anything your AI must never say, promise, or do?", field: 'restrictions', type: 'text' },
    { id: 18, question: "Any special rules? (cancellation policy, deposits, emergency cases, service limits)", field: 'special_business_rules', type: 'text' },
    { id: 19, question: "Where should we send your AI receptionist preview? Please provide your name, email, and WhatsApp/phone.", field: 'contact_details', type: 'contact' },
    { id: 20, question: "Perfect. Do you want to submit this setup for Elite AI review?", field: 'submission_status', type: 'final' }
  ];

  let sessionId = '';
  let currentIdx = 0;
  let answers = {};
  let history = [];
  let isOpen = false;
  let isSubmitting = false;

  function getSessionId() {
    if (!sessionId) sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    return sessionId;
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function getQuestion() { return QUESTIONS[currentIdx] || null; }

  function updateProgress() {
    const bar = document.getElementById('chat-progress-bar');
    const text = document.getElementById('chat-progress-text');
    if (!bar || !text) return;
    const q = getQuestion();
    const step = q ? q.id : QUESTIONS.length;
    bar.style.width = (step / QUESTIONS.length * 100) + '%';
    text.textContent = 'Step ' + step + ' of ' + QUESTIONS.length;
  }

  function updateBackButton() {
    const btn = document.getElementById('chat-header-back');
    if (!btn) return;
    btn.style.visibility = history.length > 0 ? 'visible' : 'hidden';
  }

  function addMsg(text, type, html) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg-' + type;
    d.innerHTML = '<div class="chat-msg-bubble">' + (html || text.replace(/\n/g, '<br>')) + '</div><div class="chat-msg-time">' + timeNow() + '</div>';
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
  }

  function showTyping() {
    const c = document.getElementById('chat-messages');
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg-bot';
    d.id = 'chat-typing';
    d.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('chat-typing');
    if (el) el.remove();
  }

  function showOptions(q, callback) {
    const c = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    const sel = [];

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;

      if (opt === 'Other') {
        btn.onclick = () => {
          // Replace options with text input
          wrap.innerHTML = '';
          const row = document.createElement('div');
          row.style.cssText = 'width:100%;display:flex;gap:6px;';
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.placeholder = 'Type your answer...';
          inp.style.cssText = 'flex:1;padding:8px 14px;border:1px solid #e9d9d4;border-radius:999px;font-size:13px;outline:none;font-family:Inter,sans-serif;';
          inp.onfocus = () => inp.style.borderColor = 'var(--accent)';
          inp.onblur = () => inp.style.borderColor = '#e9d9d4';
          const ok = document.createElement('button');
          ok.textContent = '✓';
          ok.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;flex-shrink:0;';
          const doSend = () => { callback(inp.value.trim() || 'not specified'); wrap.remove(); };
          ok.onclick = doSend;
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
          row.appendChild(inp);
          row.appendChild(ok);
          wrap.appendChild(row);
          inp.focus();
        };
      } else {
        btn.onclick = () => {
          const idx = sel.indexOf(opt);
          if (idx >= 0) {
            sel.splice(idx, 1);
            btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = '';
          } else {
            if (q.maxSelect && sel.length >= q.maxSelect) {
              const first = sel.shift();
              wrap.querySelectorAll('.chat-option-btn').forEach(b => {
                if (b.textContent === first && !b.querySelector('input')) {
                  b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
                }
              });
            }
            sel.push(opt);
            btn.style.background = 'var(--accent)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--accent)';
          }
        };
      }
      wrap.appendChild(btn);
    });

    const doneBtn = document.createElement('button');
    doneBtn.className = 'chat-option-btn';
    doneBtn.textContent = 'Done ✓';
    doneBtn.style.fontWeight = '700';
    doneBtn.style.background = 'rgba(236,28,140,.15)';
    doneBtn.onclick = () => {
      if (sel.length === 0) callback('not specified');
      else callback(sel.join(', '));
      wrap.remove();
    };
    wrap.appendChild(doneBtn);
    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  function ask() {
    const q = getQuestion();
    if (!q) { showSummary(); return; }

    updateProgress();
    updateBackButton();
    addMsg(q.question, 'bot');

    if (q.type === 'options') {
      showOptions(q, val => submit(val));
    } else if (q.type === 'contact') {
      showContactForm();
    } else if (q.type === 'final') {
      showFinal();
    } else {
      enableInput(q.type === 'text' ? 'Type your answer...' : 'Paste your URL here...');
    }
  }

  function showContactForm() {
    const c = document.getElementById('chat-messages');
    const form = document.createElement('div');
    form.id = 'contact-form';
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

    const btn = document.createElement('button');
    btn.textContent = 'Continue →';
    btn.className = 'chat-option-btn';
    btn.style.cssText = 'background:var(--accent);color:#fff;font-weight:600;border:none;align-self:flex-end;margin-top:4px;';
    btn.onclick = () => {
      const vals = {};
      form.querySelectorAll('input').forEach(f => vals[f.dataset.field] = f.value.trim() || '');
      answers.contact_name = vals.contact_name;
      answers.contact_email = vals.contact_email;
      answers.contact_phone = vals.contact_phone;
      addMsg('Name: ' + vals.contact_name + '\nEmail: ' + vals.contact_email + '\nPhone: ' + vals.contact_phone, 'user');
      form.remove();
      history.push(currentIdx);
      currentIdx++;
      ask();
    };
    form.appendChild(btn);
    c.appendChild(form);
    c.scrollTop = c.scrollHeight;
  }

  function showFinal() {
    const c = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';

    ['Submit Setup for Review','Edit Answers','Book a Demo Call'].forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        wrap.querySelectorAll('.chat-option-btn').forEach(b => b.disabled = true);
        if (opt === 'Submit Setup for Review') { submitFinal(); }
        else if (opt === 'Edit Answers') { showEditList(); }
        else {
          addMsg("Opening booking link...", 'bot');
          window.open('https://calendly.com/dombrovskakate/strategy-call', '_blank');
          submitFinal();
        }
      };
      wrap.appendChild(btn);
    });
    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  function showEditList() {
    const c = document.getElementById('chat-messages');
    addMsg("Which question would you like to edit? Tap the number:", 'bot');

    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    wrap.style.flexDirection = 'column';

    QUESTIONS.forEach((q, idx) => {
      if (q.type === 'final') return;
      if (q.field === 'lead_destination_detail' && !answers.lead_destination) return;
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = q.id + '. ' + q.question.substring(0, 50) + (q.question.length > 50 ? '...' : '');
      btn.style.textAlign = 'left';
      btn.style.justifyContent = 'flex-start';
      btn.style.width = '100%';
      btn.onclick = () => {
        wrap.remove();
        // Go back to that question
        while (history.length > 0 && history[history.length - 1] !== idx) history.pop();
        if (history.length === 0) {
          // Remove messages back to this question and re-ask
          currentIdx = idx;
          // Clear messages from this point
          const msgs = c.querySelectorAll('.chat-msg');
          for (let i = msgs.length - 1; i >= 0; i--) msgs[i].remove();
          ask();
        } else {
          currentIdx = idx;
          history.pop(); // remove current from history since we'll re-add it
          // Clear messages from this point
          const msgs = c.querySelectorAll('.chat-msg');
          for (let i = msgs.length - 1; i >= 0; i--) msgs[i].remove();
          ask();
        }
      };
      wrap.appendChild(btn);
    });
    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  function showSummary() {
    document.getElementById('chat-input-area').style.display = 'none';
    const c = document.getElementById('chat-messages');

    const sections = [
      { title: 'Business Profile', fields: ['business_name','industry','business_links','location_service_area','main_services','pricing_info','opening_hours','languages'] },
      { title: 'AI Employee Setup', fields: ['main_ai_goal','booking_method','customer_info_to_collect','common_customer_questions','escalation_rules','lead_destination','lead_destination_detail','tone_of_voice','restrictions','special_business_rules'] },
      { title: 'Contact', fields: ['contact_name','contact_email','contact_phone'] }
    ];
    const labels = {
      business_name:'Business name', industry:'Industry', business_links:'Website/Links',
      location_service_area:'Location', main_services:'Services', pricing_info:'Prices',
      opening_hours:'Hours', languages:'Languages', main_ai_goal:'AI goal',
      booking_method:'Booking', customer_info_to_collect:'Info to collect',
      common_customer_questions:'Common Qs', escalation_rules:'Escalation',
      lead_destination:'Lead dest.', lead_destination_detail:'Dest. detail',
      tone_of_voice:'Tone', restrictions:'Restrictions', special_business_rules:'Special rules',
      contact_name:'Name', contact_email:'Email', contact_phone:'Phone'
    };

    let html = '<div class="chat-summary">';
    sections.forEach(sec => {
      html += '<div class="chat-summary-section"><h4>' + sec.title + '</h4>';
      sec.fields.forEach(f => {
        const v = answers[f];
        if (!v || v === 'not specified') return;
        html += '<div class="chat-summary-row"><span class="chat-summary-label">' + (labels[f]||f) + '</span><span class="chat-summary-value">' + v + '</span></div>';
      });
      html += '</div>';
    });
    html += '<div class="chat-summary-offer"><strong>Founding 30 Offer:</strong><br>€0 setup, guided onboarding, 77 AI testing min. From €79/mo.</div></div>';
    addMsg('Here\'s your AI receptionist setup summary:', 'bot', html);

    const actions = document.createElement('div');
    actions.className = 'chat-summary-actions';
    actions.innerHTML = '<button class="chat-option-btn" id="submit-final-btn" style="padding:14px 20px;font-size:15px;font-weight:700;background:var(--accent);color:#fff;border:none;">Submit Setup for Review</button>' +
      '<button class="chat-option-btn" style="padding:12px 20px;font-size:14px;background:rgba(236,28,140,.1);color:var(--accent);border:1px solid var(--accent);" onclick="window.open(\'https://calendly.com/dombrovskakate/strategy-call\',\'_blank\')">Book a Demo Call</button>';
    c.appendChild(actions);

    document.getElementById('submit-final-btn').onclick = submitFinal;
    c.scrollTop = c.scrollHeight;
  }

  async function submitFinal() {
    if (isSubmitting) return;
    isSubmitting = true;

    addMsg('Submitting your setup for review...', 'bot');
    showTyping();

    // Disable the submit button to prevent double-click
    const btn = document.getElementById('submit-final-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sessionId: getSessionId(), answers, action: 'submit' })
      });

      removeTyping();

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          addMsg('✅ <strong>Application Submitted!</strong><br><br>Thank you! Your AI receptionist setup has been received.<br><br>Elite AI will prepare a custom AI preview based on your information and send the next step to <strong>' + (answers.contact_email || 'your email') + '</strong>.<br><br>Watch your inbox — we\'ll be in touch within the next hour! 🎉', 'bot');
          // Close after 8 seconds
          setTimeout(closeChat, 8000);
          return;
        }
      }
      throw new Error('Server error');
    } catch(e) {
      removeTyping();
      addMsg('⚠️ Submission failed. Please try again or <a href="https://calendly.com/dombrovskakate/strategy-call" target="_blank">book a demo call</a>.', 'bot');
      // Re-enable
      isSubmitting = false;
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Setup for Review'; }
    }
  }

  async function submit(val) {
    const q = getQuestion();
    if (!q) return;

    answers[q.field] = val;
    addMsg(val, 'user');
    disableInput();

    // Save to DB in background
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sessionId: getSessionId(), step: q.id, field: q.field, answer: val, answers })
      });
    } catch(e) { /* silent fail */ }

    history.push(currentIdx);
    currentIdx++;
    setTimeout(ask, 300);
  }

  function goBack() {
    if (history.length === 0) return;
    const prevIdx = history.pop();
    currentIdx = prevIdx;

    // Remove last bot message + options + user answer from DOM
    const c = document.getElementById('chat-messages');
    // Remove last user message
    const msgs = c.querySelectorAll('.chat-msg');
    let lastUser = null, lastBot = null;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (!lastUser && msgs[i].classList.contains('chat-msg-user')) lastUser = msgs[i];
      if (!lastBot && msgs[i].classList.contains('chat-msg-bot') && !lastUser) lastBot = msgs[i];
    }
    // Remove everything after lastBot
    if (lastBot) {
      let next = lastBot.nextSibling;
      while (next) { const n = next.nextSibling; if (next.parentNode) next.parentNode.removeChild(next); next = n; }
      lastBot.remove();
    }
    // Also remove the user message
    if (lastUser && lastUser.parentNode) lastUser.parentNode.removeChild(lastUser);

    updateProgress();
    updateBackButton();
    ask();
  }

  function enableInput(placeholder) {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = false; inp.focus(); if (placeholder) inp.placeholder = placeholder; }
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
    document.body.classList.add('widget-open');
    if (currentIdx === 0) {
      getSessionId();
      addMsg("Hi, I'm the Elite AI Setup Assistant. I'll ask a few simple questions and prepare the first version of your AI receptionist setup. You don't need any technical knowledge — just answer naturally.", 'bot');
      setTimeout(ask, 1200);
    }
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chat-window').classList.remove('open');
    document.getElementById('chat-fab').classList.remove('hidden');
    document.body.classList.remove('widget-open');
  }

  function handleSend() {
    const inp = document.getElementById('chat-input');
    const val = inp.value.trim();
    if (!val) return;
    inp.value = '';
    submit(val);
  }

  function init() {
    const wrapper = document.createElement('div');
    wrapper.id = 'chat-widget-wrapper';
    wrapper.innerHTML = '<button id="chat-fab" class="chat-fab" onclick="window.__chatOpen()">Create My AI Receptionist</button>' +
      '<div id="chat-window" class="chat-window">' +
      '  <div class="chat-header">' +
      '    <button id="chat-header-close" class="chat-header-close" onclick="window.__chatClose()">×</button>' +
      '    <button id="chat-header-back" class="chat-header-back" onclick="window.__chatBack()" style="position:absolute;left:16px;top:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;visibility:hidden;">←</button>' +
      '    <h3 style="padding-left:40px;padding-right:40px;">Elite AI Setup Assistant</h3>' +
      '    <p>Build your AI employee in a few minutes</p>' +
      '    <div class="chat-progress"><div id="chat-progress-bar" class="chat-progress-bar"></div></div>' +
      '    <div id="chat-progress-text" class="chat-progress-text"></div>' +
      '  </div>' +
      '  <div id="chat-messages" class="chat-messages"></div>' +
      '  <div id="chat-input-area" class="chat-input-area">' +
      '    <textarea id="chat-input" class="chat-input" rows="1" placeholder="Type your answer..."></textarea>' +
      '    <button id="chat-send-btn" class="chat-send-btn" onclick="window.__chatSend()">↑</button>' +
      '  </div>' +
      '</div>';
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

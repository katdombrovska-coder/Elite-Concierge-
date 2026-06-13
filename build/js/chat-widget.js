/* ===== Elite AI Setup Chat Widget ===== */
(function() {
  'use strict';

  const CONFIG = {
    totalSteps: 19,
    apiBase: '/api',
    adminPassword: 'elite-ai-admin', // will be replaced with env later
    questions: [
      {
        step: 1,
        question: "What's the name of your business?",
        field: 'business_name',
        type: 'text'
      },
      {
        step: 2,
        question: "What type of business is it?",
        field: 'industry',
        type: 'options',
        options: ['Beauty salon / spa','Clinic / dental / medical','Real estate','Restaurant / hospitality','Home services','Gym / wellness','Agency / consulting','Ecommerce','Other']
      },
      {
        step: 3,
        question: "Do you have a website, Instagram, or Google Maps link we should use?",
        field: 'business_links',
        type: 'text'
      },
      {
        step: 4,
        question: "Where is your business located, and do you serve clients locally, online, or both?",
        field: 'location_service_area',
        type: 'text'
      },
      {
        step: 5,
        question: "What are the main services your business offers?",
        field: 'main_services',
        type: 'text'
      },
      {
        step: 6,
        question: "Do you want the AI to mention prices or price ranges? If yes, please add them here.",
        field: 'pricing_info',
        type: 'text'
      },
      {
        step: 7,
        question: "What are your opening hours?",
        field: 'opening_hours',
        type: 'text'
      },
      {
        step: 8,
        question: "Which languages should your AI speak?",
        field: 'languages',
        type: 'options',
        options: ['English','Portuguese','Ukrainian','Russian','Spanish','French','Other']
      },
      {
        step: 9,
        question: "What should your AI employee mainly do?",
        field: 'main_ai_goal',
        type: 'options-multi',
        options: ['Answer common questions','Book appointments','Qualify leads','Handle missed calls','Take messages','Transfer urgent calls','Follow up on leads','Other']
      },
      {
        step: 10,
        question: "How should bookings work?",
        field: 'booking_method',
        type: 'options',
        options: ['Calendar link','WhatsApp confirmation','Phone confirmation','Manual approval','CRM integration','I don\'t know yet','No booking needed']
      },
      {
        step: 11,
        question: "What information should the AI collect from your customers?",
        field: 'customer_info_to_collect',
        type: 'options-multi',
        options: ['Name','Phone number','Email','Service needed','Preferred date/time','Budget','Location','Urgency','Notes / special request']
      },
      {
        step: 12,
        question: "What questions do customers usually ask before booking or buying?",
        field: 'common_customer_questions',
        type: 'text'
      },
      {
        step: 13,
        question: "When should the AI transfer or escalate to a human? (e.g. urgent cases, angry customer, special request, high-value lead, medical/legal question, customer asks for a human)",
        field: 'escalation_rules',
        type: 'text'
      },
      {
        step: 14,
        question: "Where should new leads or call summaries be sent?",
        field: 'lead_destination',
        type: 'options',
        options: ['Email','WhatsApp','Telegram','CRM','Google Sheet','Other']
      },
      {
        step: 14.5,
        question: "Please add the destination detail — for example the email address, WhatsApp number, Telegram username, CRM name, or Google Sheet info.",
        field: 'lead_destination_detail',
        type: 'text',
        skipCondition: function(answers) { return !answers.lead_destination; }
      },
      {
        step: 15,
        question: "How should your AI sound?",
        field: 'tone_of_voice',
        type: 'options',
        options: ['Professional','Warm','Luxury','Friendly','Calm','Direct','Energetic']
      },
      {
        step: 16,
        question: "Is there anything your AI must never say, promise, or do?",
        field: 'restrictions',
        type: 'text'
      },
      {
        step: 17,
        question: "Any special rules we should know? For example cancellation policy, deposits, emergency cases, service limits, or important notes.",
        field: 'special_business_rules',
        type: 'text'
      },
      {
        step: 18,
        question: "Where should we send your AI receptionist preview? Please provide your name, email, and WhatsApp/phone.",
        field: 'contact_details',
        type: 'contact',
        fields: ['contact_name','contact_email','contact_phone']
      },
      {
        step: 19,
        question: "Perfect. Do you want to submit this setup for Elite AI review?",
        field: 'submission_status',
        type: 'final'
      }
    ]
  };

  let sessionId = '';
  let currentStep = 0;
  let answers = {};
  let isOpen = false;
  let isProcessing = false;

  // Generate session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Time string
  function timeStr() {
    return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  // Get question by step number (handles 14.5)
  function getQuestion(step) {
    return CONFIG.questions.find(q => q.step === step);
  }

  // Find next question index
  function getNextQuestionIndex() {
    for (let i = currentStep; i < CONFIG.questions.length; i++) {
      const q = CONFIG.questions[i];
      if (q.skipCondition && q.skipCondition(answers)) continue;
      return i;
    }
    return -1;
  }

  // Add message to chat
  function addMessage(text, type, html) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-' + type;
    div.innerHTML = '<div class="chat-msg-bubble">' + (html || text) + '</div><div class="chat-msg-time">' + timeStr() + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // Add typing indicator
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

  // Update progress bar
  function updateProgress() {
    const bar = document.getElementById('chat-progress-bar');
    const text = document.getElementById('chat-progress-text');
    if (!bar || !text) return;
    const pct = Math.round((currentStep / CONFIG.totalSteps) * 100);
    bar.style.width = pct + '%';
    text.textContent = 'Step ' + currentStep + ' of ' + CONFIG.totalSteps;
  }

  // Show quick reply options
  function showOptions(options, multi, callback) {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-options';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;
      btn.onclick = () => {
        wrapper.querySelectorAll('.chat-option-btn').forEach(b => b.disabled = true);
        callback(opt);
      };
      wrapper.appendChild(btn);
    });

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  // Show skip button
  function showSkipButton(callback) {
    const container = document.getElementById('chat-messages');
    const btn = document.createElement('button');
    btn.className = 'chat-skip-btn';
    btn.textContent = "Skip / I don't know yet →";
    btn.onclick = () => { callback(); btn.remove(); };
    container.appendChild(btn);
    container.scrollTop = container.scrollHeight;
  }

  // Ask current question
  function askQuestion() {
    const idx = getNextQuestionIndex();
    if (idx === -1) { showSummary(); return; }
    currentStep = CONFIG.questions[idx].step;
    updateProgress();

    const q = CONFIG.questions[idx];
    addMessage(q.question, 'bot');

    // Show options or text input
    if (q.type === 'options' || q.type === 'options-multi') {
      const selected = [];
      const selectHandler = function(opt) {
        if (q.type === 'options-multi') {
          // For multi-select, keep options available but highlight
          if (selected.includes(opt)) {
            selected.splice(selected.indexOf(opt), 1);
          } else {
            selected.push(opt);
          }
        } else {
          // Single select — disable others and proceed
          submitAnswer(opt);
        }
      };

      showOptions(q.options, q.type === 'options-multi', selectHandler);

      if (q.type === 'options-multi') {
        // Add a "Done" button for multi-select
        const container = document.getElementById('chat-messages');
        const doneBtn = document.createElement('button');
        doneBtn.className = 'chat-option-btn';
        doneBtn.textContent = 'Done ✓';
        doneBtn.style.fontWeight = '700';
        doneBtn.style.background = 'rgba(236,28,140,.15)';
        doneBtn.onclick = () => {
          if (selected.length === 0) {
            submitAnswer('not specified');
          } else {
            submitAnswer(selected.join(', '));
          }
          doneBtn.remove();
        };
        container.appendChild(doneBtn);
      }

      showSkipButton(() => submitAnswer('not specified'));
    } else if (q.type === 'contact') {
      // Show structured input for contact details
      showContactForm();
    } else if (q.type === 'final') {
      showFinalOptions();
    } else {
      // Text input — enable it
      enableInput();
      showSkipButton(() => submitAnswer('not provided'));
    }
  }

  // Show contact form (name, email, phone)
  function showContactForm() {
    const container = document.getElementById('chat-messages');
    const form = document.createElement('div');
    form.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:90%;padding:8px 0;';
    form.id = 'contact-form';

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
      const fields = form.querySelectorAll('input');
      const vals = {};
      fields.forEach(f => vals[f.dataset.field] = f.value.trim() || 'not provided');
      answers.contact_name = vals.contact_name;
      answers.contact_email = vals.contact_email;
      answers.contact_phone = vals.contact_phone;
      addMessage('Name: ' + vals.contact_name + '\nEmail: ' + vals.contact_email + '\nPhone: ' + vals.contact_phone, 'user');
      form.remove();
      askQuestion(); // proceed to next
    };
    form.appendChild(submitBtn);
    container.appendChild(form);
    container.scrollTop = container.scrollHeight;
  }

  // Show final options
  function showFinalOptions() {
    const container = document.getElementById('chat-messages');
    showOptions(['Submit Setup for Review','Edit Answers','Book a Demo Call'], false, (opt) => {
      if (opt === 'Submit Setup for Review') {
        submitSetup();
      } else if (opt === 'Edit Answers') {
        addMessage("No worries — let me know which question you'd like to change.", 'bot');
        enableInput();
      } else {
        addMessage("Great! I'll open the booking link for you.", 'bot');
        window.open('https://calendly.com/dombrovskakate/strategy-call', '_blank');
        submitSetup();
      }
    });
  }

  // Show summary
  function showSummary() {
    // Hide input area
    document.getElementById('chat-input-area').style.display = 'none';

    const container = document.getElementById('chat-messages');

    // Group answers
    const sections = [
      { title: 'Business Profile', fields: ['business_name','industry','business_links','location_service_area','main_services','pricing_info','opening_hours','languages'] },
      { title: 'AI Employee Setup', fields: ['main_ai_goal','booking_method','customer_info_to_collect','common_customer_questions','escalation_rules','lead_destination','lead_destination_detail','tone_of_voice','restrictions','special_business_rules'] },
      { title: 'Contact', fields: ['contact_name','contact_email','contact_phone'] }
    ];

    const fieldLabels = {
      business_name: 'Business name',
      industry: 'Industry',
      business_links: 'Website / Links',
      location_service_area: 'Location',
      main_services: 'Main services',
      pricing_info: 'Prices',
      opening_hours: 'Opening hours',
      languages: 'Languages',
      main_ai_goal: 'AI goal',
      booking_method: 'Booking method',
      customer_info_to_collect: 'Info to collect',
      common_customer_questions: 'Common questions',
      escalation_rules: 'Escalation',
      lead_destination: 'Lead destination',
      lead_destination_detail: 'Destination detail',
      tone_of_voice: 'Tone',
      restrictions: 'Restrictions',
      special_business_rules: 'Special rules',
      contact_name: 'Name',
      contact_email: 'Email',
      contact_phone: 'WhatsApp/Phone'
    };

    let summaryHTML = '<div class="chat-summary">';

    sections.forEach(sec => {
      summaryHTML += '<div class="chat-summary-section"><h4>' + sec.title + '</h4>';
      sec.fields.forEach(f => {
        const val = answers[f] || 'not specified';
        if (val === 'not specified') return;
        summaryHTML += '<div class="chat-summary-row"><span class="chat-summary-label">' + (fieldLabels[f] || f) + '</span><span class="chat-summary-value">' + val + '</span></div>';
      });
      summaryHTML += '</div>';
    });

    summaryHTML += '<div class="chat-summary-offer"><strong>Founding 30 Offer:</strong><br>You\'re applying for the Elite AI Founding 30 offer: <strong>€0 founding setup</strong>, guided onboarding, and <strong>77 live AI testing minutes</strong>. Plans start from €79/month.</div>';

    summaryHTML += '</div>';

    addMessage('Here\'s your AI receptionist setup summary:', 'bot', summaryHTML);

    // Final CTA
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'chat-summary-actions';
    actionsDiv.innerHTML = '<button class="chat-option-btn" id="submit-final-btn" style="padding:14px 20px;font-size:15px;font-weight:700;background:var(--accent);color:#fff;border:none;">Submit Setup for Review</button>' +
                           '<button class="chat-option-btn" style="padding:12px 20px;font-size:14px;background:rgba(236,28,140,.1);color:var(--accent);border:1px solid var(--accent);" onclick="window.open(\'https://calendly.com/dombrovskakate/strategy-call\',\'_blank\')">Book a Demo Call</button>';
    container.appendChild(actionsDiv);

    document.getElementById('submit-final-btn').onclick = submitSetup;
    container.scrollTop = container.scrollHeight;
  }

  // Submit to API
  async function submitSetup() {
    addMessage('Submitting your setup for review...', 'bot');
    showTyping();

    try {
      const resp = await fetch(CONFIG.apiBase + '/submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sessionId, answers })
      });
      const data = await resp.json();

      removeTyping();

      if (data.success) {
        addMessage('✅ Perfect! Your AI receptionist setup is ready for review.<br><br>Elite AI will prepare a custom AI preview based on this information and send the next step to your email.<br><br>Thank you! 🎉', 'bot');

        // Close widget after delay
        setTimeout(() => closeChat(), 5000);
      } else {
        addMessage('Something went wrong. Please try again or <a href="https://calendly.com/dombrovskakate/strategy-call" target="_blank">book a demo call</a>.', 'bot');
      }
    } catch(e) {
      removeTyping();
      addMessage('Network error. Please try again or <a href="https://calendly.com/dombrovskakate/strategy-call" target="_blank">book a demo call</a>.', 'bot');
    }
  }

  // Submit single answer
  async function submitAnswer(val) {
    if (isProcessing) return;
    isProcessing = true;

    const q = CONFIG.questions[currentStep - 1] || CONFIG.questions.find(q2 => q2.step === currentStep);
    if (!q) { isProcessing = false; return; }

    // Save answer
    if (q.field === 'contact_details') {
      // Already handled by contact form
    } else if (q.type === 'final') {
      answers[q.field] = val;
    } else {
      answers[q.field] = val;
    }

    addMessage(val, 'user');

    // Disable input
    disableInput();

    // Show typing
    showTyping();

    try {
      const resp = await fetch(CONFIG.apiBase + '/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          sessionId,
          step: currentStep,
          field: q.field,
          answer: val,
          answers: answers
        })
      });
      const data = await resp.json();

      removeTyping();

      if (data.nextQuestion !== undefined) {
        // Get LLM response or fallback
        if (data.llmResponse) {
          addMessage(data.llmResponse, 'bot');
        } else {
          addMessage("Got it, thanks!", 'bot');
        }

        setTimeout(() => {
          isProcessing = false;
          askQuestion();
        }, 600);
      } else {
        isProcessing = false;
        enableInput();
      }
    } catch(e) {
      removeTyping();
      addMessage("Got it!", 'bot');
      setTimeout(() => {
        isProcessing = false;
        askQuestion();
      }, 600);
    }
  }

  // Input helpers
  function enableInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = false; inp.focus(); }
    if (btn) btn.disabled = false;
  }
  function disableInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = true; }
    if (btn) btn.disabled = true;
  }

  // Open/close chat
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    document.getElementById('chat-window').classList.add('open');
    document.getElementById('chat-fab').classList.add('hidden');

    if (currentStep === 0) {
      sessionId = generateSessionId();
      addMessage("Hi, I'm the Elite AI Setup Assistant. I'll ask a few simple questions and prepare the first version of your AI receptionist setup. You don't need any technical knowledge — just answer naturally.", 'bot');
      setTimeout(() => askQuestion(), 1200);
    }
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chat-window').classList.remove('open');
    document.getElementById('chat-fab').classList.remove('hidden');
  }

  // Send message handler
  function handleSend() {
    const inp = document.getElementById('chat-input');
    const val = inp.value.trim();
    if (!val || isProcessing) return;
    inp.value = '';
    submitAnswer(val);
  }

  // Init
  function init() {
    // Create widget HTML
    const wrapper = document.createElement('div');
    wrapper.id = 'chat-widget-wrapper';
    wrapper.innerHTML = `
      <button id="chat-fab" class="chat-fab" onclick="window.__chatOpen()">Create My AI Receptionist</button>
      <div id="chat-window" class="chat-window">
        <div class="chat-header">
          <button id="chat-header-close" class="chat-header-close" onclick="window.__chatClose()">×</button>
          <h3>Elite AI Setup Assistant</h3>
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

    // Global handlers
    window.__chatOpen = openChat;
    window.__chatClose = closeChat;
    window.__chatSend = handleSend;

    // Enter to send
    const inp = document.getElementById('chat-input');
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto-resize textarea
    inp.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

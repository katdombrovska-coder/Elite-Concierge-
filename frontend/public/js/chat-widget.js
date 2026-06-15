/* ===== Elite AI Setup Chat Widget — v4 High-Impact ===== */
(function() {
  'use strict';

  const QUESTIONS = [
    { id: 1,  question: "What's the name of your business?", field: 'business_name', type: 'text', placeholder: 'e.g. Quantum AI Labs' },
    { id: 2,  question: "What type of business is it?", field: 'industry', type: 'options', options: ['Beauty salon / spa','Clinic / dental / medical','Real estate','Restaurant / hospitality','Home services','Gym / wellness','Agency / consulting','Ecommerce','Car dealership','Law firm','Other'] },
    { id: 3,  question: "Describe your business in a few sentences.", field: 'business_description', type: 'text', placeholder: 'e.g. AI studio in Lisbon', required: true },
    { id: 4,  question: "Please share your website, Instagram, Google Maps, booking page, or another business link.", field: 'business_links', type: 'links', placeholder: 'Paste your URL here...' },
    { id: 5,  question: "Where is your business located, and do you serve clients locally, online, or both?", field: 'location_service_area', type: 'text', placeholder: 'e.g. Lisbon, local clients' },
    { id: 6,  question: "What are the main services your business offers?", field: 'main_services', type: 'text', placeholder: 'e.g. AI agents, chatbots, voice AI' },
    { id: 7,  question: "Do you want the AI to mention prices or price ranges? If yes, please add them here.", field: 'pricing_info', type: 'text', placeholder: 'e.g. Starter €2k, Enterprise custom' },
    { id: 8,  question: "What makes your business different from competitors?", field: 'differentiator', type: 'options', options: ['Luxury / premium service','Same-day appointments','Multilingual support','Affordable pricing','Fast response times','Specialized expertise','Family-friendly','Eco-friendly / sustainable','24/7 availability','Personalized approach','Other'] },
    { id: 9,  question: "What are your opening hours?", field: 'opening_hours', type: 'text', placeholder: 'e.g. Mon-Fri 9-18, Sat 10-14' },
    { id: 10, question: "Which languages should your AI speak? (Choose up to 2)", field: 'languages', type: 'options', options: ['English','Portuguese','Ukrainian','Russian','Spanish','French','German','Italian','Other'], maxSelect: 2 },
    { id: 11, question: "What should your AI employee mainly do? (Choose all that apply)", field: 'main_ai_goal', type: 'options', options: ['Answer common questions','Book appointments','Qualify leads','Handle missed calls','Take messages','Transfer urgent calls','Follow up on leads','Provide pricing info','Other'] },
    { id: 12, question: "How should bookings work? (Choose all that apply)", field: 'booking_method', type: 'options', options: ['Calendar link','WhatsApp confirmation','Phone confirmation','Manual approval','CRM integration','I don\'t know yet','No booking needed'] },
    { id: 13, question: "What information should the AI collect from your customers? (Choose all that apply)", field: 'customer_info_to_collect', type: 'options', options: ['Name','Phone number','Email','Service needed','Preferred date/time','Budget','Location','Urgency','Notes / special request'] },
    { id: 14, question: "What are the most common questions customers ask before booking or buying?", field: 'common_customer_questions', type: 'text', placeholder: 'e.g. Pricing, location, hours' },
    { id: 15, question: "When should the AI transfer or escalate to a human?", field: 'escalation_rules', type: 'text', placeholder: 'e.g. Urgent cases, angry customers' },
    { id: 16, question: "Describe your ideal customer.", field: 'ideal_customer', type: 'text', placeholder: 'e.g. Professionals 30-55' },
    { id: 17, question: "Where should new leads and call summaries be sent?", field: 'lead_destination', type: 'multi_dest' },
    { id: 18, question: "How should your AI sound? (Choose all that apply)", field: 'tone_of_voice', type: 'options', options: ['Professional','Warm','Luxury','Friendly','Calm','Direct','Energetic'] },
    { id: 19, question: "Any special rules, restrictions, or things the AI must never say or do?", field: 'restrictions_rules', type: 'text', placeholder: 'e.g. No price guarantees without approval' },
    { id: 20, question: "Where should we send your AI receptionist preview?", field: 'contact_details', type: 'contact' }
  ];

  const INVALID_LINK_RESPONSES = ['yes','yeah','sure','ok','yep','yup','no','nope','nah','maybe','i think so','of course','please','pls'];

  let sessionId = '';
  let currentIdx = 0;
  let answers = {};
  let history = [];
  let isOpen = false;
  let isSubmitting = false;
  let optionsWrap = null;
  let editingFromSummary = false;
  let selectedPackageBackup = null;

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
    const step = currentIdx < QUESTIONS.length ? QUESTIONS[currentIdx].id : QUESTIONS.length;
    const pct = Math.round(step / QUESTIONS.length * 100);
    bar.style.width = pct + '%';
    text.textContent = 'Question ' + step + ' of ' + QUESTIONS.length + ' — ' + pct + '% complete';
  }

  function updateBackButton() {
    const bar = document.getElementById('chat-back-bar');
    if (!bar) return;
    bar.style.display = history.length > 0 ? '' : 'none';
  }

  function addMsg(text, type, html, center) {
    const c = document.getElementById('chat-messages');
    if (!c) return;
    const d = document.createElement('div');
    d.className = 'chat-msg chat-msg-' + type + (center ? ' chat-msg-center' : '');
    d.innerHTML = '<div class="chat-msg-bubble">' + (html || text.replace(/\n/g, '<br>')) + '</div><div class="chat-msg-time">' + timeNow() + '</div>';
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
    return d;
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

  function clearOptions() {
    if (optionsWrap && optionsWrap.parentNode) optionsWrap.remove();
    optionsWrap = null;
  }

  function showOptions(q, callback) {
    const c = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    optionsWrap = wrap;
    const sel = [];

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = opt;
      if (opt === 'Other') {
        btn.onclick = () => {
          wrap.innerHTML = '';
          const row = document.createElement('div');
          row.style.cssText = 'width:100%;display:flex;gap:6px;';
          const inp = document.createElement('input');
          inp.type = 'text'; inp.placeholder = 'Type your answer...';
          inp.style.cssText = 'flex:1;padding:8px 14px;border:1px solid #e9d9d4;border-radius:999px;font-size:13px;outline:none;font-family:Inter,sans-serif;';
          inp.onfocus = () => inp.style.borderColor = '#ec1c8c';
          inp.onblur = () => inp.style.borderColor = '#e9d9d4';
          const ok = document.createElement('button');
          ok.textContent = '✓';
          ok.style.cssText = 'background:#ec1c8c;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;flex-shrink:0;';
          const doSend = () => {
            const val = inp.value.trim();
            if (!val) { inp.style.borderColor = '#ff0000'; inp.focus(); return; }
            callback(val); wrap.remove(); optionsWrap = null;
          };
          ok.onclick = doSend;
          inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
          row.appendChild(inp); row.appendChild(ok);
          wrap.appendChild(row);
          c.scrollTop = c.scrollHeight;
          setTimeout(() => inp.focus(), 100);
        };
      } else {
        btn.onclick = () => {
          const idx = sel.indexOf(opt);
          if (idx >= 0) { sel.splice(idx,1); btn.style.background=''; btn.style.color=''; btn.style.borderColor=''; }
          else {
            if (q.maxSelect && sel.length >= q.maxSelect) {
              const first = sel.shift();
              wrap.querySelectorAll('.chat-option-btn').forEach(b => { if (b.textContent === first && b !== btn) { b.style.background=''; b.style.color=''; b.style.borderColor=''; } });
            }
            sel.push(opt); btn.style.background='#ec1c8c'; btn.style.color='#fff'; btn.style.borderColor='#ec1c8c';
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
    doneBtn.onclick = () => { callback(sel.length === 0 ? 'Not specified' : sel.join(', ')); wrap.remove(); optionsWrap = null; };
    wrap.appendChild(doneBtn);
    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  /* ---- LINK VALIDATION ---- */
  function isValidLink(val) {
    if (INVALID_LINK_RESPONSES.includes(val.toLowerCase().trim())) return false;
    if (val.length < 4) return false;
    if (/^https?:\/\//i.test(val)) return true;
    if (val.includes('.') || val.includes('/')) return true;
    return false;
  }

  /* ---- LINKS TYPE SELECTOR ---- */
  function showLinksQuestion(q, callback) {
    const c = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '8px';
    optionsWrap = wrap;

    const types = ['Website', 'Instagram', 'Google Maps', 'Booking Page'];
    types.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = t;
      btn.style.cssText = 'text-align:left;padding:10px 14px;';
      btn.onclick = () => {
        wrap.innerHTML = '';
        const row = document.createElement('div');
        row.style.cssText = 'width:100%;display:flex;gap:6px;';
        const inp = document.createElement('input');
        inp.type = 'url'; inp.placeholder = 'Paste your ' + t.toLowerCase() + ' URL...';
        inp.style.cssText = 'flex:1;padding:8px 14px;border:1px solid #e9d9d4;border-radius:999px;font-size:13px;outline:none;font-family:Inter,sans-serif;';
        inp.onfocus = () => inp.style.borderColor = '#ec1c8c';
        inp.onblur = () => inp.style.borderColor = '#e9d9d4';
        const ok = document.createElement('button');
        ok.textContent = '✓';
        ok.style.cssText = 'background:#ec1c8c;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;flex-shrink:0;';
        const doSend = () => {
          const val = inp.value.trim();
          if (!val) { inp.style.borderColor = '#ff0000'; inp.focus(); return; }
          if (!isValidLink(val)) { addMsg("Please paste the actual URL so I can review your business.", 'bot'); inp.style.borderColor = '#ff0000'; inp.focus(); return; }
          callback(t + ': ' + val); wrap.remove(); optionsWrap = null;
        };
        ok.onclick = doSend;
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
        row.appendChild(inp); row.appendChild(ok);
        wrap.appendChild(row);
        c.scrollTop = c.scrollHeight;
        setTimeout(() => inp.focus(), 100);
      };
      wrap.appendChild(btn);
    });

    // "I don't have any online presence" button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'chat-option-btn';
    skipBtn.textContent = "I don't have any online presence";
    skipBtn.style.cssText = 'background:rgba(100,100,100,.08);color:#666;border:1px solid #ddd;padding:10px 14px;';
    skipBtn.onclick = () => { callback('Not provided'); wrap.remove(); optionsWrap = null; };
    wrap.appendChild(skipBtn);

    // Or type any URL
    const orDiv = document.createElement('div');
    orDiv.style.cssText = 'text-align:center;font-size:12px;color:#999;margin:4px 0;';
    orDiv.textContent = '— or paste any link below —';
    wrap.appendChild(orDiv);

    const freeRow = document.createElement('div');
    freeRow.style.cssText = 'width:100%;display:flex;gap:6px;';
    const freeInp = document.createElement('input');
    freeInp.type = 'url'; freeInp.placeholder = q.placeholder || 'Paste your URL here...';
    freeInp.style.cssText = 'flex:1;padding:8px 14px;border:1px solid #e9d9d4;border-radius:999px;font-size:13px;outline:none;font-family:Inter,sans-serif;';
    freeInp.onfocus = () => freeInp.style.borderColor = '#ec1c8c';
    freeInp.onblur = () => freeInp.style.borderColor = '#e9d9d4';
    const freeOk = document.createElement('button');
    freeOk.textContent = '✓';
    freeOk.style.cssText = 'background:#ec1c8c;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;flex-shrink:0;';
    const doFreeSend = () => {
      const val = freeInp.value.trim();
      if (!val) { freeInp.style.borderColor = '#ff0000'; freeInp.focus(); return; }
      if (!isValidLink(val)) { addMsg("Please paste the actual URL so I can review your business.", 'bot'); freeInp.style.borderColor = '#ff0000'; freeInp.focus(); return; }
      callback(val); wrap.remove(); optionsWrap = null;
    };
    freeOk.onclick = doFreeSend;
    freeInp.addEventListener('keydown', e => { if (e.key === 'Enter') doFreeSend(); });
    freeRow.appendChild(freeInp); freeRow.appendChild(freeOk);
    wrap.appendChild(freeRow);

    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  /* ---- MULTI-DESTINATION LEAD FLOW ---- */
  function showMultiDest(q, callback) {
    const c = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '8px';
    optionsWrap = wrap;

    const destTypes = ['Email', 'WhatsApp', 'Telegram', 'Google Sheets', 'CRM'];
    const sel = [];

    destTypes.forEach(d => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.textContent = d;
      btn.style.cssText = 'text-align:left;padding:10px 14px;';
      btn.onclick = () => {
        const idx = sel.indexOf(d);
        if (idx >= 0) { sel.splice(idx,1); btn.style.background=''; btn.style.color=''; btn.style.borderColor=''; }
        else { sel.push(d); btn.style.background='#ec1c8c'; btn.style.color='#fff'; btn.style.borderColor='#ec1c8c'; }
      };
      wrap.appendChild(btn);
    });

    const doneBtn = document.createElement('button');
    doneBtn.className = 'chat-option-btn';
    doneBtn.textContent = 'Done ✓';
    doneBtn.style.fontWeight = '700';
    doneBtn.style.background = 'rgba(236,28,140,.15)';
    doneBtn.onclick = () => {
      if (sel.length === 0) { callback('Not specified', ''); wrap.remove(); optionsWrap = null; return; }
      wrap.innerHTML = '';
      addMsg("Please provide the details for: " + sel.join(', '), 'bot');
      const placeholders = { 'Email':'name@email.com', 'WhatsApp':'+351xxxxxxxxx', 'Telegram':'@username', 'Google Sheets':'Paste sheet link', 'CRM':'HubSpot, GoHighLevel, Salesforce, etc.' };
      const detailForm = document.createElement('div');
      detailForm.style.cssText = 'display:flex;flex-direction:column;gap:8px;width:100%;';
      sel.forEach(d => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:6px;align-items:center;';
        const label = document.createElement('span');
        label.textContent = d + ':';
        label.style.cssText = 'font-size:12px;color:#666;min-width:80px;';
        const inp = document.createElement('input');
        inp.type = d === 'Email' ? 'email' : 'text';
        inp.placeholder = placeholders[d] || 'Enter details...';
        inp.dataset.dest = d;
        inp.style.cssText = 'flex:1;padding:8px 14px;border:1px solid #e9d9d4;border-radius:999px;font-size:13px;outline:none;font-family:Inter,sans-serif;';
        inp.onfocus = () => inp.style.borderColor = '#ec1c8c';
        inp.onblur = () => inp.style.borderColor = '#e9d9d4';
        row.appendChild(label); row.appendChild(inp);
        detailForm.appendChild(row);
      });
      const submitBtn = document.createElement('button');
      submitBtn.className = 'chat-option-btn';
      submitBtn.textContent = 'Continue →';
      submitBtn.style.cssText = 'background:#ec1c8c;color:#fff;font-weight:600;border:none;align-self:flex-end;margin-top:4px;padding:10px 20px;';
      submitBtn.onclick = () => {
        const details = {};
        detailForm.querySelectorAll('input').forEach(f => { details[f.dataset.dest] = f.value.trim(); });
        const detailStr = sel.map(d => d + ': ' + (details[d] || 'not provided')).join(', ');
        callback(sel.join(', '), detailStr);
        wrap.remove(); optionsWrap = null;
      };
      detailForm.appendChild(submitBtn);
      wrap.appendChild(detailForm);
      c.scrollTop = c.scrollHeight;
      setTimeout(() => detailForm.querySelector('input').focus(), 100);
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
    resetInput();
    addMsg(q.question, 'bot');
    if (q.type === 'options') { hideInputArea(); showOptions(q, val => submit(val)); }
    else if (q.type === 'links') { hideInputArea(); showLinksQuestion(q, val => submit(val)); }
    else if (q.type === 'multi_dest') {
      hideInputArea();
      showMultiDest(q, (dest, detail) => {
        answers.lead_destination = dest;
        answers.lead_destination_detail = detail;
        addMsg('Destinations: ' + dest + '\nDetails: ' + detail, 'user');
        resetInput(); clearOptions();
        fetch('https://eliteai.space/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId:getSessionId(),step:q.id,field:q.field,answer:dest+' | '+detail,answers}) }).catch(()=>{});
        history.push(currentIdx); currentIdx++;
        if (editingFromSummary) { editingFromSummary=false; setTimeout(()=>{const c=document.getElementById('chat-messages');c.innerHTML='';const ia=document.getElementById('chat-input-area');if(ia)ia.style.display='';showSummary();},500); return; }
        setTimeout(ask, 350);
      });
    } else if (q.type === 'contact') { hideInputArea(); showContactForm(); }
    else { showInputArea(); enableInput(q.placeholder || 'Type your answer...'); }
  }

  function showContactForm() {
    const c = document.getElementById('chat-messages');
    const form = document.createElement('div');
    form.id = 'contact-form-widget';
    form.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:90%;padding:8px 0;';
    ['Your name','Email','WhatsApp / phone'].forEach((label,i) => {
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
    btn.style.cssText = 'background:#ec1c8c;color:#fff;font-weight:600;border:none;align-self:flex-end;margin-top:4px;padding:10px 20px;';
    btn.onclick = () => {
      const vals = {};
      form.querySelectorAll('input').forEach(f => vals[f.dataset.field] = f.value.trim() || '');
      if (!vals.contact_name || !vals.contact_email) { addMsg('Please fill in at least your name and email.', 'bot'); return; }
      answers.contact_name = vals.contact_name; answers.contact_email = vals.contact_email; answers.contact_phone = vals.contact_phone;
      addMsg('Name: ' + vals.contact_name + '\nEmail: ' + vals.contact_email + '\nPhone: ' + vals.contact_phone, 'user');
      form.remove(); history.push(currentIdx); currentIdx++;
      setTimeout(ask, 300);
    };
    form.appendChild(btn);
    c.appendChild(form);
    c.scrollTop = c.scrollHeight;
    setTimeout(() => form.querySelector('input').focus(), 100);
  }

  /* ---- GENERATE BUSINESS SUMMARY ---- */
  function generateBusinessSummary(a) {
    const np = 'Not provided';
    const lines = [];
    lines.push('BUSINESS SUMMARY');
    lines.push('═══════════════════════════════════════');
    lines.push('');
    lines.push('Business: ' + (a.business_name || np));
    lines.push('Industry: ' + (a.industry || np));
    lines.push('Description: ' + (a.business_description || np));
    lines.push('Website/Links: ' + (a.business_links || np));
    lines.push('Location: ' + (a.location_service_area || np));
    lines.push('Services: ' + (a.main_services || np));
    lines.push('Pricing: ' + (a.pricing_info || np));
    lines.push('Differentiator: ' + (a.differentiator || np));
    lines.push('Hours: ' + (a.opening_hours || np));
    lines.push('Languages: ' + (a.languages || np));
    lines.push('');
    lines.push('AI CONFIGURATION');
    lines.push('───────────────────────────────────────');
    lines.push('AI Goals: ' + (a.main_ai_goal || np));
    lines.push('Booking Method: ' + (a.booking_method || np));
    lines.push('Customer Info: ' + (a.customer_info_to_collect || np));
    lines.push('FAQ Topics: ' + (a.common_customer_questions || np));
    lines.push('Escalation: ' + (a.escalation_rules || np));
    lines.push('Ideal Customer: ' + (a.ideal_customer || np));
    lines.push('Lead Destination: ' + (a.lead_destination || np));
    lines.push('Destination Details: ' + (a.lead_destination_detail || np));
    lines.push('Tone: ' + (a.tone_of_voice || np));
    lines.push('Rules/Restrictions: ' + (a.restrictions_rules || np));
    lines.push('');
    lines.push('CONTACT');
    lines.push('───────────────────────────────────────');
    lines.push('Name: ' + (a.contact_name || np));
    lines.push('Email: ' + (a.contact_email || np));
    lines.push('Phone: ' + (a.contact_phone || np));
    return lines.join('\n');
  }

  /* ---- PLACEHOLDER: Future AI Prompt Generator ---- */
  /* This function is prepared but not yet active.
     When Gemini or OpenAI integration is added, call this
     to generate a structured AI receptionist prompt. */
  function generateAIPrompt(ai_prompt_data) {
    // TODO: Implement AI prompt generation
    // Input: structured ai_prompt_data object
    // Output: formatted system prompt for AI receptionist
    // Example structure:
    // return `You are an AI receptionist for ${ai_prompt_data.business_name}...`
    return null;
  }

  function showSummary() {
    const inputArea = document.getElementById('chat-input-area');
    if (inputArea) inputArea.style.display = 'none';
    const c = document.getElementById('chat-messages');
    clearOptions();

    const np = 'Not provided';
    const sections = [
      { title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:6px"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V3h4v18"/></svg> Business Profile', fields: [
        { key: 'business_name', label: 'Business Name' },
        { key: 'industry', label: 'Industry' },
        { key: 'business_description', label: 'Description' },
        { key: 'business_links', label: 'Website / Links' },
        { key: 'location_service_area', label: 'Location' },
        { key: 'main_services', label: 'Services' },
        { key: 'pricing_info', label: 'Pricing' },
        { key: 'differentiator', label: 'Differentiator' },
        { key: 'opening_hours', label: 'Hours' },
        { key: 'languages', label: 'Languages' }
      ]},
      { title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:6px"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h0M16 16h0"/></svg> AI Configuration', fields: [
        { key: 'main_ai_goal', label: 'AI Goals' },
        { key: 'booking_method', label: 'Booking Method' },
        { key: 'customer_info_to_collect', label: 'Info to Collect' },
        { key: 'common_customer_questions', label: 'Common Questions' },
        { key: 'escalation_rules', label: 'Escalation Rules' },
        { key: 'ideal_customer', label: 'Ideal Customer' },
        { key: 'lead_destination', label: 'Lead Destination' },
        { key: 'lead_destination_detail', label: 'Destination Details' },
        { key: 'tone_of_voice', label: 'Tone of Voice' },
        { key: 'restrictions_rules', label: 'Rules & Restrictions' }
      ]},
      { title: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:6px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Contact', fields: [
        { key: 'contact_name', label: 'Name' },
        { key: 'contact_email', label: 'Email' },
        { key: 'contact_phone', label: 'Phone' }
      ]}
    ];

    let html = '<div class="chat-summary">';
    
    // Show selected package prominently if exists
    console.log('[DEBUG] showSummary - selected_package:', answers.selected_package);
    if (answers.selected_package) {
      html += '<div style="background:linear-gradient(135deg,#fff3cd,#ffe69c);border:2px solid #ffc107;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">';
      html += '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#856404;font-weight:700;margin-bottom:4px;">Selected Package</div>';
      html += '<div style="font-size:24px;font-weight:800;color:#856404;">' + answers.selected_package + '</div>';
      html += '</div>';
      console.log('[DEBUG] Package box added to HTML');
    } else {
      console.log('[DEBUG] No package to show');
    }
    
    sections.forEach(sec => {
      html += '<div class="chat-summary-section"><h4>' + sec.title + '</h4>';
      sec.fields.forEach(f => {
        const v = answers[f.key];
        const display = (!v || v === 'not specified' || v === 'Not specified' || v === '') ? '<span style="color:#999">Not provided</span>' : v;
        html += '<div class="chat-summary-row" style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.05)"><span class="chat-summary-label" style="font-weight:600;color:#666;font-size:12px">' + f.label + '</span><span class="chat-summary-value" style="font-size:13px;color:#240029;text-align:right;max-width:60%">' + display + '</span></div>';
      });
      html += '</div>';
    });

    // Offer box
    html += '<div class="chat-summary-offer" style="background:linear-gradient(135deg,rgba(236,28,140,.06),rgba(236,28,140,.02));border:1px solid rgba(236,28,140,.15);border-radius:14px;padding:18px 16px;margin-top:16px;text-align:left">' +
      '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#ec1c8c;font-weight:700;margin-bottom:10px">Founding 30 Preview</div>' +
      '<div style="font-size:13px;color:#3a1240;line-height:1.8">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="3" style="display:inline-block;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> No payment required today<br>' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="3" style="display:inline-block;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> Free AI setup preview<br>' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="3" style="display:inline-block;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> 77 testing minutes included<br>' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="3" style="display:inline-block;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> Guided onboarding<br>' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="3" style="display:inline-block;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> Activate only if you\'re happy with the result' +
      '</div>' +
      '<div style="font-size:12px;color:#6b4f6f;margin-top:10px;padding-top:10px;border-top:1px solid rgba(236,28,140,.12)">Plans start from €79/month after activation.</div>' +
      '</div></div>';

    addMsg("Here's your AI receptionist setup brief:", 'bot', html, true);

    const actions = document.createElement('div');
    actions.className = 'chat-summary-actions';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'chat-option-btn';
    submitBtn.id = 'submit-final-btn';
    submitBtn.style.cssText = 'padding:14px 20px;font-size:15px;font-weight:700;background:#ec1c8c;color:#fff;border:none;';
    submitBtn.textContent = 'Create My AI Preview';
    submitBtn.onclick = submitFinal;

    const editBtn = document.createElement('button');
    editBtn.className = 'chat-option-btn';
    editBtn.style.cssText = 'padding:12px 20px;font-size:14px;background:rgba(236,28,140,.1);color:#ec1c8c;border:1px solid #ec1c8c;';
    editBtn.textContent = 'Edit Answers';
    editBtn.onclick = () => {
      editingFromSummary = true;
      // Clear everything in messages area
      c.innerHTML = '';
      // Show input area again
      var ia = document.getElementById('chat-input-area');
      if (ia) ia.style.display = '';
      showEditList();
    };

    const bookBtn = document.createElement('button');
    bookBtn.className = 'chat-option-btn';
    bookBtn.style.cssText = 'padding:12px 20px;font-size:14px;background:rgba(236,28,140,.1);color:#ec1c8c;border:1px solid #ec1c8c;';
    bookBtn.textContent = 'Book a Strategy Call';
    bookBtn.onclick = () => { window.open('https://calendly.com/dombrovskakate/strategy-call', '_blank'); };

    actions.appendChild(submitBtn);
    actions.appendChild(editBtn);
    actions.appendChild(bookBtn);
    c.appendChild(actions);
    c.scrollTop = c.scrollHeight;
  }

  function showEditList() {
    const c = document.getElementById('chat-messages');
    clearOptions();
    addMsg("Which question would you like to edit? Tap the number:", 'bot');
    const wrap = document.createElement('div');
    wrap.className = 'chat-options';
    wrap.style.cssText = 'flex-direction:column;max-height:300px;overflow-y:auto;overflow-x:hidden;width:100%;box-sizing:border-box;';

    QUESTIONS.filter(q => q.type !== 'contact' && answers[q.field]).forEach(q => {
      const idx = QUESTIONS.indexOf(q);
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.style.cssText = 'text-align:center;justify-content:center;width:100%;padding:10px 14px;white-space:normal;line-height:1.4;box-sizing:border-box;word-wrap:break-word;overflow-wrap:break-word;';
      btn.innerHTML = '<strong>' + q.id + '.</strong> ' + q.question;
      btn.onclick = () => {
        wrap.remove(); editingFromSummary = true;
        const newHistory = []; for (let i=0;i<idx;i++) { if(answers[QUESTIONS[i].field]) newHistory.push(i); } history = newHistory; currentIdx = idx;
        c.innerHTML = ''; addMsg('You\'re editing question #'+q.id+':','bot'); addMsg(q.question,'bot');
        if (q.type==='options') showOptions(q, val => submitEdit(val));
        else if (q.type==='links') showLinksQuestion(q, val => submitEdit(val));
        else if (q.type==='multi_dest') showMultiDest(q, (dest,detail) => { answers.lead_destination=dest; answers.lead_destination_detail=detail; addMsg('Destinations: '+dest+'\nDetails: '+detail,'user'); editingFromSummary=false; currentIdx=QUESTIONS.length; setTimeout(()=>{c.innerHTML='';const ia=document.getElementById('chat-input-area');if(ia)ia.style.display='';showSummary();},500); });
        else { const inp=document.getElementById('chat-input'); if(inp)inp.value=answers[q.field]||''; enableInput('Edit your answer...'); }
        updateBackButton();
      };
      wrap.appendChild(btn);
    });

    const contactBtn = document.createElement('button');
    contactBtn.className = 'chat-option-btn';
    contactBtn.style.cssText = 'text-align:left;justify-content:flex-start;width:100%;padding:10px 14px;';
    contactBtn.innerHTML = '<strong>20.</strong> Contact details';
    contactBtn.onclick = () => { wrap.remove(); editingFromSummary=true; c.innerHTML=''; addMsg('Editing contact details:','bot'); showContactFormEdit(); };
    wrap.appendChild(contactBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'chat-option-btn';
    cancelBtn.textContent = '← Back to summary';
    cancelBtn.style.fontWeight = '600';
    cancelBtn.style.marginTop = '8px';
    cancelBtn.onclick = () => { wrap.remove(); showSummary(); };
    wrap.appendChild(cancelBtn);
    c.appendChild(wrap);
    c.scrollTop = c.scrollHeight;
  }

  async function submitFinal() {
    console.log('[DEBUG] submitFinal called');
    console.log('[DEBUG] answers object:', JSON.stringify(answers, null, 2));
    console.log('[DEBUG] selected_package:', answers.selected_package);
    
    if (isSubmitting) {
      console.log('[DEBUG] Already submitting, skipping');
      return;
    }
    isSubmitting = true;
    addMsg('Generating your AI preview...', 'bot');
    showTyping();
    const btn = document.getElementById('submit-final-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating...'; }

    const np = 'Not provided';
    const aiPromptData = {
      selected_package: answers.selected_package || np,
      business_name: answers.business_name || np,
      industry: answers.industry || np,
      business_description: answers.business_description || np,
      business_links: answers.business_links || np,
      location_service_area: answers.location_service_area || np,
      main_services: answers.main_services || np,
      pricing_info: answers.pricing_info || np,
      differentiator: answers.differentiator || np,
      opening_hours: answers.opening_hours || np,
      languages: answers.languages || np,
      main_ai_goal: answers.main_ai_goal || np,
      booking_method: answers.booking_method || np,
      customer_info_to_collect: answers.customer_info_to_collect || np,
      common_customer_questions: answers.common_customer_questions || np,
      escalation_rules: answers.escalation_rules || np,
      ideal_customer: answers.ideal_customer || np,
      lead_destination: answers.lead_destination || np,
      lead_destination_detail: answers.lead_destination_detail || np,
      tone_of_voice: answers.tone_of_voice || np,
      restrictions_rules: answers.restrictions_rules || np,
      contact_name: answers.contact_name || np,
      contact_email: answers.contact_email || np,
      contact_phone: answers.contact_phone || np
    };

    // Generate structured business summary (no paid API needed)
    const businessSummary = generateBusinessSummary(aiPromptData);

    // Placeholder for future AI prompt generation
    const aiPrompt = generateAIPrompt(aiPromptData);

    console.log('[DEBUG] Sending to API:', {sessionId: getSessionId(), action: 'submit'});

    // Show success card IMMEDIATELY before API call
    removeTyping();
    const successCard = '<div style="background:#ffffff;border-radius:16px;padding:24px 20px;text-align:center;border:1px solid rgba(236,28,140,.12);box-shadow:0 4px 20px rgba(236,28,140,.1);margin:4px 0">' +
      '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#ec1c8c,#ff4da6);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(236,28,140,.3)">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
      '<h3 style="font-family:\'Bricolage Grotesque\',serif;font-size:20px;font-weight:800;color:#240029;margin:0 0 10px;letter-spacing:-.02em;line-height:1.1">We\'re Building Your AI Preview</h3>' +
      '<p style="font-size:14px;color:#3a1240;line-height:1.6;margin:0 0 12px">We\'ve received your setup and will start building your custom AI receptionist shortly.</p>' +
      '<p style="font-size:14px;color:#3a1240;line-height:1.6;margin:0 0 16px">We\'ll send the preview and next steps to<br><strong style="color:#ec1c8c">' + (answers.contact_email || 'your email') + '</strong></p>' +
      '<div style="background:rgba(236,28,140,.08);border-radius:12px;padding:12px 16px;margin-top:8px"><p style="font-size:13px;color:#6b4f6f;margin:0"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec1c8c" stroke-width="2" style="display:inline-block;vertical-align:middle;margin-right:6px"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg> Watch your inbox — we\'ll be in touch within the next hour!</p></div></div>';
    addMsg('', 'bot', successCard, true);

    // Fire API call in background (don't block UI)
    fetch('https://eliteai.space/api/chat', {
      method: 'POST', mode: 'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        sessionId: getSessionId(),
        answers: aiPromptData,
        action: 'submit',
        ai_prompt_data: aiPromptData,
        business_summary: businessSummary,
        ai_prompt: aiPrompt
      })
    }).then(r => console.log('[DEBUG] Submit response:', r.status)).catch(e => console.error('[DEBUG] Submit error:', e));
  }

  async function submit(val) {
    const q = getQuestion(); if (!q) return;
    answers[q.field] = val;
    addMsg(val, 'user'); disableInput(); clearOptions(); hideInputArea();
    fetch('https://eliteai.space/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId:getSessionId(),step:q.id,field:q.field,answer:val,answers}) }).catch(()=>{});
    history.push(currentIdx); currentIdx++;
    if (editingFromSummary) { editingFromSummary=false; setTimeout(()=>{const c=document.getElementById('chat-messages');c.innerHTML='';const ia=document.getElementById('chat-input-area');if(ia)ia.style.display='';showSummary();},500); return; }
    setTimeout(ask, 350);
  }

  function submitEdit(val) {
    const q = getQuestion(); if (!q) return;
    answers[q.field] = val; addMsg(val,'user'); disableInput(); clearOptions();
    fetch('https://eliteai.space/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId:getSessionId(),step:q.id,field:q.field,answer:val,answers}) }).catch(()=>{});
    if (editingFromSummary) { editingFromSummary=false; currentIdx=QUESTIONS.length; setTimeout(()=>{const c=document.getElementById('chat-messages');c.innerHTML='';const ia=document.getElementById('chat-input-area');if(ia)ia.style.display='';showSummary();},500); }
  }

  function showContactFormEdit() {
    const c = document.getElementById('chat-messages');
    const form = document.createElement('div');
    form.id = 'contact-form-widget';
    form.style.cssText = 'display:flex;flex-direction:column;gap:8px;max-width:90%;padding:8px 0;';
    ['Your name','Email','WhatsApp / phone'].forEach((label,i) => {
      const inp = document.createElement('input');
      inp.type = i===1?'email':'text'; inp.placeholder = label;
      inp.value = answers[['contact_name','contact_email','contact_phone'][i]] || '';
      inp.dataset.field = ['contact_name','contact_email','contact_phone'][i];
      inp.style.cssText = 'padding:10px 14px;border:1px solid #e9d9d4;border-radius:12px;font-size:14px;font-family:Inter,sans-serif;outline:none;';
      inp.onfocus = () => inp.style.borderColor = '#ec1c8c';
      inp.onblur = () => inp.style.borderColor = '#e9d9d4';
      form.appendChild(inp);
    });
    const btn = document.createElement('button');
    btn.textContent = 'Save changes →';
    btn.className = 'chat-option-btn';
    btn.style.cssText = 'background:#ec1c8c;color:#fff;font-weight:600;border:none;align-self:flex-end;margin-top:4px;padding:10px 20px;';
    btn.onclick = () => {
      const vals = {};
      form.querySelectorAll('input').forEach(f => vals[f.dataset.field] = f.value.trim() || '');
      answers.contact_name=vals.contact_name; answers.contact_email=vals.contact_email; answers.contact_phone=vals.contact_phone;
      addMsg('Name: '+vals.contact_name+'\nEmail: '+vals.contact_email+'\nPhone: '+vals.contact_phone,'user');
      form.remove();
      if (editingFromSummary) { editingFromSummary=false; currentIdx=QUESTIONS.length; setTimeout(()=>{c.innerHTML='';const ia=document.getElementById('chat-input-area');if(ia)ia.style.display='';showSummary();},500); }
    };
    form.appendChild(btn); c.appendChild(form); c.scrollTop = c.scrollHeight;
    setTimeout(() => form.querySelector('input').focus(), 100);
  }

  function goBack() {
    if (history.length === 0) return;
    clearOptions(); editingFromSummary = false;
    const prevIdx = history.pop();
    const currentQ = QUESTIONS[currentIdx];
    if (currentQ) delete answers[currentQ.field];
    currentIdx = prevIdx;
    rebuildChat();
  }

  function rebuildChat() {
    const c = document.getElementById('chat-messages');
    c.innerHTML = '';
    addMsg("Welcome to Elite AI.\n\nI'll ask a few questions about your business and prepare your custom AI receptionist preview.\n\nMost setups take less than 3 minutes.", 'bot');
    for (let i=0;i<currentIdx;i++) {
      const q = QUESTIONS[i];
      if (answers[q.field]) {
        addMsg(q.question, 'bot');
        if (q.type==='contact') addMsg('Name: '+answers.contact_name+'\nEmail: '+answers.contact_email+'\nPhone: '+(answers.contact_phone||'not specified'),'user');
        else if (q.type==='multi_dest') addMsg('Destinations: '+(answers.lead_destination||'')+'\nDetails: '+(answers.lead_destination_detail||''),'user');
        else addMsg(answers[q.field], 'user');
      }
    }
    updateProgress(); updateBackButton();
    setTimeout(() => ask(), 200);
  }

  function resetInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) {
      inp.disabled = true;
      inp.value = '';
      inp.placeholder = '';
      inp.style.height = 'auto';
    }
    if (btn) btn.disabled = true;
  }

  function enableInput(placeholder) {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = false; inp.placeholder = placeholder || 'Type your answer...'; inp.style.height = 'auto'; inp.focus(); }
    if (btn) btn.disabled = false;
  }

  function disableInput() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (inp) { inp.disabled = true; inp.value = ''; inp.placeholder = ''; inp.style.height = 'auto'; }
    if (btn) btn.disabled = true;
  }

  function hideInputArea() {
    const ia = document.getElementById('chat-input-area');
    if (ia) ia.style.display = 'none';
  }

  function showInputArea() {
    const ia = document.getElementById('chat-input-area');
    if (ia) ia.style.display = '';
  }

  function resetState() { currentIdx=0; answers={}; history=[]; sessionId=''; isSubmitting=false; optionsWrap=null; if (selectedPackageBackup) { answers.selected_package = selectedPackageBackup; } }

  function openChat(selectedPackage) {
    const chatWindow = document.getElementById('chat-window');
    const chatFab = document.getElementById('chat-fab');
    resetState(); getSessionId();
    const c = document.getElementById('chat-messages'); c.innerHTML = '';
    const inputArea = document.getElementById('chat-input-area');
    if (inputArea) inputArea.style.display = '';
    
    // Store selected package if provided
    if (selectedPackage) {
      selectedPackageBackup = selectedPackage;
      answers.selected_package = selectedPackage;
      console.log('[DEBUG] Package stored in answers:', answers.selected_package);
      console.log('[DEBUG] Full answers object:', JSON.stringify(answers));
      // Save to backend immediately
      fetch('https://eliteai.space/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({sessionId: getSessionId(), step: 0, field: 'selected_package', answer: selectedPackage, answers: {selected_package: selectedPackage}})
      })
      .then(resp => console.log('[DEBUG] Package save response:', resp.status))
      .catch(e => console.error('[DEBUG] Package save error:', e));
    } else {
      console.log('[DEBUG] No package provided to openChat');
    }
    
    chatWindow.classList.add('open'); chatFab.classList.add('hidden');
    document.body.classList.add('widget-open'); isOpen = true;
    addMsg("Welcome to Elite AI.\n\nI'll ask a few questions about your business and prepare your custom AI receptionist preview.\n\nMost setups take less than 3 minutes.", 'bot');
    setTimeout(ask, 1200);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chat-window').classList.remove('open');
    document.getElementById('chat-fab').classList.remove('hidden');
    document.body.classList.remove('widget-open');
    disableInput();
  }

  function handleSend() {
    const inp = document.getElementById('chat-input');
    const val = inp.value.trim();
    if (!val) return;
    const q = getQuestion();
    if (q && q.field === 'business_links' && !isValidLink(val)) {
      inp.value = '';
      addMsg("Please paste the actual URL so I can review your business. For example: https://yourbusiness.com", 'bot');
      return;
    }
    inp.value = '';
    submit(val);
  }

  function hookCTAs() {
    const ctaSelectors = ['[data-testid="hero-cta-demo"]','[data-testid="nav-cta-demo"]','[data-testid="mobile-cta-demo"]','[data-testid="start-voice-demo"]','[data-testid="plan-voice-cta"]','.who-for-cta'];
    ctaSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const href = el.getAttribute('href');
        if (href && href.includes('calendly')) return;
        if (href === '#demo-card' || el.classList.contains('who-for-cta')) {
          el.addEventListener('click', (e) => { e.preventDefault(); openChat(); });
        }
      });
    });
  }

  function init() {
    const wrapper = document.createElement('div');
    wrapper.id = 'chat-widget-wrapper';
    wrapper.innerHTML =
      '<button id="chat-fab" class="chat-fab">Create My AI Receptionist</button>' +
      '<div id="chat-window" class="chat-window">' +
      '  <div class="chat-header">' +
      '    <button id="chat-header-close" class="chat-header-close" aria-label="Close">×</button>' +
      '    <div class="chat-header-brand">' +
      '      <img src="/android-chrome-192x192.png?v=3" alt="Elite AI" class="chat-header-logo">' +
      '      <h3>Elite AI Setup Assistant</h3>' +
      '    </div>' +
      '    <p class="chat-header-subtitle">Creating your custom AI receptionist</p>' +
      '    <div class="chat-progress"><div id="chat-progress-bar" class="chat-progress-bar"></div></div>' +
      '    <div id="chat-progress-text" class="chat-progress-text"></div>' +
      '  </div>' +
      '  <div id="chat-messages" class="chat-messages"></div>' +
      '  <div id="chat-back-bar" class="chat-back-bar" style="display:none"><button id="chat-back-btn" class="chat-back-btn">← Back to previous question</button></div>' +
      '  <div id="chat-input-area" class="chat-input-area">' +
      '    <textarea id="chat-input" class="chat-input" rows="1" placeholder="Type your answer..."></textarea>' +
      '    <button id="chat-send-btn" class="chat-send-btn" aria-label="Send">↑</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(wrapper);

    const headerBack = document.getElementById('chat-header-back');
    if (headerBack) headerBack.style.display = 'none';

    document.getElementById('chat-fab').addEventListener('click', openChat);
    document.getElementById('chat-header-close').addEventListener('click', closeChat);
    document.getElementById('chat-send-btn').addEventListener('click', handleSend);

    const inp = document.getElementById('chat-input');
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
    inp.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 80) + 'px'; });

    document.getElementById('chat-back-btn').addEventListener('click', goBack);
    hookCTAs();
    document.addEventListener('click', function(e) { const target = e.target.closest('[href="#demo-card"]'); if (target) { e.preventDefault(); openChat(); } });
  }

  window.__chatOpen = openChat;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

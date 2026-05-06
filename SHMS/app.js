/* ========================================
   SHMS — Smart Hospital Management System
   app.js — Complete Application Logic
   ======================================== */

'use strict';

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
const S = {
  patients:     [],
  doctors:      [],
  appointments: [],
  records:      [],
  bills:        [],
  discharges:   []
};

let seqP = 1000, seqD = 200, seqA = 300, seqR = 400, seqB = 500, seqX = 600;
const newPid = () => 'P-' + (++seqP);
const newDid = () => 'D-' + (++seqD);
const newAid = () => 'A-' + (++seqA);
const newRid = () => 'R-' + (++seqR);
const newBid = () => 'B-' + (++seqB);
const newXid = () => 'DC-' + (++seqX);
const stamp  = () => new Date().toLocaleString('en-PK', { hour12: true });
const today  = () => new Date().toISOString().split('T')[0];

/* ──────────────────────────────────────────
   PAGE NAVIGATION
────────────────────────────────────────── */
function goTo(tabName) {
  document.getElementById('page-hero').classList.remove('active');
  document.getElementById('page-app').classList.add('active');
  // activate correct tab
  const tabs = document.querySelectorAll('.atab');
  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.page === tabName);
  });
  const panels = document.querySelectorAll('.tab-panel');
  panels.forEach(p => p.classList.remove('active'));
  const target = document.getElementById('tab-' + tabName);
  if (target) target.classList.add('active');
  refreshDropdowns();
  refreshKPIs();
  window.scrollTo(0, 0);
}

function goToHero() {
  document.getElementById('page-app').classList.remove('active');
  document.getElementById('page-hero').classList.add('active');
  refreshKPIs();
  window.scrollTo(0, 0);
}

function switchTab(tabName, btn) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabName);
  if (panel) panel.classList.add('active');
  refreshDropdowns();
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* ──────────────────────────────────────────
   NOTIFICATIONS
────────────────────────────────────────── */
function notify(message, type = 'info', title = 'SHMS') {
  const colors = { info: '#1A9E8F', success: '#3A9E6A', danger: '#C84B4B', warning: '#C9944A' };
  const icons  = { info: 'ℹ', success: '✓', danger: '!', warning: '⚠' };
  const bar = document.getElementById('notifBar');
  const el = document.createElement('div');
  el.className = 'notif';
  el.innerHTML = `
    <div class="notif-icon" style="background:${colors[type]}22;color:${colors[type]}">${icons[type]}</div>
    <div class="notif-body">
      <div class="notif-title">${title}</div>
      <div class="notif-msg">${message}</div>
    </div>
    <button class="notif-close" onclick="this.closest('.notif').remove()">✕</button>
  `;
  bar.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; }, 4000);
  setTimeout(() => { el.remove(); }, 4500);
}

/* ──────────────────────────────────────────
   MODAL
────────────────────────────────────────── */
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */
function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
}
function avatarClass(seed) {
  const classes = ['av-1', 'av-2', 'av-3', 'av-4', 'av-5'];
  return classes[seed.charCodeAt(0) % classes.length];
}
function addActivity(title, body) {
  const feed = document.getElementById('timeline');
  const el = document.createElement('div');
  el.className = 'tl-item';
  el.innerHTML = `
    <div class="tl-dot"></div>
    <div class="tl-info">
      <div class="tl-time">${stamp()}</div>
      <div class="tl-title">${title}</div>
      <div class="tl-body">${body}</div>
    </div>`;
  feed.insertBefore(el, feed.firstChild);
}
function clearForm(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

/* ──────────────────────────────────────────
   DROPDOWNS & KPI REFRESH
────────────────────────────────────────── */
function refreshDropdowns() {
  const activePats = S.patients.filter(p => p.status !== 'Discharged');
  const pOpts = '<option value="">— Select Patient —</option>' +
    activePats.map(p => `<option value="${p.id}">${p.id}: ${p.name}</option>`).join('');
  const dOpts = '<option value="">— Select Doctor —</option>' +
    S.doctors.map(d => `<option value="${d.id}">${d.id}: Dr. ${d.name} (${d.spec})</option>`).join('');
  const escPOpts = '<option value="">— Select —</option>' +
    activePats.map(p => `<option value="${p.id}">${p.id}: ${p.name}</option>`).join('');

  ['a_patient', 'r_patient', 'b_patient', 'dis_patient'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = pOpts;
    el.value = cur;
  });
  document.getElementById('esc_patient').innerHTML = escPOpts;
  ['a_doctor', 'r_doctor', 'dis_doctor'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = dOpts;
    el.value = cur;
  });
}

function refreshKPIs() {
  const active  = S.patients.filter(p => p.status === 'Active').length;
  const em      = S.patients.filter(p => p.type === 'Emergency' && p.status === 'Active').length;
  const norm    = S.patients.filter(p => p.type === 'Normal'    && p.status === 'Active').length;
  const dis     = S.discharges.length;
  const pendB   = S.bills.filter(b => b.status === 'Pending').length;
  const avDoc   = S.doctors.filter(d => d.avail === 'Available').length;
  const todayA  = S.appointments.filter(a => a.date === today()).length;

  setText('k1', active);
  setText('k2', em);
  setText('k3', dis);
  setText('k4', pendB);
  setText('k5', avDoc);
  setText('k6', todayA);
  setText('hs1', S.patients.length);
  setText('hs2', S.doctors.length);
  setText('hs3', S.appointments.length);
  setText('hs4', em);
  setText('patCount', S.patients.length);
  setText('docCount', S.doctors.length);
  setText('apptCount', S.appointments.length);
  setText('recCount', S.records.length);
  setText('billCount', S.bills.length);
  setText('disCount', S.discharges.length);
  setText('emCount', em);
  setText('normCount', norm);

  renderEmQueue();
  renderDashEmQueue();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ──────────────────────────────────────────
   PATIENTS
────────────────────────────────────────── */
function registerPatient() {
  const name = document.getElementById('p_name').value.trim();
  const age  = document.getElementById('p_age').value;
  if (!name || !age) {
    notify('Name and Age are required.', 'danger', 'Validation Error');
    return;
  }
  const p = {
    id:        newPid(),
    name,
    age:       +age,
    gender:    document.getElementById('p_gender').value,
    blood:     document.getElementById('p_blood').value,
    phone:     document.getElementById('p_phone').value || 'N/A',
    type:      document.getElementById('p_type').value,
    complaint: document.getElementById('p_complaint').value || 'Not specified',
    address:   document.getElementById('p_address').value || 'N/A',
    notes:     document.getElementById('p_notes').value || '',
    status:    'Active',
    regDate:   stamp()
  };
  S.patients.push(p);
  renderPatients();
  clearForm(['p_name', 'p_age', 'p_phone', 'p_complaint', 'p_address', 'p_notes']);
  refreshDropdowns();
  refreshKPIs();
  if (p.type === 'Emergency') {
    notify(`Emergency case registered: ${p.name} (${p.id})`, 'danger', '🚨 Emergency Alert');
  } else {
    notify(`${p.name} registered successfully (${p.id})`, 'success', 'Patient Registered');
  }
  addActivity('Patient Registered', `${p.name} — ${p.id} — ${p.type} case`);
}

function renderPatients() {
  const c = document.getElementById('patientCards');
  if (!S.patients.length) {
    c.innerHTML = `<div class="empty-state"><span class="empty-icon">👤</span><p>No patients registered yet. Use the form above.</p></div>`;
    return;
  }
  c.innerHTML = S.patients.map(p => `
    <div class="p-card">
      <div class="card-top">
        <div>
          <div class="card-id">${p.id}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-role">${p.complaint}</div>
        </div>
        <div class="card-avatar ${avatarClass(p.name)}">${initials(p.name)}</div>
      </div>
      <div class="card-divider"></div>
      <div class="irow"><span class="ikey">Age / Gender</span><span class="ival">${p.age} / ${p.gender}</span></div>
      <div class="irow"><span class="ikey">Blood Group</span><span class="ival txt-red">${p.blood}</span></div>
      <div class="irow"><span class="ikey">Phone</span><span class="ival">${p.phone}</span></div>
      <div class="irow"><span class="ikey">Status</span><span class="ival"><span class="badge ${p.status === 'Active' ? 'b-act' : 'b-dis'}">${p.status}</span></span></div>
      <div class="irow"><span class="ikey">Case Type</span><span class="ival"><span class="badge ${p.type === 'Emergency' ? 'b-em' : 'b-norm'}">${p.type}</span></span></div>
      <div class="irow"><span class="ikey">Registered</span><span class="ival txt-muted" style="font-size:.72rem">${p.regDate}</span></div>
      <div class="card-btns">
        <button class="btn-sm" onclick="viewPatient('${p.id}')">View</button>
        <button class="btn-sm" onclick="toggleType('${p.id}')">Toggle Priority</button>
        <button class="btn-sm red" onclick="removePatient('${p.id}')">Remove</button>
      </div>
    </div>`).join('');
}

function viewPatient(id) {
  const p = S.patients.find(x => x.id === id);
  if (!p) return;
  const recs = S.records.filter(r => r.patId === id);
  openModal(`Patient: ${p.name}`, `
    <div class="irow"><span class="ikey">ID</span><span class="ival fw6">${p.id}</span></div>
    <div class="irow"><span class="ikey">Age / Gender</span><span class="ival">${p.age} / ${p.gender}</span></div>
    <div class="irow"><span class="ikey">Blood Group</span><span class="ival txt-red fw6">${p.blood}</span></div>
    <div class="irow"><span class="ikey">Phone</span><span class="ival">${p.phone}</span></div>
    <div class="irow"><span class="ikey">Address</span><span class="ival">${p.address}</span></div>
    <div class="irow"><span class="ikey">Complaint</span><span class="ival">${p.complaint}</span></div>
    <div class="irow"><span class="ikey">Case Type</span><span class="ival"><span class="badge ${p.type === 'Emergency' ? 'b-em' : 'b-norm'}">${p.type}</span></span></div>
    <div class="irow"><span class="ikey">Status</span><span class="ival"><span class="badge ${p.status === 'Active' ? 'b-act' : 'b-dis'}">${p.status}</span></span></div>
    ${p.notes ? `<div class="irow"><span class="ikey">Notes</span><span class="ival txt-muted">${p.notes}</span></div>` : ''}
    <div style="height:1px;background:rgba(255,255,255,0.07);margin:14px 0;"></div>
    <div class="section-label mb16">Medical Records (${recs.length})</div>
    ${recs.length ? recs.map(r => `
      <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:12px;margin-bottom:8px;">
        <div style="font-weight:600;font-size:.88rem;margin-bottom:3px;">${r.diag || 'No diagnosis'}</div>
        <div style="font-size:.78rem;color:var(--text-muted);">${r.presc || ''}</div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">${r.date}</div>
      </div>`).join('') : '<p class="txt-muted" style="font-size:.82rem;">No records yet.</p>'}`
  );
}

function toggleType(id) {
  const p = S.patients.find(x => x.id === id);
  if (!p) return;
  p.type = p.type === 'Emergency' ? 'Normal' : 'Emergency';
  renderPatients();
  refreshKPIs();
  notify(`${p.name} priority changed to ${p.type}`, 'warning', 'Priority Updated');
  addActivity('Priority Changed', `${p.name} → ${p.type}`);
}

function removePatient(id) {
  const p = S.patients.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Remove patient ${p.name} (${p.id})?`)) return;
  S.patients = S.patients.filter(x => x.id !== id);
  renderPatients();
  refreshDropdowns();
  refreshKPIs();
  notify(`Patient ${p.name} removed.`, 'warning', 'Patient Removed');
}

/* ──────────────────────────────────────────
   DOCTORS
────────────────────────────────────────── */
function addDoctor() {
  const name = document.getElementById('d_name').value.trim();
  if (!name) { notify('Doctor name is required.', 'danger'); return; }
  const d = {
    id:      newDid(),
    name,
    spec:    document.getElementById('d_spec').value,
    qual:    document.getElementById('d_qual').value || 'MBBS',
    phone:   document.getElementById('d_phone').value || 'N/A',
    avail:   document.getElementById('d_avail').value,
    shift:   document.getElementById('d_shift').value,
    added:   stamp()
  };
  S.doctors.push(d);
  renderDoctors();
  clearForm(['d_name', 'd_qual', 'd_phone']);
  refreshDropdowns();
  refreshKPIs();
  notify(`Dr. ${d.name} added (${d.id})`, 'success', 'Doctor Added');
  addActivity('Doctor Added', `Dr. ${d.name} — ${d.spec}`);
}

function renderDoctors() {
  const c = document.getElementById('doctorCards');
  if (!S.doctors.length) {
    c.innerHTML = `<div class="empty-state"><span class="empty-icon">🩺</span><p>No doctors added yet.</p></div>`;
    return;
  }
  c.innerHTML = S.doctors.map(d => `
    <div class="d-card">
      <div class="card-top">
        <div>
          <div class="card-id">${d.id}</div>
          <div class="card-name">Dr. ${d.name}</div>
          <div class="card-role">${d.spec}</div>
        </div>
        <div class="card-avatar ${avatarClass(d.spec)}">${initials(d.name)}</div>
      </div>
      <div class="card-divider"></div>
      <div class="irow"><span class="ikey">Qualification</span><span class="ival">${d.qual}</span></div>
      <div class="irow"><span class="ikey">Phone</span><span class="ival">${d.phone}</span></div>
      <div class="irow"><span class="ikey">Shift</span><span class="ival">${d.shift}</span></div>
      <div class="irow"><span class="ikey">Status</span><span class="ival">
        <span class="badge ${d.avail === 'Available' ? 'b-act' : d.avail === 'In Surgery' ? 'b-em' : 'b-pend'}">${d.avail}</span>
      </span></div>
      <div class="card-btns">
        <button class="btn-sm green" onclick="setDocStatus('${d.id}','Available')">Available</button>
        <button class="btn-sm" onclick="setDocStatus('${d.id}','In Surgery')">In Surgery</button>
        <button class="btn-sm red" onclick="removeDoc('${d.id}')">Remove</button>
      </div>
    </div>`).join('');
}

function setDocStatus(id, status) {
  const d = S.doctors.find(x => x.id === id);
  if (!d) return;
  d.avail = status;
  renderDoctors();
  refreshKPIs();
  notify(`Dr. ${d.name}: ${status}`, 'info');
}

function removeDoc(id) {
  const d = S.doctors.find(x => x.id === id);
  if (!d || !confirm(`Remove Dr. ${d.name}?`)) return;
  S.doctors = S.doctors.filter(x => x.id !== id);
  renderDoctors();
  refreshDropdowns();
  refreshKPIs();
}

/* ──────────────────────────────────────────
   APPOINTMENTS
────────────────────────────────────────── */
function scheduleAppointment() {
  const patId  = document.getElementById('a_patient').value;
  const docId  = document.getElementById('a_doctor').value;
  const date   = document.getElementById('a_date').value;
  const time   = document.getElementById('a_time').value;
  if (!patId || !docId || !date || !time) {
    notify('Please fill all required fields.', 'danger', 'Validation Error');
    return;
  }
  const conflict = S.appointments.find(a =>
    a.docId === docId && a.date === date && a.time === time && a.status !== 'Cancelled'
  );
  if (conflict) {
    notify('Time slot conflict! This doctor already has an appointment at that time.', 'danger', 'Conflict Detected');
    return;
  }
  const p = S.patients.find(x => x.id === patId);
  const d = S.doctors.find(x => x.id === docId);
  const a = {
    id:      newAid(),
    patId, patName: p.name,
    docId, docName: d.name,
    date, time,
    reason:   document.getElementById('a_reason').value || 'General Consultation',
    priority: document.getElementById('a_priority').value,
    status:   'Scheduled'
  };
  S.appointments.push(a);
  renderAppointments();
  refreshKPIs();
  notify(`Appointment scheduled: ${p.name} with Dr. ${d.name}`, 'success', 'Appointment Set');
  addActivity('Appointment Scheduled', `${p.name} → Dr. ${d.name} on ${date} at ${time}`);
  clearForm(['a_patient', 'a_doctor', 'a_date', 'a_time', 'a_reason']);
}

function renderAppointments() {
  const tb = document.getElementById('apptTable');
  if (!S.appointments.length) {
    tb.innerHTML = '<tr><td colspan="8" class="empty-td">No appointments scheduled yet.</td></tr>';
    return;
  }
  tb.innerHTML = S.appointments.map(a => `
    <tr>
      <td class="txt-muted" style="font-size:.72rem">${a.id}</td>
      <td><strong>${a.patName}</strong></td>
      <td>${a.docName}</td>
      <td>${a.date} ${a.time}</td>
      <td>${a.reason}</td>
      <td><span class="badge ${a.priority === 'Emergency' ? 'b-em' : a.priority === 'Urgent' ? 'b-pend' : 'b-norm'}">${a.priority}</span></td>
      <td><span class="badge ${a.status === 'Scheduled' ? 'b-act' : a.status === 'Completed' ? 'b-norm' : 'b-dis'}">${a.status}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn-sm green" onclick="setApptStatus('${a.id}','Completed')">Done</button>
        <button class="btn-sm red"   onclick="setApptStatus('${a.id}','Cancelled')">Cancel</button>
      </td>
    </tr>`).join('');
}

function setApptStatus(id, status) {
  const a = S.appointments.find(x => x.id === id);
  if (!a) return;
  a.status = status;
  renderAppointments();
  refreshKPIs();
  notify(`Appointment ${a.id} → ${status}`, 'info');
}

/* ──────────────────────────────────────────
   EMERGENCY QUEUE
────────────────────────────────────────── */
function renderEmQueue() {
  const el = document.getElementById('emQueue');
  if (!el) return;
  const active = S.patients
    .filter(p => p.status === 'Active')
    .sort((a, b) => (a.type === 'Emergency' ? -1 : 1));
  if (!active.length) {
    el.innerHTML = `<div class="empty-state"><span class="empty-icon">🏥</span><p>No active patients. Register patients to populate the queue.</p></div>`;
    return;
  }
  el.innerHTML = active.map((p, i) => `
    <div class="qi ${p.type === 'Emergency' ? 'em-case' : 'norm-case'}" onclick="viewPatient('${p.id}')">
      <div class="qnum ${p.type === 'Emergency' ? 'qnum-em' : 'qnum-norm'}">${i + 1}</div>
      <div class="qi-info">
        <div class="qi-name">${p.name} <span class="txt-muted" style="font-size:.72rem;font-weight:400">${p.id}</span></div>
        <div class="qi-detail">${p.complaint} · Age ${p.age} · ${p.blood}</div>
      </div>
      <span class="badge ${p.type === 'Emergency' ? 'b-em' : 'b-norm'}">${p.type}</span>
      ${p.type === 'Emergency' ? '<div class="qi-flash"></div>' : ''}
    </div>`).join('');
}

function renderDashEmQueue() {
  const list  = document.getElementById('dashEmList');
  const empty = document.getElementById('dashEmEmpty');
  if (!list || !empty) return;
  const em = S.patients.filter(p => p.status === 'Active' && p.type === 'Emergency');
  if (!em.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = em.slice(0, 5).map((p, i) => `
    <div class="qi em-case" onclick="viewPatient('${p.id}')">
      <div class="qnum qnum-em">${i + 1}</div>
      <div class="qi-info">
        <div class="qi-name">${p.name}</div>
        <div class="qi-detail">${p.complaint}</div>
      </div>
      <div class="qi-flash"></div>
    </div>`).join('');
}

function escalatePriority() {
  const patId  = document.getElementById('esc_patient').value;
  const type   = document.getElementById('esc_type').value;
  const reason = document.getElementById('esc_reason').value;
  if (!patId) { notify('Select a patient.', 'danger'); return; }
  const p = S.patients.find(x => x.id === patId);
  if (!p) return;
  p.type = type;
  renderPatients();
  renderEmQueue();
  renderDashEmQueue();
  refreshKPIs();
  notify(`${p.name} priority updated to ${type}${reason ? ' — ' + reason : ''}`, 'warning', 'Priority Escalated');
  addActivity('Priority Escalated', `${p.name} → ${type}${reason ? ' (' + reason + ')' : ''}`);
  clearForm(['esc_patient', 'esc_reason']);
}

/* ──────────────────────────────────────────
   MEDICAL RECORDS
────────────────────────────────────────── */
function addRecord() {
  const patId = document.getElementById('r_patient').value;
  const docId = document.getElementById('r_doctor').value;
  if (!patId || !docId) { notify('Select both patient and doctor.', 'danger'); return; }
  const p = S.patients.find(x => x.id === patId);
  const d = S.doctors.find(x => x.id === docId);
  const r = {
    id:      newRid(),
    patId, patName: p.name,
    docId, docName: d.name,
    diag:  document.getElementById('r_diag').value  || 'Pending',
    presc: document.getElementById('r_presc').value || 'None',
    lab:   document.getElementById('r_lab').value   || 'None',
    visit: document.getElementById('r_visit').value,
    notes: document.getElementById('r_notes').value || '',
    date:  stamp()
  };
  S.records.push(r);
  renderRecords();
  refreshKPIs();
  notify(`Record saved for ${p.name}`, 'success', 'Record Saved');
  addActivity('Record Added', `${p.name}: ${r.diag}`);
  clearForm(['r_patient', 'r_doctor', 'r_diag', 'r_presc', 'r_lab', 'r_notes']);
}

function renderRecords() {
  const c = document.getElementById('recordsList');
  if (!S.records.length) {
    c.innerHTML = `<div class="empty-state"><span class="empty-icon">📋</span><p>No records yet.</p></div>`;
    return;
  }
  c.innerHTML = S.records.map(r => `
    <div class="r-card">
      <div class="card-top">
        <div><div class="card-id">${r.id}</div></div>
        <span class="badge b-act">${r.visit}</span>
      </div>
      <div class="card-name">${r.patName}</div>
      <div class="card-role">Dr. ${r.docName}</div>
      <div class="card-divider"></div>
      <div class="irow"><span class="ikey">Diagnosis</span><span class="ival">${r.diag}</span></div>
      <div class="irow"><span class="ikey">Prescription</span><span class="ival">${r.presc}</span></div>
      <div class="irow"><span class="ikey">Lab Tests</span><span class="ival">${r.lab}</span></div>
      ${r.notes ? `<div class="irow"><span class="ikey">Notes</span><span class="ival txt-muted" style="font-size:.78rem">${r.notes}</span></div>` : ''}
      <div class="irow"><span class="ikey">Date</span><span class="ival txt-muted" style="font-size:.72rem">${r.date}</span></div>
    </div>`).join('');
}

/* ──────────────────────────────────────────
   BILLING
────────────────────────────────────────── */
function updateBillPreview() {
  const c = +document.getElementById('b_consult').value || 0;
  const m = +document.getElementById('b_meds').value    || 0;
  const l = +document.getElementById('b_lab').value     || 0;
  const r = +document.getElementById('b_room').value    || 0;
  const d = +document.getElementById('b_disc').value    || 0;
  const total = (c + m + l + r) * (1 - d / 100);
  document.getElementById('billPreview').textContent = 'PKR ' + total.toLocaleString('en-PK');
}
['b_consult','b_meds','b_lab','b_room','b_disc'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateBillPreview);
});

function generateBill() {
  const patId = document.getElementById('b_patient').value;
  if (!patId) { notify('Select a patient.', 'danger'); return; }
  const p = S.patients.find(x => x.id === patId);
  const c = +document.getElementById('b_consult').value || 0;
  const m = +document.getElementById('b_meds').value    || 0;
  const l = +document.getElementById('b_lab').value     || 0;
  const r = +document.getElementById('b_room').value    || 0;
  const d = +document.getElementById('b_disc').value    || 0;
  const sub   = c + m + l + r;
  const total = sub * (1 - d / 100);
  const b = {
    id:      newBid(),
    patId, patName: p.name,
    method:  document.getElementById('b_method').value,
    insurer: document.getElementById('b_insurer').value || 'N/A',
    consult: c, meds: m, lab: l, room: r,
    discount: d, subtotal: sub, total,
    status: 'Pending',
    date:   stamp()
  };
  S.bills.push(b);
  renderBills();
  refreshKPIs();
  notify(`Bill ${b.id} generated for ${p.name} — PKR ${total.toLocaleString()}`, 'success', 'Bill Generated');
  addActivity('Bill Generated', `${p.name} — PKR ${total.toLocaleString('en-PK')} (${b.method})`);
}

function renderBills() {
  const tb = document.getElementById('billTable');
  if (!S.bills.length) {
    tb.innerHTML = '<tr><td colspan="8" class="empty-td">No bills generated yet.</td></tr>';
    return;
  }
  const mBadge = { 'Insurance': 'b-ins', 'Out-of-Pocket': 'b-cash', 'Government Subsidized': 'b-govt' };
  tb.innerHTML = S.bills.map(b => `
    <tr>
      <td class="txt-muted" style="font-size:.72rem">${b.id}</td>
      <td><strong>${b.patName}</strong></td>
      <td><span class="badge ${mBadge[b.method] || 'b-act'}">${b.method}</span></td>
      <td>PKR ${b.subtotal.toLocaleString()}</td>
      <td>${b.discount}%</td>
      <td class="fw6 txt-teal">PKR ${b.total.toLocaleString()}</td>
      <td><span class="badge ${b.status === 'Paid' ? 'b-norm' : 'b-pend'}">${b.status}</span></td>
      <td style="display:flex;gap:6px;">
        <button class="btn-sm green" onclick="markPaid('${b.id}')">Mark Paid</button>
        <button class="btn-sm" onclick="viewBill('${b.id}')">Details</button>
      </td>
    </tr>`).join('');
}

function markPaid(id) {
  const b = S.bills.find(x => x.id === id);
  if (!b) return;
  b.status = 'Paid';
  renderBills();
  refreshKPIs();
  notify(`Bill ${id} marked as Paid.`, 'success');
}

function viewBill(id) {
  const b = S.bills.find(x => x.id === id);
  if (!b) return;
  openModal(`Bill: ${b.id}`, `
    <div class="irow"><span class="ikey">Patient</span><span class="ival fw6">${b.patName}</span></div>
    <div class="irow"><span class="ikey">Method</span><span class="ival">${b.method}</span></div>
    ${b.method === 'Insurance' ? `<div class="irow"><span class="ikey">Insurer</span><span class="ival">${b.insurer}</span></div>` : ''}
    <div style="height:1px;background:rgba(255,255,255,0.07);margin:12px 0;"></div>
    <div class="irow"><span class="ikey">Consultation</span><span class="ival">PKR ${b.consult.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Medications</span><span class="ival">PKR ${b.meds.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Lab / Tests</span><span class="ival">PKR ${b.lab.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Room</span><span class="ival">PKR ${b.room.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Subtotal</span><span class="ival">PKR ${b.subtotal.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Discount</span><span class="ival txt-gold">${b.discount}%</span></div>
    <div style="height:1px;background:rgba(255,255,255,0.07);margin:12px 0;"></div>
    <div class="irow"><span class="ikey fw6">Total</span><span class="ival txt-teal fw6" style="font-size:1.3rem">PKR ${b.total.toLocaleString()}</span></div>
    <div class="irow"><span class="ikey">Status</span><span class="ival"><span class="badge ${b.status === 'Paid' ? 'b-norm' : 'b-pend'}">${b.status}</span></span></div>
    <div class="irow"><span class="ikey">Date</span><span class="ival txt-muted" style="font-size:.72rem">${b.date}</span></div>
  `);
}

/* ──────────────────────────────────────────
   DISCHARGE
────────────────────────────────────────── */
function dischargePatient() {
  const patId = document.getElementById('dis_patient').value;
  const date  = document.getElementById('dis_date').value;
  if (!patId || !date) {
    notify('Select a patient and discharge date.', 'danger');
    return;
  }
  const p   = S.patients.find(x => x.id === patId);
  const dId = document.getElementById('dis_doctor').value;
  const doc = dId ? S.doctors.find(x => x.id === dId) : null;
  const dx  = {
    id:      newXid(),
    patId, patName: p.name,
    docId:   dId || 'N/A',
    docName: doc ? doc.name : 'N/A',
    date,
    followUp:  document.getElementById('dis_follow').value  || 'N/A',
    condition: document.getElementById('dis_cond').value,
    type:      document.getElementById('dis_type').value,
    summary:   document.getElementById('dis_summary').value || 'No summary provided.',
    meds:      document.getElementById('dis_meds').value    || 'None',
    createdAt: stamp()
  };
  S.discharges.push(dx);
  p.status = 'Discharged';
  renderPatients();
  renderDischarges();
  refreshDropdowns();
  refreshKPIs();
  notify(`${p.name} successfully discharged (${dx.id})`, 'success', 'Patient Discharged');
  addActivity('Patient Discharged', `${p.name} — ${dx.condition}`);
  clearDischargeForm();
}

function clearDischargeForm() {
  clearForm(['dis_patient', 'dis_doctor', 'dis_date', 'dis_follow', 'dis_summary', 'dis_meds']);
}

function renderDischarges() {
  const tb = document.getElementById('disTable');
  if (!S.discharges.length) {
    tb.innerHTML = '<tr><td colspan="7" class="empty-td">No discharges recorded yet.</td></tr>';
    return;
  }
  const cBadge = {
    'Recovered':            'b-norm',
    'Stable':               'b-act',
    'Referred':             'b-ins',
    'Against Medical Advice': 'b-pend',
    'Deceased':             'b-em'
  };
  tb.innerHTML = S.discharges.map(d => `
    <tr>
      <td class="txt-muted" style="font-size:.72rem">${d.id}</td>
      <td><strong>${d.patName}</strong></td>
      <td>${d.docName}</td>
      <td>${d.date}</td>
      <td><span class="badge ${cBadge[d.condition] || 'b-act'}">${d.condition}</span></td>
      <td>${d.type}</td>
      <td><button class="btn-sm" onclick="viewDischarge('${d.id}')">Report</button></td>
    </tr>`).join('');
}

function viewDischarge(id) {
  const d = S.discharges.find(x => x.id === id);
  if (!d) return;
  openModal(`Discharge Report: ${d.id}`, `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:2rem;margin-bottom:6px;">🏠</div>
      <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:400;">Discharge Summary Report</div>
      <div class="txt-muted" style="font-size:.72rem;margin-top:4px;">${d.createdAt}</div>
    </div>
    <div style="height:1px;background:rgba(255,255,255,0.07);margin:14px 0;"></div>
    <div class="irow"><span class="ikey">Patient</span><span class="ival fw6">${d.patName}</span></div>
    <div class="irow"><span class="ikey">Attending Doctor</span><span class="ival">${d.docName}</span></div>
    <div class="irow"><span class="ikey">Discharge Date</span><span class="ival">${d.date}</span></div>
    <div class="irow"><span class="ikey">Condition</span><span class="ival">${d.condition}</span></div>
    <div class="irow"><span class="ikey">Type</span><span class="ival">${d.type}</span></div>
    <div class="irow"><span class="ikey">Follow-up</span><span class="ival txt-teal">${d.followUp}</span></div>
    <div style="height:1px;background:rgba(255,255,255,0.07);margin:14px 0;"></div>
    <div class="section-label mb16">Discharge Summary</div>
    <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:14px;font-size:.85rem;line-height:1.65;color:var(--text);">${d.summary}</div>
    <div class="irow mt16"><span class="ikey">Medications</span><span class="ival txt-muted" style="font-size:.82rem">${d.meds}</span></div>
    <div style="text-align:center;margin-top:20px;">
      <button class="btn-primary" onclick="window.print()">🖨️ Print Report</button>
    </div>
  `);
}

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dis_date').value = today();
  document.getElementById('a_date').value   = today();
  refreshKPIs();
  setTimeout(() => {
    notify('Welcome to SHMS. Start by registering patients and doctors.', 'info', '👋 System Ready');
  }, 800);
});

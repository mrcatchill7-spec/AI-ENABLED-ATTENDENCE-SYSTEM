const STORAGE_KEY = 'attendly-demo-v1';
const today = new Date();
const dateInput = document.querySelector('#attendance-date');
const rosterElement = document.querySelector('#roster');
const statusMessage = document.querySelector('#status-message');
const nameInput = document.querySelector('#student-name');
const video = document.querySelector('#camera-video');
const cameraPlaceholder = document.querySelector('#camera-placeholder');
const cameraMessage = document.querySelector('#camera-message');
let cameraStream = null;

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

dateInput.value = localDateString(today);

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored.students) && stored.attendance && typeof stored.attendance === 'object') {
      return stored;
    }
  } catch (error) {
    console.warn('Could not read saved demo data.', error);
  }
  return { students: [], attendance: {} };
}

let data = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    statusMessage.textContent = 'Could not save in this browser. Check storage settings or use a different browser.';
    return false;
  }
}

function getAttendanceForDate() {
  return data.attendance[dateInput.value] || {};
}

function render() {
  const attendance = getAttendanceForDate();
  const present = data.students.filter((student) => attendance[student.id] === 'present').length;
  document.querySelector('#total-count').textContent = data.students.length;
  document.querySelector('#present-count').textContent = present;
  document.querySelector('#attendance-rate').textContent = data.students.length
    ? `${Math.round((present / data.students.length) * 100)}%`
    : '0%';

  rosterElement.replaceChildren();
  if (data.students.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<span aria-hidden="true">✦</span><strong>Your class list is empty</strong><p>Add a student above to get started. Use fictional names for testing.</p>';
    rosterElement.append(empty);
    return;
  }

  data.students.forEach((student) => {
    const isPresent = attendance[student.id] === 'present';
    const row = document.createElement('article');
    row.className = 'student-row';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = student.name.trim().charAt(0).toUpperCase() || '?';
    const info = document.createElement('div');
    info.className = 'student-info';
    const name = document.createElement('strong');
    name.textContent = student.name;
    const state = document.createElement('span');
    state.className = `attendance-state ${isPresent ? 'is-present' : ''}`;
    state.textContent = isPresent ? 'Present' : 'Not marked';
    info.append(name, state);

    const markButton = document.createElement('button');
    markButton.type = 'button';
    markButton.className = `mark-button ${isPresent ? 'marked' : ''}`;
    markButton.textContent = isPresent ? 'Undo' : 'Mark present';
    markButton.setAttribute('aria-label', `${isPresent ? 'Undo attendance for' : 'Mark present'} ${student.name}`);
    markButton.addEventListener('click', () => toggleAttendance(student.id));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${student.name}`);
    removeButton.addEventListener('click', () => removeStudent(student.id));
    row.append(avatar, info, markButton, removeButton);
    rosterElement.append(row);
  });
}

function toggleAttendance(studentId) {
  const date = dateInput.value;
  if (!data.attendance[date]) data.attendance[date] = {};
  if (data.attendance[date][studentId] === 'present') {
    delete data.attendance[date][studentId];
  } else {
    data.attendance[date][studentId] = 'present';
  }
  saveData();
  render();
}

function removeStudent(studentId) {
  const student = data.students.find((item) => item.id === studentId);
  if (!student || !window.confirm(`Remove ${student.name} and their demo attendance records?`)) return;
  data.students = data.students.filter((item) => item.id !== studentId);
  Object.values(data.attendance).forEach((day) => delete day[studentId]);
  saveData();
  statusMessage.textContent = `${student.name} was removed from this browser's demo data.`;
  render();
}

document.querySelector('#add-student-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  if (data.students.some((student) => student.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    statusMessage.textContent = 'That name is already in the class list.';
    return;
  }
  data.students.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, name });
  saveData();
  nameInput.value = '';
  statusMessage.textContent = `${name} was added.`;
  render();
  nameInput.focus();
});

dateInput.addEventListener('change', render);

document.querySelector('#export-button').addEventListener('click', () => {
  if (!data.students.length) {
    statusMessage.textContent = 'Add students before exporting attendance.';
    return;
  }
  const attendance = getAttendanceForDate();
  const rows = [['Date', 'Student', 'Status'], ...data.students.map((student) => [dateInput.value, student.name, attendance[student.id] === 'present' ? 'Present' : 'Not marked'])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${dateInput.value}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  statusMessage.textContent = 'Attendance CSV downloaded.';
});

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraMessage.textContent = 'Camera preview is unavailable. Use a supported browser on HTTPS or localhost.';
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = cameraStream;
    video.hidden = false;
    cameraPlaceholder.hidden = true;
    document.querySelector('#camera-start').disabled = true;
    document.querySelector('#camera-stop').disabled = false;
    cameraMessage.textContent = 'Preview active in this browser only. No recording or recognition is performed.';
  } catch (error) {
    cameraMessage.textContent = error.name === 'NotAllowedError'
      ? 'Camera permission was denied. You can still use the attendance register.'
      : 'Could not start camera. Check that a camera is connected and available.';
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  video.srcObject = null;
  video.hidden = true;
  cameraPlaceholder.hidden = false;
  document.querySelector('#camera-start').disabled = false;
  document.querySelector('#camera-stop').disabled = true;
  cameraMessage.textContent = 'Camera is off.';
}

document.querySelector('#camera-start').addEventListener('click', startCamera);
document.querySelector('#camera-stop').addEventListener('click', stopCamera);
window.addEventListener('pagehide', stopCamera);

render();

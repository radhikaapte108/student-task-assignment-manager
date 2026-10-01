const assignmentForm = document.querySelector('#assignment-form');
const assignmentList = document.querySelector('#assignment-list');
const formHeading = document.querySelector('#form-heading');
const submitButton = document.querySelector('#submit-button');
const cancelEditButton = document.querySelector('#cancel-edit');
const formMessage = document.querySelector('#form-message');
const listMessage = document.querySelector('#list-message');
const statusFilter = document.querySelector('#status-filter');
const assignmentCount = document.querySelector('#assignment-count');

let editingId = null;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong.');
  }
  return data;
}

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function formatDeadline(value) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function makeBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function createAssignmentCard(assignment) {
  const card = document.createElement('article');
  card.className = 'assignment-card';

  const top = document.createElement('div');
  top.className = 'card-top';
  const titleBlock = document.createElement('div');
  addTextElement(titleBlock, 'p', 'subject-name', assignment.subject);
  addTextElement(titleBlock, 'h3', 'assignment-title', assignment.title);
  top.append(titleBlock);

  const badges = document.createElement('div');
  badges.className = 'badge-row';
  const statusClass = `status-${assignment.status.toLowerCase().replaceAll(' ', '-')}`;
  const priorityClass = `priority-${assignment.priority.toLowerCase()}`;
  badges.append(makeBadge(assignment.status, statusClass), makeBadge(`${assignment.priority} priority`, priorityClass));
  top.append(badges);
  card.append(top);

  addTextElement(card, 'p', 'assignment-description', assignment.description);

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  addTextElement(bottom, 'span', 'deadline', `Due ${formatDeadline(assignment.deadline)}`);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'text-button';
  toggleButton.dataset.action = 'toggle';
  toggleButton.dataset.id = assignment._id;
  toggleButton.textContent = assignment.status === 'Completed' ? 'Mark pending' : 'Mark complete';
  actions.append(toggleButton);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'text-button';
  editButton.dataset.action = 'edit';
  editButton.dataset.id = assignment._id;
  editButton.textContent = 'Edit';
  actions.append(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'text-button delete-button';
  deleteButton.dataset.action = 'delete';
  deleteButton.dataset.id = assignment._id;
  deleteButton.textContent = 'Delete';
  actions.append(deleteButton);

  bottom.append(actions);
  card.append(bottom);
  return card;
}

function renderEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  addTextElement(empty, 'div', 'empty-icon', '✦');
  addTextElement(empty, 'h3', '', statusFilter.value === 'All' ? 'No assignments yet' : `No ${statusFilter.value.toLowerCase()} assignments`);
  addTextElement(empty, 'p', '', statusFilter.value === 'All'
    ? 'Add your first assignment using the form.'
    : 'Try another status filter or add a new assignment.');
  assignmentList.append(empty);
}

async function loadAssignments() {
  listMessage.textContent = '';
  assignmentList.replaceChildren();
  assignmentCount.textContent = '…';

  try {
    const status = statusFilter.value;
    const query = status === 'All' ? '' : `?status=${encodeURIComponent(status)}`;
    const assignments = await request(`/api/assignments${query}`);
    assignmentCount.textContent = String(assignments.length);

    if (assignments.length === 0) {
      renderEmptyState();
      return;
    }

    assignments.forEach((assignment) => assignmentList.append(createAssignmentCard(assignment)));
  } catch (error) {
    assignmentCount.textContent = '0';
    listMessage.textContent = `Unable to load assignments: ${error.message}`;
  }
}

function resetForm() {
  assignmentForm.reset();
  document.querySelector('#priority').value = 'Medium';
  document.querySelector('#status').value = 'Pending';
  editingId = null;
  formHeading.textContent = 'Add an assignment';
  submitButton.textContent = 'Add assignment';
  cancelEditButton.classList.add('hidden');
  formMessage.textContent = '';
}

function beginEdit(assignment) {
  editingId = assignment._id;
  assignmentForm.elements.subject.value = assignment.subject;
  assignmentForm.elements.title.value = assignment.title;
  assignmentForm.elements.description.value = assignment.description;
  assignmentForm.elements.deadline.value = assignment.deadline.slice(0, 10);
  assignmentForm.elements.priority.value = assignment.priority;
  assignmentForm.elements.status.value = assignment.status;
  formHeading.textContent = 'Edit assignment';
  submitButton.textContent = 'Save changes';
  cancelEditButton.classList.remove('hidden');
  formMessage.textContent = '';
  document.querySelector('#subject').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

assignmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';

  const assignment = Object.fromEntries(new FormData(assignmentForm).entries());
  const isEditing = Boolean(editingId);
  const url = isEditing ? `/api/assignments/${editingId}` : '/api/assignments';

  try {
    await request(url, {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(assignment)
    });
    resetForm();
    await loadAssignments();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

cancelEditButton.addEventListener('click', resetForm);
statusFilter.addEventListener('change', loadAssignments);

assignmentList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  try {
    if (action === 'edit') {
      const assignment = await request(`/api/assignments/${id}`);
      beginEdit(assignment);
    } else if (action === 'toggle') {
      const currentStatus = button.textContent === 'Mark complete' ? 'Completed' : 'Pending';
      await request(`/api/assignments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: currentStatus })
      });
      await loadAssignments();
    } else if (action === 'delete') {
      if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
      await request(`/api/assignments/${id}`, { method: 'DELETE' });
      if (editingId === id) resetForm();
      await loadAssignments();
    }
  } catch (error) {
    listMessage.textContent = error.message;
  }
});

loadAssignments();

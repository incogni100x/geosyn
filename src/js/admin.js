import { supabase } from './client.js';
import {
  requireAdminAuth,
  clearAdminSession,
  setSessionLoading,
  clearSessionLoading,
} from './session.js';

const TABLE_NAME = 'team_roles';
const EDGE_FUNCTION_URL = 'https://owuxtbskihhjgngswrrh.supabase.co/functions/v1/role-create';

let rolesCache = [];
let currentEditingId = null;

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
      No roles have been added yet. Use the form above to create your first entry.
    </div>
  `;
}

function escapeHtml(value) {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRoles(container, records) {
  if (!records || records.length === 0) {
    renderEmptyState(container);
    return;
  }

  rolesCache = records;

  container.innerHTML = records
    .map(
      (role) => `
        <article class="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-lg p-5 bg-white shadow-sm" data-role-id="${escapeHtml(role.id)}">
          <img src="${escapeHtml(role.image_url ?? '')}" alt="${escapeHtml(role.member_name ?? role.role_title ?? 'Role image')}" class="w-full sm:w-40 h-40 object-cover rounded-md bg-gray-100" onerror="this.src='https://via.placeholder.com/160x160?text=Image'" />
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">${escapeHtml(role.member_name ?? role.role_title ?? 'Untitled Role')}</h3>
            <p class="text-sm font-medium text-[#FF6A0C] mt-1">${escapeHtml(role.member_role ?? role.created_by_email ?? 'Specialist')}</p>
            <p class="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">${escapeHtml(role.member_description ?? role.role_description ?? '')}</p>
            <div class="mt-4 flex items-center justify-between">
              <div class="text-xs text-gray-400">
                <span>Created ${new Date(role.created_at ?? Date.now()).toLocaleString()}</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="edit-role-btn inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100" data-role-id="${escapeHtml(role.id)}">
                  Edit
                </button>
                <button type="button" class="delete-role-btn inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50" data-role-id="${escapeHtml(role.id)}">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </article>
      `,
    )
    .join('');
}

async function fetchRoles(container) {
  const loadingEl = document.getElementById('roles-loading-state');
  if (loadingEl) loadingEl.classList.remove('hidden');

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (loadingEl) loadingEl.classList.add('hidden');

  if (error) {
    console.error('Failed to load roles:', error);
    container.innerHTML = `
      <div class="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
        Unable to fetch roles at the moment. Please try again later.
      </div>
    `;
    return;
  }

  renderRoles(container, data ?? []);
}

async function handleRoleFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitBtn = document.getElementById('role-submit-btn');
  const memberName = form.memberName.value.trim();
  const memberRole = form.memberRole.value.trim();
  const memberDescription = form.memberDescription.value.trim();
  const fileInput = form.roleImage;
  const file = fileInput?.files?.[0] ?? null;
  const roleIdInput = document.getElementById('roleId');
  const statusEl = document.getElementById('role-form-status');

  const isEditing = Boolean(roleIdInput?.value);

  if (!memberName || !memberRole || !memberDescription) {
    statusEl.textContent = 'Please fill in name, role, and description.';
    statusEl.className = 'text-sm text-red-600 mt-3';
    return;
  }

  if (!isEditing && !file) {
    statusEl.textContent = 'Please select an image before uploading.';
    statusEl.className = 'text-sm text-red-600 mt-3';
    return;
  }

  try {
    setSessionLoading(submitBtn, isEditing ? 'Updating...' : 'Saving...');
    statusEl.textContent = '';

    if (isEditing) {
      await updateRole(roleIdInput.value, {
        member_name: memberName,
        member_role: memberRole,
        member_description: memberDescription,
      });
    } else {
      await createRoleViaEdge({
        memberName,
        memberRole,
        memberDescription,
        file,
      });
    }

    form.reset();
    if (roleIdInput) roleIdInput.value = '';
    exitEditMode();
    statusEl.textContent = isEditing ? 'Role updated successfully!' : 'Role added successfully!';
    statusEl.className = 'text-sm text-green-600 mt-3';

    const rolesContainer = document.getElementById('roles-container');
    if (rolesContainer) {
      await fetchRoles(rolesContainer);
    }
  } catch (error) {
    console.error('Failed to save role:', error);
    statusEl.textContent = error.message ?? 'Something went wrong.';
    statusEl.className = 'text-sm text-red-600 mt-3';
  } finally {
    clearSessionLoading(submitBtn);
  }
}

async function createRoleViaEdge({ memberName, memberRole, memberDescription, file }) {
  if (!file) throw new Error('Image file is required');

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Authentication required. Please log in again.');
  }

  const formData = new FormData();
  formData.append('memberName', memberName);
  formData.append('memberRole', memberRole);
  formData.append('memberDescription', memberDescription);
  formData.append('file', file, file.name);

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json();
}

function initLogoutButton() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      logoutBtn.disabled = true;
      logoutBtn.textContent = 'Signing out...';
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAdminSession();
      window.location.href = '/admin-login';
    }
  });
}

function enterEditMode(role) {
  const form = document.getElementById('role-form');
  if (!form) return;

  currentEditingId = role.id;
  form.memberName.value = role.member_name ?? role.role_title ?? '';
  form.memberRole.value = role.member_role ?? role.created_by_email ?? '';
  form.memberDescription.value = role.member_description ?? role.role_description ?? '';

  const roleIdInput = document.getElementById('roleId');
  if (roleIdInput) roleIdInput.value = role.id;

  const submitBtn = document.getElementById('role-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Update role';

  const cancelBtn = document.getElementById('cancel-edit-btn');
  if (cancelBtn) cancelBtn.classList.remove('hidden');

  const statusEl = document.getElementById('role-form-status');
  if (statusEl) {
    statusEl.textContent = 'Editing existing team member. Save changes or cancel to exit.';
    statusEl.className = 'text-sm text-blue-600';
  }
}

function exitEditMode() {
  const form = document.getElementById('role-form');
  if (!form) return;

  form.reset();
  const roleIdInput = document.getElementById('roleId');
  if (roleIdInput) roleIdInput.value = '';

  const submitBtn = document.getElementById('role-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Save role';

  const cancelBtn = document.getElementById('cancel-edit-btn');
  if (cancelBtn) cancelBtn.classList.add('hidden');

  const statusEl = document.getElementById('role-form-status');
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.className = 'text-sm text-gray-500';
  }

  currentEditingId = null;
}

async function updateRole(id, payload) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteRole(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAdminAuth({ redirectTo: '/admin-login' });
  if (!session?.user) return;

  const emailEl = document.getElementById('admin-user-email');
  if (emailEl) {
    emailEl.textContent = session.user.email ?? 'Unknown admin';
  }

  const roleForm = document.getElementById('role-form');
  if (roleForm) {
    roleForm.addEventListener('submit', handleRoleFormSubmit);
  }

  const rolesContainer = document.getElementById('roles-container');
  if (rolesContainer) {
    await fetchRoles(rolesContainer);

    rolesContainer.addEventListener('click', async (event) => {
      const editBtn = event.target.closest('.edit-role-btn');
      const deleteBtn = event.target.closest('.delete-role-btn');

      if (editBtn) {
        const { roleId } = editBtn.dataset;
        const role = rolesCache.find((item) => item.id === roleId);
        if (role) {
          enterEditMode(role);
        }
        return;
      }

      if (deleteBtn) {
        const { roleId } = deleteBtn.dataset;
        if (!roleId) return;

        const confirmed = window.confirm('Delete this team member? This action cannot be undone.');
        if (!confirmed) return;

        try {
          await deleteRole(roleId);
          if (rolesContainer) {
            await fetchRoles(rolesContainer);
          }
        } catch (error) {
          console.error('Failed to delete role:', error);
          alert(error.message ?? 'Unable to delete role.');
        }
      }
    });
  }

  const cancelBtn = document.getElementById('cancel-edit-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      exitEditMode();
    });
  }

  initLogoutButton();
});



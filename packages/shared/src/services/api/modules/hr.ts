import { backendDelete, backendGet, backendPatch, backendPost, backendPut } from '../httpClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HRRolePermission = { moduleId: string; actions: string[] };

export type HRRole = {
  id: string;
  shop_id: string;
  name: string;
  name_ar?: string;
  color?: string;
  is_system?: boolean;
  full_access?: boolean;
  status?: string;
  permissions?: HRRolePermission[];
  users?: number;
  created_at?: string;
};

export type HRAccessLog = {
  id: string;
  shop_id: string;
  actor: string;
  action: string;
  action_ar?: string;
  target?: string;
  details?: string;
  details_ar?: string;
  timestamp: string;
};

export type HREmployee = {
  id: string;
  shop_id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  role_id?: string;
  status?: string;
  salary?: number;
  hire_date?: string;
  created_at?: string;
};

export type HRAttendanceRecord = {
  id: string;
  shop_id: string;
  employee_id?: string;
  employeeName?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  status?: string;
};

export type HRPayrollRecord = {
  id: string;
  shop_id: string;
  employee_id?: string;
  employeeName?: string;
  amount: number;
  period?: string;
  status?: string;
  paid_at?: string;
};

export type HRLeave = {
  id: string;
  shop_id: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'unpaid' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
};

export type HRTask = {
  id: string;
  shop_id: string;
  title: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inProgress' | 'done';
  dueDate?: string;
  description?: string;
  created_at?: string;
};

export type HRCheckOutRecord = {
  id: string;
  shop_id: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  status: 'present' | 'late' | 'absent';
};

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export async function getHRRolesViaBackend(shopId: string): Promise<HRRole[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/roles`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function getHRRoleViaBackend(shopId: string, roleId: string): Promise<HRRole | null> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/roles/${encodeURIComponent(roleId)}`);
  return res?.data ?? null;
}

export async function createHRRoleViaBackend(shopId: string, body: Partial<HRRole> & { name: string }): Promise<HRRole | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/roles`, body);
  return res?.data ?? null;
}

export async function updateHRRoleViaBackend(shopId: string, roleId: string, body: Partial<HRRole>): Promise<HRRole | null> {
  const res = await backendPut<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/roles/${encodeURIComponent(roleId)}`, body);
  return res?.data ?? null;
}

export async function deleteHRRoleViaBackend(shopId: string, roleId: string): Promise<boolean> {
  try {
    await backendDelete<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/roles/${encodeURIComponent(roleId)}`);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Access Logs
// ---------------------------------------------------------------------------

export async function getHRAccessLogsViaBackend(shopId: string, limit = 50): Promise<HRAccessLog[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/access-logs?limit=${limit}`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

export async function getHREmployeesViaBackend(shopId: string): Promise<HREmployee[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/employees`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHREmployeeViaBackend(shopId: string, body: Partial<HREmployee> & { name: string }): Promise<HREmployee | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/employees`, body);
  return res?.data ?? null;
}

export async function updateHREmployeeViaBackend(shopId: string, employeeId: string, body: Partial<HREmployee>): Promise<HREmployee | null> {
  const res = await backendPut<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/employees/${encodeURIComponent(employeeId)}`, body);
  return res?.data ?? null;
}

export async function deleteHREmployeeViaBackend(shopId: string, employeeId: string): Promise<boolean> {
  try {
    await backendDelete<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/employees/${encodeURIComponent(employeeId)}`);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export async function getHRAttendanceViaBackend(shopId: string): Promise<HRAttendanceRecord[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/attendance`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHRAttendanceViaBackend(shopId: string, body: Partial<HRAttendanceRecord>): Promise<HRAttendanceRecord | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/attendance`, body);
  return Array.isArray(res?.data) ? res.data[0] ?? null : res?.data ?? null;
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export async function getHRPayrollViaBackend(shopId: string): Promise<HRPayrollRecord[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/payroll`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHRPayrollViaBackend(shopId: string, body: Partial<HRPayrollRecord> & { amount: number }): Promise<HRPayrollRecord | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/payroll`, body);
  return Array.isArray(res?.data) ? res.data[0] ?? null : res?.data ?? null;
}

// ---------------------------------------------------------------------------
// Leaves
// ---------------------------------------------------------------------------

export async function getHRLeavesViaBackend(shopId: string): Promise<HRLeave[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/leaves`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHRLeaveViaBackend(shopId: string, body: Partial<HRLeave> & { employeeName: string; startDate: string; endDate: string }): Promise<HRLeave | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/leaves`, body);
  return res?.data ?? null;
}

export async function updateHRLeaveStatusViaBackend(shopId: string, leaveId: string, status: 'pending' | 'approved' | 'rejected'): Promise<HRLeave | null> {
  const res = await backendPatch<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/leaves/${encodeURIComponent(leaveId)}/status`, { status });
  return res?.data ?? null;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function getHRTasksViaBackend(shopId: string): Promise<HRTask[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/tasks`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHRTaskViaBackend(shopId: string, body: Partial<HRTask> & { title: string }): Promise<HRTask | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/tasks`, body);
  return res?.data ?? null;
}

export async function updateHRTaskViaBackend(shopId: string, taskId: string, body: Partial<HRTask>): Promise<HRTask | null> {
  const res = await backendPut<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/tasks/${encodeURIComponent(taskId)}`, body);
  return res?.data ?? null;
}

export async function deleteHRTaskViaBackend(shopId: string, taskId: string): Promise<boolean> {
  try {
    await backendDelete<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/tasks/${encodeURIComponent(taskId)}`);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// CheckOuts
// ---------------------------------------------------------------------------

export async function getHRCheckOutsViaBackend(shopId: string): Promise<HRCheckOutRecord[]> {
  const res = await backendGet<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/checkouts`);
  return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
}

export async function createHRCheckOutViaBackend(shopId: string, body: Partial<HRCheckOutRecord>): Promise<HRCheckOutRecord | null> {
  const res = await backendPost<any>(`/api/v1/hr/shops/${encodeURIComponent(shopId)}/checkouts`, body);
  return Array.isArray(res?.data) ? res.data[0] ?? null : res?.data ?? null;
}

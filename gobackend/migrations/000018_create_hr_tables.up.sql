-- HR module: roles, role_permissions, access_logs, employees, attendance, payroll, leaves, tasks, checkouts

CREATE TABLE IF NOT EXISTS hr_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    name_ar VARCHAR(120),
    color VARCHAR(60) DEFAULT 'bg-blue-50 text-blue-600',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    full_access BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_roles_shop_id ON hr_roles(shop_id);

CREATE TABLE IF NOT EXISTS hr_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES hr_roles(id) ON DELETE CASCADE,
    module_id VARCHAR(80) NOT NULL,
    actions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (role_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_hr_role_permissions_role_id ON hr_role_permissions(role_id);

CREATE TABLE IF NOT EXISTS hr_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    actor VARCHAR(160) NOT NULL,
    action VARCHAR(120) NOT NULL,
    action_ar VARCHAR(120),
    target VARCHAR(160),
    details TEXT,
    details_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_access_logs_shop_id ON hr_access_logs(shop_id);
CREATE INDEX IF NOT EXISTS idx_hr_access_logs_created_at ON hr_access_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS hr_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(160),
    phone VARCHAR(40),
    role VARCHAR(80),
    role_id UUID REFERENCES hr_roles(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    salary NUMERIC(12,2) NOT NULL DEFAULT 0,
    hire_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_employees_shop_id ON hr_employees(shop_id);

CREATE TABLE IF NOT EXISTS hr_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(160),
    date DATE NOT NULL,
    check_in VARCHAR(10),
    check_out VARCHAR(10),
    hours VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_attendance_shop_id ON hr_attendance(shop_id);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_date ON hr_attendance(date DESC);

CREATE TABLE IF NOT EXISTS hr_payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(160),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    period VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'paid',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_payroll_shop_id ON hr_payroll(shop_id);

CREATE TABLE IF NOT EXISTS hr_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    employee_name VARCHAR(160) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'annual',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_leaves_shop_id ON hr_leaves(shop_id);

CREATE TABLE IF NOT EXISTS hr_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    assignee VARCHAR(160),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    due_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_tasks_shop_id ON hr_tasks(shop_id);

CREATE TABLE IF NOT EXISTS hr_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL,
    employee_name VARCHAR(160) NOT NULL,
    date DATE NOT NULL,
    check_in VARCHAR(10),
    check_out VARCHAR(10),
    hours VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_checkouts_shop_id ON hr_checkouts(shop_id);

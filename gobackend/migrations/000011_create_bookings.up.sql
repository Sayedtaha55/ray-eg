-- Booking categories
CREATE TABLE IF NOT EXISTS booking_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID REFERENCES shops(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    name_ar     TEXT NOT NULL DEFAULT '',
    type        TEXT NOT NULL DEFAULT 'OTHER',
    description TEXT NOT NULL DEFAULT '',
    icon        TEXT NOT NULL DEFAULT 'CalendarCheck',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking services
CREATE TABLE IF NOT EXISTS booking_services (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id          UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id      UUID REFERENCES booking_categories(id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    name_ar          TEXT NOT NULL DEFAULT '',
    description      TEXT NOT NULL DEFAULT '',
    duration_minutes INT NOT NULL DEFAULT 30,
    price            NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency         TEXT NOT NULL DEFAULT 'EGP',
    capacity         INT NOT NULL DEFAULT 1,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    metadata         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking slots
CREATE TABLE IF NOT EXISTS booking_slots (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id       UUID NOT NULL REFERENCES booking_services(id) ON DELETE CASCADE,
    shop_id          UUID REFERENCES shops(id) ON DELETE CASCADE,
    resource_id      TEXT,
    date             DATE NOT NULL,
    start_time       TEXT NOT NULL,
    end_time         TEXT NOT NULL,
    start_at         TIMESTAMPTZ NOT NULL,
    end_at           TIMESTAMPTZ NOT NULL,
    status           TEXT NOT NULL DEFAULT 'OPEN',
    max_capacity     INT NOT NULL DEFAULT 1,
    current_bookings INT NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number  TEXT NOT NULL UNIQUE,
    service_id      UUID NOT NULL REFERENCES booking_services(id) ON DELETE CASCADE,
    slot_id         UUID REFERENCES booking_slots(id) ON DELETE SET NULL,
    shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id         UUID,
    customer_name   TEXT NOT NULL DEFAULT 'عميل',
    customer_phone  TEXT,
    customer_email  TEXT NOT NULL DEFAULT '',
    start_at        TIMESTAMPTZ,
    end_at          TIMESTAMPTZ,
    participants    INT NOT NULL DEFAULT 1,
    total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency        TEXT NOT NULL DEFAULT 'EGP',
    status          TEXT NOT NULL DEFAULT 'PENDING',
    payment_status  TEXT NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    metadata        JSONB,
    confirmed_at    TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_shop_id ON bookings(shop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_at ON bookings(start_at);
CREATE INDEX IF NOT EXISTS idx_booking_services_shop_id ON booking_services(shop_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_service_id ON booking_slots(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_date ON booking_slots(date);

SELECT create_updated_at_trigger('booking_categories');
SELECT create_updated_at_trigger('booking_services');
SELECT create_updated_at_trigger('booking_slots');
SELECT create_updated_at_trigger('bookings');

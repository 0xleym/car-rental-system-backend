ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS car_id INTEGER REFERENCES cars(id);

CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);

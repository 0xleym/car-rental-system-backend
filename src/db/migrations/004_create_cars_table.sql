CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model_year INTEGER NOT NULL,
    rent_per_day DECIMAL(10, 2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cars_available ON cars(available);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);

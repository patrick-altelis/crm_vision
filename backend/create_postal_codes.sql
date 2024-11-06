CREATE TABLE IF NOT EXISTS postal_codes (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    postal_code VARCHAR(5),
    department VARCHAR(3)
);

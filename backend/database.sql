CREATE DATABASE banketam;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(100) NOT NULL,
    venue_type VARCHAR(50) NOT NULL,
    banquet_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Новая',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review TEXT
);

INSERT INTO users (login, password, full_name, phone, email, is_admin) 
VALUES ('Admin26', 'Demo20', 'Администратор Системы', '+7(111)-111-11-11', 'admin@banketam.net', true);
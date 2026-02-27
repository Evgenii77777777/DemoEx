const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'banketam',
    password: '1',
    port: 5432,
});

// Регистрация
app.post('/api/register', async (req, res) => {
    const { login, password, fullName, phone, email } = req.body;
    
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Логин уже существует' });
        }
        
        const result = await pool.query(
            'INSERT INTO users (login, password, full_name, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, login, full_name',
            [login, password, fullName, phone, email]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Авторизация
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE login = $1 AND password = $2',
            [login, password]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ error: 'Неверный логин или пароль' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создание заявки
app.post('/api/bookings', async (req, res) => {
    const { userId, fullName, venueType, banquetDate, paymentMethod } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO bookings (user_id, full_name, venue_type, banquet_date, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, fullName, venueType, banquetDate, paymentMethod]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение заявок пользователя
app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
            [req.params.userId]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Все заявки для админа
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновление статуса заявки
app.put('/api/bookings/:id/status', async (req, res) => {
    const { status } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Добавление отзыва
app.put('/api/bookings/:id/review', async (req, res) => {
    const { review } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE bookings SET review = $1 WHERE id = $2 RETURNING *',
            [review, req.params.id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
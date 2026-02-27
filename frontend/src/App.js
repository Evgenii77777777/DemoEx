import React, { useState, useEffect } from 'react';
import './styles.css';

const API_URL = 'http://localhost:5000/api';

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [bookings, setBookings] = useState([]);


    const [filteredBookings, setFilteredBookings] = useState([]); 
    const [statusFilter, setStatusFilter] = useState(''); 
    const [nameFilter, setNameFilter] = useState(''); 



    const [loginData, setLoginData] = useState({ login: '', password: '' });
    const [registerData, setRegisterData] = useState({
        login: '', password: '', fullName: '', phone: '', email: ''
    });
    const [bookingData, setBookingData] = useState({
        venueType: 'Зал', banquetDate: '', paymentMethod: 'Наличные'
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);

    //Картинки для слайдера
    const slides = ['/images/slide1.jpg', '/images/slide2.jpg', '/images/slide3.jpg', '/images/slide4.jpg'];
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [slides.length]);
    
    useEffect(() => {
        if (currentUser) {
            fetchBookings();
        }
    }, [currentUser]);


// Фильтрация заявок для админ-панели
useEffect(() => {
    let filtered = [...bookings];
    
    if (nameFilter) {
        filtered = filtered.filter(b => 
            b.full_name.toLowerCase().includes(nameFilter.toLowerCase())
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
}, [bookings, nameFilter, statusFilter]);

// Инициализация отфильтрованных заявок
useEffect(() => {
    setFilteredBookings(bookings);
}, [bookings]);

    
    const fetchBookings = async () => {
        try {
            const url = currentUser?.is_admin 
                ? `${API_URL}/bookings`
                : `${API_URL}/bookings/user/${currentUser.id}`;
            
            const response = await fetch(url);
            const data = await response.json();
            setBookings(data);
            setFilteredBookings(data); 
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };
    
    const validateRegister = () => {
        const errors = {};
        if (!/^[a-zA-Z0-9]{6,}$/.test(registerData.login)) {
            errors.login = 'Логин должен содержать минимум 6 латинских букв и цифр';
        }
        if (registerData.password.length < 8) {
            errors.password = 'Пароль должен быть минимум 8 символов';
        }
        if (!/^[а-яА-ЯёЁ\s]+$/.test(registerData.fullName)) {
            errors.fullName = 'ФИО должно содержать только кириллицу и пробелы';
        }
        if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(registerData.phone)) {
            errors.phone = 'Формат: +7(XXX)-XXX-XX-XX';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            errors.email = 'Неверный формат email';
        }
        return errors;
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validateRegister();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            
            const data = await response.json();
            if (response.ok) {
                setCurrentUser(data);
                setCurrentPage('profile');
                setMessage('');
            } else {
                setErrors({ form: data.error });
            }
        } catch (error) {
            setErrors({ form: 'Ошибка сервера' });
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            if (response.ok) {
                setCurrentUser(data);
                setCurrentPage(data.is_admin ? 'admin' : 'profile');
                setErrors({});
            } else {
                setErrors({ form: data.error });
            }
        } catch (error) {
            setErrors({ form: 'Ошибка сервера' });
        }
    };
    
    const handleCreateBooking = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    fullName: currentUser.full_name,
                    ...bookingData
                })
            });
            
            if (response.ok) {
                setMessage('Заявка успешно создана!');
                setBookingData({ venueType: 'Зал', banquetDate: '', paymentMethod: 'Наличные' });
                fetchBookings();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setErrors({ form: 'Ошибка создания заявки' });
        }
    };
    
    const handleStatusChange = async (id, newStatus) => {
        try {
            await fetch(`${API_URL}/bookings/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchBookings();
            setMessage('Статус обновлен');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };
    
    const handleAddReview = async (id, review) => {
        try {
            await fetch(`${API_URL}/bookings/${id}/review`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review })
            });
            fetchBookings();
            setMessage('Отзыв добавлен');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error adding review:', error);
        }
    };
    
    const renderHome = () => (
        <div className="home">
            <div className="slider">
                <button className="slider-btn prev" onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}>❮</button>
                <img src={slides[currentSlide]} alt={`Slide ${currentSlide + 1}`} />
                <button className="slider-btn next" onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}>❯</button>
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <span key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></span>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderRegister = () => (
        <div className="auth-form">
            <h2>Регистрация</h2>
            {errors.form && <div className="error">{errors.form}</div>}
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Логин" value={registerData.login} onChange={(e) => setRegisterData({...registerData, login: e.target.value})} />
                {errors.login && <span className="error">{errors.login}</span>}
                <input type="password" placeholder="Пароль" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} />
                {errors.password && <span className="error">{errors.password}</span>}
                <input type="text" placeholder="ФИО" value={registerData.fullName} onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})} />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
                <input type="text" placeholder="+7(XXX)-XXX-XX-XX" value={registerData.phone} onChange={(e) => setRegisterData({...registerData, phone: e.target.value})} />
                {errors.phone && <span className="error">{errors.phone}</span>}
                <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} />
                {errors.email && <span className="error">{errors.email}</span>}
                <button type="submit">Зарегистрироваться</button>
            </form>
            <p>Уже есть аккаунт? <button className="link" onClick={() => setCurrentPage('login')}>Войдите</button></p>
        </div>
    );
    
    const renderLogin = () => (
        <div className="auth-form">
            <h2>Вход</h2>
            {errors.form && <div className="error">{errors.form}</div>}
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Логин" value={loginData.login} onChange={(e) => setLoginData({...loginData, login: e.target.value})} />
                <input type="password" placeholder="Пароль" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
                <button type="submit">Войти</button>
            </form>
            <p>Нет аккаунта? <button className="link" onClick={() => setCurrentPage('register')}>Зарегистрируйтесь</button></p>
        </div>
    );
    
    const renderProfile = () => (
        <div className="profile">
            <h2>Личный кабинет</h2>
            <div className="profile-header">
                <h3>{currentUser?.full_name}</h3>
                <button onClick={() => setCurrentPage('create-booking')}>Новая заявка</button>
            </div>
            
            <h3>История заявок</h3>
            <div className="bookings-list">
                {bookings.map(booking => (
                    <div key={booking.id} className={`booking-card status-${booking.status}`}>
                        <div className="booking-header">
                            <span className="venue">{booking.venue_type}</span>
                            <span className="status">{booking.status}</span>
                        </div>
                        <div className="booking-details">
                            <p>Дата: {new Date(booking.banquet_date).toLocaleDateString()}</p>
                            <p>Оплата: {booking.payment_method}</p>
                        </div>
                        {(booking.status === 'Банкет назначен' || booking.status === 'Банкет завершен') && !booking.review && (
                            <div className="review-section">
                                <textarea placeholder="Оставьте отзыв..." rows="2" id={`review-${booking.id}`}></textarea>
                                <button onClick={() => {
                                    const review = document.getElementById(`review-${booking.id}`).value;
                                    if (review) handleAddReview(booking.id, review);
                                }}>Отправить отзыв</button>
                            </div>
                        )}
                        {booking.review && (
                            <div className="review">
                                <strong>Ваш отзыв:</strong> {booking.review}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderCreateBooking = () => (
        <div className="create-booking">
            <h2>Новая заявка</h2>
            {message && <div className="success">{message}</div>}
            {errors.form && <div className="error">{errors.form}</div>}
            
            <form onSubmit={handleCreateBooking}>
                <label>Помещение:</label>
                <select value={bookingData.venueType} onChange={(e) => setBookingData({...bookingData, venueType: e.target.value})}>
                    <option>Зал</option>
                    <option>Ресторан</option>
                    <option>Летняя веранда</option>
                    <option>Закрытая веранда</option>
                </select>
                
                <label>Дата банкета:</label>
                <input type="date" value={bookingData.banquetDate} onChange={(e) => setBookingData({...bookingData, banquetDate: e.target.value})} required />
                
                <label>Способ оплаты:</label>
                <select value={bookingData.paymentMethod} onChange={(e) => setBookingData({...bookingData, paymentMethod: e.target.value})}>
                    <option>Наличные</option>
                    <option>Карта</option>
                    <option>Безналичный расчет</option>
                </select>
                
                <button type="submit">
                 <span className="btn-text">Отправить заявку</span>
                </button>

            </form>
            
            <button className="back-btn" onClick={() => setCurrentPage('profile')}>← Назад</button>
        </div>
    );
    

const renderAdmin = () => {
    return (
        <div className="admin-panel">
            <h2>Панель администратора</h2>
            {message && <div className="success">{message}</div>}
            
            <div className="stats">
                <div className="stat-card">
                    <span className="stat-label">Всего заявок:</span>
                    <span className="stat-value">{bookings.length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Новых:</span>
                    <span className="stat-value">{bookings.filter(b => b.status === 'Новая').length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Назначенных:</span>
                    <span className="stat-value">{bookings.filter(b => b.status === 'Банкет назначен').length}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Завершенных:</span>
                    <span className="stat-value">{bookings.filter(b => b.status === 'Банкет завершен').length}</span>
                </div>
            </div>
            
            <div className="filters">
                <input 
                    type="text" 
                    placeholder="Фильтр по ФИО" 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Все статусы</option>
                    <option value="Новая">Новая</option>
                    <option value="Банкет назначен">Банкет назначен</option>
                    <option value="Банкет завершен">Банкет завершен</option>
                </select>
                {(nameFilter || statusFilter) && (
                    <button 
                        className="clear-filters"
                        onClick={() => {
                            setNameFilter('');
                            setStatusFilter('');
                        }}
                    >
                        Сбросить фильтры ✕
                    </button>
                )}
            </div>
            
            <div className="bookings-table">
                {filteredBookings.length === 0 ? (
                    <div className="no-results">
                        <p>Заявки не найдены</p>
                        {(nameFilter || statusFilter) && (
                            <button onClick={() => {
                                setNameFilter('');
                                setStatusFilter('');
                            }}>
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ФИО</th>
                                <th>Помещение</th>
                                <th>Дата</th>
                                <th>Оплата</th>
                                <th>Статус</th>
                                <th>Отзыв</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>{booking.full_name}</td>
                                    <td>{booking.venue_type}</td>
                                    <td>{new Date(booking.banquet_date).toLocaleDateString()}</td>
                                    <td>{booking.payment_method}</td>
                                    <td>
                                        <select 
                                            value={booking.status} 
                                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                            className={`status-select status-${booking.status}`}
                                        >
                                            <option value="Новая">Новая</option>
                                            <option value="Банкет назначен">Банкет назначен</option>
                                            <option value="Банкет завершен">Банкет завершен</option>
                                        </select>
                                    </td>
                                    <td className="review-cell">
                                        {booking.review ? (
                                            <div className="review-content">
                                                {booking.review}
                                            </div>
                                        ) : (
                                            <span className="no-review">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};



    
    return (
        <div className="app">


            <header>
                <div 
                    className="logo" 
                    onClick={() => setCurrentPage('home')}
                    style={{ cursor: 'pointer' }}
                >
                    <img 
                        //сказываем путь к логотипу
                        src="/images/logo2.png" 
                        alt="Банкетам.Нет"
                        style={{
                            height: '50px',
                            width: 'auto',
                            display: 'block'
                        }}
                        onError={(e) => {
                            // Если изображение не загрузилось, показываем текстовый вариант
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = 'Банкетам.Нет';
                        }}
                    />
                </div>
                <div className="header-buttons">
                    {!currentUser ? (
                        <>
                            <button onClick={() => setCurrentPage('login')}>Вход</button>
                            <button onClick={() => setCurrentPage('register')}>Регистрация</button>
                        </>
                    ) : (
                        <>
                            <span>👤 {currentUser.full_name}</span>
                            <button onClick={() => {
                                setCurrentUser(null);
                                setCurrentPage('home');
                            }}>Выход</button>
                        </>
                    )}
                </div>
            </header>
           
            <main>
                {currentPage === 'home' && renderHome()}
                {currentPage === 'register' && renderRegister()}
                {currentPage === 'login' && renderLogin()}
                {currentPage === 'profile' && currentUser && renderProfile()}
                {currentPage === 'create-booking' && currentUser && renderCreateBooking()}
                {currentPage === 'admin' && currentUser?.is_admin && renderAdmin()}
            </main>
        </div>
    );
}

export default App;
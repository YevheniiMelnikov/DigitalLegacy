// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('access_token') !== null;
        console.log('Is Logged In:', isLoggedIn);

        const loginBtn = document.querySelector('.login-btn');
        const registerBtn = document.querySelector('.register-btn');
        const logoutBtn = document.querySelector('.logout-btn');

        console.log('Buttons:', loginBtn, registerBtn, logoutBtn);

        if (isLoggedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    const loginModalElement = document.getElementById('loginModal');
    if (loginModalElement) {
        const loginModal = new bootstrap.Modal(loginModalElement);

        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.show();
            });
        }

        const loginForm = document.querySelector('#loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.querySelector('#loginEmail').value;
                const password = document.querySelector('#loginPassword').value;

                try {
                    const response = await fetch('/api/users/jwt/create/', { // Використання відносного URL
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('API Response:', data); // Для відладки
                        localStorage.setItem('access_token', data.access);
                        localStorage.setItem('refresh_token', data.refresh);
                        // Заміна alert на Bootstrap Alert
                        showAlert('Ви успішно увійшли в систему!', 'success');
                        loginModal.hide();

                        // Оновлюємо кнопки
                        checkAuth();

                        // Перенаправляємо на сторінку профілю
                        setTimeout(() => {
                            window.location.href = '/profile/';
                        }, 1000); // Чекаємо 1 секунду для відображення повідомлення
                    } else {
                        const error = await response.json();
                        // Заміна alert на Bootstrap Alert
                        showAlert('Помилка входу: ' + (error.detail || 'Неправильні дані.'), 'danger');
                    }
                } catch (err) {
                    console.error('Помилка при вході:', err);
                    // Заміна alert на Bootstrap Alert
                    showAlert('Виникла помилка при вході.', 'danger');
                }
            });
        }
    }

    const registerModalElement = document.getElementById('registerModal');
    if (registerModalElement) {
        const registerModal = new bootstrap.Modal(registerModalElement);

        const registerBtn = document.querySelector('.register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.show();
            });
        }

        const registerForm = document.querySelector('#registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.querySelector('#registerEmail').value;
                const password = document.querySelector('#registerPassword').value;

                try {
                    const response = await fetch('/api/users/register/', { // Використання відносного URL
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    if (response.ok) {
                        // Заміна alert на Bootstrap Alert
                        showAlert('Реєстрація успішна! Тепер ви можете увійти.', 'success');
                        registerModal.hide();
                    } else {
                        const error = await response.json();
                        // Заміна alert на Bootstrap Alert
                        showAlert('Помилка реєстрації: ' + (error.email || error.password || 'Не вдалося зареєструватися.'), 'danger');
                    }
                } catch (err) {
                    console.error('Помилка при реєстрації:', err);
                    // Заміна alert на Bootstrap Alert
                    showAlert('Виникла помилка при реєстрації.', 'danger');
                }
            });
        }
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Відкриваємо кастомне модальне вікно для підтвердження виходу
            const logoutConfirmModal = new bootstrap.Modal(document.getElementById('logoutConfirmModal'));
            logoutConfirmModal.show();
        });
    }

    // Обробка підтвердження виходу
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            // Виконуємо вихід
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // Заміна alert на Bootstrap Alert
            showAlert('Ви вийшли із системи.', 'info');
            checkAuth();
            // Закриваємо модальне вікно
            const logoutConfirmModal = bootstrap.Modal.getInstance(document.getElementById('logoutConfirmModal'));
            logoutConfirmModal.hide();
            // Перенаправляємо на головну сторінку
            setTimeout(() => {
                window.location.href = '/';
            }, 1000); // Чекаємо 1 секунду для відображення повідомлення
        });
    }

    // Функція для показу Bootstrap Alerts
    function showAlert(message, type) {
        const alertPlaceholder = document.getElementById('alert-placeholder');
        if (alertPlaceholder) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрити"></button>
                </div>
            `;
            alertPlaceholder.append(wrapper);

            // Автоматично закрити alert через 5 секунд
            setTimeout(() => {
                const alert = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
                alert.close();
            }, 5000);
        }
    }

    // Функція для відображення профілю
    function loadUserProfile() {
        if (window.location.pathname === '/profile/') {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                showAlert('Ви не авторизовані. Будь ласка, увійдіть.', 'warning');
                window.location.href = '/';
                return;
            }

            fetch('/api/users/me/', { // Припускаючи, що у вас є ендпоінт для отримання даних користувача
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Не вдалося завантажити дані користувача.');
                }
            })
            .then(data => {
                const userInfoDiv = document.getElementById('user-info');
                if (userInfoDiv) {
                    userInfoDiv.innerHTML = `
                        <p><strong>Email:</strong> ${data.email}</p>
                        <!-- Додайте інші поля за потребою -->
                    `;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Помилка при завантаженні даних користувача.', 'danger');
            });
        }
    }

    loadUserProfile();

    checkAuth();

    // Додаємо слухача подій для синхронізації стану авторизації між вкладками
    window.addEventListener('storage', checkAuth);
});

const languagesBtn = document.querySelector('.languages');
const loginText = document.querySelector('.loginText');
const usernamePlaceholder = document.querySelector('.usernamePlaceholder');
const passwordPlaceholder = document.querySelector('.passwordPlaceholder');
const login = document.getElementById('loginForm');

let languageToggle = false;
languagesBtn.addEventListener('click', function() {
    languageToggle = !languageToggle;
    if (languageToggle) {
        languagesBtn.textContent = "English";
        loginText.textContent = "Sign in";
        usernamePlaceholder.placeholder = "Username";
        passwordPlaceholder.placeholder = "Password";
        loginButton.value = "Sign In";
    } else {
        languagesBtn.textContent = "Português";
        loginText.textContent = "Iniciar Sessão";
        usernamePlaceholder.placeholder = "Utilizador";
        passwordPlaceholder.placeholder = "Palavra-Passe";
        loginButton.value = "Login";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    };
  
    themeToggleButton.addEventListener('click', toggleTheme);
  
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
  });
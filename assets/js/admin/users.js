let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
let logOut = document.querySelector("#log_out");

logOut.addEventListener("click", () => {
    // Redirecionar para a rota de logout
    window.location.href = "/logout";
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); // chamando a função (opcional)
});

// Função para alterar o ícone do menu lateral (opcional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); // substitui as classes dos ícones
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); // substitui as classes dos ícones
  }
}

const loginForm = document.getElementById('registerForm');

loginForm.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    loginForm.submit();
  }
});

// Certifique-se de que o elemento com a classe 'show-register' existe antes de adicionar um event listener
let showRegisterBtn = document.querySelector(".show-register");
if (showRegisterBtn) {
  showRegisterBtn.addEventListener("click", function () {
    document.querySelector(".popup_register").classList.add("active");
  });
}

// Certifique-se de que o elemento com a classe 'close_register' existe antes de adicionar um event listener
let closeRegisterBtn = document.querySelector(".close_register");
if (closeRegisterBtn) {
  closeRegisterBtn.addEventListener("click", function () {
    document.querySelector(".popup_register").classList.remove("active");
  });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Verificar o parâmetro de tipo de utilizador na URL
var userType = getParameterByName('type');
var messageElement = document.getElementById('message');

window.addEventListener('DOMContentLoaded', function() {
  // Exibir aviso de login
  showLoginAlert();

  // Mostrar lista de utilizadors
  updateUsersList();
});

function showLoginAlert() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('type')) {
    const userType = urlParams.get('type');
    if (userType === '1') {
      alert('Você entrou como Desenvolvedor.');
    } else if (userType === '2') {
      alert('Você entrou como Administrador.');
    }
  }
}

async function updateUsersList() {
  try {
    const response = await fetch('/getUsersJson');
    const users = await response.json();

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Limpa o conteúdo atual da tabela

    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${user.ID}</td>
          <td>${user.login}</td>
          <td>${user.nome}</td>
          <td>${user.morada}</td>
          <td>${user.nif}</td>
          <td>${user.email}</td>
          <td>${user.Type}</td>
          <td>${user.Status}</td>
          <td>
            <button class="edit-btn" data-id="${user.ID}" alt="Editar utilizador" tabindex="X">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="delete-btn" data-id="${user.ID}" alt="Eliminar utilizador" tabindex="Y">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
      `;
      tbody.appendChild(tr);

      // Adiciona eventos aos botões de editar
      tr.querySelector('.edit-btn').addEventListener('click', (e) => {
        document.querySelector(".popup_edit").classList.add("active");
        const id = e.currentTarget.getAttribute('data-id');
        const user = users.find(u => u.ID == id);
      });

      // Adiciona eventos aos botões de exclusão
      tr.querySelector('.delete-btn').addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const confirmed = confirm('Tem certeza de que deseja excluir este utilizador?');
        if (confirmed) {
          removeUser(id);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar lista de utilizadores:', error);
  }
}

async function removeUser(userId) {
    try {
        const response = await fetch(`/deleteUser/${userId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        alert(data.message);
        updateUsersList(); // Atualiza a lista de utilizadors após a exclusão
    } catch (error) {
        console.error('Erro ao excluir utilizador:', error);
        alert('Erro ao excluir utilizador. Por favor, tente novamente mais tarde.');
    }
}

document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const loginInput = document.getElementById('login');
  const login = loginInput.value;
  const typeSelect = document.querySelector('[name="type"]');
  const type = typeSelect.value;
  const nifInput = document.getElementById('nif'); // Assuming the NIF input has this ID
  const nif = nifInput.value;

  // Check user type selection
  if (type === '0') {
      alert('Por favor, selecione o tipo de utilizador.');
      return;
  }

  // NIF validation using regular expression
  const nifRegex = /^\d{9}$/; // Matches exactly 9 digits
  if (!nifRegex.test(nif)) {
      alert('NIF inválido. O NIF deve conter apenas 9 dígitos.');
      return; // Prevent form submission if NIF is invalid
  }

  // Função para verificar se um login já existe
  function checkLogin(name) {
    return fetch(`/checkLogin/${name}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao verificar nome do login');
        }
        return response.text(); // Obtém o texto da resposta
      })
      .then(data => {
        console.log(`Response from server: ${data}`);
        return data === 'true'; // Retorna true se a resposta for 'true', caso contrário, retorna false
      })
      .catch(error => {
        console.error('Erro ao verificar nome do login:', error);
        throw error;
      });
  }

  // Verifica se o nome do login já existe
  checkLogin(name)
    .then(nameExists => {
      if (!nameExists) {
        alert('Este nome de login já está em uso.');
      } else {
        const nameErrorElement = document.getElementById('nameError');
        if (nameErrorElement) {
          nameErrorElement.textContent = ''; // Limpa mensagens de erro anteriores
        }

        // Envie o formulário após 0.1 segundos
        setTimeout(function() {
          document.getElementById('componentForm').submit();
        }, 100);

        // Alerta de sucesso
        alert('login criado com sucesso.');

        // Redirecionamento para d_components.html após 0.1 segundos
        setTimeout(function() {
          window.location.href = 'a_users.html';
        }, 100);
      }
    })
    .catch(error => console.error('Erro ao verificar nome do login:', error));
});

// Certifique-se de que o elemento com a classe 'edit-btn' existe antes de adicionar um event listener
let editButtons = document.querySelectorAll(".edit-btn");
if (editButtons) {
  editButtons.forEach(button => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute('data-id'); // Obtém o ID do usuário do atributo data-id
      openEditForm(userId); // Chama a função para abrir o formulário de edição com os dados do usuário
      document.querySelector(".popup_edit").classList.add("active");
    });
  });
}

// Certifique-se de que o elemento com a classe 'close_edit' existe antes de adicionar um event listener
let closeEditBtn = document.querySelector(".close_edit");
if (closeEditBtn) {
  closeEditBtn.addEventListener("click", function () {
    document.querySelector(".popup_edit").classList.remove("active");
  });
}




// Função para buscar o nome do usuário atualmente logado no servidor
function getUser() {
  fetch('/getUser') // Rota para obter o nome do usuário no servidor
      .then(response => response.json())
      .then(data => {
          // Atualiza o conteúdo do elemento userName com o nome recebido do servidor
          document.getElementById('userName').innerText = data.nome;
      })
      .catch(error => console.error('Erro ao buscar o nome do usuário:', error));
}

// Chama a função para buscar o nome do usuário assim que a página carrega
window.addEventListener('DOMContentLoaded', getUser);

    // Função para abrir o formulário de edição e preencher os campos com os dados do usuário
    function openEditForm(userId) {
      // Atualizar o valor do input hidden com o ID do usuário
      document.getElementById("editUserId").value = userId;
      // Atualizar o atributo action do formulário com o ID do usuário
      document.getElementById("editForm").action = "/editUser/" + userId;
      // Outras ações necessárias, como preencher os campos do formulário com os dados do usuário
      // Exemplo: document.getElementById("editLogin").value = userLogin;
}


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
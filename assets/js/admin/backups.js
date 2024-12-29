// Selecionar elementos DOM
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
let logOut = document.querySelector("#log_out");

// Adicionar evento de clique ao botão de logout
logOut.addEventListener("click", () => {
    // Redirecionar para a rota de logout
    window.location.href = "/logout";
});

// Adicionar evento de clique ao botão de fechar da barra lateral
closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); // chamar a função (opcional)
});

// Função para mudar o ícone do botão da barra lateral (opcional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); // substituir as classes dos ícones
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); // substituir as classes dos ícones
  }
}

// Certificar-se de que o elemento com a classe 'show-backup' existe antes de adicionar um ouvinte de evento
let showbackupBtn = document.querySelector(".show-backup");
if (showbackupBtn) {
  showbackupBtn.addEventListener("click", function () {
    document.querySelector(".popup_backup").classList.add("active");
  });
}

// Certificar-se de que o elemento com a classe 'close_backup' existe antes de adicionar um ouvinte de evento
let closebackupBtn = document.querySelector(".close_backup");
if (closebackupBtn) {
  closebackupBtn.addEventListener("click", function () {
    document.querySelector(".popup_backup").classList.remove("active");
  });
}

// Função para obter o nome do usuário atualmente logado no servidor
function getUser() {
  fetch('/getUser') // Rota para obter o nome do usuário no servidor
      .then(response => response.json())
      .then(data => {
          // Atualizar o conteúdo do elemento userName com o nome recebido do servidor
          document.getElementById('userName').innerText = data.nome;
      })
      .catch(error => console.error('Erro ao buscar o nome do usuário:', error));
}

// Chamar a função para obter o nome do usuário assim que a página carregar
window.addEventListener('DOMContentLoaded', getUser);

// Adicionar ouvinte de evento quando o DOM é carregado para configurar o tema da página
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleButton = document.getElementById('theme-toggle');
  
  // Função para alternar entre os temas claro e escuro
  const toggleTheme = () => {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
          localStorage.setItem('theme', 'dark');
      } else {
          localStorage.setItem('theme', 'light');
      }
  };

  // Adicionar evento de clique ao botão de alternar tema
  themeToggleButton.addEventListener('click', toggleTheme);

  // Verificar se há um tema salvo no armazenamento local e aplicá-lo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
  }
});

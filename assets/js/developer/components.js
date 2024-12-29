// Variáveis para elementos do DOM
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let logOut = document.querySelector("#log_out");

logOut.addEventListener("click", () => {
    // Redirecionar para a rota de logout
    window.location.href = "/logout";
});

// Event listener para o botão de fechar sidebar
closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});

window.addEventListener('DOMContentLoaded', function() {
  // Exibir aviso de login
  showLoginAlert();

  // Mostrar lista de utilizadors
  updateComponentList();
});

// Função para alterar o ícone do botão da sidebar
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
  }
}

// Event listener para mostrar popup de componente
let showComponentBtn = document.querySelector(".show-component");
if (showComponentBtn) {
  showComponentBtn.addEventListener("click", () => {
    document.querySelector(".popup_component").classList.add("active");
  });
}

// Event listener para fechar popup de componente
let closeComponentBtn = document.querySelector(".close_component");
if (closeComponentBtn) {
  closeComponentBtn.addEventListener("click", () => {
    document.querySelector(".popup_component").classList.remove("active");
  });
}

// Função para obter parâmetro da URL
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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

function formatarData(data) {
  const date = new Date(data);
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  const segundos = String(date.getSeconds()).padStart(2, '0');
  return `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
}


async function removeComponent(componentId) {
    try {
        const response = await fetch(`/deleteComponent/${componentId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        alert(data.message);
        updateComponentList(); // Atualiza a lista de componentes após a exclusão
    } catch (error) {
        console.error('Erro ao excluir componente:', error);
        alert('Erro ao excluir componente. Por favor, tente novamente mais tarde.');
    }
}

// Função para atualizar lista de componentes
async function updateComponentList() {
  try {
    const response = await fetch('/getComponentsJson');
    const components = await response.json();

    const tbody = document.querySelector('.home-section .table_section tbody');
    tbody.innerHTML = '';

    components.forEach(component => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${component.ID}</td>
          <td>${component.User_ID}</td>
          <td>${component.Component_ID}</td>
          <td>${component.Name}</td>
          <td>${component.Description}</td>
          <td>${formatarData(component.Date)}</td>
          <td>
              <button class="view-btn" data-id="${component.ID}" alt="Visualizar Versões da Componente"><i class="fa-solid fa-book-open"></i></button>
              <button class="edit-btn" data-id="${component.ID}" alt="Editar Componente"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="delete-btn" data-id="${component.ID}" alt="Eliminar componente"><i class="fa-solid fa-trash"></i></button>
          </td>
      `;
      tbody.appendChild(tr);

      // Event listeners para botões de visualizar, editar e excluir
      tr.querySelector('.view-btn').addEventListener('click', () => {
        const id = tr.querySelector('.view-btn').getAttribute('data-id');
        // Implementar a lógica para visualizar o componente
        viewComponentVersions(id);
      });

      tr.querySelector('.edit-btn').addEventListener('click', () => {
        document.querySelector(".popup_edit").classList.add("active");
        const id = tr.querySelector('.edit-btn').getAttribute('data-id');
        const component = components.find(c => c.ID == id);
        showEditComponentForm(component);
      });

      tr.querySelector('.delete-btn').addEventListener('click', () => {
        const id = tr.querySelector('.delete-btn').getAttribute('data-id');
        const confirmed = confirm('Tem certeza de que deseja excluir este componente?');
        if (confirmed) {
          removeComponent(id);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar lista de componentes:', error);
  }
}

function viewComponentVersions(id) {
  // Redirecionar para a página d_versions.html com o ID como parâmetro de consulta
  window.location.href = `d_versions.html?componentId=${id}`;
}


window.addEventListener('DOMContentLoaded', function() {
        // Função para preencher as opções do select com os dados das componentes
        fetch('/getComponents')
            .then(response => response.json())
            .then(data => {
                const selectElement = document.getElementById('componentSelect');
                data.forEach(component => {
                    const option = document.createElement('option');
                    option.value = component.id;
                    option.textContent = `${component.id} - ${component.name}`;
                    selectElement.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar componentes:', error);
            });
});


document.getElementById('componentForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const nameInput = document.getElementById('name');
  const name = nameInput.value;
  const idCompSelect = document.getElementById('componentSelect');
  let idComp = idCompSelect.value;

  // Verifica se idComp é igual a 0 e, se for, define como null
  if (idComp === '0') {
    idComp = null;
  }

  // Função para verificar se um componente já existe
  function checkComponent(name) {
    return fetch(`/checkComponent/${name}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao verificar nome do componente');
        }
        return response.text(); // Obtém o texto da resposta
      })
      .then(data => {
        console.log(`Response from server: ${data}`);
        return data === 'true'; // Retorna true se a resposta for 'true', caso contrário, retorna false
      })
      .catch(error => {
        console.error('Erro ao verificar nome do componente:', error);
        throw error;
      });
  }

// Verifica se o nome do componente já existe
checkComponent(name)
    .then(nameExists => {
        if (!nameExists) {
            alert('Este nome de componente já está em uso.');
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
            alert('Componente criado com sucesso.');

            // Redirecionamento para d_components.html após 0.3 segundos
            setTimeout(function() {
                window.location.href = 'd_components.html';
            }, 100);
        }
    })
    .catch(error => console.error('Erro ao verificar nome do componente:', error));
  });

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

document.getElementById('search').addEventListener('click', function() {
  // Obtenha os valores dos campos de entrada
  var idComp = document.getElementById('comp_search').value;
  var version = document.getElementById('pesquisaComp').value;

  // Verifica se a opção selecionada é "Data" (valor igual a 1)
  if (version === "1") {
      // Verifica se a data está no formato YYYY-MM-DD
      var regexDate = /^\d{4}-\d{2}-\d{2}$/; // Expressão regular para o formato de data
      if (!regexDate.test(idComp)) {
          alert("A data deve estar no formato 'AAAA-MM-DD'.");
          return; // Aborta a execução da função
      }
  } else if (version === "0") {
      // Verifica se há caracteres especiais
      var regexSpecialCharacters = /[^\w\s]/; // Expressão regular para caracteres especiais
      if (regexSpecialCharacters.test(idComp)) {
          alert("O nome não pode conter caracteres especiais.");
          return; // Aborta a execução da função
      }
  }

  // Chama a função para pesquisar componentes e atualizar a lista na página
  searchComponents(version, idComp);
});

async function searchComponents(version, idComp) {
    try {
        const response = await fetch(`/searchComponents/${version}/${idComp}`);
        const components = await response.json();

        const tbody = document.querySelector('.home-section .table_section tbody');
        tbody.innerHTML = '';

        components.forEach(component => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${component.id}</td>
                <td>${component.id_user}</td>
                <td>${component.id_comp}</td>
                <td>${component.name}</td>
                <td>${component.description}</td>
                <td>${formatarData(component.date)}</td>
                <td>
                    <button class="view-btn" data-id="${component.id}" alt="Visualizar Versões da Componente"><i class="fa-solid fa-book-open"></i></button>
                    <button class="edit-btn" data-id="${component.id}" alt="Editar Componente"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="delete-btn" data-id="${component.id}" alt="Eliminar componente"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);

            // Event listeners para botões de visualizar, editar e excluir
            tr.querySelector('.view-btn').addEventListener('click', () => {
                const id = tr.querySelector('.view-btn').getAttribute('data-id');
                // Implementar a lógica para visualizar o componente
                viewComponentVersions(id);
            });

            tr.querySelector('.edit-btn').addEventListener('click', () => {
                document.querySelector(".popup_edit").classList.add("active");
                const id = tr.querySelector('.edit-btn').getAttribute('data-id');
                const component = components.find(c => c.id == id);
                showEditComponentForm(component);
            });

            tr.querySelector('.delete-btn').addEventListener('click', () => {
                const id = tr.querySelector('.delete-btn').getAttribute('data-id');
                const confirmed = confirm('Tem certeza de que deseja excluir este componente?');
                if (confirmed) {
                    removeComponent(id);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao pesquisar componentes:', error);
    }
};
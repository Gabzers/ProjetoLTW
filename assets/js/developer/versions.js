let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
let logOut = document.querySelector("#log_out");

logOut.addEventListener("click", () => {
    // Redirecionar para a rota de logout
    window.location.href = "/logout";
});

window.addEventListener('DOMContentLoaded', function() {
  // Mostrar lista de utilizadors
  updateVersionList();
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); // calling the function(optional)
});

// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); // replacing the icons class
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); // replacing the icons class
  }
}

// Event listener para mostrar popup de versão
let showVersionBtn = document.querySelector(".show-version");
if (showVersionBtn) {
  showVersionBtn.addEventListener("click", () => {
    document.querySelector(".popup_version").classList.add("active");
  });
}

// Event listener para fechar popup de versão
let closeVersionBtn = document.querySelector(".close_version");
if (closeVersionBtn) {
  closeVersionBtn.addEventListener("click", () => {
    document.querySelector(".popup_version").classList.remove("active");
  });
}


// Função para buscar o nome do usuário atualmente logado no servidor
function getUser() {
  fetch('/getUser') // Rota para obter o nome do usuário no servidor
      .then(response => response.json())
      .then(data => {
          // Atualiza o conteúdo do elemento userName com o nome recebido do servidor
          document.getElementById('userName').innerText = data.nome;

          updateComponentVersionsTitle(data.nome);
      })
      .catch(error => console.error('Erro ao buscar o nome do usuário:', error));
}

function updateComponentVersionsTitle() {
  // Extrair o ID do componente do URL
  const urlParams = new URLSearchParams(window.location.search);
  const id_comp = urlParams.get('componentId');

  // Verificar se o ID do componente foi passado no URL
  if (!id_comp) {
    console.error('ID do componente não foi encontrado no URL.');
    return;
  }

  // Agora você pode usar o ID do componente para buscar o nome da componente
  fetch(`/getComponentName/${id_comp}`)
    .then(response => response.json())
    .then(data => {
      // Atualizar o título com o nome da componente
      const componentVersionsTitleElement = document.getElementById('componentVersionsTitle');
      if (componentVersionsTitleElement) {
        componentVersionsTitleElement.innerText = `Versões da Componente ${data.name}`;
      }
    })
    .catch(error => {
      console.error('Erro ao obter o nome da componente:', error);
    });
}



// Chama a função para buscar o nome do usuário assim que a página carrega
window.addEventListener('DOMContentLoaded', getUser);

function formatarData(data) {
  const date = new Date(data);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  const hora = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  const segundos = String(date.getSeconds()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;
}

async function updateVersionList() {
  try {
    // Extrair o ID do componente do URL
    const urlParams = new URLSearchParams(window.location.search);
    const id_comp = urlParams.get('componentId');

    // Verificar se o ID do componente foi passado no URL
    if (!id_comp) {
      console.error('ID do componente não foi encontrado no URL.');
      return;
    }

    const response = await fetch(`/getVersionsJson/${id_comp}`);
    const versions = await response.json();

    const tbody = document.querySelector('.home-section .table_section tbody');

    // Manter o conteúdo existente da tabela
    tbody.innerHTML = '';

    // Iterar sobre as versões ao contrário
    versions.reverse().forEach(version => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${version.ID}</td>
          <td>${version.Component}</td>
          <td>${version.Version}</td>
          <td>${formatarData(version.Date)}</td>
          <td>
              <button class="edit-btn" data-id="${version.ID}" alt="Editar Versão" ><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="delete-btn" data-id="${version.ID}" alt="Eliminar Versão" ><i class="fa-solid fa-trash"></i></button>
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
        const confirmed = confirm('Tem certeza de que deseja excluir esta versão?');
        if (confirmed) {
          removeVersion(id);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao carregar lista de versões:', error);
  }
}


window.addEventListener('DOMContentLoaded', function() {
  // Extrair o ID do componente da URL
  const urlParams = new URLSearchParams(window.location.search);
  const id_comp = urlParams.get('componentId');

  // Verificar se o ID do componente foi encontrado na URL
  if (id_comp) {
      // Preencher o valor do campo oculto id_comp
      document.getElementById('versionIdComp').value = id_comp;
  } else {
      console.error('ID do componente não encontrado na URL.');
  }
});

document.getElementById('versionForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const versionInput = document.getElementById('version');
  const version = versionInput.value;
  const idCompInput = document.getElementById('versionIdComp');
  const idComp = idCompInput.value;

  // Função para verificar se uma versão já existe para o componente
  function checkVersion(idComp, version) {
    return fetch(`/checkVersion/${idComp}/${version}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao verificar versão');
        }
        return response.text(); // Obtém o texto da resposta
      })
      .then(data => {
        console.log(`Response from server: ${data}`);
        return data === 'true'; // Retorna true se a resposta for 'true', caso contrário, retorna false
      })
      .catch(error => {
        console.error('Erro ao verificar versão:', error);
        throw error;
      });
  }

// Verifica se a versão já existe para o componente
checkVersion(idComp, version)
    .then(versionExists => {
        if (versionExists) {
            alert('Esta versão já existe para este componente.');
        } else {
            // Limpa mensagens de erro anteriores
            document.getElementById('versionError').textContent = '';

            // Salvar o URL atual
            const currentUrl = window.location.href;

            alert('Versão adicionada com sucesso!');

            // Envie o formulário após 0.1 segundos
            setTimeout(function() {
                document.getElementById('versionForm').submit();
            }, 100);

            // Redirecionar para o URL atual após 0.3 segundos
            setTimeout(function() {
                window.location.href = currentUrl;
            }, 300);
        }
    })
    .catch(error => console.error('Erro ao verificar versão:', error));
  });

async function removeVersion(versionId) {
  try {
      const response = await fetch(`/deleteVersion/${versionId}`, {
          method: 'DELETE'
      });
      const data = await response.json();
      alert(data.message);
      updateVersionList(); // Atualiza a lista de versões após a exclusão
  } catch (error) {
      console.error('Erro ao excluir versão:', error);
      alert('Erro ao excluir versão. Por favor, tente novamente mais tarde.');
  }
}

window.addEventListener('DOMContentLoaded', function() {
  // Extrair o ID do componente da URL
  const urlParams = new URLSearchParams(window.location.search);
  const id_comp = urlParams.get('componentId');

  // Verificar se o ID do componente foi encontrado na URL
  if (id_comp) {
      // Preencher o valor do campo oculto id_comp
      document.getElementById('versionIdComp').value = id_comp;
  } else {
      console.error('ID do componente não encontrado na URL.');
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
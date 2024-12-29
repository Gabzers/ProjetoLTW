const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Para produção, use 'true' e certifique-se de usar HTTPS
}));

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Middleware para analisar corpos de solicitação com formato urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração da conexão com o banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Deixe vazio se não tiver senha configurada
    database: 'ltw-projeto'
};

// Criar a conexão com o banco de dados
const connection = mysql.createConnection(dbConfig);

// Conectar ao banco de dados
connection.connect(function(err) {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados.');
});

// Exportar a conexão para uso em outros arquivos
module.exports = connection;

// Rota para a página de login
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.post('/ilogin', function (req, res) {
    const { login, password } = req.body;
  
    connection.query("SELECT * FROM users WHERE login = ? AND password = ?", [login, password],
      function (err, rows) {
        if (err) {
          res.status(500).send('Erro interno do servidor');
          return;
        }
  
        if (rows.length > 0) {
          const user = rows[0];
          const active = user.active;
  
          if (active === 1) {
            res.status(403).send('Esta conta está inativa.');
            return;
          }
  
          req.session.user = user;
  
          switch (user.type) {
            case 2:
              res.redirect(`/a_users.html?type=${user.type}`);
              break;
            case 1:
              res.redirect(`/d_components.html?type=${user.type}`);
              break;
            default:
              res.status(403).send('Esta conta não tem permissões para acessar esta página');
              break;
          }
        } else {
          res.status(401).send('Credenciais inválidas');
        }
      });
  });

// Rota para verificar se uma versão já existe para um componente
app.get('/checkVersion/:idComp/:version', function(req, res) {
    const idComp = req.params.idComp;
    const version = req.params.version;

    // Consulta ao banco de dados para verificar se a versão já existe para o componente
    connection.query("SELECT COUNT(*) AS count FROM version WHERE id_comp = ? AND version = ?", [idComp, version], function(err, result) {
        if (err) {
            console.error('Erro ao verificar versão:', err);
            res.status(500).send('Erro ao verificar versão.');
        } else {
            const count = result[0].count;
            if (count > 0) {
                res.send('true'); // A versão já existe para o componente
            } else {
                res.send('false'); // A versão não existe para o componente
            }
        }
    });
});


// Lidar com a inserção de uma nova conta
app.post('/iRegister', function (req, res) {
    const { login, password, nome, morada, nif, email, type } = req.body;

    connection.query("INSERT INTO users (login, password, nome, morada, nif, email, type) VALUES (?, ?, ?, ?, ?, ?, ?)", 
    [login, password, nome, morada, nif, email, type],
    function (err) {
        if (!err) {
            console.log('Conta criada com sucesso.');
        } else {
            console.log('Erro ao realizar a consulta.', err);
        }
    });
});

app.post('/iVersion', function (req, res) {
    const { id_comp, version } = req.body;

    // Log para verificar se os parâmetros do corpo da solicitação estão chegando corretamente
    console.log('ID do componente:', id_comp);
    console.log('Versão:', version);

    // Extrair o ID do componente do URL
    const urlParams = new URLSearchParams(req.headers.referer);
    const id_comp_url = urlParams.get('componentId');

    // Verifica se os valores necessários foram fornecidos e não são vazios
    if (!id_comp || !version || version.trim() === '') {
        return res.status(400).send('Todos os campos são obrigatórios: id_comp, version');
    }

    // Insere a nova versão no banco de dados
    connection.query("INSERT INTO version (id_comp, version, date) VALUES (?, ?, CURRENT_TIMESTAMP)", 
    [id_comp, version],
    function (err) {
        if (!err) {
            console.log('Versão registrada com sucesso.');
        } else {
            console.log('Erro ao registrar a versão.', err);
        }
    });
});

/* app.get('/getUser/:id', function(req, res, next) {
    var id = req.params.id;
    var query = 'SELECT * from users WHERE id = ?';
    connection.query(query, [id], function(error, data) {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).send('Erro ao buscar usuário');
            return;
        }
        res.render('sample_data', { title: 'Edit MySQL Users', action: 'Edit', sampleData: data[0] });
    });
}); */

app.post('/editUser/:id', function(req, res, next) {
    var id = req.params.id;

    // Obter os dados do corpo da requisição
    var { login, password, nome, morada, nif, email, type, active } = req.body;

    // Montar a query de atualização
    var query = 'UPDATE users SET ';
    var params = [];
    var fieldsToUpdate = [];

    if (login) {
        fieldsToUpdate.push('login = ?');
        params.push(login);
    }
    if (password) {
        fieldsToUpdate.push('password = ?');
        params.push(password);
    }
    if (nome) {
        fieldsToUpdate.push('nome = ?');
        params.push(nome);
    }
    if (morada) {
        fieldsToUpdate.push('morada = ?');
        params.push(morada);
    }
    if (nif) {
        fieldsToUpdate.push('nif = ?');
        params.push(nif);
    }
    if (email) {
        fieldsToUpdate.push('email = ?');
        params.push(email);
    }
    if (type) {
        fieldsToUpdate.push('type = ?');
        params.push(type);
    }
    if (active) {
        fieldsToUpdate.push('active = ?');
        params.push(active);
    }

    query += fieldsToUpdate.join(', ') + ' WHERE id = ?';
    params.push(id);

    // Executar a query no banco de dados
    connection.query(query, params, function(error, result) {
        if (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário.' });
            return;
        }
        // Verificar se algum registro foi afetado
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
        } else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    });
});


app.post('/iComponent', function (req, res) {
    const { id_comp, name, descricao } = req.body;

    // Verifica se o valor para 'name' é fornecido e não é vazio
    if (!name || name.trim() === '') {
        return res.status(400).send('O nome do componente é obrigatório');
    }
    
    // Verifica se o usuário está autenticado
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send('Usuário não autenticado');
    }

    const userId = req.session.user.id; // Obter o ID do usuário logado na sessão

    // Verifica se id_comp é igual a 0
    if (id_comp === '0') {
        // Insere o componente sem o id_comp
        connection.query("INSERT INTO component (id_user, name, description) VALUES (?, ?, ?)", 
        [userId, name, descricao],
        function (err) {
            if (!err) {
                console.log('Componente registrado com sucesso.');

            } else {
                console.log('Erro ao registrar o componente.', err);
            }
        });
    } else {
        // Insere o componente com o id_comp fornecido
        connection.query("INSERT INTO component (id_user, id_comp, name, description) VALUES (?, ?, ?, ?)", 
        [userId, id_comp, name, descricao],
        function (err) {
            if (!err) {
                console.log('Componente registrado com sucesso.');
            } else {
                console.log('Erro ao registrar o componente.', err);
            }
        });
    }
});

// Rota para obter dados das componentes
app.get('/getComponents', function (req, res) {
    connection.query("SELECT id, name FROM component", function (err, rows) {
        if (!err) {
            res.json(rows); // Retorna os dados das componentes em formato JSON
        } else {
            console.error('Erro ao buscar componentes:', err);
            res.status(500).send('Erro ao buscar componentes');
        }
    });
});


// Rota para obter os valores da tabela de utilizadores em formato JSON
app.get('/getUsersJson', function(req, res) {
    connection.query("SELECT id, login, nome, morada, nif, email, type, active FROM users", function(err, rows) {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar utilizadores.' });
            return;
        }

        const formattedUsers = rows.map(row => {
            let typeString;

            switch(row.type) {
                case 1:
                    typeString = 'Desenvolvedor';
                    break;
                case 2:
                    typeString = 'Administrador';
                    break;
                default:
                    typeString = 'Desconhecido';
            }

            return {
                ID: row.id,
                login: row.login,
                nome: row.nome,
                morada: row.morada,
                nif: row.nif,
                email: row.email,
                Type: typeString,
                Status: row.active ? 'Inativo' : 'Ativo'  // Verifica se `row.active` é true ou false
            };
        });

        res.status(200).json(formattedUsers);
    });
});



// Rota para obter os valores da tabela de componentes em formato JSON
app.get('/getComponentsJson', function(req, res) {
    connection.query("SELECT c.id, u.nome AS User_Name, IFNULL(c.id_comp, 'Nenhuma') AS Component_ID, c.name AS Component_Name, c.description, c.date FROM component c INNER JOIN users u ON c.id_user = u.id", function(err, rows) {
        if (err) {
            console.error('Erro ao buscar componentes:', err);
            res.status(500).json({ error: 'Erro ao buscar componentes.' });
            return;
        }

        const formattedComponents = rows.map(row => {
            return {
                ID: row.id,
                User_ID: row.User_Name,
                Component_ID: row.Component_ID === null ? 'Nenhuma' : row.Component_ID,
                Name: row.Component_Name,
                Description: row.description,
                Date: row.date
            };
        });

        res.status(200).json(formattedComponents);
    });
});

// Rota para obter as versões de um dado componente em formato JSON
app.get('/getVersionsJson/:id_comp', function(req, res) {
    const idComp = req.params.id_comp;

    connection.query("SELECT id, version, date FROM version WHERE id_comp = ?", [idComp], function(err, rows) {
        if (err) {
            console.error('Erro ao buscar versões:', err);
            res.status(500).json({ error: 'Erro ao buscar versões.' });
            return;
        }

        // Obter o nome do componente correspondente ao id_comp
        connection.query("SELECT name FROM component WHERE id = ?", [idComp], function(err, componentRow) {
            if (err) {
                console.error('Erro ao buscar nome do componente:', err);
                res.status(500).json({ error: 'Erro ao buscar nome do componente.' });
                return;
            }

            const componentName = componentRow.length > 0 ? componentRow[0].name : null;

            const formattedVersions = rows.map(row => {
                return {
                    ID: row.id,
                    Component: componentName,
                    Version: row.version,
                    Date: row.date
                };
            });

            res.status(200).json(formattedVersions);
        });
    });
});





app.get('/checkLogin/:login', function(req, res) {
    const loginToCheck = req.params.login;

    connection.query("SELECT login FROM users", function(err, rows) {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar logins.' });
            return;
        }

        const logins = rows.map(row => row.login);
        const loginExists = logins.includes(loginToCheck);

        res.status(200).json(!loginExists);
    });
});

// Rota para verificar se um componente já existe
app.get('/checkComponent/:name', function(req, res) {
    // Obter o nome do componente a ser verificado
    const nameToCheck = req.params.name;

    // Consultar a tabela de componentes para verificar se o nome já existe
    connection.query("SELECT name FROM component", function(err, rows) {
        if (err) {
            // Em caso de erro, retornar uma mensagem de erro
            res.status(500).json({ error: 'Erro ao buscar componentes.' });
            return;
        }

        // Mapear os nomes de componentes existentes
        const componentNames = rows.map(row => row.name);

        // Verificar se o nome do componente já existe
        const nameExists = componentNames.includes(nameToCheck);

        // Retornar um boolean indicando se o nome do componente já existe
        res.status(200).json(!nameExists);
    });
});


// Rota para excluir um utilizador
app.delete('/deleteUser/:userId', function(req, res) {
    const userId = req.params.userId;

    connection.query("DELETE FROM users WHERE id = ?", [userId], function(err, result) {
        if (err) {
            res.status(500).json({ message: 'Erro ao excluir utilizador.' });
            return;
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    });
});

// Rota para excluir um componente
app.delete('/deleteComponent/:componentId', function(req, res) {
    const componentId = req.params.componentId;

    connection.query("DELETE FROM component WHERE id = ?", [componentId], function(err, result) {
        if (err) {
            res.status(500).json({ message: 'Erro ao excluir componente.' });
            return;
        }
        res.status(200).json({ message: 'Componente excluído com sucesso.' });
    });
});

// Rota para excluir uma versão
app.delete('/deleteVersion/:versionId', function(req, res) {
    const versionId = req.params.versionId;

    connection.query("DELETE FROM version WHERE id = ?", [versionId], function(err, result) {
        if (err) {
            res.status(500).json({ message: 'Erro ao excluir versão.' });
            return;
        }
        res.status(200).json({ message: 'Versão excluída com sucesso.' });
    });
});

// Rota para obter o nome da componente com base no ID
app.get('/getComponentName/:id_comp', (req, res) => {
    // Extrair o ID da componente dos parâmetros da URL
    const id_comp = req.params.id_comp;
  
    // Consultar o banco de dados para obter o nome da componente com base no ID
    connection.query("SELECT name FROM component WHERE id = ?", [id_comp], function(err, rows) {
      if (err) {
        console.error('Erro ao buscar nome da componente:', err);
        res.status(500).json({ error: 'Erro ao buscar nome da componente.' });
        return;
      }
  
      // Verificar se o nome da componente foi encontrado
      if (rows.length > 0) {
        const componentName = rows[0].name;
        res.status(200).json({ name: componentName }); // Enviar o nome da componente como resposta JSON
      } else {
        res.status(404).json({ error: 'Nome da componente não encontrado' }); // Se não encontrado, enviar uma mensagem de erro
      }
    });
  });

// Rota para a página de login
app.get('/login.html', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Middleware para verificar a autenticação do usuário
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        // Se o usuário não estiver autenticado, redirecione para a página de login
        res.redirect('/login.html');
    } else {
        // Se o usuário estiver autenticado, prossiga para a próxima rota
        next();
    }
}

// Middleware para verificar a autenticação do usuário e o tipo de usuário
function requireAuthAndType(req, res, next) {
    // Verifica se o usuário está autenticado
    if (!req.session || !req.session.user) {
        // Se o usuário não estiver autenticado, redirecione para a página de login
        return res.redirect('/login.html');
    }

    const userType = req.session.user.type;

    // Verifica o tipo de usuário e redireciona de acordo com a página
    if (userType === 2 && req.originalUrl !== '/a_users.html' && req.originalUrl !== '/a_backups.html') {
        // Se o tipo for 2 (Administrador) e a página não for a_users ou a_backups, redirecione para a_users
        return res.redirect('/a_users.html');
    } else if (userType === 1 && req.originalUrl !== '/d_components.html' && req.originalUrl !== '/d_versions.html') {
        // Se o tipo for 1 (Desenvolvedor) e a página não for d_components ou d_versions, redirecione para d_components
        return res.redirect('/d_components.html');
    }

    // Se o usuário estiver autenticado e o tipo de usuário estiver correto, prossiga para a próxima rota
    next();
}

// Rota para pesquisar componentes com base no tipo e valor da pesquisa
app.get('/searchComponents/:version/:idComp', function(req, res) {
    const idComp = req.params.idComp; // ID do componente a ser pesquisado
    const version = req.params.version; // Tipo de pesquisa (0 para name, 1 para date)

    let queryString = '';
    let searchValue = '';

    // Função para garantir que a data seja formatada corretamente
    const formatDate = (dateString) => {
        return dateString.substring(0, 10); // Pegar apenas os primeiros 10 caracteres
    };

    // Construir e executar a consulta SQL com base no tipo de pesquisa
    if (version === '0') {
        queryString = "SELECT * FROM component WHERE name LIKE ?";
        searchValue = "%" + idComp + "%"; // Usando LIKE para pesquisa parcial de nome
    } else if (version === '1') {
        const formattedDate = formatDate(idComp); // Formatar a data
        queryString = "SELECT * FROM component WHERE DATE(date) = ?";
        searchValue = formattedDate; // Pesquisa direta por data com apenas os primeiros 10 caracteres
    } else {
        res.status(400).json({ error: 'Tipo de pesquisa inválido.' });
        return;
    }

    // Executar a consulta com base no tipo de pesquisa e valor
    connection.query(queryString, [searchValue], function(err, rows) {
        if (err) {
            console.error('Erro ao buscar componentes:', err);
            res.status(500).json({ error: 'Erro ao buscar componentes.' });
            return;
        }

        // Substituir id_comp por "Nenhuma" se for null
        rows.forEach(row => {
            if (row.id_comp === null) {
                row.id_comp = "Nenhuma";
            }
        });

        // Se nenhum componente for encontrado, retornar uma mensagem de alerta
        if (rows.length === 0) {
            res.status(404).json({ message: 'Nenhum componente encontrado.' });
            return;
        }

        // Enviar os resultados como resposta JSON
        res.status(200).json(rows);
    });
});













// Rota para fazer logout
app.get('/logout', function(req, res) {
    // Destrua a sessão do usuário
    req.session.destroy(function(err) {
        if(err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        // Redirecione o usuário de volta para a página de login após o logout
        res.redirect('/login.html');
    });
});

// Rotas protegidas - usar o middleware requireAuth para verificar a autenticação
app.get('/a_users.html', requireAuth, function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'a_users.html'));
});

app.get('/a_backups.html', requireAuth, function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'a_backups.html'));
});

app.get('/d_components.html', requireAuth, function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'd_components.html'));
});

app.get('/d_versions.html', requireAuth, function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'd_versions.html'));
});


// Iniciando o servidor
const server = app.listen(3000, function () {
    console.log("Servidor a funcionar na porta %s", server.address().port);
});


// Rota para obter informações do usuário
app.get('/getUser', function(req, res) {
    // Verifica se o usuário está autenticado e tem um nome definido na sessão
    if (req.session && req.session.user && req.session.user.nome) {
        // Retorna o nome do usuário no formato JSON
        res.json({ nome: req.session.user.nome });
    } else {
        // Se o usuário não estiver autenticado ou não tiver um nome definido na sessão, retorna um erro
        res.status(401).json({ error: 'Usuário não autenticado ou nome não encontrado na sessão' });
    }
});
RateStation
Descrição
RateStation é uma aplicação simples de rede social onde os usuários podem se cadastrar, fazer login, criar perfis personalizados com foto de perfil e biografia, além de editar esses dados posteriormente. A aplicação utiliza Node.js, Express, MongoDB para o backend, EJS como motor de templates e CSS para o design das páginas.
--------------------------------------------------------------------------------------------------------------------
Funcionalidades
Cadastro de usuários com foto de perfil.
Login de usuários com autenticação.
Edição de perfil, incluindo a atualização de nome de usuário, biografia e foto de perfil.
Navegação simplificada com barra de menu.
--------------------------------------------------------------------------------------------------------------------
Estrutura do Projeto
RateStation/
├── public/                    # Arquivos estáticos (CSS, imagens, etc.)
│   ├── image/                 # Imagens da interface
│   ├── style.css              # Estilos para login e signup
│   ├── style2.css             # Estilos para a página principal (home)
│   └── style3.css             # Estilos para a edição de perfil
├── uploads/                   # Fotos de perfil enviadas pelos usuários
├── views/                     # Arquivos EJS (templates)
│   ├── login.ejs              # Página de login
│   ├── signup.ejs             # Página de cadastro
│   └── home.ejs               # Página principal após login
│   └── edit-profile.ejs       # Página de edição de perfil
├── config.js                  # Configuração e conexão com MongoDB
├── index.js                   # Arquivo principal da aplicação (server)
└── package.json               # Dependências e metadados do projeto
--------------------------------------------------------------------------------------------------------------------
Instalação
Pré-requisitos
Node.js (versão 14.x ou superior)
MongoDB (instância local ou remota)
Passos para rodar o projeto
Clone o repositório:
git clone https://github.com/username/ratestation.git
cd ratestation
Instale as dependências:
npm install
Inicie o servidor MongoDB:
mongod
Execute a aplicação:
node index.js
Acesse a aplicação no navegador:
http://localhost:5000
--------------------------------------------------------------------------------------------------------------------
Endpoints Principais
GET /login - Página de login.
POST /login - Autenticação de usuário.
GET /signup - Página de cadastro de usuário.
POST /signup - Cadastro de um novo usuário.
GET /home - Página principal após o login.
GET /edit-profile - Página de edição do perfil do usuário.
POST /update-profile - Atualização das informações de perfil.
--------------------------------------------------------------------------------------------------------------------
Scripts de Banco de Dados
// Configuração do MongoDB em config.js
const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login-tut");

connect.then(() => {
    console.log("Database connected Succesfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});
--------------------------------------------------------------------------------------------------------------------
Tecnologias Utilizadas
Node.js para o servidor backend.
Express como framework web.
MongoDB para armazenamento de dados.
Multer para upload de arquivos (fotos de perfil).
Bcrypt para hash de senhas.
EJS como motor de templates.
CSS para estilização das páginas.

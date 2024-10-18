const express = require('express'); // Declare apenas uma vez
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require('multer');
const collection = require('./config');

const app = express();

// Configurar multer para salvar fotos na pasta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // A pasta 'uploads' deve existir na raiz do projeto
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome único para o arquivo
    }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir arquivos estáticos de CSS e imagens
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Acesso à pasta 'uploads'
app.use('/public', express.static(path.join(__dirname, '../public')));   // Acesso aos arquivos da pasta 'public'

// Middleware de log
app.use((req, res, next) => {
    console.log(`Requisição para: ${req.url} - Método: ${req.method}`);
    console.log("Headers:", req.headers);
    next();
});

// Configuração do EJS como motor de visualização
app.set('view engine', 'ejs');

// Rotas
app.get("/login", (req, res) => {
    res.render("login"); // Certifique-se de que você tem um arquivo login.ejs na sua pasta views
});

app.get("/home", (req, res) => {
    const username = req.query.username; // Obtenha o username da query string
    const profilePic = req.query.profilePic; // Obtenha a profilePic da query string
    res.render("home", { username: username, profilePic: profilePic });
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Nova rota para editar perfil
app.get("/edit-profile", (req, res) => {
    const username = req.query.username;
    const profilePic = req.query.profilePic;

    // Busca o usuário no banco de dados
    collection.findOne({ name: username }).then(user => {
        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }
        res.render("edit-profile", { 
            username: user.name, 
            profilePic: user.profilePic, 
            biography: user.biography // Adicione biografia aqui
        });
    }).catch(err => {
        console.error("Erro ao buscar usuário:", err);
        res.status(500).send("Erro interno do servidor.");
    });
});


// Atualizar perfil
app.post("/update-profile", upload.single('profilePic'), async (req, res) => {
    const { username, existingUsername, biography } = req.body; // Captura o novo e o existente
    const profilePic = req.file ? req.file.filename : req.body.existingProfilePic; // Mantém a imagem existente se nenhuma nova for enviada
    console.log("Existing Username:", existingUsername);
    console.log("Biografia:", biography); // Log para verificar a biografia
    try {
        // Verifica se o novo nome de usuário já existe no banco de dados
        const existingUser = await collection.findOne({ name: username });
        if (existingUser && existingUser.name !== existingUsername) {
            return res.send("Esse nome de usuário já está em uso."); // Retorna uma mensagem se o nome já existir
        }

        // Atualizar os dados do usuário no banco de dados
        const result = await collection.updateOne(
            { name: existingUsername }, // Usar o nome de usuário existente para encontrar o registro
            { $set: { name: username, profilePic: profilePic, biography: biography } } // Dados a serem atualizados
        );

        console.log("Resultado da atualização:", result); // Log para verificar o resultado da atualização

        if (result.matchedCount === 0) {
            return res.send("Usuário não encontrado. Verifique o nome de usuário."); // Confirma que o nome de usuário existe
        }

        if (result.modifiedCount === 0) {
            return res.send("Nenhuma atualização foi feita. O nome de usuário pode ser o mesmo."); // Mensagem caso não haja mudança
        }

        // Redirecionar para a página inicial passando os dados do usuário
        res.redirect(`/home?username=${username}&profilePic=${profilePic}`); // Passar dados pelo query string
    } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
        res.status(500).send("Erro ao atualizar o perfil.");
    }
});

// Registrar usuário
app.post("/signup", upload.single('profilePic'), async (req, res) => {
    console.log("Arquivo recebido:", req.file);
    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    if (!req.file) {
        return res.send("Por favor, envie uma imagem.");
    }

    const data = {
        name: req.body.username,
        password: req.body.password,
        email: req.body.email,
        profilePic: req.file ? req.file.filename : null // Nome do arquivo da imagem
    };

    console.log("Dados a serem salvos:", data);

    // Verificar se o usuário já existe no banco de dados
    const existingUser = await collection.findOne({ name: data.name });
    const existingEmail = await collection.findOne({ email: data.email });

    if (existingUser) {
        return res.send("Usuário já cadastrado.");
    }
    if (existingEmail) {
        return res.send("E-mail já cadastrado.");
    } else {
        // Hash a senha usando bcrypt
        const saltRounds = 10; // Número de rounds de sal para bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Substituir a senha original pela senha hash

        const userdata = await collection.create(data); // Mudar para create em vez de insertMany
        console.log("Usuário criado:", userdata);
        res.redirect("/login");
    }
});

// Login do usuário
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("Não conseguimos achar esse nome de usuário.");
        }

        // Comparar a senha hash do banco de dados com a senha em texto simples
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            res.redirect(`/home?username=${check.name}&profilePic=${check.profilePic}`);
        } else {
            return res.send("Senha errada.");
        }
    } catch (error) {
        console.error("Erro no login:", error);
        return res.send("Informações erradas.");
    }
});

// Iniciar o servidor
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});

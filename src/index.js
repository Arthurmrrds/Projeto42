const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require('multer');
const collection = require("./config");

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

const app = express();
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

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
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
            res.render("home", { username: check.name, profilePic: check.profilePic });
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

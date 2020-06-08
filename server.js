const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./src/database/db")

// configurar pasta pública
server.use(express.static("public"))

server.use(express.urlencoded ({ extended: true }))

// utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// configurar caminhos da minha aplicação
// pág inicial
// req: requisição e res: respost
server.get("/", (req, res) => {
    return res.render("index.html")
})

server.get ("/create-point", (req, res) => {
    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) =>{
    const query = `
        INSERT INTO places (
            img,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `
    const values = [
        req.body.img,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            return res.send('Erro no cadastro')
        }

        console.log('Cadastrado com sucesso')
        console.log(this)
    
        return res.render('create-point.html', { saved: true })
    }

    db.run(query, values, afterInsertData)
})


server.get ("/search-results", (req,res) => {
    // pegar os dados do banco de dados
    const search = req.query.search

    if(search == "") {
        return res.render ("search-results.html", { total: 0})
    }


    db.all(`SELECT * FROM places WHERE cty LIKE "%${search}%"`, function(err, rows) {
        if(err) {
            return console.log(err)
        }
        
        const total = rows.length

        // mostrar a página html com os dados do banco de dados
        return res.render("search-results.html", {places: rows, total: total})

    })

})

// ligar o servidor
server.listen(3000)
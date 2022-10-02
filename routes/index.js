var express = require('express');
const http = require('http');


var app = express();
app.use(express.static('assets'));

const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

const server = http.createServer((req, res) => {
    console.log(req.url);

    res.setHeader('Content-Type', 'text/html');
    let url1 = './views/';

    if(req.url == '/'){
        url1 += 'pages/index-main-page';
        res.statusCode = 200; 
    }else if(req.url == '/index-login-page'){
        url1 += '/index-login-page';
        res.statusCode = 200;
        res.end();
    } 

    fs.readFile(url1, (err, data) => {
        if(err){
            console.log(err);
            res.end();
        }else{
            res.end(data);
        }
    });
});

app.get('/', async function (req, res){
    let data = {
        url : req.url,
    }
    res.render('pages/index-main-page', data);
})


app.listen(3000, 'localhost', () => {
    console.log("server is running");
})
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();
const port = 4000;

// Configurar Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const ip = req.ip;
  const primeraVisita = !req.cookies.visitoAntes;

  if (primeraVisita) {
    res.cookie('visitoAntes', 'true', { maxAge: 1000 * 60 * 60 * 24 * 365 });
  }

  res.render('home', { ip, primeraVisita, title: 'Bienvenido' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

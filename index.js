const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

// Conectar a MongoDB
mongoose.connect('mongodb://adminUser:1234@mongo.ddc.lab.:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Definir esquema y modelo
const visitaSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  contador: { type: Number, default: 1 },
  ultimaVisita: { type: Date, default: Date.now }
});

const Visita = mongoose.model('Visita', visitaSchema);

// Configurar Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', async (req, res) => {
  const ip = req.ip;
  const primeraVisita = !req.cookies.visitoAntes;

  if (primeraVisita) {
    res.cookie('visitoAntes', 'true', { maxAge: 1000 * 60 * 60 * 24 * 365 }); // 1 año
  }

  try {
    const visita = await Visita.findOneAndUpdate(
      { ip },
      { $inc: { contador: 1 }, $set: { ultimaVisita: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.render('home', {
      ip,
      primeraVisita,
      contador: visita.contador,
      ultimaVisita: visita.ultimaVisita.toLocaleString(),
      title: 'Bienvenido'
    });
  } catch (error) {
    console.error('Error al guardar visita:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});

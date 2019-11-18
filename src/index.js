const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const CardSchema = require('./mongoScheme');

const {
  BinListNET,
  NeutrinoAPI,
  BinListIO,
  ServicesObjectives
} = require('./helperApis');

const { everySix } = require('./utils')

const app = express();
const PORT = process.env.PORT || 7996;
const DBURL = process.env.DBURL || 'mongodb://localhost:27017/uffa-binlookup';
mongoose.connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

/**
 * @param {object} data         Objeto que contem os dados para solvar no banco 
 * @param {number} binNumber    Numero bin do cartao
 * @param {string} db           De qual base veio
 */
function saveCardOnBase({ data, binNumber }) {
  return new Promise((resolve, reject) => {
    CardSchema.create({ ...data, binNumber }).then(newCard => {
      resolve({ ...newCard._doc });
    }).catch(err => reject({ error: true, err, description: "Was impossible create a new register, check the environment" }));
  });
};

function getFromApi(binNum) {
  return new Promise((resolve, reject) => {
    BinListNET(binNum).then(data => {
      resolve(data);
    }).catch(err => {
      NeutrinoAPI(binNum).then(data => {
        resolve(data);
      }).catch(err => {
        ServicesObjectives(binNum).then(data => {
          resolve(data);
        }).catch(err => {
          BinListIO(binNum).then(data => {
            resolve(data);
          }).catch(err => {
            reject({ ...err, message: "It's impossible found it." });
          });
        });
      });
    });
  });
};

app.get('/bin/:binNum', (req, res) => {
  let { binNum } = req.params;

  if (binNum.length < 6) return res.status(400).send({ error: true, discription: 'You must provide minimum six number on params' });

  if (binNum.length > 6) binNum = everySix(binNum);

  CardSchema.findOne({ binNumber: new RegExp(binNum) }).then(data => {

    if (data) res.send({ ...data._doc, opah_db: true });

    else {
      getFromApi(binNum).then(data => {
        saveCardOnBase({ data, binNumber: binNum }).then(data => {

          res.send(data);

        }).catch(err => res.status(500).send({ ...err, message: "Error when trying save" }));
      }).catch(err => res.status(404).send({ ...err, error: true, message: "We can't find it." }));
    }

  }).catch(err => {
    return res.send(400).send({
      err,
      error: true,
      description: 'That number are wrong you way to passed!'
    });
  });

});

app.post('/bin', (req, res) => {

  const {
    binNumber,
    scheme,
  } = req.body;  //Desestruturando os dados recebidos no Body da requisição

  if (!binNumber || !scheme) return res.status(400).send({ error: true, description: "You have to pass a bin and scheme of the card" });

  CardSchema.create(req.body).then(newCard => {
    res.send(newCard);
  }).catch(error => {
    res.status(500).send({
      error: true,
      err: error,
      message: 'Cannot made the new Bin Card register'
    });
  });
});


app.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`));
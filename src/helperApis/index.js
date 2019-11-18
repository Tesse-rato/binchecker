
const https = require("https");
const {
  everySix,
  BinListIo_parser,
  NeutrinoAPI_parser,
  ServicesObjectives_parser,
} = require("../utils");

const BinListIO = bin => ({ host: "binlist.io", path: '/lookup/' + bin + '/', headers: { "Content-Type": "application/json" } });
const BinListNET = bin => ({ host: "lookup.binlist.net", path: '/' + bin, headers: { "Accept-Version": "3" } });
const NeutrinoAPI = bin => ({
  host: "neutrinoapi.net",
  path: `/bin-lookup?bin-number=${bin}`,
  headers: {
    user_id: "bruno-opah",
    api_key: "oGdfGVxRZEBLektaHr6wbXRXY2nHaO59liBoVIG5GBllPU5W",
  }
});
const ServicesObjectives = bin => ({
  host: "trial.serviceobjects.com",
  path: `/bv/web.svc/JSON/ValidateBIN_V2?BinNumber=${bin}&LicenseKey=WS45-LKH3-TNX5`,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * 
 * @param {string} path Caminho para API
 * @param {string} host UrlBase da API
 * @param {object} headers Headers da requisição
 */
function config({ host, path, headers }) {
  return {
    host,
    path,
    headers,
    port: 443,
    method: "GET",
  }
}

/**
 * @param {string} path Caminho para API
 * @param {string} host UrlBase da API
 * @param {object} headers Headers da requisição
 * @returns {Promise} <string> Resposta do servidor
 */
function client({ host, path, headers }) {
  return new Promise((resolve, reject) => {
    const errorObj = {
      error: true,
      description: `Could not connected on https://${host + path} API`
    };
    try {
      let body = '';
      console.log(host + path);
      const httpsRequest = https.request(config({ host, path, headers }), (response) => {
        response.on('error', (err) => reject({ ...errorObj, err }));
        response.on('data', data => { body += data });
        response.on('end', () => {
          console.log(body);
          if (response.statusCode == 404) return reject(errorObj)
          else return resolve(body);
        });
      });
      httpsRequest.on('error', (err) => reject({ ...errorObj, err, message: 'Error on request' }));
      httpsRequest.end();
    } catch (err) {
      return reject({ ...errorObj, err });
    }
  });
}

exports.BinListNET = function (bin) {
  return client(BinListNET(bin)).then(string => {
    const obj = JSON.parse(string);
    obj.bank.name = obj.bank.name.toLowerCase();
    return { ...obj, origin: 'binlist.net' };
  });
}
exports.NeutrinoAPI = function (bin) {
  return new Promise((resolve, reject) => {
    return client(NeutrinoAPI(bin)).then(string => JSON.parse(string)).then(data => {
      if (data['api-error'] || !data['valid']) return reject({ message: "NotFound on Neutrino API" });
      else resolve({ binNumber: bin, ...NeutrinoAPI_parser(data) });
    }).catch(err => reject({ ...err, message: "NotFound on Neutrino API" }));
  });
}
exports.ServicesObjectives = function (bin) {
  return new Promise((resolve, reject) => {
    return client(ServicesObjectives(bin)).then(string => JSON.parse(string)).then(({ BinValidationInfoV2: data }) => {
      if (data.Status != "NotFound") resolve({ binNumber: bin, ...ServicesObjectives_parser(data) });
      else reject({ message: "NotFound on ServicesObjectives" });
    }).catch(err => reject({ err }));
  });
}
exports.BinListIO = function (bin) {
  return new Promise((resolve, reject) => {
    return client(BinListIO(bin)).then(string => JSON.parse(string)).then(data => {
      if (data.success) return resolve({ binNumber: bin, ...BinListIo_parser(data) })
      else return reject({ message: 'Not Found on binlist.Io' })
    });
  });
}

exports.client = client;
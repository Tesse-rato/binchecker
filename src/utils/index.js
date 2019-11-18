

exports.BinListIo_parser = function (data) {
  return {
    number: { length: data.number.length, luhn: data.number.luhn },
    scheme: data.scheme.toLowerCase(),
    type: data.type.toLowerCase(),
    country: {
      name: data.country.name.toLowerCase(),
    },
    bank: {
      name: data.bank.name.toLowerCase()
    },
    origin: 'binlist.io'
  }
}

exports.ServicesObjectives_parser = function (data) {
  return {
    scheme: data.Brand.toLowerCase(),
    type: data.CardType.toLowerCase(),
    country: {
      name: data.Country.toLowerCase(),
    },
    bank: {
      name: data.Bank.toLowerCase()
    },
    origin: 'serviceobjects.com'
  }
}
exports.NeutrinoAPI_parser = function (data) {
  return {
    scheme: data["card-brand"].toLowerCase(),
    type: data["card-type"].toLowerCase(),
    country: {
      name: data["country"].toLowerCase(),
    },
    origin: 'neutrinoapi.net'
  }
}

exports.everySix = function (bin) {
  return bin.split("").slice(0, 6).reduce((crr, acm) => crr + acm);
}
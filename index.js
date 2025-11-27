const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// ---------- Chargement du schéma Protobuf ----------

// Charger la définition Protobuf depuis employee.proto
const root = protobuf.loadSync('employee.proto');
// Récupérer le type "Employees" défini dans employee.proto
const EmployeeList = root.lookupType('Employees');

// ---------- Construction des données ----------

// Liste d'employés en mémoire
const employees = [];

employees.push({
  id: 1,
  name: 'Ali',
  salary: 9000
});

employees.push({
  id: 2,
  name: 'Kamal',
  salary: 22000
});

employees.push({
  id: 3,
  name: 'Amal',
  salary: 23000
});

// Objet racine compatible avec le message "Employees"
let jsonObject = { 
  employee: employees 
};

// ---------- JSON : encodage & décodage ----------

console.time('JSON encode');
let jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// ---------- XML : encodage & décodage ----------

// Options de conversion JSON -> XML
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
// Conversion XML -> JSON (texte) -> objet JS
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// ---------- Protobuf : vérification, encodage & décodage ----------

// Vérification de conformité avec le schéma Protobuf
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) {
  throw Error(errMsg);
}

console.time('Protobuf encode');
// Création du message Protobuf à partir de l'objet JS
let message = EmployeeList.create(jsonObject);
// Encodage en binaire Protobuf
let buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
// Conversion vers objet JS "classique" (optionnel)
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');

// ---------- Écriture des fichiers ----------

fs.writeFileSync('data.json', jsonData);  // JSON
fs.writeFileSync('data.xml', xmlData);    // XML
fs.writeFileSync('data.proto', buffer);   // Protobuf binaire

// ---------- Mesure des tailles des fichiers ----------

const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

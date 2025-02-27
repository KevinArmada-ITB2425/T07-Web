const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const files = ['./Aigua-imatge001.json', './Aigua-imatge002.json'];
const dataDir = path.join(__dirname, 'data');
const outputFilePath = path.join(__dirname, 'consumo_total.csv');

let allData = [];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    allData.push({
        fecha: jsonData.fecha,
        consumo_total: jsonData.consumo_total
    });
});

const csv = parse(allData, { fields: ['fecha', 'consumo_total'] });

fs.writeFileSync(outputFilePath, csv);

console.log(`CSV file has been saved to ${outputFilePath}`);
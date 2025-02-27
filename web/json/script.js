const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const files = [
    '/workspaces/testeo/web/json/Aigua-image001.json',
    '/workspaces/testeo/web/json/Aigua-imatge002.json'
];
const outputFilePath = path.join(__dirname, 'consumo_total.csv');

let allData = [];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const rawData = fs.readFileSync(file);
        const jsonData = JSON.parse(rawData);

        allData.push({
            fecha: jsonData.fecha,
            consumo_total: jsonData.consumo_total
        });
    } else {
        console.error(`Error: El archivo ${file} no existe.`);
    }
});

if (allData.length > 0) {
    const csv = parse(allData, { fields: ['fecha', 'consumo_total'] });
    fs.writeFileSync(outputFilePath, csv);
    console.log(`El archivo CSV ha sido guardado en ${outputFilePath}`);
} else {
    console.error('Error: No se encontraron datos para convertir a CSV.');
}
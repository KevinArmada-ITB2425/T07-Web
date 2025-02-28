document.addEventListener("DOMContentLoaded", () => {
    const formulari = document.getElementById("formulari-calculadora");
    const resultatsList = document.getElementById("resultats-list");
    const ctxAigua = document.getElementById("grafica-consum-aigua").getContext("2d");

    let graficaAigua;

    formulari.addEventListener("submit", async (e) => {
        e.preventDefault();

        const diesTotals = parseInt(document.getElementById("dies").value, 10);

        try {
            // Intenta cargar el archivo CSV
            const response = await fetch('./data/consumo_total.csv'); // Asegura que la ruta es correcta
            if (!response.ok) throw new Error("No se pudo cargar el archivo CSV");

            const csvData = await response.text();
            console.log("Datos del CSV recibidos:", csvData);

            // Parsear los datos del CSV
            const consums = parseCSV(csvData);
            if (consums.length === 0) throw new Error("No se encontraron datos en el CSV");

            // Calculamos la media de consumo diario
            const consumDiariMitja = calcularConsumMitja(consums);
            console.log("Consumo diario promedio:", consumDiariMitja);

            // Calculamos el consumo total para los días indicados
            const consumTotal = consumDiariMitja * diesTotals;
            console.log("Consumo total para", diesTotals, "días:", consumTotal);

            // Calculamos el consumo mensual y anual
            const consumMensual = calcularConsumoAproximado(consumTotal, diesTotals, 30);
            const consumAnual = calcularConsumoAproximado(consumTotal, diesTotals, 365);
            const consumMensualElectricitat = calcularConsumoAproximado(consumTotalElectricitat, diesTotals, 30);
            const consumAnualElectricitat = calcularConsumoAproximado(consumTotalElectricitat, diesTotals, 365);

            // Limpiamos la lista de resultados y añadimos los nuevos cálculos
            resultatsList.innerHTML = "";

            const crearElementoLista = (texto) => {
                const listItem = document.createElement("li");
                listItem.textContent = texto;
                return listItem;
            };

            resultatsList.appendChild(crearElementoLista(`Consum total en ${diesTotals} dies: ${consumTotal.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum mensual aproximat: ${consumMensual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum anual aproximat: ${consumAnual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));

            // Actualizar la gráfica
            if (graficaAigua) graficaAigua.destroy();
            graficaAigua = crearGrafica(ctxAigua, diesTotals, consumTotal, 'rgba(37, 99, 235, 0.5)', 'rgba(37, 99, 235, 1)', 'Consum total');

        } catch (error) {
            console.error('Error:', error.message);
            resultatsList.innerHTML = `<li style="color: red;">Error: ${error.message}</li>`;
        }
    });
});

// Función para parsear el CSV correctamente
function parseCSV(csvData) {
    const lines = csvData.trim().split('\n').slice(1); // Ignora la primera línea (encabezado)
    const datos = lines.map(line => {
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim()); // Elimina comillas y espacios
        if (columns.length !== 2 || isNaN(columns[1])) return null; // Evita errores en líneas vacías o datos incorrectos
        return {
            fecha: columns[0],
            consumo: parseFloat(columns[1])
        };
    }).filter(entry => entry !== null); // Filtra entradas nulas

    console.log("Datos parseados del CSV:", datos);
    return datos;
}

// Función para calcular el consumo promedio diario
function calcularConsumMitja(consums) {
    if (consums.length === 0) return 0;
    const totalConsum = consums.reduce((sum, entry) => sum + entry.consumo, 0);
    return totalConsum / consums.length;
}

// Función para calcular consumo aproximado para un periodo determinado
function calcularConsumoAproximado(consumTotal, dies, diasEnPeriodo) {
    return (consumTotal / dies) * diasEnPeriodo;
}

// Función para generar la gráfica
function crearGrafica(ctx, diesTotals, consumTotal, backgroundColor, borderColor, label) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: diesTotals }, (_, i) => i + 1),
            datasets: [{
                label: label,
                data: Array(diesTotals).fill(consumTotal / diesTotals),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

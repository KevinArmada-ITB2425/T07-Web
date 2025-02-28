document.addEventListener("DOMContentLoaded", () => {
    const formulari = document.getElementById("formulari-calculadora");
    const resultatsList = document.getElementById("resultats-list");
    const ctxAigua = document.getElementById("grafica-consum-aigua").getContext("2d");

    let graficaAigua;

    formulari.addEventListener("submit", async (e) => {
        e.preventDefault();

        const diesTotals = parseInt(document.getElementById("dies").value, 10);

        try {
            // Cargar el archivo CSV de consumo de agua
            const response = await fetch('./data/consumo_total.csv'); // Asegúrate de que la ruta es correcta
            if (!response.ok) throw new Error("No se pudo cargar el archivo CSV de consumo de agua");

            const csvData = await response.text();
            console.log("Datos del CSV de agua recibidos:", csvData);

            // Parsear los datos del CSV de agua
            const consums = parseCSV(csvData);
            if (consums.length === 0) throw new Error("No se encontraron datos en el CSV de consumo de agua");

            // Calculamos la media de consumo diario
            const consumDiariMitja = calcularConsumMitja(consums);
            console.log("Consumo diario promedio de agua:", consumDiariMitja);

            // Calculamos el consumo total para los días indicados
            const consumTotal = consumDiariMitja * diesTotals;
            console.log("Consumo total de agua para", diesTotals, "días:", consumTotal);

            // Calculamos el consumo mensual y anual
            const consumMensual = calcularConsumoAproximado(consumTotal, diesTotals, 30);
            const consumAnual = calcularConsumoAproximado(consumTotal, diesTotals, 365);

            // Ahora cargamos el archivo CSV de electricidad
            const responseElectricidad = await fetch('./data/consumo_total_kwh.csv'); // Asegura que la ruta es correcta
            if (!responseElectricidad.ok) throw new Error("No se pudo cargar el archivo CSV de consumo de electricidad");

            const csvElectricidadData = await responseElectricidad.text();
            console.log("Datos del CSV de electricidad recibidos:", csvElectricidadData);

            // Parsear los datos del CSV de electricidad
            const electricidadData = parseCSVElectricidad(csvElectricidadData);
            if (electricidadData.length === 0) throw new Error("No se encontraron datos en el CSV de electricidad");

            // Calcular el consumo total de electricidad semanal y de fin de semana
            const electricidadSetmana = calcularElectricidad(electricidadData, "electricidadSetmana");
            const electricidadCapSetmana = calcularElectricidad(electricidadData, "electricidadCapSetmana");

            // Cálculos adicionales de kWh
            const consumTotalKwh = (electricidadSetmana + electricidadCapSetmana) / 7 * diesTotals; // Estimación para el periodo indicado
            const consumMensualKwh = (electricidadSetmana + electricidadCapSetmana) / 7 * 30; // Estimación mensual
            const consumAnualKwh = (electricidadSetmana + electricidadCapSetmana) / 7 * 365; // Estimación anual

            // Limpiamos la lista de resultados y añadimos los nuevos cálculos
            resultatsList.innerHTML = "";

            const crearElementoLista = (texto) => {
                const listItem = document.createElement("li");
                listItem.textContent = texto;
                return listItem;
            };

            // Mostrar los resultados de consumo de agua
            resultatsList.appendChild(crearElementoLista(`Consum total en ${diesTotals} dies: ${consumTotal.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`));
            resultatsList.appendChild(crearElementoLista(`Consum mensual aproximat: ${consumMensual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`));
            resultatsList.appendChild(crearElementoLista(`Consum anual aproximat: ${consumAnual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`));

            // Mostrar los resultados de electricidad en kWh
            resultatsList.appendChild(crearElementoLista(`Consum total en ${diesTotals} dies: ${consumTotalKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum mensual aproximat: ${consumMensualKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum anual aproximat: ${consumAnualKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));

            // Actualizar la gráfica
            if (graficaAigua) graficaAigua.destroy();
            graficaAigua = crearGrafica(ctxAigua, diesTotals, consumTotal, 'rgba(37, 99, 235, 0.5)', 'rgba(37, 99, 235, 1)', 'Consum total');
            

        } catch (error) {
            console.error('Error:', error.message);
            resultatsList.innerHTML = `<li style="color: red;">Error: ${error.message}</li>`;
        }
    });
});

// Función para parsear el CSV de consumo de agua
function parseCSV(csvData) {
    const lines = csvData.trim().split('\n').slice(1); // Ignora la primera línea (encabezado)
    const datos = lines.map(line => {
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim()); // Elimina comillas y espacios
        if (columns.length !== 2 || isNaN(columns[1])) return null; // Validar que solo haya 2 columnas y la segunda sea numérica
        return {
            fecha: columns[0],
            consumo: parseFloat(columns[1])
        };
    }).filter(entry => entry !== null); // Filtra entradas nulas

    console.log("Datos parseados del CSV de agua:", datos);
    return datos;
}

// Función para parsear el CSV de electricidad
function parseCSVElectricidad(csvData) {
    const lines = csvData.trim().split('\n').slice(1); // Ignora la primera línea (encabezado)
    const datosElectricidad = lines.map(line => {
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim()); // Elimina comillas y espacios
        if (columns.length !== 2 || isNaN(columns[0]) || isNaN(columns[1])) return null; // Validar que haya 2 columnas y sean numéricas
        return {
            electricidadSetmana: parseFloat(columns[0]),
            electricidadCapSetmana: parseFloat(columns[1])
        };
    }).filter(entry => entry !== null); // Filtra entradas nulas

    console.log("Datos parseados del CSV de electricidad:", datosElectricidad);
    return datosElectricidad;
}

// Función para calcular el consumo promedio diario de agua
function calcularConsumMitja(consums) {
    if (consums.length === 0) return 0;
    const totalConsum = consums.reduce((sum, entry) => sum + entry.consumo, 0);
    return totalConsum / consums.length;
}

// Función para calcular consumo aproximado para un periodo determinado
function calcularConsumoAproximado(consumTotal, dies, diasEnPeriodo) {
    return (consumTotal / dies) * diasEnPeriodo;
}

// Función para calcular el total de electricidad semanal o de fin de semana
function calcularElectricidad(electricidadData, tipo) {
    const totalElectricidad = electricidadData.reduce((sum, entry) => sum + entry[tipo], 0);
    return totalElectricidad;
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

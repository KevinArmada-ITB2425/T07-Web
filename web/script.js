document.addEventListener("DOMContentLoaded", () => {
    const formulari = document.getElementById("formulari-calculadora");
    const resultatsList = document.getElementById("resultats-list");
    const ctxAigua = document.getElementById("grafica-consum-aigua").getContext("2d");
    const ctxEnergia = document.getElementById("grafica-consum-energia").getContext("2d"); // Obtener el contexto para la gráfica de energía

    let graficaAigua;
    let graficaEnergia; // Declarar la variable de la gráfica de energía

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

            // Cargar el archivo CSV de productos
            const responseProductos = await fetch('./data/productos.csv'); // Asegúrate de que la ruta es correcta
            if (!responseProductos.ok) throw new Error("No se pudo cargar el archivo CSV de productos");

            const csvProductosData = await responseProductos.text();
            console.log("Datos del CSV de productos recibidos:", csvProductosData);

            // Parsear los datos del CSV de productos
            const productosData = parseCSVProductos(csvProductosData);
            if (productosData.length === 0) throw new Error("No se encontraron datos en el CSV de productos");

            // Calcular el gasto total de productos
            const totalGasto = calcularGastoTotal(productosData, diesTotals);
            const gastoMensual = (totalGasto / diesTotals) * 30; // Corregido: uso del gasto total por los días totales
            const gastoAnual = (totalGasto / diesTotals) * 365; // Corregido: uso del gasto total por los días totales

            // Limpiamos la lista de resultados y añadimos los nuevos cálculos
            resultatsList.innerHTML = "";

            const crearElementoLista = (texto) => {
                const listItem = document.createElement("li");
                listItem.textContent = texto;
                return listItem;
            };

            // Mostrar los resultados de consumo de agua
            const crearSeccion = (titulo, items) => {
                const seccion = document.createElement("div");
                seccion.style.marginBottom = "20px";
            
                const tituloElemento = document.createElement("h3");
                tituloElemento.textContent = titulo;
                tituloElemento.style.color = "#2563eb";
                tituloElemento.style.marginBottom = "5px";
            
                const lista = document.createElement("ul");
                lista.style.listStyleType = "disc";
                lista.style.paddingLeft = "20px";
            
                items.forEach(texto => {
                    const listItem = document.createElement("li");
                    listItem.textContent = texto;
                    lista.appendChild(listItem);
                });
            
                seccion.appendChild(tituloElemento);
                seccion.appendChild(lista);
                return seccion;
            };
            
            // Limpiar la lista de resultados y agregar las secciones
            resultatsList.innerHTML = "";
            
            resultatsList.appendChild(crearSeccion("Consum d'Aigua", [
                `Consum total en ${diesTotals} dies: ${consumTotal.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`,
                `Consum mensual aproximat: ${consumMensual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`,
                `Consum anual aproximat: ${consumAnual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`
            ]));
            
            resultatsList.appendChild(crearSeccion("Consum d'Electricitat", [
                `Consum total en ${diesTotals} dies: ${consumTotalKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`,
                `Consum mensual aproximat: ${consumMensualKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`,
                `Consum anual aproximat: ${consumAnualKwh.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`
            ]));
            
            resultatsList.appendChild(crearSeccion("Gasto en Productes", [
                `Gasto total en ${diesTotals} dies: ${totalGasto.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}`,
                `Gasto mensual aproximat: ${gastoMensual.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}`,
                `Gasto anual aproximat: ${gastoAnual.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}`
            ]));

            // Actualizar la gráfica de agua
            if (graficaAigua) graficaAigua.destroy();
            graficaAigua = crearGrafica(ctxAigua, diesTotals, consumTotal, 'rgba(37, 99, 235, 0.5)', 'rgba(37, 99, 235, 1)', 'Consum total');
            
            // Actualizar la gráfica de energía
            if (graficaEnergia) graficaEnergia.destroy();
            graficaEnergia = crearGrafica(ctxEnergia, diesTotals, consumTotalKwh, 'rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)', 'Consum d\'electricitat (kWh)');

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

// Función para parsear el CSV de productos
function parseCSVProductos(csvData) {
    const lines = csvData.trim().split('\n').slice(1); // Ignora la primera línea (encabezado)
    const datosProductos = lines.map(line => {
        const columns = line.split(',').map(col => col.replace(/"/g, '').trim()); // Elimina comillas y espacios
        
        // Comprobamos si hay suficientes columnas y si la última columna tiene un precio numérico
        if (columns.length < 5 || isNaN(columns[columns.length - 1])) return null; // Validamos que haya 5 columnas mínimas y que el precio sea numérico
        
        const producto = columns[0]; // El nombre del producto está en la primera columna
        const precio = parseFloat(columns[columns.length - 1]); // El precio está en la última columna
        
        // Devolvemos un objeto con el nombre del producto y su precio
        return {
            producto: producto,
            precio: precio
        };
    }).filter(entry => entry !== null); // Filtra entradas nulas

    console.log("Datos parseados del CSV de productos:", datosProductos);
    return datosProductos;
}

// Función para calcular el gasto total de productos
function calcularGastoTotal(productosData, diasTotales) {
    const gastoMensual = productosData.reduce((sum, entry) => sum + entry.precio, 0);
    return (gastoMensual / 30) * diasTotales; // Convertimos el gasto mensual en diario y lo multiplicamos por los días indicados
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

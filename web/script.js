document.addEventListener("DOMContentLoaded", () => {
    const formulari = document.getElementById("formulari-calculadora");
    const resultatsList = document.getElementById("resultats-list");
    const ctxAigua = document.getElementById("grafica-consum-aigua").getContext("2d");

    let graficaAigua;

    formulari.addEventListener("submit", async (e) => {
        e.preventDefault();

        const diesTotals = parseInt(document.getElementById("dies").value, 10);

        try {
            const response = await fetch('./data/consumo_total.csv'); // Asegura que la ruta es correcta
            const csvData = await response.text();
            const consums = parseCSV(csvData);

            const consumDiariMitja = calcularConsumMitja(consums);
            const consumTotal = consumDiariMitja * diesTotals;

            const consumMensual = calcularConsumoAproximado(consumTotal, diesTotals, 30);
            const consumAnual = calcularConsumoAproximado(consumTotal, diesTotals, 365);

            resultatsList.innerHTML = "";

            const crearElementoLista = (texto) => {
                const listItem = document.createElement("li");
                listItem.textContent = texto;
                return listItem;
            };

            resultatsList.appendChild(crearElementoLista(`Consum total en ${diesTotals} dies: ${consumTotal.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum mensual aproximat: ${consumMensual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));
            resultatsList.appendChild(crearElementoLista(`Consum anual aproximat: ${consumAnual.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres/kWh`));

            if (graficaAigua) graficaAigua.destroy();
            graficaAigua = crearGrafica(ctxAigua, diesTotals, consumTotal, 'rgba(37, 99, 235, 0.5)', 'rgba(37, 99, 235, 1)', 'Consum total');

        } catch (error) {
            console.error('Error al llegir el fitxer CSV:', error);
            resultatsList.innerHTML = 'Error al llegir el fitxer CSV.';
        }
    });
});

function parseCSV(csvData) {
    const lines = csvData.trim().split('\n').slice(1); // Elimina la primera línea (encabezados)
    return lines.map(line => {
        const [fecha, consumo] = line.split(',');
        return {
            fecha: fecha.replace(/"/g, '').trim(), // Limpia las comillas
            consumo: parseFloat(consumo) // Convierte a número
        };
    });
}

function calcularConsumMitja(consums) {
    const totalConsum = consums.reduce((sum, entry) => sum + entry.consumo, 0);
    return totalConsum / consums.length; // Calcula el consumo promedio diario
}

function calcularConsumoAproximado(consumTotal, dies, diasEnPeriodo) {
    return (consumTotal / dies) * diasEnPeriodo;
}

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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

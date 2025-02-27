document.addEventListener("DOMContentLoaded", () => {
    const formulari = document.getElementById("formulari-calculadora");
    const resultatsList = document.getElementById("resultats-list");
    const ctxAigua = document.getElementById("grafica-consum-aigua").getContext("2d");
    const ctxEnergia = document.getElementById("grafica-consum-energia").getContext("2d");

    let graficaAigua, graficaEnergia;

    formulari.addEventListener("submit", (e) => {
        e.preventDefault();

        const diesTotals = parseInt(document.getElementById("dies").value, 10);

        fetch('./json/consumo_total.csv')
            .then(response => response.text())
            .then(csvData => {
                const consums = parseCSV(csvData);

                const consumTotalAigua = calcularConsumTotal(diesTotals, consums.aiguaSetmana, consums.aiguaCapSetmana);
                const consumTotalElectricitat = calcularConsumTotal(diesTotals, consums.electricitatSetmana, consums.electricitatCapSetmana);

                const consumMensualAigua = calcularConsumoAproximado(consumTotalAigua, diesTotals, 30);
                const consumAnualAigua = calcularConsumoAproximado(consumTotalAigua, diesTotals, 365);
                const consumMensualElectricitat = calcularConsumoAproximado(consumTotalElectricitat, diesTotals, 30);
                const consumAnualElectricitat = calcularConsumoAproximado(consumTotalElectricitat, diesTotals, 365);

                resultatsList.innerHTML = "";

                const crearElementoLista = (texto) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = texto;
                    return listItem;
                };

                resultatsList.appendChild(crearElementoLista(`Consum d'aigua en ${diesTotals} dies: ${consumTotalAigua.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres`));
                resultatsList.appendChild(crearElementoLista(`Consum d'energia en ${diesTotals} dies: ${consumTotalElectricitat.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));
                resultatsList.appendChild(crearElementoLista(`Consum mensual aproximat Aigua: ${consumMensualAigua.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres | Energia: ${consumMensualElectricitat.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));
                resultatsList.appendChild(crearElementoLista(`Consum anual aproximat Aigua: ${consumAnualAigua.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litres | Energia: ${consumAnualElectricitat.toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`));

                if (graficaAigua) graficaAigua.destroy();
                graficaAigua = crearGrafica(ctxAigua, diesTotals, consumTotalAigua, 'rgba(37, 99, 235, 0.5)', 'rgba(37, 99, 235, 1)', 'Consum d\'aigua (litres)');

                if (graficaEnergia) graficaEnergia.destroy();
                graficaEnergia = crearGrafica(ctxEnergia, diesTotals, consumTotalElectricitat, 'rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)', 'Consum d\'electricitat (kWh)');
            })
            .catch(error => {
                console.error('Error al llegir el fitxer CSV:', error);
                resultatsList.innerHTML = 'Error al llegir el fitxer CSV.';
            });
    });
});

function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');

    const consums = {
        aiguaSetmana: parseFloat(lines[1].split(',')[0]),
        aiguaCapSetmana: parseFloat(lines[1].split(',')[1]),
        electricitatSetmana: parseFloat(lines[1].split(',')[2]),
        electricitatCapSetmana: parseFloat(lines[1].split(',')[3])
    };

    return consums;
}

function calcularConsumTotal(diesTotals, consumDiaSetmana, consumDiaCapSetmana) {
    const diesCapSetmana = Math.floor(diesTotals / 7) * 2 + Math.min(diesTotals % 7, 2);
    const diesSetmana = diesTotals - diesCapSetmana;

    return (diesSetmana * consumDiaSetmana) + (diesCapSetmana * consumDiaCapSetmana);
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
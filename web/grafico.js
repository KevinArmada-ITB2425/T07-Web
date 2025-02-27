// Función para crear un gráfico de barras
function crearGrafica(ctx, dies, consumTotal, backgroundColor, borderColor, label) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [`Consum en ${dies} dies`],
            datasets: [{
                label: label,
                data: [consumTotal],
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
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calcular').addEventListener('click', calcular);
});

function calcular() {
    const dias = parseInt(document.getElementById('dias').value, 10);
    if (isNaN(dias) || dias <= 0) {
        document.getElementById('resultado').innerText = 'Por favor, introduce un número válido de días.';
        return;
    }

    document.getElementById('resultado').innerText = 'Calculando...';
    
    fetch('./json/consumo_total.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n').slice(1); // Skip the header line
            const consumos = lines.filter(line => line.trim() !== '').map(line => {
                const [fecha, consumo_total] = line.split(',');
                return parseInt(consumo_total, 10);
            });

            if (consumos.length >= 2) {
                const consumoDiario = (consumos[0] + consumos[1]) / 2;
                const resultado = consumoDiario * dias;
                document.getElementById('resultado').innerText = `El consumo total de agua para ${dias} días es: ${resultado} unidades.`;
            } else {
                document.getElementById('resultado').innerText = 'No se encontraron suficientes datos en el CSV.';
            }
        })
        .catch(error => {
            console.error('Error al leer el archivo CSV:', error);
            document.getElementById('resultado').innerText = 'Error al leer el archivo CSV.';
        });
}
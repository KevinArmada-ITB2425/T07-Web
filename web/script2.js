document.getElementById('calcular').addEventListener('click', calcular);

function calcular() {
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
                const resultado = consumos[1] * 22 + consumos[0] * 8;
                document.getElementById('resultado').innerText = `El resultado del cálculo es: ${resultado}`;
            } else {
                document.getElementById('resultado').innerText = 'No se encontraron suficientes datos en el CSV.';
            }
        })
        .catch(error => {
            console.error('Error al leer el archivo CSV:', error);
            document.getElementById('resultado').innerText = 'Error al leer el archivo CSV.';
        });
}
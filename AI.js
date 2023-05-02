const fs = require('fs');
const readline = require('readline');
const brain = require('brain.js');

const net = new brain.recurrent.LSTM({
    activation: 'leaky-relu',
    hiddenLayers: [2, 10, 20, 10]
});

const array = [];
const fileName = 'humanchat.txt';

fs.readFile('brain.json', (err, data) => {
    if (err) {
        console.log("Error reading file:", err);
        return;
    }

    if (data.toString() === '') {
        console.log("AI já está treinado"); // Colocar um aviso para saber se a AI está criada
        train();
    } else if (data) {
        net.fromJSON(JSON.parse(data.toString()));
        boot();
    } else {
        console.log("Arquivo Vazio");
    }
});

const train = () => {
    console.log("Treinando...");
    const d = new Date();
    const readStream = fs.createReadStream(fileName, 'utf8');
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        const splitLine = line.split(': ');
        if (splitLine[0] === 'Human 1') {
            array.push({
                input: splitLine[1],
                output: null
            });
        } else if (splitLine[0] === 'Human 2') {
            array[array.length - 1].output = splitLine[1];
        }
    });

    rl.on('close', () => {
        net.train(array, {
            iterations: 20000,
            log: true,
            errorThresh: 0.001,
            logPeriod: 5,
            momentum: 0.1,
            learningRate: 0.001
        });
        fs.writeFile('brain.json', JSON.stringify(net.toJSON()), (err) => {
            if (err) {
                console.log("Error writing file:", err);
                return;
            }
            console.log(`Treinamento acabou em ${(new Date() - d) / 1000} s`);
            boot();
        });
    });
};

const boot = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Escreva uma mensagem: ", (q) => {
        console.log(net.run(q));
        boot();
    });
};

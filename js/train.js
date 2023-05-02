const fs = require('fs');
const readline = require('readline');
const brain = require('brain.js');
const net = new brain.recurrent.LSTM({
    activation: 'leaky-relu'
});

const rl = readline.createInterface({
    hiddenLayers: [2, 10, 20, 10],
    input: process.stdin,
    output: process.stdout
});

const array = [];

fs.readFile('brain.json', (err, data) => {
    if (err) {
        console.log("Error reading file:", err);
        return;
    }

    if (data.toString() === '') {
        console.log("AI já está treinado") //Colocar um aviso para saber se a AI está criado
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
    const fileNames = ['humanchat.txt'];
    let fileCount = 0;
    let array = [];

    fileNames.forEach((fileName) => {
        const readStream = fs.createReadStream(fileName, 'utf8');
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            array.push(line);
        });

        rl.on('close', () => {
            fileCount++;
            if (fileCount === fileNames.length) {
                // Todos os arquivos já vão estar lidos
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
                });
            }
        });
    });
};

const boot = () => {
    rl.question("Escreva uma mensagem: ", (q) => {
        console.log(net.run(q));
        boot(); //Perguntas
    });
};

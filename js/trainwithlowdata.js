const fs = require('fs');
const readline = require('readline');
const brain = require('brain.js');
const net = new brain.recurrent.LSTM();

const rl = readline.createInterface({
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
    const fileNames = ['conversation1.txt', 'conversation2.txt', 'conversation3.txt'];
    let fileContents = '';
    let fileCount = 0;
    fileNames.forEach((fileName) => {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                console.log(`Error reading file ${fileName}: `, err);
                return;
            }
            console.log(`Data from file ${fileName}: `, data);
            fileContents += data.toString();
            fileCount++;
            if (fileCount === fileNames.length) {
                // Todos os arquivos já vai estar lidos
                const array = fileContents.split('.'); //Nós estamos separando por cada sentença
                net.train(array, {
                    iterations: 10000,
                    log: true,
                    errorThresh: 0.001,
                    logPeriod: 50,
                    momentum: 0.1,
                    learningRate: 0.01
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
}

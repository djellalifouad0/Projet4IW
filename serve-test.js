const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/test-chat.html') {
        const filePath = path.join(__dirname, 'test-chat.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erreur serveur');
                return;
            }
            
            res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page non trouvée');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log(`📱 Ouvrez http://localhost:${PORT} dans votre navigateur`);
    console.log(`🔌 Assurez-vous que le serveur WebSocket tourne sur le port 5000`);
});

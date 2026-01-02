const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
    ws.on("message", msg => {
        // repassa pra todo mundo
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg.toString());
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Rodando na porta", PORT);
});

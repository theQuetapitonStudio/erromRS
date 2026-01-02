const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const MSG_FILE = "messages.json";
let messages = fs.existsSync(MSG_FILE)
    ? JSON.parse(fs.readFileSync(MSG_FILE))
    : [];

function saveMessages() {
    fs.writeFileSync(MSG_FILE, JSON.stringify(messages, null, 2));
}

wss.on("connection", ws => {
    ws.send(JSON.stringify({ type: "history", data: messages }));

    ws.on("message", msg => {
        const data = JSON.parse(msg.toString());
        messages.push(data);
        saveMessages();

        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "message", data }));
            }
        }
    });
});

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    res.json({
        url: "/uploads/" + req.file.filename
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Rodando na porta", PORT));

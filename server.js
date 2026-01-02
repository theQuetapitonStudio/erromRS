const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ===== WEBSOCKET (chat + webrtc signaling)
wss.on("connection", ws => {
    ws.on("message", msg => {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg.toString());
            }
        }
    });
});

// ===== UPLOAD (100MB)
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ url: "/uploads/" + req.file.filename });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
    console.log("Rodando na porta", PORT)
);

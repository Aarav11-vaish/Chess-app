import { useState, useEffect } from 'react';

function usesocket() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000");

        ws.onopen = () => {
            console.log("Connected to server");
            setSocket(ws);
        };

        ws.onclose = () => {
            console.log("Disconnected from server");
            setSocket(null);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return socket;
}

export default usesocket;

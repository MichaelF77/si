function calculateSocketFromHost(host) {
    if (!host) {
        return "ws://127.0.0.1:4000/ws";
    }
    const hostParts = host.split("/");
    const hostName = hostParts[2]; // Extract the hostname from the URL
    return `ws://${hostName}/ws`;
}

export const generatePlayerSummary = (players, player_id) => {
    return (
        <div>
            {players?.map((player) => {
                const isCurrentPlayer = player.player_id === player_id;
                return (
                    <div key={player.player_id}>
                        {isCurrentPlayer && (<strong >{player.name} (You) : {player.score}</strong>)}
                        {!isCurrentPlayer && (<p >{player.name} (You) : {player.score}</p>)}
                    </div>
                )

            })}
        </div>
    )
};



export const handleHostLoop = (name, setHostData, setScreen, setGameStatus, screen, host_or_game_id = null, host = null) => {


    // Open a WebSocket connection
    const socket = new WebSocket(calculateSocketFromHost(host));

    socket.onopen = () => {
        console.log("WebSocket connection opened");

        // Send JSON message with action and host_name
        if (screen === "start") {
            const message = {
                action: "start_game",
                host_name: name,
                host_id: host_or_game_id,
            };
            socket.send(JSON.stringify(message));
            console.log("Message sent:", message);
        } else if (screen === "reconnect") {
            const message = {
                action: "host_reconnect",
                game_id: host_or_game_id,
            };
            socket.send(JSON.stringify(message));
            console.log("Message sent:", message);
        }
    };

    socket.onmessage = (message) => {
        try {
            console.log("Message received:", message);
            let data = message.data;
            console.log("Data received:", data);
            data = data.replace(/'/g, '"');
            data = JSON.parse(data);

            if (screen === "start" || screen === "reconnect") {
                // Save host data and navigate to Host Screen
                if (data.host) {
                    console.log("Host:", data['host']);
                    setHostData(data.host); // Save host details
                    setScreen("host"); // Switch to Host Screen
                }
                console.log("Message received:", data);
            }
            try {
                if (data.status) {
                    console.log("setting status", data.status);
                    setGameStatus(data.status); // Update game status
                }
            } catch (error) {
                console.error("Error processing incoming status update:", error);
            }
        } catch (error) {
            console.error("Error processing incoming message:", error);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };

    return function (message) {
        socket.send(JSON.stringify(message));
        console.log("Message sent:", message);
    }

};

export const handleSubmitHost = (event, name, setHostData, setScreen, setGameStatus, screen, host_id = null, host = null) => {
    event.preventDefault(); // Prevent default form submission behavior
    handleHostLoop(name, setHostData, setScreen, setGameStatus, screen, host_id, host);
    return;
}


export const handlePlayerLoop = (name, gameID, setGameStatus, player_id = null, host = null) => {

    // Open a WebSocket connection
    const socket = new WebSocket(calculateSocketFromHost(host));

    socket.onopen = () => {
        console.log("WebSocket connection opened");

        // Send JSON message with action and host_name
        const message = {
            "action": "register",
            "name": name,
            "game_id": gameID,
            "player_id": player_id,
        };
        socket.send(JSON.stringify(message));
        console.log("Message sent:", message);
    };

    socket.onmessage = (message) => {
        try {
            console.log("Message received:", message);
            let data = message.data;
            console.log("Data received:", data);
            data = data.replace(/'/g, '"');
            data = JSON.parse(data);


            try {
                if (data.status) {
                    console.log("setting status", data.status);
                    setGameStatus(data.status); // Update game status
                }
            } catch (error) {
                console.error("Error processing incoming status update:", error);
            }
        } catch (error) {
            console.error("Error processing incoming message:", error);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };

    return function (message) {
        socket.send(JSON.stringify(message));
        console.log("Message sent:", message);
    }
};


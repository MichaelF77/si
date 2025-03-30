import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

function LoginForm({ onLogin }) {

    const [userToken, setUserToken] = useState('');
    const [gameToken, setGameToken] = useState('10001');
    const [roundsNum, setRoundsNum] = useState(8);
    const [hostName, setHostName] = useState('');
    const [playerName, setPlayerName] = useState(generateRandomString(5));
    const [hostEmail, setHostEmail] = useState('');

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            const response = await axios.post('/auth', {
                token: userToken,
                player_data: {
                    name: playerName,
                    game_token: gameToken,
                },
                user_data: {
                    name: hostName,
                    email: hostEmail,
                },
            });

            const { token } = response.data;
            Cookies.set('authToken', token);
            sessionStorage.setItem('authToken', token);
            onLogin();
        } catch (err) {

            setError('Invalid credentials');

        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div class="container">
                <h2>Начать Новую Игру</h2>
                <input
                type="text"
                value={userToken}
                onChange={(e) => setUserToken(e.target.value)}
                placeholder="Enter User Token"
            />

                <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Имя Ведущего"
            />
            <input
                type="email"
                value={hostEmail}
                onChange={(e) => setHostEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                type="text"
                value={roundsNum}
                onChange={(e) => setUserToken(e.target.value)}
                placeholder="Количество тем"
            />
                <button type="submit">Start Game</button>
            </div>

            <div class="container">
                <h2>Присоединиться к игре</h2>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Имя Игрока"
                />
                <input
                type="text"
                value={gameToken}
                onChange={(e) => setGameToken(e.target.value)}
                placeholder="Токен Игры"
                />
                <button  type="submit">Присоединиться</button>
            </div>
        </form>
    );
}

export default LoginForm;
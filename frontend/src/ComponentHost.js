import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useTranslation } from "react-i18next";
import "./i18n"; // Import i18n initialization

import callAPI from './callAPI';
import { handleLoop as handleHostLoop, performStatusUpdate } from "./gameFlow";
import RoundStatsTable from "./RoundStatsTable";
import GameSettingsCollector from "./GameSettingsCollector";
import { GameStatsDisplay, GameHeaderDisplay } from "./GameStatsDisplay";


const POSSIBLE_STATES = {
    AUTO_START: 'AUTO_START',
    NOT_EXIST: 'NOT_EXIST',
    STARTED: 'STARTED',
    ENDED: 'ENDED'

}



function ComponentHost({ startGame, newGameSettings }) {
    const { t, i18n } = useTranslation(); // Hook for translations

    const [gameState, setGameState] = useState(startGame ? POSSIBLE_STATES.AUTO_START : POSSIBLE_STATES.NOT_EXIST);
    const [loading, setLoading] = useState(false);


    const [name, setName] = useState(t("defaultGameName")); // Name input value (default: AAA)
    const [hostData, setHostData] = useState(null); // Stores host data from the WebSocket
    const [gameStatus, setGameStatus] = useState(null); // Stores game status updates from the WebSocket


    const [reconnectGameToken, setReconnectGameToken] = useState(null); // Stores game ID for reconnection
    const [gameSettings, setGameSettings] = useState(newGameSettings); // Stores game settings

    const messanger = useRef(null);
    const currentGameID = useRef(null); // Ref to store the current game ID



    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang); // Change language dynamically
    };

    const reloadGameStatus = async () => {
        setLoading(true);
        try {
            if (currentGameID.current) {
                const data = await callAPI(`/api/host/game/${currentGameID.current}`);
                if (data && data.status?.game_id) {
                    setGameStatus(data.status);
                }
            }
        } catch (error) {
            console.error('Error setting data:', error);
        }
        finally {
            setLoading(false);
        }
    };


    const switchStatus = (status) => {
        if (status === 'host') {
            setGameState(POSSIBLE_STATES.STARTED);
        }
    };
    const safeSetGameStatus = (propsedNewStatus) => {
        setGameStatus((prevStatus) => ({
            ...prevStatus,
            ...propsedNewStatus
        }));
    };

    const switchGameStatus = (status) => {
        performStatusUpdate({
            status: status,
            setGameStatus: safeSetGameStatus,
            ignoreGameCheck: false,
            currentGameID: currentGameID,
            reloadGameStatus: reloadGameStatus
        });
    };

    const handleSwitchHostData = (data) => {
        if (data?.game_id) {
            currentGameID.current = data.game_id;
        }
        setHostData(data);
    };





    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleCreateGame = async () => {
        try {
            const data = await callAPI(`/api/host`);
            const hostID = data.id;
            const messanger_handler = handleHostLoop(name, handleSwitchHostData, switchStatus, switchGameStatus, 'start', hostID, null,
                { number_of_rounds: gameSettings?.numRounds, round_names: gameSettings?.roundNames },
                window.location.href
            );
            messanger.current = messanger_handler; // Save the messanger function to state

        } catch (error) {
            console.error('Error setting data:', error);
        }
    }

    const handleReconnectGame = async () => {
        try {
            const data = await callAPI(`/api/host/game/${reconnectGameToken}`);
            if (data && data.status?.game_id) {
                const gameIDToUse = data.status.game_id
                currentGameID.current = gameIDToUse;
                setGameStatus(data.status);
                const messanger_handler = handleHostLoop(name, handleSwitchHostData, switchStatus, switchGameStatus, 'reconnect', null, gameIDToUse,
                    {},
                    window.location.href
                )
                messanger.current = messanger_handler; // Save the messanger function to state
            }
        } catch (error) {
            console.error('Error setting data:', error);
        }
    }




    const sendMessage = useCallback((message) => {
        if (messanger.current) {
            message.game_id = currentGameID.current;
            messanger.current(message);
        } else {
            console.error('Messanger is not initialized yet.');
        }
    }, [currentGameID, messanger]);

    const handleEndGame = async () => {
        sendMessage({
            action: "finish_game",
        });
        setGameState(POSSIBLE_STATES.ENDED);
    }

    const handleSetRoundNamesDuringGame = async () => {
        sendMessage({
            action: "set_round_names",
            round_names: gameSettings.roundNames,
        });
    }



    // call handleCreateGame when startGame is true
    useEffect(() => {
        if (gameState === POSSIBLE_STATES.AUTO_START) {
            setGameState(POSSIBLE_STATES.NOT_EXIST);
            setName("Default Game")
            handleCreateGame();
        }
    }, [gameState, handleCreateGame]);


    const logout = () => {
        // Clear the token and redirect to login page
        sessionStorage.removeItem('authToken');
        window.location.reload();
    }

    return (
        <div>
            <h2>{t("hostInterface")}</h2>
            {false && (
                <div>
                    <button onClick={() => handleLanguageChange("en")}>English</button>
                    <button onClick={() => handleLanguageChange("ru")}>Русский</button>
                </div>
            )}
            <div className="top-bar">
                <button onClick={logout} className="leave-button">{t("logout")}</button>
                <GameStatsDisplay t={t} gameStats={gameStatus} />
            </div>

            {(gameState === POSSIBLE_STATES.NOT_EXIST || gameState === POSSIBLE_STATES.ENDED) && (
                <div>
                    <p>{t("createNewGame")}</p>

                    <GameSettingsCollector
                        t={t}
                        fireSendUpdatedGameSettings={() => { }}
                        allowSetRoundNumber={true}
                        setGameSettings={setGameSettings}
                        gameSettings={gameSettings}
                    />
                    <button onClick={handleCreateGame}>{t("createGame")}</button>
                    <br />
                    <p>{t("reconnectGame")}</p>
                    <input
                        type="text"
                        placeholder={t("gameTokenPlaceholder")}
                        value={reconnectGameToken}
                        onChange={(e) => setReconnectGameToken(e.target.value)}
                    />
                    <button onClick={handleReconnectGame}>{t("reconnectGame")}</button>
                    <button onClick={logout}>{t("quitToLogin")}</button>
                </div>
            )}

            {gameState === POSSIBLE_STATES.STARTED && (
                <div>
                    <p>{t("hostToken")}: {sessionStorage.getItem('authToken')}, {t("gameToken")}: {hostData?.token}</p>
                    <GameHeaderDisplay t={t} gameStatus={gameStatus} />

                    {gameStatus?.question_state === "running" && (
                        <div>
                            <p>{t("timeRemaining")}: {gameStatus.time_left} {t("seconds")}</p>
                            <button onClick={() => sendMessage({ action: "start_timer" })}>{t("startTimer")}</button>
                        </div>
                    )}

                    {gameStatus?.question_state === "answering" && (
                        <div>
                            {gameStatus.responders?.length && (
                                <div>
                                    <p>{t("answeringFor")}: {gameStatus.nominal}</p>
                                    <p>{t("firstButton")}: {gameStatus.responders[0].name}</p>
                                    <button onClick={() => sendMessage({
                                        action: "host_decision",
                                        host_decision: "accept"
                                    })}>{t("correct")}</button>
                                    <button onClick={() => sendMessage({
                                        action: "host_decision",
                                        host_decision: "decline"
                                    })}>{t("wrong")}</button>
                                    <button onClick={() => sendMessage({
                                        action: "host_decision",
                                        host_decision: "cancel"
                                    })}>{t("cancel")}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}


            {gameStatus?.current_round_stats &&
                <RoundStatsTable
                    data={gameStatus?.current_round_stats}
                    number_of_question_in_round={gameStatus?.number_of_question_in_round}
                    nominals={gameStatus?.nominals} />}

            {gameState === POSSIBLE_STATES.STARTED && (
                <div>
                    <GameSettingsCollector
                        t={t}
                        fireSendUpdatedGameSettings={handleSetRoundNamesDuringGame}
                        allowSetRoundNumber={false}
                        setGameSettings={setGameSettings}
                        gameSettings={gameSettings}
                    />

                    <button onClick={handleEndGame}>{t("endGame")}</button>
                </div>
            )}



            {loading && <p>{t("loading")}</p>}


        </div>
    );
}

export default ComponentHost;
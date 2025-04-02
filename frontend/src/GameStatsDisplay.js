export function GameStatsDisplay({ t, gameStats }) {
    return (
        <div>
            <span>⏳ {t("lag")}: {gameStats?.lag?.toFixed(2)} ms</span>
            <span>🎮 {t("gameToken")}: {gameStats?.game_token}</span>
        </div>
    );
}

export function GameHeaderDisplay({ t, gameStatus }) {
    return (
        <h2>{t("round")}: {gameStatus?.current_round + 1}: {gameStatus?.round_name} {t("question")}: {gameStatus?.current_nominal}</h2>

    );
}


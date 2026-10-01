import { useEffect, useRef, useState } from "react";

import GameScene from "./components/GameScene";
import Icon from "./components/Icon";

import { loadLevels } from "./data/gameData";
import type { Level } from "./types/gameTypes";

import { useAuth } from "./hooks/useAuth";

import { useLeaderboard } from "./hooks/useLeaderboard";

export default function App() {
  const [levels, setLevels] = useState<Level[] | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [loadAttempt, setLoadAttempt] = useState(0);

  const [currentLevel, setCurrentLevel] = useState(0);

  const [playerName, setPlayerName] = useState("");

  const [points, setPoints] = useState(0);

  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const awardedLevels = useRef(new Set<number>());

  const { user, authLoading, signingIn, signInForTesting } = useAuth();

  const { leaderboardMessage, submittingScore, submitLeaderboardScore } =
    useLeaderboard(user, points);

  useEffect(() => {
    let active = true;

    setLevels(null);
    setLoadError(null);

    loadLevels()
      .then((loadedLevels) => {
        if (active) {
          setLevels(loadedLevels);
          setCurrentLevel(0);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load game levels:", error);

        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Unknown loading error.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  async function awardLevel(levelNumber: number) {
    if (!levels || awardedLevels.current.has(levelNumber)) {
      return;
    }

    awardedLevels.current.add(levelNumber);

    const pointsEarned = 50;

    const newTotalPoints = points + pointsEarned;

    setPoints(newTotalPoints);

    setCompletedLevels((current) =>
      current.includes(levelNumber) ? current : [...current, levelNumber],
    );

    const isFinalLevel = levelNumber === levels[levels.length - 1].id;

    if (isFinalLevel && user) {
      try {
        await submitLeaderboardScore(newTotalPoints);
      } catch (error) {
        console.error("Could not submit final score:", error);
      }
    }
  }

  function deductPoints(amount: number) {
    setPoints((value) => Math.max(0, value - amount));
  }

  function deductPointsForWrongAnswer() {
    deductPoints(10);
  }

  function goToNextLevel() {
    if (!levels) {
      return;
    }

    setCurrentLevel((current) => Math.min(current + 1, levels.length - 1));
  }

  function goBackToGames() {
    window.history.back();
  }

  if (!levels) {
    return (
      <div className="portal-game-shell">
        <main className="portal-load-state" aria-live="polite">
          <h1>{loadError ? "Could not load game content" : "Loading game content..."}</h1>
          {loadError && (
            <>
              <p>{loadError}</p>
              <button
                className="button button-teal"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              >
                Retry loading
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="portal-game-shell">
      <header className="portal-topbar">
        <div className="portal-title-group">
          <button
            type="button"
            className="portal-back-button"
            onClick={goBackToGames}
            aria-label="Back to Zat.am games"
          >
            <Icon name="arrow" size={20} />
            <span>Back</span>
          </button>

          <div className="portal-mark">सं</div>

          <div>
            <span className="portal-kicker">Sanskrit Dialogue</span>

            <strong>Conversation Game</strong>
          </div>
        </div>

        <div className="portal-user-area">
          {authLoading ? (
            <div className="portal-stat">
              <strong>Checking user...</strong>
            </div>
          ) : user ? (
            <div className="portal-stat">
              <strong>{user.displayName || user.email || "Signed in"}</strong>
            </div>
          ) : (
            <button
              className="button button-teal"
              onClick={signInForTesting}
              disabled={signingIn}
            >
              {signingIn ? "Signing in..." : "Zat.am Login"}
            </button>
          )}

          {playerName && (
            <div className="portal-stat">
              <strong>{playerName}</strong>
            </div>
          )}

          <div className="portal-stat">
            <Icon name="points" size={18} />

            <strong>{points}</strong>

            <span>Points</span>
          </div>

          <button
            className="portal-settings-button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label="Settings"
          >
            <Icon name="settings" size={21} />
          </button>
        </div>
      </header>

      <div className="portal-body">
        <aside className="level-sidebar">
          <div className="level-sidebar-header">
            <div>
              <span>LEVELS</span>

              <strong>Select a scenario</strong>
            </div>

            <small>
              {completedLevels.length}/{levels.length}
            </small>
          </div>

          <div className="level-sidebar-scroll">
            {levels.map((level, index) => {
              const active = index === currentLevel;

              const complete = completedLevels.includes(level.id);

              const unlocked =
                index === 0 || completedLevels.includes(levels[index - 1].id);

              const locked = !unlocked;

              return (
                <button
                  key={level.id}
                  className={`level-sidebar-card${active ? " active" : ""}${
                    locked ? " locked" : ""
                  }`}
                  disabled={locked}
                  aria-disabled={locked}
                  aria-label={
                    locked
                      ? `${level.title} ${level.subtitle} locked`
                      : `${level.title} ${level.subtitle}`
                  }
                  onClick={() => {
                    if (locked) {
                      return;
                    }

                    setCurrentLevel(index);
                  }}
                >
                  <div
                    className="level-sidebar-thumb"
                    style={{
                      backgroundImage: `url(${level.thumbnailImage})`,
                    }}
                  >
                    <span className="level-sidebar-number">
                      {String(level.id).padStart(2, "0")}
                    </span>

                    {complete ? (
                      <span className="level-sidebar-complete">
                        <Icon name="check" size={15} />
                      </span>
                    ) : locked ? (
                      <span className="level-sidebar-lock">
                        <Icon name="lock" size={16} />
                      </span>
                    ) : null}
                  </div>

                  <div className="level-sidebar-copy">
                    <small>{level.title}</small>

                    <strong>{level.subtitle.replace("The ", "")}</strong>

                    <span>
                      {locked
                        ? "Locked"
                        : `${Object.keys(level.nodes).length} dialogue nodes`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="portal-game-main">
          <GameScene
            key={currentLevel}
            levels={levels}
            levelIndex={currentLevel}
            userName={playerName}
            onNameChange={setPlayerName}
            points={points}
            onLevelComplete={awardLevel}
            onWrongAnswer={deductPointsForWrongAnswer}
            onHintUsed={deductPoints}
            onNextLevel={goToNextLevel}
            onExit={goBackToGames}
            externalSettingsOpen={settingsOpen}
            onExternalSettingsClose={() => setSettingsOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}

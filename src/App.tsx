import { useRef, useState } from 'react';

import GameScene from './components/GameScene';
import Icon from './components/Icon';

import { LEVELS } from './data/gameData';

import {
  useAuth,
} from './hooks/useAuth';

import {
  useLeaderboard,
} from './hooks/useLeaderboard';

export default function App() {
  const [
    currentLevel,
    setCurrentLevel,
  ] = useState(0);

  const [
    playerName,
    setPlayerName,
  ] = useState('');

  const [
    points,
    setPoints,
  ] = useState(0);

  const [
    stars,
    setStars,
  ] = useState(0);

  const [
    completedLevels,
    setCompletedLevels,
  ] = useState<number[]>([]);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const awardedLevels =
    useRef(new Set<number>());

const {
  user,
  authLoading,
  signingIn,
  signInForTesting,
} = useAuth();

  const {
    leaderboardMessage,
    submittingScore,
    submitLeaderboardScore,
  } = useLeaderboard(
    user,
    points
  );

async function awardLevel(
  levelNumber: number
) {
  if (
    awardedLevels.current.has(
      levelNumber
    )
  ) {
    return;
  }

  awardedLevels.current.add(
    levelNumber
  );

  const pointsEarned = 50;

  const newTotalPoints =
    points + pointsEarned;

  setPoints(
    newTotalPoints
  );

  setStars(
    value => value + 3
  );

  setCompletedLevels(
    current =>
      current.includes(
        levelNumber
      )
        ? current
        : [
            ...current,
            levelNumber,
          ]
  );

  const isFinalLevel =
    levelNumber ===
    LEVELS[
      LEVELS.length - 1
    ].id;

  if (
    isFinalLevel &&
    user
  ) {
    try {
      await submitLeaderboardScore(
        newTotalPoints
      );
    } catch (error) {
      console.error(
        'Could not submit final score:',
        error
      );
    }
  }
}

  function deductPoints(
    amount: number
  ) {
    setPoints(
      value =>
        Math.max(
          0,
          value - amount
        )
    );
  }

  function deductPointsForWrongAnswer() {
    deductPoints(10);
  }

  function goToNextLevel() {
    setCurrentLevel(
      current =>
        Math.min(
          current + 1,
          LEVELS.length - 1
        )
    );
  }

  return (
    <div className="portal-game-shell">

      <header className="portal-topbar">

        <div className="portal-title-group">

          <div className="portal-mark">
            सं
          </div>

          <div>
            <span className="portal-kicker">
              Sanskrit Dialogue
            </span>

            <strong>
              Conversation Game
            </strong>
          </div>

        </div>

        <div className="portal-user-area">
          {authLoading ? (
  <div className="portal-stat">
    <strong>Checking user...</strong>
  </div>
) : user ? (
  <div className="portal-stat">
    <strong>
      {user.displayName ||
        user.email ||
        'Signed in'}
    </strong>
  </div>
) : (
  <button
    className="button button-teal"
    onClick={signInForTesting}
    disabled={signingIn}
  >
    {signingIn
      ? 'Signing in...'
      : 'Test Zat.am Login'}
  </button>
)}

          {playerName && (
            <div className="portal-stat">
              <strong>
                {playerName}
              </strong>
            </div>
          )}

          <div className="portal-stat">
            <Icon
              name="points"
              size={18}
            />

            <strong>
              {points}
            </strong>

            <span>
              Points
            </span>
          </div>

          <div className="portal-stat">
            <Icon
              name="star"
              size={18}
            />

            <strong>
              {stars}
            </strong>

            <span>
              Stars
            </span>
          </div>

          <button
            className="portal-settings-button"
            onClick={() =>
              setSettingsOpen(
                open => !open
              )
            }
            aria-label="Settings"
          >
            <Icon
              name="settings"
              size={21}
            />
          </button>

        </div>

      </header>

      <div className="portal-body">

        <aside className="level-sidebar">

          <div className="level-sidebar-header">

            <div>
              <span>
                LEVELS
              </span>

              <strong>
                Select a scenario
              </strong>
            </div>

            <small>
              {completedLevels.length}/
              {LEVELS.length}
            </small>

          </div>

          <div className="level-sidebar-scroll">

            {LEVELS.map(
              (
                level,
                index
              ) => {
                const active =
                  index ===
                  currentLevel;

                const complete =
                  completedLevels.includes(
                    level.id
                  );

                return (
                  <button
                    key={
                      level.id
                    }
                    className={
                      `level-sidebar-card${
                        active
                          ? ' active'
                          : ''
                      }`
                    }
                    onClick={() =>
                      setCurrentLevel(
                        index
                      )
                    }
                  >

                    <div
                      className="level-sidebar-thumb"
                      style={{
                        backgroundImage:
                          `url(${level.thumbnailImage})`,
                      }}
                    >

                      <span className="level-sidebar-number">
                        {String(
                          level.id
                        ).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      {complete && (
                        <span className="level-sidebar-complete">
                          <Icon
                            name="check"
                            size={
                              15
                            }
                          />
                        </span>
                      )}

                    </div>

                    <div className="level-sidebar-copy">

                      <small>
                        {
                          level.title
                        }
                      </small>

                      <strong>
                        {level.subtitle.replace(
                          'The ',
                          ''
                        )}
                      </strong>

                      <span>
                        {
                          Object.keys(
                            level.nodes
                          ).length
                        }{' '}
                        dialogue nodes
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </aside>

        <main className="portal-game-main">

          <GameScene
            key={
              currentLevel
            }
            levelIndex={
              currentLevel
            }
            userName={
              playerName
            }
            onNameChange={
              setPlayerName
            }
            points={
              points
            }
            stars={
              stars
            }
            onLevelComplete={
              awardLevel
            }
            onWrongAnswer={
              deductPointsForWrongAnswer
            }
            onHintUsed={
              deductPoints
            }
            onNextLevel={
              goToNextLevel
            }
            onExit={() => {}}
            externalSettingsOpen={
              settingsOpen
            }
            onExternalSettingsClose={() =>
              setSettingsOpen(
                false
              )
            }
          />

        </main>

      </div>

    </div>
  );
}

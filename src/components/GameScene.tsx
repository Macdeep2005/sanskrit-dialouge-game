import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Choice,
  LEVELS,
  DialogueNode,
} from '../data/gameData';

import CharacterSprite from './CharacterSprite';
import LevelComplete from './LevelComplete';
import Icon from './Icon';

import {
  transliterateNameToDevanagari,
} from '../utils/transliterateName';

import '../styles/game.css';

function shuffleChoices(
  choices: Choice[]
) {
  const shuffledChoices =
    [...choices];

  for (
    let index =
      shuffledChoices.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() *
      (index + 1)
    );

    [
      shuffledChoices[index],
      shuffledChoices[randomIndex],
    ] = [
      shuffledChoices[randomIndex],
      shuffledChoices[index],
    ];
  }

  return shuffledChoices;
}

interface GameSceneProps {
  levelIndex: number;

  userName: string;

  onNameChange:
    (name: string) => void;

  points: number;
  stars: number;

  onNextLevel?: () => void;

  onExit: () => void;

  onLevelComplete:
    (levelNumber: number) => void;

  onWrongAnswer: () => void;

  onHintUsed:
    (cost: number) => void;

  externalSettingsOpen?: boolean;

  onExternalSettingsClose?: () => void;
}

export default function GameScene({
  levelIndex,
  userName,
  onNameChange,
  points,
  stars,
  onNextLevel,
  onExit,
  onLevelComplete,
  onWrongAnswer,
  onHintUsed,
  externalSettingsOpen = false,
  onExternalSettingsClose,
}: GameSceneProps) {

  const level =
    LEVELS[levelIndex];

  const [
    nameInput,
    setNameInput,
  ] = useState('');

  const [
    sanskritName,
    setSanskritName,
  ] = useState('');

  const [
    nameLoading,
    setNameLoading,
  ] = useState(false);

  const [
    nameError,
    setNameError,
  ] = useState('');

  const [
    currentNodeId,
    setCurrentNodeId,
  ] = useState(
    level.startNodeId
  );

  const [
    showComplete,
    setShowComplete,
  ] = useState(false);

  const [volume, setVolume] =
    useState(80);

  const [textSize, setTextSize] =
    useState(0);

  const [
    playingAudio,
    setPlayingAudio,
  ] = useState<
    string | null
  >(null);

  const [
    wrongChoice,
    setWrongChoice,
  ] = useState<
    Choice | null
  >(null);

  const [
    choiceShuffleVersion,
    setChoiceShuffleVersion,
  ] = useState(0);

  const [
    englishHintShown,
    setEnglishHintShown,
  ] = useState(false);

  const [
    answerHintShown,
    setAnswerHintShown,
  ] = useState(false);

  const [
    mistakes,
    setMistakes,
  ] = useState<string[]>([]);

  const [
    reviewMode,
    setReviewMode,
  ] = useState(false);

  const [
    showReviewPopup,
    setShowReviewPopup,
  ] = useState(false);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const node: DialogueNode =
    level.nodes[currentNodeId];

  const isLastLevel =
    levelIndex ===
    LEVELS.length - 1;

  const nextLevel =
    !isLastLevel
      ? LEVELS[levelIndex + 1]
      : null;

  const correctChoice =
    node.choices.find(
      choice =>
        choice.isCorrect
    );

  const displayedChoices = useMemo(
    () => shuffleChoices(
      node.choices
    ),
    [
      level.id,
      currentNodeId,
      choiceShuffleVersion,
    ]
  );

  const sceneClass =
    `game-scene game-level-${level.id}${
      textSize === 1
        ? ' game-large-text'
        : ''
    }`;

  useEffect(() => {
    setCurrentNodeId(
      level.startNodeId
    );

    setShowComplete(false);
    setWrongChoice(null);

    setMistakes([]);
    setReviewMode(false);

    setShowReviewPopup(false);

    setNameError('');

    stopAudio();

  }, [levelIndex]);

  useEffect(() => {
    setEnglishHintShown(false);
    setAnswerHintShown(false);
  }, [currentNodeId, levelIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    return () =>
      audioRef.current?.pause();
  }, []);

  function fillVariables(
    text: string
  ) {
    return text
      .split(
        '{name}',
      ).join(userName)
      .split(
        '{sanskritName}',
      ).join(sanskritName);
  }

  async function submitName() {

    const cleanName =
      nameInput.trim();

    if (!cleanName) {
      setNameError(
        'Please enter your name.'
      );
      return;
    }

    setNameLoading(true);
    setNameError('');

    try {

      const convertedName =
        await transliterateNameToDevanagari(
          cleanName
        );

      onNameChange(cleanName);

      setSanskritName(
        convertedName
      );

      setCurrentNodeId('i2');

    } catch (error) {

      setNameError(
        'We could not convert your name right now. Please try again.'
      );

    } finally {
      setNameLoading(false);
    }
  }

  function playAudio(
    id: string,
    audioPath: string
  ) {

    if (!audioPath) return;

    if (
      playingAudio === id &&
      audioRef.current
    ) {

      audioRef.current.pause();

      audioRef.current.currentTime =
        0;

      audioRef.current = null;

      setPlayingAudio(null);

      return;
    }

    audioRef.current?.pause();

    const audio =
      new Audio(audioPath);

    audio.volume =
      volume / 100;

    audioRef.current =
      audio;

    setPlayingAudio(id);

    audio.onended = () =>
      setPlayingAudio(null);

    audio.onerror = () =>
      setPlayingAudio(null);

    audio
      .play()
      .catch(() =>
        setPlayingAudio(null)
      );
  }

  function completeLevel() {

    onLevelComplete(
      level.id
    );

    setShowComplete(true);
  }

  function advanceChoice(
    nextNodeId:
      string | 'END'
  ) {

    if (
      nextNodeId === 'END'
    ) {

      if (
        mistakes.length > 0 &&
        !reviewMode
      ) {

        setWrongChoice(null);

        setShowReviewPopup(
          true
        );

        return;
      }

      completeLevel();

      return;
    }

    setCurrentNodeId(
      nextNodeId
    );
  }

  function startMistakeReview() {

    if (
      mistakes.length === 0
    ) {

      setShowReviewPopup(
        false
      );

      completeLevel();

      return;
    }

    setShowReviewPopup(false);

    setReviewMode(true);

    setWrongChoice(null);

    setCurrentNodeId(
      mistakes[0]
    );
  }

  function handleChoice(
    choice: Choice
  ) {

    if (
      choice.isCorrect ===
      false
    ) {

      stopAudio();

      onWrongAnswer();

      setMistakes(
        current => {

          if (
            current.includes(
              currentNodeId
            )
          ) {
            return current;
          }

          return [
            ...current,
            currentNodeId,
          ];
        }
      );

      setWrongChoice(choice);

      return;
    }

    if (reviewMode) {

      const remainingMistakes =
        mistakes.filter(
          mistakeId =>
            mistakeId !==
            currentNodeId
        );

      setMistakes(
        remainingMistakes
      );

      setWrongChoice(null);

      if (
        remainingMistakes.length >
        0
      ) {

        setCurrentNodeId(
          remainingMistakes[0]
        );

      } else {

        setReviewMode(false);

        completeLevel();
      }

      return;
    }

    setWrongChoice(null);

    advanceChoice(
      choice.nextNodeId
    );
  }

  function handleRetry() {
    setWrongChoice(null);

    setChoiceShuffleVersion(
      current => current + 1
    );
  }

  function showEnglishHint() {
    if (englishHintShown) {
      return;
    }

    onHintUsed(5);
    setEnglishHintShown(true);
  }

  function showAnswerHint() {
    if (answerHintShown || !correctChoice) {
      return;
    }

    onHintUsed(10);
    setAnswerHintShown(true);
  }

  function handleRecovery() {

    if (
      !wrongChoice ||
      wrongChoice.nextNodeId ===
        'END'
    ) {
      return;
    }

    setWrongChoice(null);

    setCurrentNodeId(
      wrongChoice.nextNodeId
    );
  }

  function stopAudio() {

    audioRef.current?.pause();

    if (
      audioRef.current
    ) {
      audioRef.current.currentTime =
        0;
    }

    audioRef.current = null;

    setPlayingAudio(null);
  }

  function handleReplay() {

    stopAudio();

    setCurrentNodeId(
      level.startNodeId
    );

    setShowComplete(false);

    setWrongChoice(null);

    setMistakes([]);

    setReviewMode(false);

    setShowReviewPopup(
      false
    );

    setEnglishHintShown(false);
    setAnswerHintShown(false);
  }

  function handleNext() {

    stopAudio();

    if (onNextLevel) {
      onNextLevel();
    } else {
      onExit();
    }
  }

  return (
    <section
      className={sceneClass}
      style={{
        backgroundImage:
          `linear-gradient(
            to bottom,
            rgba(10,5,30,0.05),
            rgba(10,5,30,0.15) 55%,
            rgba(10,5,30,0.72)
          ),
          url('${node.backgroundImage}')`,
      }}
    >

      <div className="game-shade" />

      {reviewMode && (
        <div className="review-mode-badge">
          Review your mistake
        </div>
      )}

      <div className="scene-level-badge">

        <span>
          {String(
            level.id
          ).padStart(2, '0')}
        </span>

        <div>
          <small>
            {level.title}
          </small>

          <strong>
            {level.subtitle}
          </strong>
        </div>

      </div>

      {externalSettingsOpen && (
        <aside className="game-settings-panel portal-settings-panel">

          <div className="settings-heading">

            <h3>
              Settings
            </h3>

            <button
              onClick={
                onExternalSettingsClose
              }
              aria-label="Close settings"
            >
              <Icon name="close" />
            </button>

          </div>

          <label className="settings-control">

            <span>
              Master volume

              <strong>
                {volume}%
              </strong>
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={
                event =>
                  setVolume(
                    Number(
                      event.target.value
                    )
                  )
              }
            />

          </label>

        </aside>
      )}

      <div className="character-slot character-player">
        <CharacterSprite
          src={node.playerSprite}
          alt="Player"
        />
      </div>

      <div className="character-slot character-npc">
        <CharacterSprite
          src={node.npcSprite}
          alt={node.speaker}
          flipped
        />
      </div>

     

      <div
        className="npc-dialogue-wrap"
        key={
          `${currentNodeId}-bubble`
        }
      >

        <article className="npc-dialogue">

          <div className="dialogue-speaker">
            {node.speaker}
          </div>

          <div className="dialogue-content">

            <div>

              <p className="dialogue-sanskrit">
                {fillVariables(
                  node.npcText
                )}
              </p>

              {englishHintShown && (
                <p className="dialogue-english">
                  {fillVariables(
                    node.npcTranslation
                  )}
                </p>
              )}

            </div>

            {node.npcAudioPath && (
              <button
                className={
                  `audio-button${
                    playingAudio ===
                    'npc'
                      ? ' audio-playing'
                      : ''
                  }`
                }
                onClick={() =>
                  playAudio(
                    'npc',
                    node.npcAudioPath
                  )
                }
                aria-label="Play NPC audio"
              >
                <Icon
                  name="volume"
                  size={22}
                />
              </button>
            )}

          </div>

        </article>

      </div>

      <div className="choice-area">

        <div className="choice-label">
          {node.requiresNameInput
            ? 'Enter your name'
            : reviewMode
            ? 'Try again'
            : 'Choose your response'}
        </div>

        {!node.requiresNameInput &&
          !wrongChoice && (
          <div
            className="hint-controls"
            aria-label="Hints"
          >
            <span>
              <Icon
                name="book"
                size={17}
              />
              Hints
            </span>

            <button
              onClick={showEnglishHint}
              disabled={englishHintShown}
            >
              {englishHintShown
                ? 'English shown'
                : 'Show English −5'}
            </button>

            {correctChoice && (
              <button
                onClick={showAnswerHint}
                disabled={answerHintShown}
              >
                {answerHintShown
                  ? 'Answer shown'
                  : 'Show answer −10'}
              </button>
            )}
          </div>
        )}

        {answerHintShown &&
          correctChoice && (
          <aside className="answer-hint">
            <span>Correct response</span>
            <strong>
              {fillVariables(
                correctChoice.choiceText
              )}
            </strong>
            <small>
              {fillVariables(
                correctChoice.choiceTranslation
              )}
            </small>
          </aside>
        )}

        {node.requiresNameInput ? (

          <div className="name-entry-box">

            <input
              type="text"
              value={nameInput}
              onChange={event =>
                setNameInput(
                  event.target.value
                )
              }
              placeholder="Enter your name in English"
              maxLength={40}
              disabled={
                nameLoading
              }
              onKeyDown={event => {

                if (
                  event.key ===
                  'Enter'
                ) {
                  submitName();
                }

              }}
            />

            <button
              className="button button-teal"
              onClick={
                submitName
              }
              disabled={
                nameLoading ||
                !nameInput.trim()
              }
            >

              {nameLoading
                ? 'Converting...'
                : 'Continue'}

              {!nameLoading && (
                <Icon
                  name="arrow"
                  size={19}
                />
              )}

            </button>

            {nameError && (
              <p className="name-entry-error">
                {nameError}
              </p>
            )}

          </div>

        ) : wrongChoice ? (

          <article
            className="wrong-feedback"
            role="alert"
          >

            <div className="wrong-feedback-heading">

              <span>
                −10 points
              </span>

              <h2>
                Not quite
              </h2>

            </div>

            <p>
              {wrongChoice.feedback ??
                'That response does not fit this conversation.'}
            </p>

            {correctChoice && (
              <div className="better-response">

                <span>
                  Better response
                </span>

                <strong>
                  {fillVariables(
                    correctChoice.choiceText
                  )}
                </strong>

                <small>
                  {fillVariables(
                    correctChoice.choiceTranslation
                  )}
                </small>

              </div>
            )}

            <div className="wrong-feedback-actions">

              <button
                className="button button-secondary"
                onClick={
                  handleRetry
                }
              >

                <Icon
                  name="replay"
                  size={19}
                />

                Try Again

              </button>

              {wrongChoice.nextNodeId !==
                'END' && (

                <button
                  className="button button-teal"
                  onClick={
                    handleRecovery
                  }
                >

                  Continue with help

                  <Icon
                    name="arrow"
                    size={19}
                  />

                </button>

              )}

            </div>

          </article>

        ) : node.choices.length ===
          0 ? (

          <button
            className="finish-level-button"
            onClick={
              completeLevel
            }
          >

            Finish Level

            <Icon
              name="check"
              size={22}
            />

          </button>

        ) : (

          <div className="choice-grid">

            {displayedChoices.map(
              (choice, index) => (

                <article
                  className={
                    `choice-card choice-${index + 1}`
                  }
                  key={
                    choice.id
                  }
                >

                  <button
                    className="choice-main"
                    onClick={() =>
                      handleChoice(
                        choice
                      )
                    }
                  >

                    <span className="choice-letter">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span className="choice-copy">

                      <strong>
                        {fillVariables(
                          choice.choiceText
                        )}
                      </strong>

                      {englishHintShown && (
                        <small>
                          {fillVariables(
                            choice.choiceTranslation
                          )}
                        </small>
                      )}

                    </span>

                    <Icon
                      name="arrow"
                      size={22}
                    />

                  </button>

                  {choice.choiceAudioPath && (
                    <button
                      className={
                        `choice-audio${
                          playingAudio ===
                          choice.id
                            ? ' audio-playing'
                            : ''
                        }`
                      }
                      onClick={() =>
                        playAudio(
                          choice.id,
                          choice.choiceAudioPath
                        )
                      }
                      aria-label="Play answer audio"
                    >

                      <Icon
                        name="volume"
                        size={21}
                      />

                    </button>
                  )}

                </article>

              )
            )}

          </div>

        )}

      </div>

      {showReviewPopup && (

        <div className="review-popup-overlay">

          <div className="review-popup">

            <div className="review-popup-icon">
              <Icon
                name="replay"
                size={28}
              />
            </div>

            <h2>
              Let's review your mistakes
            </h2>

            <p>
              You made{' '}
              {mistakes.length}{' '}
              {mistakes.length === 1
                ? 'mistake'
                : 'mistakes'}.
              {' '}
              Let's try them again
              before completing the
              level.
            </p>

            <button
              className="button button-teal"
              onClick={
                startMistakeReview
              }
            >

              Start Review

              <Icon
                name="arrow"
                size={19}
              />

            </button>

          </div>

        </div>

      )}

      {showComplete && (

        <LevelComplete
          levelNum={level.id}
          isLastLevel={
            isLastLevel
          }
          nextLevelName={
            nextLevel?.subtitle ??
            ''
          }
          totalPoints={
            points
          }
          totalStars={
            stars
          }
          onReplay={
            handleReplay
          }
          onNext={
            handleNext
          }
          onMenu={() =>
            setShowComplete(
              false
            )
          }
        />

      )}

    </section>
  );
}

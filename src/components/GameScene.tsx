import { useEffect, useRef, useState } from 'react';
import { Choice, LEVELS, DialogueNode } from '../data/gameData';
import CharacterSprite from './CharacterSprite';
import LevelComplete from './LevelComplete';
import Icon from './Icon';
import '../styles/game.css';

interface GameSceneProps {
  levelIndex: number;
  userName: string;
  points: number;
  stars: number;
  onNextLevel?: () => void;
  onExit: () => void;
  onLevelComplete: (levelNumber: number) => void;
  onWrongAnswer: () => void;
  externalSettingsOpen?: boolean;
  onExternalSettingsClose?: () => void;
}

export default function GameScene({
  levelIndex,
  userName,
  points,
  stars,
  onNextLevel,
  onExit,
  onLevelComplete,
  onWrongAnswer,
  externalSettingsOpen = false,
  onExternalSettingsClose,
}: GameSceneProps) {
  const level = LEVELS[levelIndex];
  const [currentNodeId, setCurrentNodeId] = useState(level.startNodeId);
  const [showComplete, setShowComplete] = useState(false);
  const [volume, setVolume] = useState(80);
  const [textSize, setTextSize] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [wrongChoice, setWrongChoice] = useState<Choice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const node: DialogueNode = level.nodes[currentNodeId];
  const isLastLevel = levelIndex === LEVELS.length - 1;
  const nextLevel = !isLastLevel ? LEVELS[levelIndex + 1] : null;
  const correctChoice = node.choices.find(choice => choice.isCorrect);
  const sceneClass = `game-scene game-level-${level.id}${textSize === 1 ? ' game-large-text' : ''}`;

  useEffect(() => {
    setCurrentNodeId(level.startNodeId);
    setShowComplete(false);
    setWrongChoice(null);
    stopAudio();
  }, [levelIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  function playAudio(id: string, audioPath: string) {
    if (playingAudio === id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setPlayingAudio(null);
      return;
    }

    audioRef.current?.pause();

    const audio = new Audio(audioPath);
    audio.volume = volume / 100;
    audioRef.current = audio;
    setPlayingAudio(id);

    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => setPlayingAudio(null);

    audio.play().catch(() => setPlayingAudio(null));
  }

  function completeLevel() {
    onLevelComplete(level.id);
    setShowComplete(true);
  }

  function advanceChoice(nextNodeId: string | 'END') {
    if (nextNodeId === 'END') {
      completeLevel();
      return;
    }

    setCurrentNodeId(nextNodeId);
  }

  function handleChoice(choice: Choice) {
    if (choice.isCorrect === false) {
      stopAudio();
      onWrongAnswer();
      setWrongChoice(choice);
      return;
    }

    advanceChoice(choice.nextNodeId);
  }

  function handleRetry() {
    setWrongChoice(null);
  }

  function handleRecovery() {
    if (!wrongChoice || wrongChoice.nextNodeId === 'END') return;

    setWrongChoice(null);
    setCurrentNodeId(wrongChoice.nextNodeId);
  }

  function stopAudio() {
    audioRef.current?.pause();

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }

    audioRef.current = null;
    setPlayingAudio(null);
  }

  function handleReplay() {
    stopAudio();
    setCurrentNodeId(level.startNodeId);
    setShowComplete(false);
    setWrongChoice(null);
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
    <section className={sceneClass}>
      <div className="game-shade" />

      <div className="scene-level-badge">
        <span>0{level.id}</span>

        <div>
          <small>{level.title}</small>
          <strong>{level.subtitle}</strong>
        </div>
      </div>

      {externalSettingsOpen && (
        <aside className="game-settings-panel portal-settings-panel">
          <div className="settings-heading">
            <h3>Settings</h3>

            <button
              onClick={onExternalSettingsClose}
              aria-label="Close settings"
            >
              <Icon name="close" />
            </button>
          </div>

          <label className="settings-control">
            <span>
              Master volume
              <strong>{volume}%</strong>
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={event =>
                setVolume(Number(event.target.value))
              }
            />
          </label>

          <div className="settings-control">
            <span>Text size</span>

            <div className="text-size-buttons">
              <button
                className={textSize === 0 ? 'active' : ''}
                onClick={() => setTextSize(0)}
              >
                Normal
              </button>

              <button
                className={textSize === 1 ? 'active' : ''}
                onClick={() => setTextSize(1)}
              >
                Large
              </button>
            </div>
          </div>

          <p className="settings-tip">
            Put your MP3 files inside public/audio and use the speaker
            buttons to hear each Sanskrit line.
          </p>
        </aside>
      )}

      <div className="character-stage">
        <div className="character-slot character-player">
          <CharacterSprite type={node.playerSprite} />
        </div>

        <div className="character-slot character-npc">
          <CharacterSprite type={node.npcSprite} flipped />
        </div>
      </div>

      <div
        className="npc-dialogue-wrap"
        key={`${currentNodeId}-bubble`}
      >
        <article className="npc-dialogue">
          <div className="dialogue-speaker">
            {node.speaker}
          </div>

          <div className="dialogue-content">
            <div>
              <p className="dialogue-sanskrit">
                {node.npcText}
              </p>

              <p className="dialogue-english">
                {node.npcTranslation}
              </p>
            </div>

            <button
              className={`audio-button${
                playingAudio === 'npc'
                  ? ' audio-playing'
                  : ''
              }`}
              onClick={() =>
                playAudio('npc', node.npcAudioPath)
              }
              aria-label="Play NPC audio"
            >
              <Icon name="volume" size={22} />
            </button>
          </div>
        </article>
      </div>

      <div className="choice-area">
        <div className="choice-label">
          Choose your response
        </div>

        {wrongChoice ? (
          <article className="wrong-feedback" role="alert">
            <div className="wrong-feedback-heading">
              <span>−10 points</span>
              <h2>Not quite</h2>
            </div>

            <p>{wrongChoice.feedback ?? 'That response does not fit this conversation.'}</p>

            {correctChoice && (
              <div className="better-response">
                <span>Better response</span>
                <strong>{correctChoice.choiceText}</strong>
                <small>{correctChoice.choiceTranslation}</small>
              </div>
            )}

            <div className="wrong-feedback-actions">
              <button className="button button-secondary" onClick={handleRetry}>
                <Icon name="replay" size={19} />
                Try again
              </button>

              {wrongChoice.nextNodeId !== 'END' && (
                <button className="button button-teal" onClick={handleRecovery}>
                  Continue with help
                  <Icon name="arrow" size={19} />
                </button>
              )}
            </div>
          </article>
        ) : node.choices.length === 0 ? (
          <button
            className="finish-level-button"
            onClick={completeLevel}
          >
            Finish Level
            <Icon name="check" size={22} />
          </button>
        ) : (
          <div className="choice-grid">
            {node.choices.map((choice, index) => (
              <article
                className={`choice-card choice-${index + 1}`}
                key={choice.id}
              >
                <button
                  className="choice-main"
                  onClick={() =>
                    handleChoice(choice)
                  }
                >
                  <span className="choice-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="choice-copy">
                    <strong>{choice.choiceText}</strong>
                    <small>{choice.choiceTranslation}</small>
                  </span>

                  <Icon name="arrow" size={22} />
                </button>

                <button
                  className={`choice-audio${
                    playingAudio === choice.id
                      ? ' audio-playing'
                      : ''
                  }`}
                  onClick={() =>
                    playAudio(
                      choice.id,
                      choice.choiceAudioPath
                    )
                  }
                  aria-label={`Play ${choice.choiceTranslation}`}
                >
                  <Icon name="volume" size={21} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {showComplete && (
        <LevelComplete
          levelNum={level.id}
          isLastLevel={isLastLevel}
          nextLevelName={nextLevel?.subtitle ?? ''}
          totalPoints={points}
          totalStars={stars}
          onReplay={handleReplay}
          onNext={handleNext}
          onMenu={() => setShowComplete(false)}
        />
      )}
    </section>
  );
}

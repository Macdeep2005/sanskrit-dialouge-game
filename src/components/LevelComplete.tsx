import Icon from './Icon';

interface LevelCompleteProps {
  levelNum: number;
  isLastLevel: boolean;
  nextLevelName: string;
  totalPoints: number;
  totalStars: number;
  onReplay: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export default function LevelComplete({ levelNum, isLastLevel, nextLevelName, totalPoints, totalStars, onReplay, onNext, onMenu }: LevelCompleteProps) {
  return (
    <div className="complete-overlay">
      <section className="complete-card">
        <div className="complete-check"><Icon name="check" size={36} /></div>
        <div className="complete-heading">
          <p>Conversation complete</p>
          <h2>Level {levelNum} Finished</h2>
          <span>You completed the branching conversation.</span>
        </div>

        <div className="complete-stars" aria-label="3 stars earned">
          <Icon name="star" size={42} /><Icon name="star" size={52} /><Icon name="star" size={42} />
        </div>

        <div className="complete-stats">
          <div><Icon name="points" size={24} /><span>Total points</span><strong>{totalPoints}</strong></div>
          <div><Icon name="star" size={24} /><span>Total stars</span><strong>{totalStars}</strong></div>
        </div>

        <div className="complete-actions">
          <button className="button button-secondary" onClick={onReplay}><Icon name="replay" size={20} />Play Again</button>
          {!isLastLevel
            ? <button className="button button-primary" onClick={onNext}>Next: {nextLevelName.replace('The ', '')}<Icon name="arrow" size={20} /></button>
            : <div className="complete-final-message">All current levels are complete.</div>}
          <button className="complete-menu-button" onClick={onMenu}>Back to Level Select</button>
        </div>
      </section>
    </div>
  );
}

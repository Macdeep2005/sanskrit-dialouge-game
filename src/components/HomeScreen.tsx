import Icon from "./Icon";

interface HomeScreenProps {
  onStart: () => void;
}

const steps = [
  {
    number: "01",
    title: "Listen",
    description: "Read each Sanskrit line before responding.",
    icon: "volume" as const,
  },
  {
    number: "02",
    title: "Choose",
    description: "Make dialogue choices and follow each story.",
    icon: "arrow" as const,
  },
  {
    number: "03",
    title: "Progress",
    description: "Earn points and stars as you complete scenarios.",
    icon: "star" as const,
  },
];

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-orb home-orb-left" aria-hidden="true" />
      <div className="home-orb home-orb-right" aria-hidden="true" />

      <section className="home-card" aria-labelledby="home-title">
        <div className="home-title-row">
          <div className="home-mark" aria-hidden="true">
            सं
          </div>

          <div>
            <p className="home-kicker">Learn through conversation</p>
            <h1 id="home-title">
              Sanskrit Dialogue <span>Game</span>
            </h1>
            <p className="home-sanskrit">संस्कृत संवाद</p>
          </div>
        </div>

        <div className="home-steps">
          {steps.map((step) => (
            <article className="home-step" key={step.number}>
              <div>
                <span>{step.number}</span>
                <Icon name={step.icon} size={19} />
              </div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <button
          className="button button-primary home-start-button"
          onClick={onStart}
        >
          <Icon name="play" size={21} />
          Start Playing
        </button>
      </section>
    </main>
  );
}

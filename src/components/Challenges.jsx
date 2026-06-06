import challengesImg from "../../docs/images/challenges.png";

export default function Challenges() {
  const items = [
    {
      number: "01",
      title: "Low Productivity",
      text: "Outdated farming techniques and lack of data lead to suboptimal yields, wasting land potential and water resources.",
      delay: "0.1s",
    },
    {
      number: "02",
      title: "Inefficient Resource Management",
      text: "High input costs and blind application of fertilizers drain profitability and harm the surrounding ecosystem.",
      delay: "0.2s",
    },
    {
      number: "03",
      title: "Late Disease Detection",
      text: "Relying on manual inspection means outbreaks are caught after the damage is irreversible, devastating entire harvests.",
      delay: "0.3s",
    },
  ];

  return (
    <section className="challenges" id="challenges">
      <div className="challenges-inner">
        
        {/* Left Side: Just the Image */}
        <div className="challenges-media reveal">
          <img src={challengesImg} alt="Farming Challenges" />
        </div>

        {/* Right Side: Header + Overlapping Content Box */}
        <div className="challenges-content-box reveal" style={{ transitionDelay: "0.1s" }}>
          <div className="challenges-header">
            <h2>Challenges Facing Modern Farmers</h2>
            <p>
              Small-scale farmers struggle with obstacles that limit their success
              and threaten global food security.
            </p>
          </div>

          <div className="challenge-list">
            {items.map((item) => (
              <div className="challenge-item" key={item.title}>
                <div className="challenge-number">{item.number}</div>
                <div className="challenge-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

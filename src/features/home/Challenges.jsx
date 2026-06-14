import challengesImg from "../../../docs/images/challenges.png";

export default function Challenges() {
  const items = [
    {
      number: "01",
      title: "Disease Outbreaks",
      text: "Late detection of crop diseases leads to widespread damage and crop loss. Farmers lack accessible tools to quickly identify and treat plant health issues before it's too late.",
      delay: "0.1s",
    },
    {
      number: "02",
      title: "High Distribution Costs",
      text: "Inefficient delivery routes waste fuel and time, cutting into already thin profit margins and delaying fresh produce from reaching markets.",
      delay: "0.2s",
    },
    {
      number: "03",
      title: "Resource Inefficiency",
      text: "Blind application of water, fertilizer, and labor drives up production costs while offering little insight into optimal resource allocation for maximum profitability.",
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

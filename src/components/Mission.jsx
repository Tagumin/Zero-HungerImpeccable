export default function Mission() {
  const items = [
    {
      title: "Maximize Harvest Yields",
      text: "Unlock the full potential of every acre. Our AI models predict optimal planting windows and resource allocation to push yields beyond historical limits.",
    },
    {
      title: "Outsmart the Elements",
      text: "Stay three steps ahead of pests, disease, and extreme weather with predictive alerts that protect your bottom line.",
    },
    {
      title: "Democratize Agronomy",
      text: "Put a world-class agronomist in the pocket of every farmer, translating complex soil data into simple, actionable daily steps.",
    },
    {
      title: "Regenerate the Earth",
      text: "Leave the land better than you found it. We make regenerative, eco-friendly farming both highly scalable and deeply profitable.",
    },
  ];

  return (
    <section className="mission">
      <div className="mission-inner">
        <div className="mission-left reveal">
          <h2 className="section-title-sticky">Our Mission</h2>
          <p className="mission-lead">
            We are building the future of farming—empowering growers with
            data-driven insights to feed a growing world.
          </p>
        </div>
        <div className="mission-right">
          <div className="mission-list">
            {items.map((item, index) => (
              <div 
                className="mission-item reveal" 
                key={item.title}
              >
                <div className="mission-item-num">0{index + 1}</div>
                <div className="mission-item-content">
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
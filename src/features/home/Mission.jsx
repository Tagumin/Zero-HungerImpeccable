export default function Mission() {
  const items = [
    {
      title: "Detect Disease Early",
      text: "Identify crop diseases before they spread. Our visual disease detection system helps farmers diagnose problems instantly and take action to protect their harvest.",
    },
    {
      title: "Optimize Distribution Routes",
      text: "Cut fuel costs and delivery time with intelligent route planning. Our ACO algorithm finds the most efficient paths to deliver produce from farm to market.",
    },
    {
      title: "Minimize Production Costs",
      text: "Maximize profit margins with data-driven resource allocation. Our optimization engine balances water, fertilizer, and labor to reduce costs while maintaining yield.",
    },
    {
      title: "Empower Every Farmer",
      text: "Make precision agriculture accessible to all. We deliver professional-grade farming intelligence through simple, actionable tools that work for farms of any size.",
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

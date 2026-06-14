export default function About() {
  const cards = [
    {
      img: "../../../frontend/dist/images/food_security.jpg",
      alt: "Reduce Post-Harvest Loss",
      title: "Reduce Post-Harvest Loss",
      text: "Optimize distribution routes and detect disease early to minimize crop waste and ensure more food reaches those who need it.",
      className: "bento-item bento-large reveal",
      delay: "0.1s",
    },
    {
      img: "../../../frontend/dist/images/improved_nutrition.jpg",
      alt: "Lower Farming Costs",
      title: "Lower Farming Costs",
      text: "Use intelligent resource optimization to cut water, fertilizer, and labor expenses while maintaining healthy yields and profitability.",
      className: "bento-item bento-small reveal",
      delay: "0.2s",
    },
    {
      img: "../../../frontend/dist/images/sustainable_agriculture.jpg",
      alt: "Strengthen Food Systems",
      title: "Strengthen Food Systems",
      text: "Combine disease prevention, efficient distribution, and cost control to build resilient agricultural supply chains.",
      className: "bento-item bento-small reveal",
      delay: "0.3s",
    },
  ];

  return (
    <section className="about-sdg" id="about">
      <div className="about-sdg-inner">
        <div className="about-top reveal">
          <p className="label-badge">The Objective</p>
          <h2 className="sdg-title">Zero Hunger by 2030</h2>
          <p className="sdg-sub">
            We are building intelligent tools to reduce crop loss, optimize farm
            economics, and strengthen the path from field to market.
          </p>
        </div>

        <div className="bento-layout">
          {cards.map((card) => (
            <div
              className={card.className}
              key={card.title}
              style={{ transitionDelay: card.delay }}
            >
              <div className="bento-media">
                <img src={card.img} alt={card.alt} />
              </div>
              <div className="bento-text">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

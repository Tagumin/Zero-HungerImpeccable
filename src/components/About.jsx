export default function About() {
  const cards = [
    {
      img: "images/food_security.jpg",
      alt: "Stabilize Food Supply",
      title: "Stabilize Food Supply",
      text: "Predict harvest yields and protect crops against climate volatility to ensure year-round stability.",
      className: "bento-item bento-large reveal",
      delay: "0.1s",
    },
    {
      img: "images/improved_nutrition.jpg",
      alt: "Enhance Crop Nutrition",
      title: "Enhance Crop Nutrition",
      text: "Leverage soil data to grow nutrient-dense crops that combat malnutrition in vulnerable regions.",
      className: "bento-item bento-small reveal",
      delay: "0.2s",
    },
    {
      img: "images/sustainable_agriculture.jpg",
      alt: "Scale Sustainable Farming",
      title: "Scale Sustainable Farming",
      text: "Adopt data-driven practices that maximize output while actively restoring long-term soil health.",
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
            We are building the intelligence required to eliminate global hunger,
            secure supply chains, and make sustainable farming the standard.
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
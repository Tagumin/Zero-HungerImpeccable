import { Link } from "react-router-dom";

export default function Features() {
  const features = [
    {
      img: "images/optimization.jpg",
      alt: "Smart Decision Support",
      title: "Smart Decision Support System",
      text: "Real-time data helps you plan planting, irrigation, and harvest timing. Make moves with confidence, not guesswork.",
      to: "/cost-optimizer",
      isInternal: true,
      align: "left",
    },
    {
      img: "images/optimization.jpg",
      alt: "Smart Decision Support",
      title: "Intelligent Route Optimizer",
      text: "Deploy state-of-the-art Ant Colony Optimization (ACO) to find the most efficient distribution paths across multiple destinations. Save fuel, minimize travel costs, and streamline food logistics.",
      to: "/distribution-map",
      isInternal: true,
      align: "right",
    },
    {
      img: "images/disease_identification.jpg",
      alt: "Disease Identification",
      title: "Microscopic Threat Detection",
      text: "Catch outbreaks before they decimate a field. Just snap a photo, and our computer vision models identify pathogens instantly.",
      to: "/disease-care",
      isInternal: true,
      align: "left",
    },
  ];

  return (
    <section className="features" id="features">
      <div className="features-inner">
        <div className="features-header reveal">
          <h2 className="section-title-center">Platform Capabilities</h2>
        </div>

        <div className="features-showcase">
          {features.map((feature, idx) => (
            <div
              className={`feature-editorial align-${feature.align} reveal`}
              key={feature.title}
            >
              <div className="feature-editorial-media">
                <img src={feature.img} alt={feature.alt} />
              </div>
              <div className="feature-editorial-content">
                <div className="feature-index">0{idx + 1}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                {feature.isInternal ? (
                  <Link to={feature.to} className="btn-feature-link">
                    Explore Capability &rarr;
                  </Link>
                ) : (
                  <a href={feature.to} className="btn-feature-link">
                    Explore Capability &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

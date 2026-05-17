import { Link } from "react-router-dom";

export default function Features() {
  const features = [
    {
      img: "images/crop_recommendation.jpg",
      alt: "Crop Recommendation",
      title: "Precision Planting Engine",
      text: "Stop guessing what the soil wants. Our AI models analyze micro-climate data to tell you exactly what, when, and where to plant for maximum yield.",
      to: "/crop-recommendation",
      isInternal: true,
      align: "left",
    },
    {
      img: "images/optimization.jpg",
      alt: "Smart Decision Support",
      title: "The Farm's Nervous System",
      text: "Command your entire operation from a single pane of glass. Anticipate irrigation needs and coordinate harvest timing with zero blind spots.",
      to: "#",
      isInternal: false,
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

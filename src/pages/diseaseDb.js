const diseaseDB = [
  {
    label: "Corn_Blight",
    name: "Corn Blight",
    sci: "Helminthosporium turcicum",
    treatment: [
      "Apply mancozeb or chlorothalonil fungicide",
      "Remove and destroy infected plant debris",
      "Improve field drainage and airflow",
    ],
    prevention: [
      "Use resistant hybrid varieties",
      "Practice crop rotation with non-host crops",
      "Avoid overhead irrigation",
    ],
  },
  {
    label: "Corn_CommonRust",
    name: "Corn Common Rust",
    sci: "Puccinia sorghi",
    treatment: [
      "Apply triazole-based fungicide (propiconazole)",
      "Spray at first sign of pustules",
      "Repeat application every 14 days if needed",
    ],
    prevention: [
      "Plant rust-resistant corn hybrids",
      "Monitor crops regularly from early growth stages",
      "Plant early to avoid peak rust season",
    ],
  },
  {
    label: "Corn_GrayLeafSpot",
    name: "Corn Gray Leaf Spot",
    sci: "Cercospora zeae-maydis",
    treatment: [
      "Apply strobilurin or triazole fungicide",
      "Remove severely infected leaves",
      "Reduce humidity around plants",
    ],
    prevention: [
      "Use resistant varieties",
      "Rotate crops to break disease cycle",
      "Till or remove corn residues after harvest",
    ],
  },
  {
    label: "Potato_EarlyBlight",
    name: "Potato Early Blight",
    sci: "Alternaria solani",
    treatment: [
      "Apply chlorothalonil or mancozeb fungicide",
      "Remove infected lower leaves promptly",
      "Avoid wetting foliage during irrigation",
    ],
    prevention: [
      "Use certified disease-free seed potatoes",
      "Maintain proper plant nutrition (avoid low nitrogen)",
      "Practice 2–3 year crop rotation",
    ],
  },
  {
    label: "Potato_Lateblight",
    name: "Potato Late Blight",
    sci: "Phytophthora infestans",
    treatment: [
      "Apply metalaxyl + mancozeb immediately",
      "Destroy all infected plants and tubers",
      "Avoid overhead irrigation to reduce leaf wetness",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Ensure good field drainage",
      "Monitor closely during cool, wet weather",
    ],
  },
  {
    label: "Rice_BacterialLeafBlight",
    name: "Rice Bacterial Leaf Blight",
    sci: "Xanthomonas oryzae pv. oryzae",
    treatment: [
      "Apply copper-based bactericides",
      "Remove and destroy infected plants",
      "Avoid flood-spread by managing water carefully",
    ],
    prevention: [
      "Use resistant varieties (IR64, BRRI dhan28)",
      "Maintain proper plant spacing",
      "Avoid excess nitrogen fertilization",
    ],
  },
  {
    label: "Rice_BrownSpot",
    name: "Rice Brown Spot",
    sci: "Cochliobolus miyabeanus",
    treatment: [
      "Apply iprodione or propiconazole fungicide",
      "Remove infected plant debris from field",
      "Correct soil nutrient deficiencies (especially potassium)",
    ],
    prevention: [
      "Use healthy certified seeds",
      "Maintain balanced soil fertility",
      "Treat seeds with fungicide before planting",
    ],
  },
  {
    label: "Rice_LeafBlast",
    name: "Rice Leaf Blast",
    sci: "Magnaporthe grisea",
    treatment: [
      "Apply tricyclazole or azoxystrobin fungicide",
      "Remove infected leaves immediately",
      "Drain fields for 5–7 days to reduce humidity",
    ],
    prevention: [
      "Use resistant varieties (IR64, Mahsuri)",
      "Avoid excess nitrogen fertilization",
      "Split fertilizer application across growth stages",
    ],
  },
  {
    label: "Rice_LeafScald",
    name: "Rice Leaf Scald",
    sci: "Microdochium oryzae",
    treatment: [
      "Apply propiconazole or tebuconazole fungicide",
      "Remove and burn heavily infected leaves",
      "Improve field aeration and drainage",
    ],
    prevention: [
      "Use tolerant varieties where available",
      "Avoid excessive nitrogen application",
      "Maintain proper water management in fields",
    ],
  },
  {
    label: "Rice_SheathBlight",
    name: "Rice Sheath Blight",
    sci: "Rhizoctonia solani",
    treatment: [
      "Apply hexaconazole or validamycin fungicide",
      "Drain field intermittently to reduce humidity",
      "Remove infected lower sheaths promptly",
    ],
    prevention: [
      "Reduce planting density for better airflow",
      "Avoid excessive nitrogen fertilizer",
      "Practice proper water management",
    ],
  },
  {
    label: "Soybean_BacterialBlight",
    name: "Soybean Bacterial Blight",
    sci: "Pseudomonas savastanoi pv. glycinea",
    treatment: [
      "Apply copper-based bactericide spray",
      "Remove and destroy infected plant debris",
      "Avoid working in fields when plants are wet",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Practice crop rotation with non-legumes",
      "Plant resistant or tolerant varieties",
    ],
  },
  {
    label: "Soybean_DownyMildew",
    name: "Soybean Downy Mildew",
    sci: "Peronospora manshurica",
    treatment: [
      "Apply metalaxyl or cymoxanil fungicide",
      "Remove infected leaves and plant parts",
      "Reduce canopy humidity through proper spacing",
    ],
    prevention: [
      "Use resistant soybean varieties",
      "Ensure good field drainage",
      "Avoid dense planting",
    ],
  },
  {
    label: "Soybean_MosaicVirus",
    name: "Soybean Mosaic Virus",
    sci: "Soybean mosaic virus (SMV)",
    treatment: [
      "Remove and destroy infected plants immediately",
      "Control aphid vectors with insecticide",
      "Disinfect tools between rows",
    ],
    prevention: [
      "Use virus-resistant soybean varieties",
      "Control aphid populations early in season",
      "Use certified virus-free seeds",
    ],
  },
  {
    label: "Soybean_Rust",
    name: "Soybean Rust",
    sci: "Phakopsora pachyrhizi",
    treatment: [
      "Apply triazole or strobilurin fungicide",
      "Spray at first sign of pustules on lower leaves",
      "Repeat application every 14–21 days",
    ],
    prevention: [
      "Plant early to avoid peak infection period",
      "Monitor lower leaf surfaces regularly",
      "Maintain proper plant spacing for airflow",
    ],
  },
  {
    label: "Soybean__DiabroticaSpeciosa",
    name: "Soybean Diabrotica Speciosa",
    sci: "Diabrotica speciosa",
    treatment: [
      "Apply carbamate or pyrethroid insecticide",
      "Use soil insecticide drench at root zone",
      "Remove heavily infested plant debris",
    ],
    prevention: [
      "Practice crop rotation to break beetle cycle",
      "Use seed treatment insecticides at planting",
      "Monitor adult populations with yellow sticky traps",
    ],
  },
  {
    label: "Soybean__PowderyMildew",
    name: "Soybean Powdery Mildew",
    sci: "Microsphaera diffusa",
    treatment: [
      "Apply sulfur-based or triazole fungicide",
      "Remove heavily infected plant parts",
      "Improve air circulation between plants",
    ],
    prevention: [
      "Use resistant soybean varieties",
      "Avoid dense planting to improve airflow",
      "Monitor during dry weather with moderate humidity",
    ],
  },
  {
    label: "Soybean__SouthernBlight",
    name: "Soybean Southern Blight",
    sci: "Sclerotium rolfsii",
    treatment: [
      "Apply flutolanil or PCNB fungicide to soil",
      "Remove and destroy infected plants including surrounding soil",
      "Solarize soil before replanting",
    ],
    prevention: [
      "Practice deep tillage to bury sclerotia",
      "Rotate with non-host crops for 2+ years",
      "Avoid excess soil moisture around stem base",
    ],
  },
  {
    label: "Wheat_BlackRust",
    name: "Wheat Black Rust",
    sci: "Puccinia graminis f. sp. tritici",
    treatment: [
      "Apply tebuconazole or propiconazole fungicide",
      "Remove infected plant debris from field",
      "Spray at flag leaf stage for best protection",
    ],
    prevention: [
      "Plant resistant wheat varieties",
      "Plant at recommended time to avoid peak rust",
      "Monitor fields weekly during humid periods",
    ],
  },
  {
    label: "Wheat_BrownRust",
    name: "Wheat Brown Rust",
    sci: "Puccinia triticina",
    treatment: [
      "Apply triazole fungicide (propiconazole, tebuconazole)",
      "Spray at early pustule appearance",
      "Repeat if infection pressure remains high",
    ],
    prevention: [
      "Use brown rust-resistant wheat varieties",
      "Plant at optimal sowing time",
      "Avoid excessive nitrogen that increases susceptibility",
    ],
  },
  {
    label: "Wheat_FusariumHeadBlight",
    name: "Wheat Fusarium Head Blight",
    sci: "Fusarium graminearum",
    treatment: [
      "Apply tebuconazole at early flowering stage",
      "Remove and destroy infected heads",
      "Avoid harvesting mycotoxin-contaminated grain",
    ],
    prevention: [
      "Rotate with non-cereal crops",
      "Use resistant or tolerant wheat varieties",
      "Avoid excess nitrogen at heading stage",
    ],
  },
  {
    label: "Wheat_LeafBlight",
    name: "Wheat Leaf Blight",
    sci: "Alternaria triticina",
    treatment: [
      "Apply mancozeb or zineb fungicide",
      "Remove infected lower leaves early",
      "Ensure adequate potassium nutrition",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Practice crop rotation with non-cereals",
      "Treat seeds with fungicide before sowing",
    ],
  },
  {
    label: "Wheat_Mildew",
    name: "Wheat Mildew",
    sci: "Blumeria graminis f. sp. tritici",
    treatment: [
      "Apply triadimefon or fenpropimorph fungicide",
      "Remove infected plant material from field",
      "Improve air circulation through plant spacing",
    ],
    prevention: [
      "Plant mildew-resistant wheat varieties",
      "Avoid high nitrogen fertilization",
      "Sow at recommended density to avoid dense canopy",
    ],
  },
  {
    label: "Wheat_Septoria",
    name: "Wheat Septoria",
    sci: "Zymoseptoria tritici",
    treatment: [
      "Apply triazole fungicide (epoxiconazole, tebuconazole)",
      "Spray from flag leaf emergence onwards",
      "Repeat application if wet conditions persist",
    ],
    prevention: [
      "Use Septoria-resistant wheat varieties",
      "Practice crop rotation to reduce inoculum",
      "Avoid burying infected debris shallowly",
    ],
  },
  {
    label: "Wheat_Smut",
    name: "Wheat Smut",
    sci: "Tilletia caries / Ustilago tritici",
    treatment: [
      "Treat seeds with carboxin or thiram before sowing",
      "Remove and burn smutted heads before harvest",
      "Clean harvesting equipment between fields",
    ],
    prevention: [
      "Use certified smut-free seeds",
      "Apply systemic fungicide seed treatment",
      "Use smut-resistant varieties where available",
    ],
  },
  {
    label: "Wheat_TanSpot",
    name: "Wheat Tan Spot",
    sci: "Pyrenophora tritici-repentis",
    treatment: [
      "Apply propiconazole or tebuconazole fungicide",
      "Remove infected crop residues promptly",
      "Spray at early leaf lesion appearance",
    ],
    prevention: [
      "Rotate crops to break residue-borne cycle",
      "Till soil to bury infected wheat straw",
      "Use resistant wheat varieties where available",
    ],
  },
  {
    label: "Wheat_YellowRust",
    name: "Wheat Yellow Rust",
    sci: "Puccinia striiformis f. sp. tritici",
    treatment: [
      "Apply propiconazole or tebuconazole fungicide",
      "Remove infected debris from field",
      "Improve airflow between crop rows",
    ],
    prevention: [
      "Use yellow rust-resistant wheat varieties",
      "Monitor crops at early growth stages",
      "Plant at correct sowing time for your region",
    ],
  },
];

export default diseaseDB;

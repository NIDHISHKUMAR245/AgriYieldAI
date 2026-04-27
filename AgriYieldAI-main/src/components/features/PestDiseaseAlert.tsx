import { CropInputs } from "@/types";
import { Bug, ShieldAlert, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, Leaf } from "lucide-react";
import { useState } from "react";

interface Props {
  inputs: CropInputs;
}

type Severity = "High" | "Medium" | "Low";

interface Threat {
  name: string;
  type: "Pest" | "Disease" | "Fungal" | "Viral" | "Bacterial";
  description: string;
  // Conditions that raise risk
  tempRange?: [number, number];   // optimal temp range for threat
  humidityMin?: number;           // humidity above which risk rises
  humidityMax?: number;           // humidity below which risk rises (for dry-weather pests)
  controls: {
    preventive: string[];
    curative: string[];
  };
  icon: string;
}

interface CropThreat {
  crop: string;
  threats: Threat[];
}

const CROP_THREATS: CropThreat[] = [
  {
    crop: "maize",
    threats: [
      {
        name: "Fall Armyworm",
        type: "Pest",
        description: "Spodoptera frugiperda larvae feed on whorl leaves causing 'window-pane' damage. Most destructive in warm, humid conditions.",
        tempRange: [22, 35],
        humidityMin: 60,
        controls: {
          preventive: ["Early sowing to avoid peak moth activity", "Intercrop with cowpea to disrupt pest cycle", "Install pheromone traps @ 10/ha"],
          curative: ["Spray Emamectin benzoate 5% SG @ 0.4 g/L", "Apply Spinetoram 11.7% SC @ 0.5 mL/L", "Chlorpyrifos 20EC @ 2.5 mL/L in the whorl"],
        },
        icon: "🐛",
      },
      {
        name: "Northern Leaf Blight",
        type: "Fungal",
        description: "Exserohilum turcicum causes long, elliptical gray-green lesions on leaves. Favoured by cool, humid weather.",
        tempRange: [18, 27],
        humidityMin: 75,
        controls: {
          preventive: ["Use resistant hybrids (HQPM-1, NK 6240)", "Crop rotation with non-host crops", "Remove and destroy infected plant debris"],
          curative: ["Spray Mancozeb 75% WP @ 2.5 g/L", "Apply Propiconazole 25% EC @ 1 mL/L at disease onset", "Tebuconazole 25.9% EC @ 1 mL/L"],
        },
        icon: "🍂",
      },
      {
        name: "Stem Borer",
        type: "Pest",
        description: "Chilo partellus bores into stem causing dead heart symptom. Active during warm, dry periods with moderate humidity.",
        tempRange: [26, 36],
        humidityMin: 40,
        humidityMax: 75,
        controls: {
          preventive: ["Apply Trichocard (Trichogramma) @ 1.5 lakh eggs/ha", "Synchronize sowing within community to disrupt pest cycle"],
          curative: ["Carbofuran 3G @ 8 kg/ha in whorl", "Spray Chlorantraniliprole 18.5 SC @ 0.3 mL/L", "Flubendiamide 39.35% SC @ 0.2 mL/L"],
        },
        icon: "🐌",
      },
    ],
  },
  {
    crop: "banana",
    threats: [
      {
        name: "Panama Wilt (Fusarium Wilt)",
        type: "Fungal",
        description: "Fusarium oxysporum causes yellowing and wilting of older leaves. Spreads rapidly in warm, wet soils.",
        tempRange: [24, 32],
        humidityMin: 70,
        controls: {
          preventive: ["Plant disease-free tissue culture seedlings", "Use resistant varieties (Grand Naine, Robusta)", "Soil solarization before planting"],
          curative: ["Drench soil with Carbendazim 0.1% solution", "Apply Trichoderma viride @ 5 g/kg soil", "No effective chemical cure — remove and burn infected plants"],
        },
        icon: "🍌",
      },
      {
        name: "Banana Weevil Borer",
        type: "Pest",
        description: "Cosmopolites sordidus larvae bore into rhizome weakening pseudostem. Most active in warm humid conditions.",
        tempRange: [25, 32],
        humidityMin: 75,
        controls: {
          preventive: ["Use pheromone traps @ 10/ha for monitoring", "Peel corm debris promptly after harvest", "Dip suckers in Chlorpyrifos 20EC @ 2 mL/L before planting"],
          curative: ["Apply Carbofuran 3G @ 40 g/plant in soil", "Drench with Chlorpyrifos 20EC @ 5 mL/L around pseudostem"],
        },
        icon: "🐞",
      },
      {
        name: "Sigatoka Leaf Spot",
        type: "Fungal",
        description: "Mycosphaerella musicola causes yellowish streaks on leaves reducing photosynthesis. Thrives in high humidity.",
        tempRange: [23, 30],
        humidityMin: 80,
        controls: {
          preventive: ["Ensure adequate spacing for air circulation", "Remove and bury affected leaves", "Balanced nutrition reduces susceptibility"],
          curative: ["Spray Propiconazole 25% EC @ 1 mL/L", "Apply Mancozeb + Carbendazim combination", "Mineral oil sprays as preventive cover"],
        },
        icon: "🍃",
      },
    ],
  },
  {
    crop: "cotton",
    threats: [
      {
        name: "Pink Bollworm",
        type: "Pest",
        description: "Pectinophora gossypiella larvae feed on cotton bolls. Severe in warm, dry conditions during boll development.",
        tempRange: [24, 36],
        humidityMax: 65,
        controls: {
          preventive: ["Use Bt cotton hybrids with cry1Ac gene", "Install pheromone traps @ 5/ha from 45 DAS", "Early planting reduces overlap with pest peak"],
          curative: ["Spray Emamectin Benzoate 5% SG @ 0.5 g/L", "Spinosad 45% SC @ 0.3 mL/L", "Chlorantraniliprole 18.5 SC @ 0.3 mL/L at boll stage"],
        },
        icon: "🐛",
      },
      {
        name: "Bacterial Blight",
        type: "Bacterial",
        description: "Xanthomonas citri pv. malvacearum causes angular leaf spots and boll rot. Risk increases after rain and wounds from storms.",
        tempRange: [25, 35],
        humidityMin: 70,
        controls: {
          preventive: ["Use disease-free certified seed", "Treat seeds with Streptocycline 0.01% for 30 min", "Avoid field operations when plants are wet"],
          curative: ["Spray Streptomycin + Copper oxychloride mixture", "Copper hydroxide 77% WP @ 3 g/L", "Remove and destroy heavily infected plants"],
        },
        icon: "🦠",
      },
      {
        name: "Whitefly (Bemisia tabaci)",
        type: "Pest",
        description: "Sucks sap and transmits Cotton Leaf Curl Virus. Populations surge in hot, dry conditions.",
        tempRange: [28, 38],
        humidityMax: 60,
        controls: {
          preventive: ["Yellow sticky traps @ 20/ha for monitoring", "Avoid excess nitrogen fertilization", "Intercrop with okra or cowpea as trap crop"],
          curative: ["Spray Thiamethoxam 25 WG @ 0.3 g/L", "Imidacloprid 17.8 SL @ 0.3 mL/L", "Spiromesifen 22.9 SC @ 0.5 mL/L for resistance management"],
        },
        icon: "🪲",
      },
    ],
  },
  {
    crop: "rice",
    threats: [
      {
        name: "Brown Plant Hopper",
        type: "Pest",
        description: "Nilaparvata lugens causes 'hopper burn' in patches. Explosive outbreaks occur under warm, humid conditions with dense crop canopy.",
        tempRange: [25, 32],
        humidityMin: 75,
        controls: {
          preventive: ["Avoid excessive nitrogen application", "Maintain 5–7 cm water level to drown nymphs", "Use resistant varieties (IR 64, Swarna Sub1)"],
          curative: ["Spray Buprofezin 25% SC @ 1 mL/L", "Dinotefuran 20% SG @ 0.4 g/L", "Ethofenprox 10% EC @ 1 mL/L at panicle stage"],
        },
        icon: "🦟",
      },
      {
        name: "Rice Blast",
        type: "Fungal",
        description: "Pyricularia oryzae causes diamond-shaped lesions on leaves, neck, and panicles. Favoured by cool nights + warm days + high humidity.",
        tempRange: [20, 28],
        humidityMin: 80,
        controls: {
          preventive: ["Use blast-resistant varieties", "Balanced fertilization — avoid excess N", "Seed treatment with Tricyclazole 75% WP @ 2 g/kg"],
          curative: ["Spray Tricyclazole 75% WP @ 0.6 g/L", "Isoprothiolane 40% EC @ 1.5 mL/L", "Azoxystrobin 23% SC @ 1 mL/L"],
        },
        icon: "💀",
      },
    ],
  },
  {
    crop: "chickpea",
    threats: [
      {
        name: "Pod Borer (Helicoverpa)",
        type: "Pest",
        description: "Helicoverpa armigera larvae bore into pods and consume seeds. Risk peaks during pod fill stage in warm conditions.",
        tempRange: [22, 32],
        humidityMin: 50,
        controls: {
          preventive: ["Install bird perches @ 50/ha for natural control", "Pheromone traps @ 10/ha from 30 DAS", "Intercrop with coriander to attract predators"],
          curative: ["Spray HaNPV @ 250 LE/ha at egg-hatch stage", "Emamectin Benzoate 5% SG @ 0.4 g/L", "Indoxacarb 14.5 SC @ 0.8 mL/L"],
        },
        icon: "🐛",
      },
      {
        name: "Fusarium Wilt",
        type: "Fungal",
        description: "Fusarium oxysporum f. sp. ciceri causes sudden wilting. Cool, moist soils favour disease establishment.",
        tempRange: [16, 26],
        humidityMin: 55,
        controls: {
          preventive: ["Treat seeds with Trichoderma harzianum @ 4 g/kg", "Use resistant varieties (JG 11, KAK 2)", "Avoid chickpea–chickpea continuous cropping"],
          curative: ["Soil drench with Carbendazim 0.1%", "Apply Trichoderma + FYM mixture to soil", "No fully effective curative treatment — prevention is key"],
        },
        icon: "🌿",
      },
    ],
  },
  {
    crop: "mango",
    threats: [
      {
        name: "Mango Fruit Fly",
        type: "Pest",
        description: "Bactrocera dorsalis lays eggs in ripening fruit. Warm, humid conditions accelerate population.",
        tempRange: [24, 35],
        humidityMin: 65,
        controls: {
          preventive: ["Bag fruits individually at marble stage", "Methyl Eugenol traps @ 25/ha for monitoring", "Collect and destroy fallen fruits daily"],
          curative: ["Protein bait spray (Spinosad + protein hydrolysate)", "Malathion 50 EC @ 2 mL/L as bait spray on trees", "Field sanitation — bury fallen fruits @ 50 cm depth"],
        },
        icon: "🪰",
      },
      {
        name: "Powdery Mildew",
        type: "Fungal",
        description: "Oidium mangiferae covers flowers, leaves, and young fruits with white powder. Thrives in dry weather with cool nights.",
        tempRange: [15, 25],
        humidityMin: 40,
        humidityMax: 70,
        controls: {
          preventive: ["Apply wettable sulfur before flowering as preventive", "Maintain orchard sanitation — remove dead twigs", "Plant spacing to ensure air circulation"],
          curative: ["Spray Hexaconazole 5% EC @ 2 mL/L", "Triadimefon 25% WP @ 1 g/L", "Dinocap 48% EC @ 0.5 mL/L at 15-day intervals"],
        },
        icon: "🌸",
      },
    ],
  },
  {
    crop: "coconut",
    threats: [
      {
        name: "Rhinoceros Beetle",
        type: "Pest",
        description: "Oryctes rhinoceros bores into the crown, damaging the growing point. Year-round threat in humid coastal regions.",
        tempRange: [25, 34],
        humidityMin: 70,
        controls: {
          preventive: ["Apply Metarhizium anisopliae to breeding sites (compost, piles)", "Remove dead stems and stumps promptly", "Wire mesh protection around crown of young palms"],
          curative: ["Hook out beetles manually with crow bar", "Apply Carbaryl 10% DP @ 25 g in the crown", "Baculovirus oryctes spray for biological control"],
        },
        icon: "🪲",
      },
      {
        name: "Bud Rot",
        type: "Bacterial",
        description: "Phytophthora palmivora causes rotting of the bud (growing point) during heavy rains. Can kill the palm.",
        tempRange: [20, 30],
        humidityMin: 85,
        controls: {
          preventive: ["Improve drainage around palms", "Apply Bordeaux mixture (1%) to crown during monsoon", "Avoid injury to crown during agricultural operations"],
          curative: ["Remove and burn affected crown leaves", "Apply Copper oxychloride 50% WP @ 5 g/L in the crown", "Drench with Metalaxyl-M 4% + Mancozeb 64% WP @ 3 g/L"],
        },
        icon: "🌴",
      },
    ],
  },
  {
    crop: "coffee",
    threats: [
      {
        name: "White Stem Borer",
        type: "Pest",
        description: "Xylotrechus quadripes larvae girdle the stem, killing branches. High risk in warm, dry periods.",
        tempRange: [22, 32],
        humidityMax: 65,
        controls: {
          preventive: ["Whitewash stems with lime + copper sulfate mixture", "Shade regulation to reduce temperature stress", "Prune and burn infested branches immediately"],
          curative: ["Inject Dichlorvos 76% EC diluted in trunk holes", "Swab stems with Endosulfan 35% EC", "Remove severely infested stumps and replant"],
        },
        icon: "🪵",
      },
      {
        name: "Coffee Berry Borer",
        type: "Pest",
        description: "Hypothenemus hampei bores into coffee berries. Risk increases at harvest time with warm, humid conditions.",
        tempRange: [20, 30],
        humidityMin: 70,
        controls: {
          preventive: ["Harvest ripe berries regularly to reduce infestation", "Use alcohol + water traps (3:1 ratio) for monitoring", "Beauveria bassiana spray for biological control"],
          curative: ["Spray Endosulfan 35% EC @ 2 mL/L at berry initiation", "Chlorpyrifos 20 EC @ 2 mL/L after berry development", "Maintain harvest schedule to minimize overripe berries"],
        },
        icon: "🐞",
      },
    ],
  },
  {
    crop: "jute",
    threats: [
      {
        name: "Stem Rot",
        type: "Fungal",
        description: "Macrophomina phaseolina causes damping off and stem rot. Warm, waterlogged conditions accelerate spread.",
        tempRange: [28, 36],
        humidityMin: 80,
        controls: {
          preventive: ["Ensure adequate field drainage", "Treat seeds with Thiram 75% WS @ 3 g/kg", "Crop rotation with cereals"],
          curative: ["Spray Carbendazim 50% WP @ 1 g/L on stem base", "Copper oxychloride 50% WP @ 3 g/L", "Remove and destroy severely affected plants"],
        },
        icon: "🍂",
      },
    ],
  },
  {
    crop: "lentil",
    threats: [
      {
        name: "Lentil Wilt",
        type: "Fungal",
        description: "Fusarium oxysporum f.sp. lentis causes wilting at any growth stage. Cool, moist soils favour pathogen.",
        tempRange: [15, 25],
        humidityMin: 55,
        controls: {
          preventive: ["Use wilt-resistant varieties (IPL 316, PL 406)", "Deep summer ploughing to expose soil to sun", "Trichoderma seed treatment @ 5 g/kg"],
          curative: ["Soil application of Trichoderma + FYM mixture", "Carbendazim 50% WP drench @ 1 g/L around root zone", "No fully effective curative — focus on prevention"],
        },
        icon: "🌿",
      },
      {
        name: "Aphid",
        type: "Pest",
        description: "Aphis craccivora sucks sap and transmits viruses. Colonies develop rapidly in cool, dry spring weather.",
        tempRange: [15, 26],
        humidityMax: 60,
        controls: {
          preventive: ["Spray water jets to dislodge colonies", "Intercrop with coriander to attract parasitoids", "Avoid excessive nitrogen which promotes soft tissue"],
          curative: ["Dimethoate 30% EC @ 1 mL/L", "Imidacloprid 17.8 SL @ 0.3 mL/L", "Thiamethoxam 25 WG @ 0.3 g/L"],
        },
        icon: "🐜",
      },
    ],
  },
  {
    crop: "mothbeans",
    threats: [
      {
        name: "Yellow Mosaic Virus",
        type: "Viral",
        description: "Transmitted by whitefly, causes yellow mosaic on leaves reducing yield by 70–100%. Spreads rapidly in hot, dry conditions.",
        tempRange: [28, 40],
        humidityMax: 55,
        controls: {
          preventive: ["Use resistant varieties (RMO 40, Mex 64-1)", "Rogue out infected plants early", "Control whitefly vector with Imidacloprid seed treatment"],
          curative: ["No curative treatment for virus", "Spray Imidacloprid 17.8 SL @ 0.3 mL/L to control whitefly vector", "Remove infected plants immediately to prevent spread"],
        },
        icon: "🦠",
      },
    ],
  },
  {
    crop: "muskmelon",
    threats: [
      {
        name: "Powdery Mildew",
        type: "Fungal",
        description: "Podosphaera xanthii causes white powder on leaves, reducing photosynthesis. Thrives in warm, dry conditions.",
        tempRange: [22, 32],
        humidityMin: 40,
        humidityMax: 70,
        controls: {
          preventive: ["Use resistant hybrids", "Ensure adequate plant spacing for air movement", "Avoid overhead irrigation — use drip"],
          curative: ["Spray Sulphur 80% WP @ 3 g/L", "Hexaconazole 5% SC @ 1 mL/L", "Myclobutanil 10% WP @ 0.5 g/L at 10-day intervals"],
        },
        icon: "💨",
      },
      {
        name: "Melon Fruit Fly",
        type: "Pest",
        description: "Bactrocera cucurbitae punctures young fruits causing rotting. High risk in warm, humid weather.",
        tempRange: [25, 35],
        humidityMin: 65,
        controls: {
          preventive: ["Bag fruits at set stage", "Install Cue-lure traps @ 25/ha for males", "Collect and destroy fallen fruits"],
          curative: ["Protein bait spray (Malathion 50EC @ 2 mL + protein hydrolysate)", "Spinosad 45% SC @ 0.3 mL/L as bait", "Regular field sanitation"],
        },
        icon: "🪰",
      },
    ],
  },
  {
    crop: "orange",
    threats: [
      {
        name: "Citrus Canker",
        type: "Bacterial",
        description: "Xanthomonas axonopodis pv. citri causes raised, corky lesions on leaves and fruit. Spreads during rainy, windy weather.",
        tempRange: [20, 32],
        humidityMin: 75,
        controls: {
          preventive: ["Plant disease-free budded plants", "Windbreaks reduce wound entry points", "Copper-based bactericides as preventive sprays"],
          curative: ["Spray Copper oxychloride 50% WP @ 3 g/L", "Streptomycin sulfate 90% SP @ 0.5 g/L + Copper hydroxide", "Remove and destroy severely infected shoots"],
        },
        icon: "🍊",
      },
      {
        name: "Citrus Psylla",
        type: "Pest",
        description: "Diaphorina citri transmits Citrus Greening (HLB). Risk highest during new flush growth in warm conditions.",
        tempRange: [23, 33],
        humidityMin: 60,
        controls: {
          preventive: ["Synchronize flush management across orchards", "Imidacloprid trunk painting at new flush", "Parasitoid Tamarixia radiata release for biological control"],
          curative: ["Dimethoate 30% EC @ 1 mL/L at new flush", "Imidacloprid 17.8 SL @ 0.3 mL/L", "Thiamethoxam 25 WG @ 0.3 g/L"],
        },
        icon: "🐜",
      },
    ],
  },
  {
    crop: "papaya",
    threats: [
      {
        name: "Papaya Ring Spot Virus",
        type: "Viral",
        description: "PRV-P transmitted by Myzus persicae (aphid) causes ring spots on fruits and mosaic on leaves. Spreads rapidly in warm, windy conditions.",
        tempRange: [25, 35],
        humidityMin: 55,
        controls: {
          preventive: ["Rogue infected plants immediately on detection", "Control aphid vector with mineral oil sprays", "Establish nurseries far from infected fields"],
          curative: ["No cure — remove and burn infected plants", "Spray mineral oil 2% to reduce virus transmission by aphids", "Use cross-protection with mild PRSV strains (advanced technique)"],
        },
        icon: "🦠",
      },
      {
        name: "Phytophthora Root Rot",
        type: "Fungal",
        description: "Phytophthora palmivora causes crown and root rot, especially in waterlogged soils during rainy season.",
        tempRange: [22, 30],
        humidityMin: 80,
        controls: {
          preventive: ["Plant on raised beds to prevent waterlogging", "Avoid injury to roots during weeding", "Apply Trichoderma @ 25 g/plant in soil"],
          curative: ["Drench with Metalaxyl-M 35% WS @ 2 g/L", "Fosetyl-Al 80% WP @ 3 g/L as soil drench", "Improve drainage urgently if waterlogging observed"],
        },
        icon: "💧",
      },
    ],
  },
  {
    crop: "pigeonpeas",
    threats: [
      {
        name: "Sterility Mosaic Disease",
        type: "Viral",
        description: "Spread by eriophyid mites, causes bushy plants without flowers. Warm, humid conditions favour mite vectors.",
        tempRange: [22, 30],
        humidityMin: 65,
        controls: {
          preventive: ["Use resistant varieties (ICPL 20126, BRG 5)", "Remove and destroy infected plants early", "Apply Dicofol 18.5 EC @ 2 mL/L to control mites"],
          curative: ["Spray Wettable Sulphur 80% WP @ 3 g/L", "Abamectin 1.9% EC @ 0.5 mL/L for mite control", "Rogue out all affected plants to prevent spread"],
        },
        icon: "🌿",
      },
    ],
  },
  {
    crop: "watermelon",
    threats: [
      {
        name: "Downy Mildew",
        type: "Fungal",
        description: "Pseudoperonospora cubensis causes yellow angular spots on upper leaf surface with gray-purple sporulation below. Thrives in cool, moist nights.",
        tempRange: [15, 25],
        humidityMin: 80,
        controls: {
          preventive: ["Use resistant varieties", "Avoid overhead irrigation — drip preferred", "Copper-based sprays as preventive at 10-day intervals"],
          curative: ["Spray Metalaxyl + Mancozeb @ 3 g/L", "Dimethomorph 50% WP @ 1 g/L", "Famoxadone + Cymoxanil 55.6% WG @ 0.5 g/L"],
        },
        icon: "💧",
      },
      {
        name: "Cucumber Beetle",
        type: "Pest",
        description: "Aulacophora foveicollis defoliates seedlings and transmits wilt bacteria. Peak activity in warm, dry conditions.",
        tempRange: [24, 35],
        humidityMax: 60,
        controls: {
          preventive: ["Row covers on young seedlings", "Kaolin clay spray repels adult beetles", "Yellow sticky traps for monitoring"],
          curative: ["Carbaryl 50% WP @ 2 g/L", "Spinosad 45% SC @ 0.3 mL/L", "Pyrethrin 1% EC @ 1.5 mL/L"],
        },
        icon: "🪲",
      },
    ],
  },
];

function calcSeverity(threat: Threat, temp: number, humidity: number): Severity {
  let score = 0;

  if (threat.tempRange) {
    const [tMin, tMax] = threat.tempRange;
    if (temp >= tMin && temp <= tMax) {
      // Perfect temp range
      const mid = (tMin + tMax) / 2;
      const proximity = 1 - Math.abs(temp - mid) / ((tMax - tMin) / 2);
      score += 2 * proximity;
    } else {
      const distFromRange = temp < tMin ? tMin - temp : temp - tMax;
      if (distFromRange < 5) score += 0.5;
    }
  }

  if (threat.humidityMin !== undefined && humidity >= threat.humidityMin) {
    score += 1 + Math.min(1, (humidity - threat.humidityMin) / 20);
  } else if (threat.humidityMin !== undefined) {
    const gap = threat.humidityMin - humidity;
    if (gap < 15) score += 0.3;
  }

  if (threat.humidityMax !== undefined && humidity <= threat.humidityMax) {
    score += 1 + Math.min(1, (threat.humidityMax - humidity) / 20);
  } else if (threat.humidityMax !== undefined) {
    const gap = humidity - threat.humidityMax;
    if (gap < 15) score += 0.3;
  }

  if (score >= 3.0) return "High";
  if (score >= 1.5) return "Medium";
  return "Low";
}

const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
}> = {
  High: {
    label: "High Risk",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    dot: "bg-red-500",
  },
  Medium: {
    label: "Moderate Risk",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    dot: "bg-amber-500",
  },
  Low: {
    label: "Low Risk",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
    dot: "bg-green-500",
  },
};

const TYPE_CONFIG: Record<Threat["type"], { label: string; color: string; bg: string }> = {
  Pest:      { label: "Pest",     color: "text-orange-700", bg: "bg-orange-50" },
  Disease:   { label: "Disease",  color: "text-purple-700", bg: "bg-purple-50" },
  Fungal:    { label: "Fungal",   color: "text-amber-700",  bg: "bg-amber-50"  },
  Viral:     { label: "Viral",    color: "text-rose-700",   bg: "bg-rose-50"   },
  Bacterial: { label: "Bacterial",color: "text-blue-700",   bg: "bg-blue-50"   },
};

function ThreatCard({
  threat,
  severity,
}: {
  threat: Threat;
  severity: Severity;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[severity];
  const typeCfg = TYPE_CONFIG[threat.type];

  return (
    <div className={`rounded-xl border ${cfg.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${cfg.bg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">{threat.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-foreground">{threat.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeCfg.bg} ${typeCfg.color}`}>
                  {typeCfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{threat.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.badgeBg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${severity === "High" ? "animate-pulse" : ""}`} />
              <span className={`text-xs font-bold ${cfg.badgeText} whitespace-nowrap`}>{cfg.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0"
              aria-label="Toggle details"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="bg-white px-4 py-4 space-y-3 border-t border-gray-100">
          <p className="text-sm text-muted-foreground leading-relaxed">{threat.description}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Preventive */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Preventive Measures
              </p>
              <ul className="space-y-1.5">
                {threat.controls.preventive.map((ctrl, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                    {ctrl}
                  </li>
                ))}
              </ul>
            </div>

            {/* Curative */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Curative / Chemical Control
              </p>
              <ul className="space-y-1.5">
                {threat.controls.curative.map((ctrl, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    {ctrl}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PestDiseaseAlert({ inputs }: Props) {
  const cropData = CROP_THREATS.find((c) => c.crop === inputs.crop);

  if (!cropData) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Bug className="w-4 h-4 text-orange-700" />
          </div>
          <h3 className="font-heading font-700 text-lg text-foreground">Pest & Disease Alerts</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Threat data not available for this crop yet.
        </p>
      </div>
    );
  }

  const evaluated = cropData.threats.map((t) => ({
    threat: t,
    severity: calcSeverity(t, inputs.temperature, inputs.humidity),
  }));

  // Sort: High → Medium → Low
  const sortOrder: Record<Severity, number> = { High: 0, Medium: 1, Low: 2 };
  evaluated.sort((a, b) => sortOrder[a.severity] - sortOrder[b.severity]);

  const highCount = evaluated.filter((e) => e.severity === "High").length;
  const medCount = evaluated.filter((e) => e.severity === "Medium").length;
  const lowCount = evaluated.filter((e) => e.severity === "Low").length;

  const overallRisk: Severity = highCount > 0 ? "High" : medCount > 0 ? "Medium" : "Low";
  const overallCfg = SEVERITY_CONFIG[overallRisk];

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <Bug className="w-4 h-4 text-orange-700" />
        </div>
        <h3 className="font-heading font-700 text-lg text-foreground">Pest & Disease Alerts</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Based on {inputs.temperature}°C · {inputs.humidity}% humidity
        </span>
      </div>

      {/* Overall risk banner */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${overallCfg.border} ${overallCfg.bg} mb-5`}>
        <div className="flex items-center gap-2.5">
          <ShieldAlert className={`w-5 h-5 ${overallCfg.color} flex-shrink-0`} />
          <div>
            <p className={`text-sm font-bold ${overallCfg.color}`}>
              Overall Risk: {overallCfg.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {highCount > 0
                ? `${highCount} threat${highCount > 1 ? "s" : ""} require immediate attention`
                : medCount > 0
                ? `${medCount} threat${medCount > 1 ? "s" : ""} need monitoring`
                : "Conditions are relatively safe — stay vigilant"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-right flex-shrink-0">
          {highCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{highCount}</p>
              <p className="text-xs text-red-500">High</p>
            </div>
          )}
          {medCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{medCount}</p>
              <p className="text-xs text-amber-500">Medium</p>
            </div>
          )}
          {lowCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{lowCount}</p>
              <p className="text-xs text-green-500">Low</p>
            </div>
          )}
        </div>
      </div>

      {/* Condition context */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "Temperature", value: `${inputs.temperature}°C`, icon: "🌡️" },
          { label: "Humidity", value: `${inputs.humidity}%`, icon: "💧" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex-1 flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2">
            <span className="text-base">{icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Threat cards */}
      <div className="space-y-3">
        {evaluated.map(({ threat, severity }) => (
          <ThreatCard key={threat.name} threat={threat} severity={severity} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-brand-50 border border-brand-100 rounded-xl">
        <Leaf className="w-3.5 h-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Risk levels are calculated from your temperature and humidity inputs relative to each threat's optimal conditions. Click any card to expand prevention and treatment guidance. Always consult local KVK (Krishi Vigyan Kendra) for regional-specific advisories.
        </p>
      </div>
    </div>
  );
}

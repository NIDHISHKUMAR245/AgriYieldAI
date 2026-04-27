import { useState } from "react";
import { CropInputs } from "@/types";
import { CROP_MAP } from "@/lib/cropData";
import { RefreshCw, Leaf, Sprout, Sun, CloudRain, Wind, ChevronRight, Info, ArrowRight } from "lucide-react";

interface Props {
  inputs: CropInputs;
}

type Season = "kharif" | "rabi" | "zaid";
type BenefitType = "nitrogen_fixer" | "soil_rest" | "deep_root" | "pest_break" | "phosphorus_booster" | "cover_crop";

interface RotationCrop {
  crop: string;           // must match CROP_MAP key
  season: Season[];       // seasons this crop can be grown
  benefits: BenefitType[];
  nFixation: number;      // kg/ha N fixed (0 if non-legume)
  nDepletion: number;     // relative N depletion score 0-10
  pDepletion: number;
  kDepletion: number;
  cropFamily: string;     // to avoid same-family rotation
  description: string;    // why this rotation helps
}

const BENEFIT_CONFIG: Record<BenefitType, { label: string; color: string; bg: string; icon: string; detail: string }> = {
  nitrogen_fixer: {
    label: "N-Fixer",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: "🌿",
    detail: "Legume root nodules fix atmospheric N₂, naturally replenishing soil nitrogen for the next crop.",
  },
  soil_rest: {
    label: "Soil Rest",
    color: "text-amber-700",
    bg: "bg-amber-100",
    icon: "🏔️",
    detail: "Lower-biomass crop allows soil microbial activity to recover and organic matter to rebuild.",
  },
  deep_root: {
    label: "Deep Root",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: "🌱",
    detail: "Deep root system breaks compaction layers and improves soil structure and water infiltration.",
  },
  pest_break: {
    label: "Pest Break",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: "🛡️",
    detail: "Different crop family disrupts pest and pathogen life cycles, reducing soil-borne disease carry-over.",
  },
  phosphorus_booster: {
    label: "P Mobilizer",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: "⚗️",
    detail: "Mycorrhizal associations and root exudates mobilize fixed phosphorus, improving P availability for next crop.",
  },
  cover_crop: {
    label: "Cover Crop",
    color: "text-teal-700",
    bg: "bg-teal-100",
    icon: "🌾",
    detail: "Dense canopy prevents weed growth, reduces erosion, and adds organic matter when incorporated.",
  },
};

const SEASON_CONFIG: Record<Season, { label: string; months: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  kharif: {
    label: "Kharif",
    months: "Jun – Oct",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: CloudRain,
  },
  rabi: {
    label: "Rabi",
    months: "Nov – Mar",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Wind,
  },
  zaid: {
    label: "Zaid",
    months: "Mar – Jun",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: Sun,
  },
};

// Season each crop belongs to (primary)
const CROP_SEASON: Record<string, Season> = {
  maize:       "kharif",
  banana:      "kharif",
  cotton:      "kharif",
  jute:        "kharif",
  mango:       "kharif",
  coconut:     "kharif",
  pigeonpeas:  "kharif",
  mothbeans:   "kharif",
  watermelon:  "zaid",
  muskmelon:   "zaid",
  papaya:      "kharif",
  chickpea:    "rabi",
  lentil:      "rabi",
  coffee:      "rabi",
  orange:      "rabi",
};

// Crop family for avoiding same-family rotation
const CROP_FAMILY: Record<string, string> = {
  maize:       "poaceae",
  banana:      "musaceae",
  cotton:      "malvaceae",
  jute:        "malvaceae",
  mango:       "anacardiaceae",
  coconut:     "arecaceae",
  pigeonpeas:  "fabaceae",
  mothbeans:   "fabaceae",
  chickpea:    "fabaceae",
  lentil:      "fabaceae",
  watermelon:  "cucurbitaceae",
  muskmelon:   "cucurbitaceae",
  papaya:      "caricaceae",
  coffee:      "rubiaceae",
  orange:      "rutaceae",
};

// Full rotation database
const ROTATION_PROFILES: RotationCrop[] = [
  {
    crop: "chickpea",
    season: ["rabi"],
    benefits: ["nitrogen_fixer", "pest_break", "soil_rest"],
    nFixation: 140,
    nDepletion: 1, pDepletion: 5, kDepletion: 2,
    cropFamily: "fabaceae",
    description: "Excellent rabi legume that fixes 100–180 kg N/ha through symbiotic bacteria, reducing fertilizer costs for the next kharif crop by up to 50 kg urea/ha.",
  },
  {
    crop: "lentil",
    season: ["rabi"],
    benefits: ["nitrogen_fixer", "soil_rest", "pest_break"],
    nFixation: 120,
    nDepletion: 1, pDepletion: 4, kDepletion: 2,
    cropFamily: "fabaceae",
    description: "Cool-season legume that fixes 80–140 kg N/ha. Its fine root network improves soil porosity and its short canopy allows weed suppression without major resource depletion.",
  },
  {
    crop: "maize",
    season: ["kharif"],
    benefits: ["deep_root", "cover_crop", "pest_break"],
    nFixation: 0,
    nDepletion: 8, pDepletion: 5, kDepletion: 6,
    cropFamily: "poaceae",
    description: "Deep fibrous roots break compaction and channel organic matter deep into the profile. Rotation with legumes makes it an ideal companion in sequential systems.",
  },
  {
    crop: "pigeonpeas",
    season: ["kharif"],
    benefits: ["nitrogen_fixer", "deep_root", "soil_rest"],
    nFixation: 160,
    nDepletion: 2, pDepletion: 6, kDepletion: 3,
    cropFamily: "fabaceae",
    description: "Perennial legume with a 3-meter taproot that fixes 100–200 kg N/ha and mines phosphorus from sub-soil. Intercropping with cereals provides immediate N benefits.",
  },
  {
    crop: "mothbeans",
    season: ["kharif"],
    benefits: ["nitrogen_fixer", "cover_crop", "soil_rest"],
    nFixation: 90,
    nDepletion: 1, pDepletion: 3, kDepletion: 1,
    cropFamily: "fabaceae",
    description: "Drought-hardy arid-zone legume that fixes 60–120 kg N/ha and provides excellent ground cover, preventing erosion while improving soil organic carbon.",
  },
  {
    crop: "cotton",
    season: ["kharif"],
    benefits: ["deep_root", "pest_break"],
    nFixation: 0,
    nDepletion: 7, pDepletion: 4, kDeplotion: 5,
    cropFamily: "malvaceae",
    description: "Taproot system improves soil drainage. Rotation after legumes significantly reduces fertilizer inputs. Breaks cereal pest cycles effectively.",
  },
  {
    crop: "watermelon",
    season: ["zaid"],
    benefits: ["cover_crop", "pest_break", "soil_rest"],
    nFixation: 0,
    nDepletion: 4, pDepletion: 3, kDepletion: 5,
    cropFamily: "cucurbitaceae",
    description: "Short-duration summer crop that efficiently uses residual soil moisture and nutrients after rabi. Vine cover reduces evaporation and suppresses weeds between rows.",
  },
  {
    crop: "muskmelon",
    season: ["zaid"],
    benefits: ["pest_break", "soil_rest"],
    nFixation: 0,
    nDepletion: 3, pDepletion: 3, kDepletion: 4,
    cropFamily: "cucurbitaceae",
    description: "Light-feeding cucurbit ideal for the zaid gap period, using residual fertility with minimal inputs. Breaks disease cycles from cereal-pulse sequences.",
  },
  {
    crop: "banana",
    season: ["kharif"],
    benefits: ["deep_root", "cover_crop"],
    nFixation: 0,
    nDepletion: 6, pDepletion: 5, kDepletion: 7,
    cropFamily: "musaceae",
    description: "High K-demanding crop that helps cycle potassium through its large biomass. Pseudostem residues decompose rapidly, returning nutrients to the topsoil.",
  },
  {
    crop: "mango",
    season: ["kharif"],
    benefits: ["deep_root", "soil_rest"],
    nFixation: 0,
    nDepletion: 3, pDepletion: 3, kDepletion: 3,
    cropFamily: "anacardiaceae",
    description: "Perennial orchard crop that allows inter-cropping with legumes during early years. Deep root system prevents sub-soil compaction and improves water table recharge.",
  },
  {
    crop: "orange",
    season: ["rabi"],
    benefits: ["deep_root", "pest_break"],
    nFixation: 0,
    nDepletion: 4, pDepletion: 4, kDepletion: 5,
    cropFamily: "rutaceae",
    description: "Perennial citrus with a distinct root architecture that supports soil bio-diversity and mycorrhizal networks, improving nutrient cycling across seasons.",
  },
  {
    crop: "papaya",
    season: ["kharif"],
    benefits: ["pest_break", "soil_rest"],
    nFixation: 0,
    nDepletion: 5, pDepletion: 4, kDepletion: 6,
    cropFamily: "caricaceae",
    description: "Fast-growing perennial that quickly covers ground, suppressing weeds. Rotation into papaya from cereals breaks major soil-borne pathogen cycles.",
  },
  {
    crop: "coconut",
    season: ["kharif"],
    benefits: ["deep_root", "cover_crop"],
    nFixation: 0,
    nDepletion: 4, pDepletion: 4, kDepletion: 6,
    cropFamily: "arecaceae",
    description: "Long-duration perennial that allows profitable intercropping (cocoa, banana, spices) in the inter-row spaces, maximizing land-use efficiency.",
  },
  {
    crop: "coffee",
    season: ["rabi"],
    benefits: ["soil_rest", "pest_break"],
    nFixation: 0,
    nDepletion: 5, pDepletion: 4, kDepletion: 4,
    cropFamily: "rubiaceae",
    description: "Shade-grown perennial that supports layered canopy systems, preserving soil moisture and organic matter through mulching from leaf litter.",
  },
  {
    crop: "jute",
    season: ["kharif"],
    benefits: ["cover_crop", "soil_rest", "pest_break"],
    nFixation: 0,
    nDepletion: 5, pDepletion: 4, kDepletion: 5,
    cropFamily: "malvaceae",
    description: "Dense stand effectively suppresses weeds. Post-harvest incorporation of jute sticks adds significant organic matter, improving long-term soil health.",
  },
];

// Build lookup for quick access
const ROTATION_MAP: Record<string, RotationCrop> = Object.fromEntries(
  ROTATION_PROFILES.map((r) => [r.crop, r])
);

// Rotation recommendations: current crop → best next crops in each season
const ROTATION_RULES: Record<string, { kharif: string[]; rabi: string[]; zaid: string[] }> = {
  maize:      { kharif: ["pigeonpeas", "banana", "cotton"],      rabi: ["chickpea", "lentil", "orange"],   zaid: ["watermelon", "muskmelon"] },
  banana:     { kharif: ["maize", "pigeonpeas", "papaya"],        rabi: ["chickpea", "lentil"],              zaid: ["muskmelon", "watermelon"] },
  cotton:     { kharif: ["maize", "pigeonpeas", "banana"],        rabi: ["chickpea", "lentil"],              zaid: ["watermelon", "muskmelon"] },
  jute:       { kharif: ["maize", "pigeonpeas", "banana"],        rabi: ["chickpea", "lentil"],              zaid: ["watermelon", "muskmelon"] },
  mango:      { kharif: ["coconut", "papaya", "banana"],          rabi: ["orange", "chickpea"],              zaid: ["muskmelon"] },
  coconut:    { kharif: ["banana", "papaya", "pigeonpeas"],       rabi: ["coffee", "orange"],                zaid: ["muskmelon"] },
  pigeonpeas: { kharif: ["maize", "cotton", "banana"],            rabi: ["lentil", "orange"],                zaid: ["watermelon", "muskmelon"] },
  mothbeans:  { kharif: ["maize", "cotton", "pigeonpeas"],        rabi: ["chickpea", "lentil"],              zaid: ["watermelon", "muskmelon"] },
  watermelon: { kharif: ["maize", "banana", "pigeonpeas"],        rabi: ["chickpea", "lentil"],              zaid: ["muskmelon"] },
  muskmelon:  { kharif: ["maize", "banana", "cotton"],            rabi: ["chickpea", "lentil"],              zaid: ["watermelon"] },
  papaya:     { kharif: ["banana", "coconut", "pigeonpeas"],      rabi: ["chickpea", "lentil", "orange"],   zaid: ["watermelon"] },
  chickpea:   { kharif: ["maize", "cotton", "banana"],            rabi: ["lentil", "orange"],                zaid: ["watermelon", "muskmelon"] },
  lentil:     { kharif: ["maize", "cotton", "pigeonpeas"],        rabi: ["chickpea", "orange"],              zaid: ["watermelon", "muskmelon"] },
  coffee:     { kharif: ["banana", "coconut", "papaya"],          rabi: ["orange", "lentil"],                zaid: ["muskmelon"] },
  orange:     { kharif: ["mango", "banana", "papaya"],            rabi: ["coffee", "lentil"],                zaid: ["muskmelon"] },
};

function getNextSeason(currentSeason: Season): Season {
  if (currentSeason === "kharif") return "rabi";
  if (currentSeason === "rabi") return "zaid";
  return "kharif";
}

function scoreRotationCrop(
  candidate: RotationCrop,
  currentCropKey: string,
  inputs: CropInputs,
  nDeficit: number,
  pDeficit: number,
  kDeficit: number
): number {
  let score = 0;

  // Legume bonus if N is deficient
  if (nDeficit > 10 && candidate.nFixation > 0) score += 3;
  if (nDeficit > 20 && candidate.nFixation > 100) score += 2;

  // Low depletion bonus for already-depleted nutrients
  if (pDeficit > 10 && candidate.pDepletion <= 3) score += 1.5;
  if (kDeficit > 10 && candidate.kDepletion <= 3) score += 1.5;

  // Pest break bonus for same-family avoidance
  if (CROP_FAMILY[currentCropKey] !== candidate.cropFamily) score += 2;

  // More benefit types = higher score
  score += candidate.benefits.length * 0.5;

  return score;
}

function detectCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
}

interface RecommendationCardProps {
  candidate: RotationCrop;
  nextSeason: Season;
  nFixation: number;
  rank: number;
}

function RecommendationCard({ candidate, nextSeason, rank, nFixation }: RecommendationCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const profile = CROP_MAP[candidate.crop];
  const seasonCfg = SEASON_CONFIG[nextSeason];
  const SeasonIcon = seasonCfg.icon;

  const rankColors = ["bg-amber-500", "bg-gray-400", "bg-amber-700"];
  const rankLabels = ["Best Pick", "2nd Choice", "3rd Choice"];

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border-b border-brand-100">
        <div className={`w-6 h-6 rounded-full ${rankColors[rank]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {rank + 1}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{profile?.emoji}</span>
          <div className="min-w-0">
            <h4 className="font-heading font-700 text-sm text-foreground leading-tight">{profile?.displayName}</h4>
            <span className="text-xs text-muted-foreground">{rankLabels[rank]}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${seasonCfg.bg} ${seasonCfg.color} border ${seasonCfg.border} flex-shrink-0`}>
          <SeasonIcon className="w-3 h-3" />
          {seasonCfg.label} · {seasonCfg.months}
        </div>
      </div>

      {/* Benefits */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {candidate.benefits.map((b) => {
            const cfg = BENEFIT_CONFIG[b];
            return (
              <span
                key={b}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
              >
                <span>{cfg.icon}</span>
                {cfg.label}
              </span>
            );
          })}
        </div>

        {/* N fixation highlight */}
        {nFixation > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg mb-3">
            <Sprout className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-green-700">
                Fixes ~{nFixation} kg N/ha
              </p>
              <p className="text-xs text-green-600">
                Saves ≈ {Math.round(nFixation / 0.46)} kg Urea/ha for next crop
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {candidate.description}
        </p>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setShowDetail(!showDetail)}
          className="mt-2 flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors"
        >
          <Info className="w-3 h-3" />
          {showDetail ? "Less detail" : "Why this rotation?"}
          <ChevronRight className={`w-3 h-3 transition-transform ${showDetail ? "rotate-90" : ""}`} />
        </button>

        {showDetail && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {candidate.benefits.map((b) => {
              const cfg = BENEFIT_CONFIG[b];
              return (
                <div key={b} className="flex items-start gap-2">
                  <span className={`text-xs font-semibold ${cfg.color} px-1.5 py-0.5 ${cfg.bg} rounded flex-shrink-0`}>{cfg.icon} {cfg.label}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cfg.detail}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nutrient impact footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium mb-1.5">Soil nutrient impact after this crop:</p>
        <div className="flex gap-3">
          {[
            { label: "N", value: nFixation > 0 ? `+${nFixation}` : `-${candidate.nDepletion * 8}`, positive: nFixation > 0, unit: " kg/ha" },
            { label: "P", value: `-${candidate.pDepletion * 4}`, positive: false, unit: " kg/ha" },
            { label: "K", value: `-${candidate.kDepletion * 5}`, positive: false, unit: " kg/ha" },
          ].map(({ label, value, positive, unit }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-xs font-bold text-foreground">{label}:</span>
              <span className={`text-xs font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
                {value}{unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CropRotationAdvisor({ inputs }: Props) {
  const currentSeason = CROP_SEASON[inputs.crop] ?? detectCurrentSeason();
  const [selectedNextSeason, setSelectedNextSeason] = useState<Season>(getNextSeason(currentSeason));

  const profile = CROP_MAP[inputs.crop];
  const rotationRules = ROTATION_RULES[inputs.crop];

  // Calculate nutrient deficits (how much below ideal midpoint)
  const idealNMid = profile ? (profile.idealN[0] + profile.idealN[1]) / 2 : 90;
  const idealPMid = profile ? (profile.idealP[0] + profile.idealP[1]) / 2 : 45;
  const idealKMid = profile ? (profile.idealK[0] + profile.idealK[1]) / 2 : 40;
  const nDeficit = Math.max(0, idealNMid - inputs.N);
  const pDeficit = Math.max(0, idealPMid - inputs.P);
  const kDeficit = Math.max(0, idealKMid - inputs.K);

  // Get candidates for the selected next season
  const candidateKeys: string[] = rotationRules ? rotationRules[selectedNextSeason] : [];

  // Filter out same family crops and score
  const scored = candidateKeys
    .filter((key) => {
      const r = ROTATION_MAP[key];
      return r && r.season.includes(selectedNextSeason);
    })
    .map((key) => {
      const candidate = ROTATION_MAP[key];
      return {
        candidate,
        score: scoreRotationCrop(candidate, inputs.crop, inputs, nDeficit, pDeficit, kDeficit),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const currentSeasonCfg = SEASON_CONFIG[currentSeason];
  const nextSeasonCfg = SEASON_CONFIG[selectedNextSeason];
  const CurrentIcon = currentSeasonCfg.icon;

  // Soil health context
  const soilIssues: string[] = [];
  if (nDeficit > 15) soilIssues.push(`N deficient (−${nDeficit.toFixed(0)} kg/ha) — prioritize legume rotation`);
  if (pDeficit > 10) soilIssues.push(`P below ideal (−${pDeficit.toFixed(0)} kg/ha)`);
  if (kDeficit > 10) soilIssues.push(`K below ideal (−${kDeficit.toFixed(0)} kg/ha)`);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-teal-700" />
        </div>
        <h3 className="font-heading font-700 text-lg text-foreground">Crop Rotation Advisor</h3>
        <span className="text-xs text-muted-foreground ml-auto">Post-{profile?.displayName} strategy</span>
      </div>

      {/* Season flow */}
      <div className="flex items-center gap-2 mb-5 p-3 bg-brand-50 border border-brand-100 rounded-xl">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${currentSeasonCfg.bg} ${currentSeasonCfg.color} border ${currentSeasonCfg.border}`}>
          <CurrentIcon className="w-3.5 h-3.5" />
          Current: {profile?.displayName} ({currentSeasonCfg.label})
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <p className="text-xs text-muted-foreground font-medium">Next season rotation →</p>
      </div>

      {/* Soil depletion context */}
      {soilIssues.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Soil Nutrient Context (influencing recommendations)
          </p>
          <ul className="space-y-0.5">
            {soilIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                <span className="mt-0.5">•</span>{issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Season selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-foreground mb-2">Plan rotation for which season?</p>
        <div className="flex gap-2">
          {(["kharif", "rabi", "zaid"] as Season[]).map((season) => {
            const cfg = SEASON_CONFIG[season];
            const Icon = cfg.icon;
            const isCurrent = season === currentSeason;
            return (
              <button
                key={season}
                type="button"
                onClick={() => setSelectedNextSeason(season)}
                disabled={isCurrent}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  selectedNextSeason === season && !isCurrent
                    ? `${cfg.bg} ${cfg.border} ${cfg.color} shadow-sm`
                    : isCurrent
                    ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border-border text-muted-foreground hover:border-brand-200 hover:bg-brand-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cfg.label}</span>
                <span className="text-xs font-normal opacity-70">{cfg.months}</span>
                {isCurrent && <span className="text-xs text-gray-400">(current)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {scored.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-brand-600" />
            Top {scored.length} crops for {nextSeasonCfg.label} after {profile?.displayName}
          </p>
          {scored.map(({ candidate }, idx) => (
            <RecommendationCard
              key={candidate.crop}
              candidate={candidate}
              nextSeason={selectedNextSeason}
              rank={idx}
              nFixation={candidate.nFixation}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No specific rotation data for this season combination.</p>
          <p className="text-xs mt-1">Try selecting a different next season above.</p>
        </div>
      )}

      {/* General rotation tips */}
      <div className="mt-5 p-4 bg-teal-50 border border-teal-100 rounded-xl">
        <p className="text-xs font-bold text-teal-700 mb-2 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          General Rotation Principles
        </p>
        <ul className="space-y-1 text-xs text-teal-700 leading-relaxed">
          <li className="flex gap-1.5"><span className="flex-shrink-0">•</span>Always alternate cereal → legume → oilseed for maximum soil health recovery</li>
          <li className="flex gap-1.5"><span className="flex-shrink-0">•</span>Never repeat the same crop family in consecutive seasons on the same plot</li>
          <li className="flex gap-1.5"><span className="flex-shrink-0">•</span>Incorporate crop residues after harvest to return 40–60% of extracted nutrients</li>
          <li className="flex gap-1.5"><span className="flex-shrink-0">•</span>Apply green manure (Dhaincha/Sunhemp) in any gap period to enrich organic carbon</li>
        </ul>
      </div>
    </div>
  );
}

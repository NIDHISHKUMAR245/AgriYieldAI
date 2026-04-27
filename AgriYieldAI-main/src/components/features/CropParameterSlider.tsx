interface Props {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  idealRange?: [number, number];
  onChange: (name: string, value: number) => void;
  description?: string;
}

export default function CropParameterSlider({
  label,
  name,
  value,
  min,
  max,
  step,
  unit,
  idealRange,
  onChange,
  description,
}: Props) {
  const pct = ((value - min) / (max - min)) * 100;
  const inIdeal = idealRange ? value >= idealRange[0] && value <= idealRange[1] : true;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-foreground">{label}</label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${
            inIdeal ? "bg-brand-100 text-brand-700" : "bg-orange-100 text-orange-700"
          }`}>
            {value} {unit}
          </span>
          {idealRange && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Ideal: {idealRange[0]}–{idealRange[1]}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(name, parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${inIdeal ? '#16a34a' : '#f97316'} ${pct}%, #d1fae5 ${pct}%)`,
          }}
        />
        {idealRange && (
          <div
            className="absolute top-0 h-2 rounded-full opacity-20 bg-brand-600 pointer-events-none"
            style={{
              left: `${((idealRange[0] - min) / (max - min)) * 100}%`,
              width: `${((idealRange[1] - idealRange[0]) / (max - min)) * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

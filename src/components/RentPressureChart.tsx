import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Building2, Globe } from "lucide-react";

const rentData = [
  { year: 2019, usAvgRent: 1149, rentPerSqFt: 18.98, rentPerSqM: 204.30 },
  { year: 2020, usAvgRent: 1185, rentPerSqFt: 18.79, rentPerSqM: 202.25 },
  { year: 2021, usAvgRent: 1265, rentPerSqFt: 21.67, rentPerSqM: 233.25 },
  { year: 2022, usAvgRent: 1341, rentPerSqFt: 23.54, rentPerSqM: 253.38 },
  { year: 2023, usAvgRent: 1448, rentPerSqFt: 24.82, rentPerSqM: 267.16 },
  { year: 2024, usAvgRent: 1535, rentPerSqFt: 26.21, rentPerSqM: 282.12 },
  { year: 2025, usAvgRent: 1650, rentPerSqFt: 27.67, rentPerSqM: 297.84 },
];

const rentMeta = {
  us2019to2024IncreasePercent: 33.6,
  amenityNewUnitsIncrease2014to2023Percent: 39,
  globalPrimeRentsIncrease2024Percent: 4.3,
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: typeof rentData[0];
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rentPerSqM = (data.rentPerSqFt * 10.7639).toFixed(2);
    
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-xl">
        <p className="font-bold text-card-foreground mb-2">{label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">Avg monthly rent:</span> ${data.usAvgRent.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-secondary-foreground">Avg rent:</span> ${data.rentPerSqFt}/ft² • ${rentPerSqM}/m²
        </p>
      </div>
    );
  }
  return null;
};

const StatPill = ({
  icon,
  label,
  value,
  caption,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
  variant?: "default" | "primary";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className={`flex-1 min-w-[200px] p-4 rounded-xl border ${
      variant === "primary"
        ? "bg-primary/10 border-primary/30"
        : "bg-muted/50 border-border"
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${variant === "primary" ? "text-primary" : "text-foreground"}`}>
      {value}
    </p>
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{caption}</p>
  </motion.div>
);

const RentPressureChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="bg-card/60 backdrop-blur-lg rounded-2xl border border-border/40 shadow-xl p-6 lg:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-card-foreground mb-2">
          Rents keep rising. Matching right saves you money.
        </h3>
        <p className="text-sm text-muted-foreground">
          Real US data, 2019–2025. Monthly rent and cost per square foot.
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[280px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rentData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="year"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="usAvgRent"
              name="US avg monthly rent"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              isAnimationActive={true}
              animationDuration={1500}
              animationBegin={300}
            />
            <Line
              type="monotone"
              dataKey="rentPerSqFt"
              name="Rent per ft²"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--muted-foreground))" }}
              isAnimationActive={true}
              animationDuration={1500}
              animationBegin={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stat Pills */}
      <div className="flex flex-wrap gap-4 mt-6">
        <StatPill
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label="US rents 2019 → 2024"
          value={`+${rentMeta.us2019to2024IncreasePercent}%`}
          caption="Average monthly rent increase (iProperty Management, 2025)."
          variant="primary"
        />
        <StatPill
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          label="Amenity-rich new units (US)"
          value={`+${rentMeta.amenityNewUnitsIncrease2014to2023Percent}%`}
          caption="Increase in median asking rent 2014–2023 (Harvard JCHS)."
        />
        <StatPill
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          label="Prime global cities"
          value={`+${rentMeta.globalPrimeRentsIncrease2024Percent}%`}
          caption="Prime residential rent growth in 30 global cities in 2024 (Savills World Cities Index)."
        />
      </div>
    </motion.div>
  );
};

export default RentPressureChart;

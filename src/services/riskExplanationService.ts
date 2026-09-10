export interface HeatRiskExplanationInput {
  location: string;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  wind: number;
  uv: number;
  heatStressScore: number;
  riskLevel: string;
  peakHeatPeriod: string;
}

export async function explainHeatRisk(input: HeatRiskExplanationInput): Promise<string> {
  const response = await fetch('/api/explain-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as { explanation?: string; error?: string };
  if (!response.ok || !data.explanation) {
    throw new Error(data.error || "Could not explain today's heat risk");
  }

  return data.explanation;
}

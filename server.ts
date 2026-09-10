import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = Number(process.env.PORT || 3000);
const requestTimes = new Map<string, number>();

app.use(express.json({ limit: '16kb' }));

const stringFields = ['location', 'riskLevel', 'peakHeatPeriod'];
const numberFields = ['temperature', 'humidity', 'apparentTemperature', 'wind', 'uv', 'heatStressScore'];

function isValidPayload(payload: Record<string, unknown>): boolean {
  return (
    stringFields.every((field) => typeof payload[field] === 'string' && String(payload[field]).length <= 160) &&
    numberFields.every((field) => typeof payload[field] === 'number' && Number.isFinite(payload[field])) &&
    Number(payload.humidity) >= 0 &&
    Number(payload.humidity) <= 100 &&
    Number(payload.uv) >= 0 &&
    Number(payload.uv) <= 20 &&
    Number(payload.heatStressScore) >= 0 &&
    Number(payload.heatStressScore) <= 100
  );
}

app.post('/api/explain-risk', async (request, response) => {
  const clientKey = request.ip || 'unknown';
  const lastRequestAt = requestTimes.get(clientKey) || 0;
  if (Date.now() - lastRequestAt < 1500) {
    response.status(429).json({ error: 'Please wait a moment before trying again.' });
    return;
  }
  requestTimes.set(clientKey, Date.now());

  const payload = request.body as Record<string, unknown>;
  if (!payload || !isValidPayload(payload)) {
    response.status(400).json({ error: 'The heat data could not be processed.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    response.status(503).json({ error: 'Explanations are temporarily unavailable.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Explain today's heat risk in plain language using only the data below.
Do not calculate or change the heat stress score. Do not invent weather information.
Do not diagnose medical conditions. Do not mention being an AI. Keep the answer under 80 words,
use 2 or 3 short sentences, and give one practical action based on the provided peak heat period.

Location: ${String(payload.location)}
Temperature: ${String(payload.temperature)} °C
Humidity: ${String(payload.humidity)}%
Apparent temperature: ${String(payload.apparentTemperature)} °C
Wind: ${String(payload.wind)} km/h
UV: ${String(payload.uv)}
Heat stress score: ${String(payload.heatStressScore)}
Risk level: ${String(payload.riskLevel)}
Peak heat period: ${String(payload.peakHeatPeriod)}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const explanation = result.text?.trim();
    if (!explanation) throw new Error('Empty Gemini response');
    response.json({ explanation });
  } catch (error) {
    console.error('Heat risk explanation failed:', error);
    response.status(500).json({ error: "Today's explanation is temporarily unavailable." });
  }
});

app.all('/api/explain-risk', (_request, response) => {
  response.status(405).json({ error: 'This action is not available.' });
});


app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  if (error) {
    response.status(400).json({ error: 'The request could not be processed.' });
    return;
  }
  next();
});

app.use(express.static('dist'));
app.get('*', (_request, response) => {
  response.sendFile('index.html', { root: 'dist' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`HeatSafe server listening on port ${port}`);
});

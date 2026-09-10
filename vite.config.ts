import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'heat-risk-explanation-api',
        configureServer(server) {
          server.middlewares.use('/api/explain-risk', async (request, response) => {
            if (request.method !== 'POST') {
              response.statusCode = 405;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            try {
              const chunks: Buffer[] = [];
              for await (const chunk of request) {
                chunks.push(Buffer.from(chunk));
              }

              const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
              const requiredFields = [
                'location',
                'temperature',
                'humidity',
                'apparentTemperature',
                'wind',
                'uv',
                'heatStressScore',
                'riskLevel',
                'peakHeatPeriod',
              ];

              if (requiredFields.some((field) => payload[field] === undefined || payload[field] === null)) {
                response.statusCode = 400;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ error: 'Incomplete heat data' }));
                return;
              }

              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
                response.statusCode = 503;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ error: 'Gemini is not configured' }));
                return;
              }

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

              if (!explanation) {
                throw new Error('Gemini returned an empty explanation');
              }

              response.statusCode = 200;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ explanation }));
            } catch (error) {
              console.error('Heat risk explanation failed:', error);
              response.statusCode = 500;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify({ error: "Could not explain today's heat risk" }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

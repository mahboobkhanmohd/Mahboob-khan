import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const explanationRequestTimes = new Map<string, number>();

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'heat-risk-explanation-api',
        configureServer(server) {
          server.middlewares.use('/api/explain-risk', async (request, response) => {
            const sendJson = (status: number, body: Record<string, string>) => {
              response.statusCode = status;
              response.setHeader('Content-Type', 'application/json');
              response.end(JSON.stringify(body));
            };

            if (request.method !== 'POST') {
              sendJson(405, { error: 'This action is not available.' });
              return;
            }

            const clientKey = request.socket.remoteAddress || 'local';
            const lastRequestAt = explanationRequestTimes.get(clientKey) || 0;
            if (Date.now() - lastRequestAt < 1500) {
              sendJson(429, { error: 'Please wait a moment before trying again.' });
              return;
            }
            explanationRequestTimes.set(clientKey, Date.now());

            try {
              const chunks: Buffer[] = [];
              let bodySize = 0;
              for await (const chunk of request) {
                const buffer = Buffer.from(chunk);
                bodySize += buffer.length;
                if (bodySize > 16_000) {
                  sendJson(413, { error: 'The heat data could not be processed.' });
                  request.destroy();
                  return;
                }
                chunks.push(buffer);
              }

              const payload = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
              const requiredStringFields = [
                'location',
                'riskLevel',
                'peakHeatPeriod',
              ];
              const requiredNumberFields = [
                'temperature',
                'humidity',
                'apparentTemperature',
                'wind',
                'uv',
                'heatStressScore',
              ];

              if (
                requiredStringFields.some(
                  (field) => typeof payload[field] !== 'string' || String(payload[field]).length > 160
                ) ||
                requiredNumberFields.some((field) => typeof payload[field] !== 'number' || !Number.isFinite(payload[field])) ||
                Number(payload.humidity) < 0 ||
                Number(payload.humidity) > 100 ||
                Number(payload.uv) < 0 ||
                Number(payload.uv) > 20 ||
                Number(payload.heatStressScore) < 0 ||
                Number(payload.heatStressScore) > 100
              ) {
                sendJson(400, { error: 'The heat data could not be processed.' });
                return;
              }

              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
                sendJson(503, { error: 'Explanations are temporarily unavailable.' });
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
              sendJson(500, { error: "Today's explanation is temporarily unavailable." });
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

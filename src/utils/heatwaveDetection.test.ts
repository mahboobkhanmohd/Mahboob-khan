/**
 * Unit tests for HeatSafe Early-Warning Heatwave Detection
 */

import { detectHeatwave } from './heatwaveDetection';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Starting Heatwave Detection Engine Unit Tests...\n');

  // Test 1: Normal weather (e.g. Paris / London in spring, 22°C)
  {
    const normalInputs = {
      hourlyTemperature: Array(24).fill(22),
      hourlyApparentTemperature: Array(24).fill(22),
      fallbackTemp: 22,
      fallbackFeelsLike: 22,
    };

    const result = detectHeatwave(normalInputs);
    console.log('[NORMAL TEST] isHeatwave:', result.isHeatwave);
    assert(result.isHeatwave === false, 'Normal weather should NOT trigger heatwave warning');
    assert(result.severity === null, 'Severity should be null when not a heatwave');
    assert(result.duration === 0, 'Duration should be 0 when not a heatwave');
    console.log('  ✓ Normal conditions correctly do not trigger alert');
  }

  // Test 2: Standard afternoon heat warning (e.g. 42°C afternoon peak)
  {
    const hourlyTemp = [
      24, 23, 23, 22, 22, 23, // 0-5
      25, 27, 30, 33, 36, 38, // 6-11
      40, 42, 42, 41, 39, 36, // 12-17 (12 PM - 5 PM: hot)
      33, 31, 29, 27, 26, 25  // 18-23
    ];
    const hourlyApparent = hourlyTemp.map(t => t + 3); // 45°C peak apparent

    const result = detectHeatwave({
      hourlyTemperature: hourlyTemp,
      hourlyApparentTemperature: hourlyApparent,
      fallbackTemp: 40,
      fallbackFeelsLike: 43,
    });

    console.log('[HEAT WARNING TEST]:', {
      isHeatwave: result.isHeatwave,
      severity: result.severity,
      headline: result.headline,
      explanation: result.explanation,
      peakWindow: result.peakWindow,
      actionAdvice: result.actionAdvice,
      duration: result.duration,
    });

    assert(result.isHeatwave === true, 'High heat should trigger heat warning');
    assert(result.severity === 'SEVERE' || result.severity === 'MODERATE', 'Severity should be set');
    assert(result.headline.includes('HEAT WARNING'), 'Headline should be HEAT WARNING');
    assert(
      result.explanation === 'Very high heat is expected this afternoon.',
      `Explanation should match expected, got "${result.explanation}"`
    );
    assert(
      result.peakWindow === '2 PM – 4 PM',
      `Peak window should be 2 PM – 4 PM, got "${result.peakWindow}"`
    );
    assert(
      result.actionAdvice === 'Avoid unnecessary outdoor activity during this time.',
      `Action advice should match expected, got "${result.actionAdvice}"`
    );
    assert(result.duration >= 4, `Duration should be >= 4 hours, got ${result.duration}`);
    console.log('  ✓ Afternoon heat warning matched all specifications');
  }

  // Test 3: Extreme heatwave (e.g. 45°C)
  {
    const hourlyTemp = Array(24).fill(45);
    const hourlyApparent = Array(24).fill(48);

    const result = detectHeatwave({
      hourlyTemperature: hourlyTemp,
      hourlyApparentTemperature: hourlyApparent,
      fallbackTemp: 45,
      fallbackFeelsLike: 48,
    });

    assert(result.isHeatwave === true, 'Extreme heat should trigger alert');
    assert(result.severity === 'EXTREME', `Severity should be EXTREME, got ${result.severity}`);
    assert(result.headline === 'EXTREME HEAT WARNING', 'Headline should be EXTREME HEAT WARNING');
    console.log('  ✓ Extreme heatwave test passed');
  }

  console.log('\n✨ All Heatwave Detection unit tests passed successfully!');
}

runTests();

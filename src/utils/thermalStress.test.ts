/**
 * Deterministic Unit Tests for Thermal Stress Calculation Engine
 * Covers: Normal, Hot, Humid, and Extreme conditions
 */

import {
  calculateThermalStress,
  ThermalStressInputs,
  getHeatStressLevel,
  normalizeTemperature,
  normalizeHumidity,
  normalizeApparentTemp,
  normalizeUV,
  normalizeWindCooling,
} from './thermalStress';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Starting Thermal Stress Engine Unit Tests...\n');

  // 1. Normal Conditions Test
  {
    const normalInputs: ThermalStressInputs = {
      temperature: 21,
      relativeHumidity: 38,
      apparentTemperature: 21,
      windSpeed: 18,
      uvIndex: 2,
    };
    const result = calculateThermalStress(normalInputs);
    console.log(`[NORMAL CONDITION] Score: ${result.score}, Level: ${result.level}`);

    assert(result.score >= 0 && result.score <= 20, `Normal score ${result.score} should be in SAFE range (0-20)`);
    assert(result.level === 'SAFE', `Normal level should be SAFE, got ${result.level}`);
    assert(result.recommendations.length >= 3, 'Should provide actionable recommendations');
    console.log('  ✓ Normal conditions test passed');
  }

  // 2. Caution / Mild Heat Conditions Test
  {
    const cautionInputs: ThermalStressInputs = {
      temperature: 28,
      relativeHumidity: 45,
      apparentTemperature: 29,
      windSpeed: 15,
      uvIndex: 5,
    };
    const result = calculateThermalStress(cautionInputs);
    console.log(`[CAUTION CONDITION] Score: ${result.score}, Level: ${result.level}`);

    assert(result.score >= 21 && result.score <= 40, `Caution score ${result.score} should be in CAUTION range (21-40)`);
    assert(result.level === 'CAUTION', `Caution level should be CAUTION, got ${result.level}`);
    console.log('  ✓ Caution conditions test passed');
  }

  // 3. Hot (Dry) Conditions Test
  {
    const hotInputs: ThermalStressInputs = {
      temperature: 36,
      relativeHumidity: 30,
      apparentTemperature: 38,
      windSpeed: 12,
      uvIndex: 8,
    };
    const result = calculateThermalStress(hotInputs);
    console.log(`[HOT CONDITION] Score: ${result.score}, Level: ${result.level}`);

    assert(result.score >= 41 && result.score <= 65, `Hot score ${result.score} should reflect elevated stress`);
    assert(result.level === 'MODERATE' || result.level === 'HIGH', `Hot level should be MODERATE or HIGH, got ${result.level}`);
    console.log('  ✓ Hot conditions test passed');
  }

  // 4. Hot & Humid Conditions Test (e.g. Hyderabad / Coastal heat index)
  {
    const humidInputs: ThermalStressInputs = {
      temperature: 39,
      relativeHumidity: 62,
      apparentTemperature: 44,
      windSpeed: 14,
      uvIndex: 9,
    };
    const result = calculateThermalStress(humidInputs);
    console.log(`[HUMID/HOT CONDITION] Score: ${result.score}, Level: ${result.level}`);

    assert(result.score >= 61 && result.score <= 80, `Humid/hot score ${result.score} should be in HIGH range (61-80)`);
    assert(result.level === 'HIGH', `Humid/hot level should be HIGH, got ${result.level}`);
    assert(result.score === 72, `Humid condition should calculate exactly 72, got ${result.score}`);
    assert(result.verdict === 'Very hot conditions. Take care if you go outside.', `Verdict should be exact, got "${result.verdict}"`);
    assert(result.whyReasons.includes('Temperature is high.'), 'Should include simple temperature reason');
    assert(result.whyReasons.includes('Humidity is making cooling harder.'), 'Should include simple humidity reason');
    assert(result.whyReasons.includes('Strong sunlight is increasing heat exposure.'), 'Should include simple sun reason');
    console.log('  ✓ Humid/hot conditions test passed (Calculated score: 72, verdict & why reasons verified)');
  }

  // 5. Extreme Conditions Test
  {
    const extremeInputs: ThermalStressInputs = {
      temperature: 45,
      relativeHumidity: 60,
      apparentTemperature: 51,
      windSpeed: 4,
      uvIndex: 11,
    };
    const result = calculateThermalStress(extremeInputs);
    console.log(`[EXTREME CONDITION] Score: ${result.score}, Level: ${result.level}`);

    assert(result.score >= 81 && result.score <= 100, `Extreme score ${result.score} should be in EXTREME range (81-100)`);
    assert(result.level === 'EXTREME', `Extreme level should be EXTREME, got ${result.level}`);
    console.log('  ✓ Extreme conditions test passed');
  }

  // 6. Strict Determinism Test (100 sequential runs with same inputs)
  {
    const testInput: ThermalStressInputs = {
      temperature: 34.5,
      relativeHumidity: 55,
      apparentTemperature: 41.2,
      windSpeed: 9.8,
      uvIndex: 7.5,
    };
    const firstRun = calculateThermalStress(testInput);
    for (let i = 0; i < 100; i++) {
      const subsequentRun = calculateThermalStress(testInput);
      assert(
        subsequentRun.score === firstRun.score && subsequentRun.level === firstRun.level,
        'Engine must be strictly deterministic across repeated calls'
      );
    }
    console.log('  ✓ Determinism test passed (100/100 matching runs)');
  }

  // 7. Clamp Boundary Tests (Negative and ultra-high values)
  {
    const subZeroResult = calculateThermalStress({
      temperature: -5,
      relativeHumidity: 10,
      apparentTemperature: -10,
      windSpeed: 40,
      uvIndex: 0,
    });
    assert(subZeroResult.score === 0, `Sub-zero input score must clamp to 0, got ${subZeroResult.score}`);

    const offChartsResult = calculateThermalStress({
      temperature: 58,
      relativeHumidity: 100,
      apparentTemperature: 65,
      windSpeed: 0,
      uvIndex: 16,
    });
    assert(offChartsResult.score === 100, `Extreme off-charts score must clamp to 100, got ${offChartsResult.score}`);
    console.log('  ✓ Boundary clamping tests passed');
  }

  console.log('\n✨ All 7 Thermal Stress Engine unit test suites passed successfully!\n');
}

runTests();

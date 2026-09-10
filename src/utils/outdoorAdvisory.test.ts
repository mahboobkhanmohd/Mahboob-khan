/**
 * Unit tests for Outdoor Advisory logic
 */

import { computeOutdoorAdvisory, formatHour12 } from './outdoorAdvisory';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Starting Outdoor Advisory Unit Tests...\n');

  // Test 1: formatHour12
  {
    assert(formatHour12(0) === '12 AM', '0 should be 12 AM');
    assert(formatHour12(8) === '8 AM', '8 should be 8 AM');
    assert(formatHour12(12) === '12 PM', '12 should be 12 PM');
    assert(formatHour12(14) === '2 PM', '14 should be 2 PM');
    assert(formatHour12(16) === '4 PM', '16 should be 4 PM');
    assert(formatHour12(18) === '6 PM', '18 should be 6 PM');
    console.log('  ✓ formatHour12 test passed');
  }

  // Test 2: Hot sunny day (peak in afternoon)
  {
    const hourlyTemp = [
      24, 23, 23, 22, 22, 23, // 0-5
      25, 28, 31, 34, 36, 38, // 6-11
      40, 42, 42, 41, 39, 36, // 12-17
      33, 31, 29, 28, 26, 25  // 18-23
    ];
    const hourlyApparent = hourlyTemp.map(t => t + 3);

    const advisory = computeOutdoorAdvisory({
      hourlyTemperature: hourlyTemp,
      hourlyApparentTemperature: hourlyApparent,
      hourlyHumidity: Array(24).fill(45),
      hourlyUvIndex: [0,0,0,0,0,0, 1,2,5,7,9,10, 10,10,8,6,3,1, 0,0,0,0,0,0],
      fallbackTemp: 40,
      fallbackFeelsLike: 43,
      fallbackHumidity: 45,
      fallbackUvIndex: 10,
    });

    console.log('Hot Day Recommendation:', advisory.recommendation);
    console.log('Periods:', advisory.periods.map(p => `${p.name}: ${p.indicator} (${p.statusLabel})`).join(', '));

    const morning = advisory.periods.find(p => p.name === 'Morning');
    const afternoon = advisory.periods.find(p => p.name === 'Afternoon');
    const evening = advisory.periods.find(p => p.name === 'Evening');

    assert(afternoon?.indicator === '🔴', 'Afternoon should be 🔴');
    assert(advisory.recommendation.includes('Try to avoid going outside between'), 'Should advise avoiding high heat hours');
    console.log('  ✓ Hot sunny day test passed');
  }

  // Test 2b: Standard heat day with Morning 🟢, Afternoon 🔴, Evening 🟢
  {
    const hourlyTemp = [
      22, 22, 21, 21, 21, 22, // 0-5
      23, 25, 27, 29, 31, 33, // 6-11 (Morning comfortable)
      38, 41, 42, 40, 37, 32, // 12-17 (Afternoon peak heat: 12-16)
      29, 27, 26, 25, 24, 23  // 18-23 (Evening comfortable)
    ];
    const hourlyApparent = [...hourlyTemp];

    const advisory = computeOutdoorAdvisory({
      hourlyTemperature: hourlyTemp,
      hourlyApparentTemperature: hourlyApparent,
      hourlyHumidity: Array(24).fill(40),
      hourlyUvIndex: [0,0,0,0,0,0, 1,2,3,4,6,7, 8,9,8,6,4,2, 0,0,0,0,0,0],
      fallbackTemp: 35,
      fallbackFeelsLike: 35,
      fallbackHumidity: 40,
      fallbackUvIndex: 8,
    });

    console.log('Typical Afternoon Heat Recommendation:', advisory.recommendation);
    console.log('Periods:', advisory.periods.map(p => `${p.name}: ${p.indicator}`).join(', '));

    const morning = advisory.periods.find(p => p.name === 'Morning');
    const afternoon = advisory.periods.find(p => p.name === 'Afternoon');
    const evening = advisory.periods.find(p => p.name === 'Evening');

    assert(morning?.indicator === '🟢', `Morning should be 🟢, got ${morning?.indicator}`);
    assert(afternoon?.indicator === '🔴', `Afternoon should be 🔴, got ${afternoon?.indicator}`);
    assert(evening?.indicator === '🟢', `Evening should be 🟢, got ${evening?.indicator}`);
    assert(
      advisory.recommendation === 'Try to avoid going outside between 12 PM and 4 PM.',
      `Should match exact recommendation: "Try to avoid going outside between 12 PM and 4 PM.", got "${advisory.recommendation}"`
    );
    console.log('  ✓ Standard afternoon heat test passed');
  }

  // Test 3: Safe, comfortable day
  {
    const hourlyTemp = Array(24).fill(22);
    const hourlyApparent = Array(24).fill(22);

    const advisory = computeOutdoorAdvisory({
      hourlyTemperature: hourlyTemp,
      hourlyApparentTemperature: hourlyApparent,
      hourlyHumidity: Array(24).fill(40),
      hourlyUvIndex: Array(24).fill(2),
      fallbackTemp: 22,
      fallbackFeelsLike: 22,
      fallbackHumidity: 40,
      fallbackUvIndex: 2,
    });

    console.log('Safe Day Recommendation:', advisory.recommendation);
    assert(advisory.isAllSafe, 'Should be marked all safe');
    assert(
      advisory.recommendation === 'Conditions are relatively comfortable today.',
      `Should match exact safe wording, got: "${advisory.recommendation}"`
    );
    assert(advisory.periods.every(p => p.indicator === '🟢'), 'All periods should be 🟢');
    console.log('  ✓ Safe comfortable day test passed');
  }

  console.log('\n✨ All Outdoor Advisory unit tests passed successfully!');
}

runTests();

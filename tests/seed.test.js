const fs = require('fs');
const path = require('path');
const { loadCities } = require('../scripts/seed');

describe('sample city data', () => {
  const cities = loadCities('http://localhost:5000');

  it('contains at least two cities', () => {
    expect(cities.length).toBeGreaterThanOrEqual(2);
  });

  it.each(cities.map((city) => [city.name, city]))('%s has a complete 3-day plan', (name, city) => {
    expect(city.description).toBeTruthy();
    expect(city.plan.map((day) => day.day)).toEqual([1, 2, 3]);

    city.plan.forEach((day) => {
      expect(day['day-description']).toBeTruthy();
      expect(day.activities.length).toBeGreaterThan(0);
      day.activities.forEach((activity) => {
        expect(activity.activity).toBeTruthy();
        expect(activity.description).toBeTruthy();
        expect(typeof activity.ticketPrice).toBe('number');
        expect(typeof activity.distanceToNextActivity).toBe('number');
      });
    });
  });

  it('points every image at a file that exists in images/', () => {
    cities.forEach((city) => {
      const urls = [city.imageUrl, ...city.plan.flatMap((d) => d.activities.map((a) => a.imageUrl))];
      urls.forEach((url) => {
        expect(url.startsWith('http://localhost:5000/images/')).toBe(true);
        expect(fs.existsSync(path.join(__dirname, '..', 'images', path.basename(url)))).toBe(true);
      });
    });
  });
});

const { Country, State, City } = require('country-state-city');

// Get all countries
exports.getAllCountries = (req, res) => {
  const countries = Country.getAllCountries();
  res.json(countries);
};

// Get states by country code
exports.getStatesByCountry = (req, res) => {
  const { countryCode } = req.params;
  const states = State.getStatesOfCountry(countryCode);
  if (states.length === 0) {
    return res.status(404).json({
      message: `No states found for the country code: ${countryCode}`
    });
  }
  res.json(states);
};

// Get cities by state code
exports.getCitiesByState = (req, res) => {
    const { countryCode, isoCode } = req.params;
    const cities = City.getCitiesOfState(countryCode, isoCode);
    if (cities.length === 0) {
      return res.status(404).json({
        message: `No cities found for the state code: ${isoCode}`
      });
    }
    res.json(cities);
};

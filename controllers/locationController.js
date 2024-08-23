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
  res.json(states);
};

// Get cities by state code
exports.getCitiesByState = (req, res) => {
    const { countryCode, isoCode } = req.params;
    const cities = City.getCitiesOfState(countryCode, isoCode);
    res.json(cities);
};

const { Country, State, City } = require('country-state-city');

// Get all countries
exports.getAllCountries = (req, res) => {
  const countries = Country.getAllCountries();
  res.json(countries);
};

// Get states by country code
exports.getStatesByCountryS = (req, res) => {
  const { countryCode } = req.params;
  const states = State.getStatesOfCountry(countryCode);
  if (states.length === 0) {
    return res.status(404).json({
      message: `No states found for the country code: ${countryCode}`
    });
  }
  res.json(states);
};


exports.getStatesByCountry = (req, res) => {
  const { countryName } = req.params;

  // Find the country using the name
  const country = Country.getAllCountries().find(
    (country) => country.name.toLowerCase() === countryName.toLowerCase()
  );

  if (!country) {
    return res.status(404).json({
      message: `Country with the name: ${countryName} not found`,
    });
  }

  const states = State.getStatesOfCountry(country.isoCode);
  if (states.length === 0) {
    return res.status(404).json({
      message: `No states found for the country: ${countryName}`,
    });
  }

  res.json(states);
};


// Get cities by state code
exports.getCitiesByStates = (req, res) => {
    const { countryCode, isoCode } = req.params;
    const cities = City.getCitiesOfState(countryCode, isoCode);
    if (cities.length === 0) {
      return res.status(404).json({
        message: `No cities found for the state code: ${isoCode}`
      });
    }
    res.json(cities);
};


exports.getCitiesByState = (req, res) => {
    const { countryName, stateName } = req.params;

    // Find the country using the name
    const country = Country.getAllCountries().find(
        (country) => country.name.toLowerCase() === countryName.toLowerCase()
    );

    if (!country) {
        return res.status(404).json({
            message: `Country with the name: ${countryName} not found`,
        });
    }

    // Find the state using the name and the country isoCode
    const state = State.getStatesOfCountry(country.isoCode).find(
        (state) => state.name.toLowerCase() === stateName.toLowerCase()
    );

    if (!state) {
        return res.status(404).json({
            message: `State with the name: ${stateName} not found in ${countryName}`,
        });
    }

    const cities = City.getCitiesOfState(country.isoCode, state.isoCode);

    if (cities.length === 0) {
        return res.status(404).json({
            message: `No cities found for the state: ${stateName}`,
        });
    }

    res.json(cities);
};


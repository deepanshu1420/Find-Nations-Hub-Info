import React, { useEffect, useState, useContext } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Error from "../Components/Error";
import Spinner from "../Components/Spinner";
import { findCountryName } from "../Components/CountryCodes";
import { SearchContext } from "../Pages/Home";
import "../Styles/CountryDetails.css";

function CountryDetails() {
  const navigate = useNavigate();
  const { country } = useParams();
  const location = useLocation();
  const context = useContext(SearchContext);
  const allCountries = context?.apiData || null;

  const [apiData, setApiData] = useState(location.state?.country || null);
  const [loading, setLoading] = useState(!location.state?.country);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);

    // 1. Router state has full object (came from CountryCard click)
    if (location.state?.country) {
      setApiData(location.state.country);
      setLoading(false);
      return;
    }

    // 2. Find in global list (came from border country link)
    if (allCountries) {
      const found = allCountries.find(
        (c) =>
          c.names?.common?.toLowerCase() === country.toLowerCase() ||
          c.codes?.alpha_3 === country
      );
      if (found) {
        setApiData(found);
        setLoading(false);
        return;
      }
    }

    // 3. Global list not loaded yet, keep showing spinner
    setLoading(true);

  }, [country, location.state, allCountries]);

  return (
    <section className="country-details-section">
      <div className="back-btn-container" data-aos="fade-right">
        <button type="button" onClick={() => navigate("/")}>
          <IoArrowBack /> Back
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Error error={error} />
      ) : apiData ? (
        <div className="countryInfoSection">
          <div className="countryFlag-container" data-aos="fade-right">
            <img
            src={apiData.flag?.url_png || "https://flagcdn.com/w320/un.png"}
            alt={`${apiData.names?.common} Flag`}
            title={`${apiData.names?.common} Flag`}
            onError={(e) => {
              e.target.src = "https://flagcdn.com/w320/un.png";
              }}
            />
          </div>

          <div className="countryStats-container" data-aos="fade-left">
            <p className="country-title">{apiData.names?.common}</p>

            <div className="country-details">
              <div>
                <p>
                  <strong>Native Names: </strong>
                  {apiData.names?.native
                    ? Object.values(apiData.names.native)
                        .map((n) => n.common)
                        .join(", ")
                    : "--"}
                </p>
                <p>
                  <strong>Population: </strong>
                  {apiData.population
                    ? apiData.population.toLocaleString()
                    : "--"}
                </p>
                <p>
                  <strong>Region: </strong>
                  {apiData.region || "--"}
                </p>
                <p>
                  <strong>Sub Region: </strong>
                  {apiData.subregion || "--"}
                </p>
                <p>
                  <strong>Capital: </strong>
                  {apiData.capitals?.length
                    ? apiData.capitals.map((c) => c.name).join(", ")
                    : "--"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Top Level Domain: </strong>
                  {apiData.tlds?.length ? apiData.tlds.join(", ") : "--"}
                </p>
                <p>
                  <strong>Currencies: </strong>
                  {apiData.currencies?.length
                    ? apiData.currencies
                        .map((c) => `${c.name} (${c.symbol})`)
                        .join(", ")
                    : "--"}
                </p>
                <p>
                  <strong>Languages: </strong>
                  {apiData.languages?.length
                    ? apiData.languages.map((l) => l.name).join(", ")
                    : "--"}
                </p>
              </div>
            </div>

            <div className="country-border">
              {apiData.borders?.length > 0 && (
                <p>
                  <strong>Border Countries: </strong>
                </p>
              )}
              {apiData.borders?.length > 0 ? (
                apiData.borders.map((code, index) => {
                  const countryName = findCountryName(code);
                  const borderCountry =
                    allCountries?.find((c) => c.codes?.alpha_3 === code) ||
                    null;

                  return (
                    <Link
                      to={`/${countryName}`}
                      key={index}
                      title={countryName}
                      state={{ country: borderCountry }}
                    >
                      <span className="country-border-name">{countryName}</span>
                    </Link>
                  );
                })
              ) : (
                <span className="no-countries">
                  There are no neighboring countries sharing a border with it.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CountryDetails;
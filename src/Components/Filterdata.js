import React, { useContext } from "react";
import CountryCard from "./CountryCard";
import { SearchContext } from "../Pages/Home";

function Filterdata() {
  let renderedContent;

  const { userInput, regionChoice, apiData } = useContext(SearchContext);

  if (userInput === "" && regionChoice === "") {
    renderedContent = apiData.map((country, index) => (
      <CountryCard
        key={index}
        country={country}
        flag={country.flag?.url_png}
        name={country.names?.common}
        population={country.population}
        region={country.region}
        capital={country.capitals?.[0]?.name || "N/A"}
      />
    ));
  } else if (userInput === "" && regionChoice !== "") {
    renderedContent = apiData
      .filter((country) => country.region === regionChoice)
      .map((country, index) => (
        <CountryCard
          key={index}
          country={country}
          flag={country.flag?.url_png}
          name={country.names?.common}
          population={country.population}
          region={country.region}
          capital={country.capitals?.[0]?.name || "N/A"}
        />
      ));
  } else if (userInput !== "" && regionChoice === "") {
    renderedContent = apiData
      .filter((country) =>
        country.names?.common
          ?.toLowerCase()
          .startsWith(userInput.toLowerCase())
      )
      .map((country, index) => (
        <CountryCard
          key={index}
          country={country}
          flag={country.flag?.url_png}
          name={country.names?.common}
          population={country.population}
          region={country.region}
          capital={country.capitals?.[0]?.name || "N/A"}
        />
      ));
  } else if (userInput !== "" && regionChoice !== "") {
    renderedContent = apiData
      .filter(
        (country) =>
          country.names?.common
            ?.toLowerCase()
            .startsWith(userInput.toLowerCase()) &&
          country.region === regionChoice
      )
      .map((country, index) => (
        <CountryCard
          key={index}
          country={country}
          flag={country.flag?.url_png}
          name={country.names?.common}
          population={country.population}
          region={country.region}
          capital={country.capitals?.[0]?.name || "N/A"}
        />
      ));
  }

  if (renderedContent.length === 0) {
    renderedContent = (
      <div
        style={{
          color: "red",
          fontSize: "20px",
          textAlign: "center",
          letterSpacing: "0.7px",
        }}
      >
        <p>
          No country found matching your input or filter. Please try something
          different.
        </p>
      </div>
    );
  }

  return renderedContent;
}

export default Filterdata;
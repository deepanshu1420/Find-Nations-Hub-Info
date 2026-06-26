import React, { useEffect, useState, useContext } from "react";
import Filterdata from "./Filterdata";
import Error from "./Error";
import Spinner from "./Spinner";
import { SearchContext } from "../Pages/Home";
import "../Styles/Fetch.css";

function Fetch() {
  const { apiData, setApiData, apiError, setApiError } = useContext(SearchContext);
  const [loading, setLoading] = useState(!apiData); // if data exists, skip loading

  useEffect(() => {
    if (apiData) return; // ✅ skip fetch if already loaded

    let isMounted = true;

    const API_KEY = "rc_live_23326e28604b4d0594c77efafff8b695";

    const fetchCountries = async () => {
      try {
        const urls = [
          "https://api.restcountries.com/countries/v5?limit=100&offset=0",
          "https://api.restcountries.com/countries/v5?limit=100&offset=100",
          "https://api.restcountries.com/countries/v5?limit=100&offset=200",
        ];

        const responses = await Promise.all(
          urls.map((url) =>
            fetch(url, {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
            })
          )
        );

        const jsonData = await Promise.all(
          responses.map(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
          })
        );

        const mergedCountries = jsonData.flatMap((item) => item.data.objects);

        if (isMounted) {
          setApiData(mergedCountries);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          if (error.message === "Failed to fetch") {
            setApiError("No internet connection. Please check your network.");
          } else {
            setApiError("An error occurred while fetching data from the API.");
          }
          setLoading(false);
        }
      }
    };

    fetchCountries();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ empty deps, runs only once

  return (
    <section className="main-body-section">
      {loading && (
        <div className="main-body-error">
          <Spinner />
        </div>
      )}

      {!loading && apiError && (
        <div className="main-body-error">
          <Error error={apiError} />
        </div>
      )}

      {!loading && !apiError && (
        <div className="main-body-container" data-aos="fade-up">
          <Filterdata />
        </div>
      )}
    </section>
  );
}

export default Fetch;
import React from "react";
import { Link } from "react-router-dom";

function CountryCard(props) {
  return (
    <Link
      to={`/${props.name}`}
      state={{ country: props.country }}
      title={props.name}
    >
      <div className="country-card">
        <div className="ctd-img">
          <img
          src={props.flag || "https://flagcdn.com/w320/un.png"}
          alt={`${props.name} Flag`}
          onError={(e) => {
          e.target.src = "https://flagcdn.com/w320/un.png";
          }}
          />
        </div>

        <div className="ctd-info">
          <p className="ctd-title">{props.name}</p>

          <p className="ctd-desc">
            <strong>Population: </strong>
            {props.population
              ? props.population.toLocaleString()
              : <span>--</span>}
          </p>

          <p className="ctd-desc">
            <strong>Region: </strong>
            {props.region || <span>--</span>}
          </p>

          <p className="ctd-desc">
            <strong>Capital: </strong>
            {props.capital || <span>--</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default CountryCard;
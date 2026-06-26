import React, { createContext } from "react";
import Filter from "../Components/Filter";
import Fetch from "../Components/Fetch";

export const SearchContext = createContext();

function Home() {
  return (
    <div className="home-page">
      <Filter />
      <Fetch />
    </div>
  );
}

export default Home;
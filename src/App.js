import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import CountryDetails from "./Pages/CountryDetails";
import Quiz from "./Pages/Quiz";
import NotFound from "./Pages/NotFound";
import { SearchContext } from "./Pages/Home";
import AOS from "aos";
import "./App.css";
import "aos/dist/aos.css";

function App() {
  const [apiData, setApiData] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [apiError, setApiError] = useState(null);
  const [regionChoice, setRegionChoice] = useState("");

  useEffect(() => {
    AOS.init({
      offset: 50,
      duration: 500,
    });
  }, []);

  return (
    <SearchContext.Provider
      value={{
        userInput,
        setUserInput,
        regionChoice,
        setRegionChoice,
        apiData,
        setApiData,
        apiError,
        setApiError,
      }}
    >
      <Router basename="/">
        <div className="App">
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/:country" element={<CountryDetails />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </SearchContext.Provider>
  );
}

export default App;
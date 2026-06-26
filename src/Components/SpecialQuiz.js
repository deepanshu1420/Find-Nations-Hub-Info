import React, { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { FaCheckCircle, FaTrophy, FaFlag, FaRoute, FaRedo, FaSync } from "react-icons/fa";
import HopAnimation from "./HopAnimation";
import { findCountryName } from "./CountryCodes";
import * as dijkstra from "dijkstrajs";
import { SearchContext } from "../Pages/Home";

function getRandomCountry(countries) {
  return countries[Math.floor(Math.random() * countries.length)];
}

function buildGraph(countries) {
  const graph = {};
  countries.forEach((c) => {
    if (!c.codes?.alpha_3) return;
    graph[c.codes.alpha_3] = {};
    if (Array.isArray(c.borders)) {
      c.borders.forEach((b) => {
        graph[c.codes.alpha_3][b] = 1;
      });
    }
  });
  return graph;
}

function getFlag(country) {
  return country?.flag?.url_png || country?.flag?.url_svg || "https://flagcdn.com/w320/un.png";
}

function getCca3(country) {
  return country?.codes?.alpha_3 || "";
}

function SpecialQuiz() {
  const { apiData } = useContext(SearchContext);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [current, setCurrent] = useState(null);
  const [path, setPath] = useState([]);
  const [hops, setHops] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [shortestPath, setShortestPath] = useState([]);
  const [showShortest, setShowShortest] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [animationFrom, setAnimationFrom] = useState(null);
  const [animationTo, setAnimationTo] = useState(null);

  // Use already-loaded context data instead of fetching again
  useEffect(() => {
    if (apiData && apiData.length > 0) {
      setCountries(apiData);
      setLoading(false);
    }
  }, [apiData]);

  useEffect(() => {
    if (countries.length > 0) startNewGame();
    // eslint-disable-next-line
  }, [countries]);

  function startNewGame() {
    let s, e;
    do {
      s = getRandomCountry(countries);
      e = getRandomCountry(countries);
    } while (
      (!s.borders || s.borders.length === 0) ||
      (!e.borders || e.borders.length === 0) ||
      getCca3(s) === getCca3(e)
    );
    setStart(s);
    setEnd(e);
    setCurrent(s);
    setPath([getCca3(s)]);
    setHops(0);
    setWrong(0);
    setShowResult(false);
    setShortestPath([]);
    setShowShortest(false);
    setHighScore(parseInt(localStorage.getItem(`specialquiz_highscore_of_${getCca3(s)}_${getCca3(e)}`) || "0", 10));
  }

  function resetStats() {
    setCurrent(start);
    setPath([getCca3(start)]);
    setHops(0);
    setWrong(0);
    setShowResult(false);
    setShowShortest(false);
  }

  function handleBorderClick(borderAlpha3) {
    if (showResult || animating) return;
    setAnimating(true);
    setAnimationFrom(getCca3(current));
    setAnimationTo(borderAlpha3);
    setTimeout(() => {
      setAnimating(false);
      setAnimationFrom(null);
      setAnimationTo(null);
      const nextCountry = countries.find((c) => getCca3(c) === borderAlpha3);
      if (!nextCountry) {
        toast.error("Invalid country.");
        setWrong((w) => w + 1);
        return;
      }
      setCurrent(nextCountry);
      setPath((p) => [...p, borderAlpha3]);
      setHops((h) => h + 1);
      if (borderAlpha3 === getCca3(end)) {
        setShowResult(true);
        const graph = buildGraph(countries);
        let shortest = [];
        try {
          shortest = dijkstra.find_path(graph, getCca3(start), getCca3(end));
        } catch {
          shortest = [];
        }
        setShortestPath(shortest);
        if (highScore === 0 || hops + 1 < highScore) {
          setHighScore(hops + 1);
          localStorage.setItem(`specialquiz_highscore_of_${getCca3(start)}_${getCca3(end)}`, hops + 1);
        }
        toast.success("You reached the destination!", { icon: <FaCheckCircle color="#4caf50" /> });
      } else {
        toast("Hopped to " + findCountryName(borderAlpha3), { icon: <FaFlag color="#fdd835" /> });
      }
    }, 700);
  }

  function handleShowShortest() {
    if (!shortestPath || shortestPath.length === 0) return;
    setShowShortest((show) => !show);
    if (!showShortest) {
      toast("Shortest path shown below", { icon: <FaRoute color="#fdd835" /> });
    }
  }

  if (loading || !start || !end || !current) {
    return (
      <div style={{ minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', color: 'var(--text-color)' }}>
        Loading quiz...
      </div>
    );
  }

  const borderCountries = (current.borders || [])
    .map((alpha3) => countries.find((c) => getCca3(c) === alpha3))
    .filter(Boolean);

  return (
    <div style={{ minHeight: '70vh', padding: 20, backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ height: '100%', width: '100%', maxWidth: 600, backgroundColor: 'var(--nav-bg-color)', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px var(--nav-shadow-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaFlag color="#fdd835" />
            <span style={{ fontWeight: 700 }}>Start:</span>
            <img src={getFlag(start)} alt={findCountryName(getCca3(start))} style={{ width: 36, height: 24, borderRadius: 4 }} onError={(e) => { e.target.src = "https://flagcdn.com/w320/un.png"; }} />
            <span>{findCountryName(getCca3(start))}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaFlag color="#e53935" />
            <span style={{ fontWeight: 700 }}>End:</span>
            <img src={getFlag(end)} alt={findCountryName(getCca3(end))} style={{ width: 36, height: 24, borderRadius: 4 }} onError={(e) => { e.target.src = "https://flagcdn.com/w320/un.png"; }} />
            <span>{findCountryName(getCca3(end))}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fdd835', fontWeight: 700 }}>
            <FaTrophy /> Best: {highScore === 0 ? '-' : highScore} hops
          </div>
        </div>
        <hr style={{ borderColor: 'var(--btn-hover)', margin: '16px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: '#fdd835' }}>Current:</span>
          <img src={getFlag(current)} alt={findCountryName(getCca3(current))} style={{ width: 48, height: 32, borderRadius: 4 }} onError={(e) => { e.target.src = "https://flagcdn.com/w320/un.png"; }} />
          <span style={{ fontWeight: 700 }}>{findCountryName(getCca3(current))}</span>
          <span style={{ marginLeft: 'auto', color: '#fdd835', fontWeight: 600 }}>Hops: {hops}</span>
          <span style={{ color: '#e53935', fontWeight: 600 }}>Wrong: {wrong}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={resetStats} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', border: '2px solid #fdd835', borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaRedo /> Reset</button>
          <button onClick={startNewGame} style={{ backgroundColor: '#fdd835', color: '#202D36', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaSync /> New Question</button>
          {showResult && shortestPath.length > 1 && (
            <button onClick={handleShowShortest} style={{ backgroundColor: showShortest ? '#4caf50' : '#fdd835', color: showShortest ? '#fff' : '#202D36', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaRoute /> {showShortest ? 'Hide Shortest Path' : 'Show Shortest Path'}</button>
          )}
        </div>
        <HopAnimation from={animationFrom} to={animationTo} countries={countries} />
        {showResult ? (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <h2 style={{ fontSize: 28, color: '#fdd835', marginBottom: 10 }}>You reached the destination!</h2>
            <p style={{ fontSize: 20 }}>Total Hops: <strong style={{ color: '#fdd835' }}>{hops}</strong></p>
            <p style={{ fontSize: 18 }}>Your Path: {path.map((c, i) => (
              <span key={c} style={{ color: c === getCca3(end) ? '#e53935' : c === getCca3(start) ? '#fdd835' : 'var(--text-color)', fontWeight: 700 }}>
                {findCountryName(c)}{i < path.length - 1 ? ' → ' : ''}
              </span>
            ))}</p>
            {showShortest && shortestPath.length > 1 && (
              <div style={{ margin: '18px 0', fontSize: 16, color: '#4caf50', fontWeight: 700 }}>
                <span>Shortest: {shortestPath.map((c, i) => (
                  <span key={c}>{findCountryName(c)}{i < shortestPath.length - 1 ? ' → ' : ''}</span>
                ))}</span>
              </div>
            )}
            <button onClick={startNewGame} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: 16, backgroundColor: '#fdd835', color: '#202D36', border: 'none', cursor: 'pointer' }}>
              Play Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {borderCountries.length === 0 ? (
              <div style={{ color: '#e53935', fontWeight: 700, fontSize: 18 }}>No bordering countries! (Island or error)</div>
            ) : borderCountries.map((bc) => (
              <button
                key={getCca3(bc)}
                onClick={() => handleBorderClick(getCca3(bc))}
                disabled={animating || showResult}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  border: '2px solid #fdd835',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: animating || showResult ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <img src={getFlag(bc)} alt={findCountryName(getCca3(bc))} style={{ width: 32, height: 20, borderRadius: 3 }} onError={(e) => { e.target.src = "https://flagcdn.com/w320/un.png"; }} />
                {findCountryName(getCca3(bc))}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecialQuiz;
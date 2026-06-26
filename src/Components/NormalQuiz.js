import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { FaCheckCircle, FaTimesCircle, FaTrophy } from "react-icons/fa";
import { SearchContext } from "../Pages/Home";
import { useContext } from "react";

const QUIZ_TYPES = [
  { key: "region", label: "Region" },
  { key: "sub-region", label: "Sub-Region" },
  { key: "capital", label: "Capital" },
  { key: "currencies", label: "Currencies" },
  { key: "languages", label: "Languages" },
];

function getQuizQuestion(country, quizType) {
  switch (quizType) {
    case "region":
      return { question: `Which region does ${country.names?.common} belong to?`, answer: country.region || "Unknown" };
    case "sub-region":
      return { question: `Which sub-region does ${country.names?.common} belong to?`, answer: country.subregion || "Unknown" };
    case "capital":
      return { question: `What is the capital of ${country.names?.common}?`, answer: country.capitals?.[0]?.name || "Unknown" };
    case "currencies":
      return { question: `What is the currency of ${country.names?.common}?`, answer: country.currencies?.[0]?.name || "Unknown" };
    case "languages":
      return { question: `What is an official language of ${country.names?.common}?`, answer: country.languages?.[0]?.name || "Unknown" };
    default:
      return { question: "", answer: "" };
  }
}

function getOptions(countries, quizType, correctAnswer) {
  let options = new Set();
  options.add(correctAnswer);
  while (options.size < 4) {
    const random = countries[Math.floor(Math.random() * countries.length)];
    let value = "";
    switch (quizType) {
      case "region": value = random.region || "Unknown"; break;
      case "sub-region": value = random.subregion || "Unknown"; break;
      case "capital": value = random.capitals?.[0]?.name || "Unknown"; break;
      case "currencies": value = random.currencies?.[0]?.name || "Unknown"; break;
      case "languages": value = random.languages?.[0]?.name || "Unknown"; break;
      default: value = "";
    }
    if (value) options.add(value);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

function getHighScore(quizType) {
  return parseInt(localStorage.getItem(`quiz_highscore_${quizType}`) || "0", 10);
}

function setHighScore(quizType, score) {
  localStorage.setItem(`quiz_highscore_${quizType}`, score);
}

function NormalQuiz({ quizType: quizTypeProp }) {
  const [quizType, setQuizType] = useState(quizTypeProp || QUIZ_TYPES[0].key);
  const { apiData } = useContext(SearchContext);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState(getHighScore(quizTypeProp || QUIZ_TYPES[0].key));
  const [questionNum, setQuestionNum] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (quizTypeProp && quizTypeProp !== quizType) setQuizType(quizTypeProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizTypeProp]);

  // Use already-loaded context data instead of fetching again
  useEffect(() => {
    if (apiData && apiData.length > 0) {
      setCountries(apiData);
      setLoading(false);
    }
  }, [apiData]);

  const nextQuestion = useCallback(
    (type = quizType, data = countries) => {
      const filtered = data.filter((c) => {
        switch (type) {
          case "region": return c.region;
          case "sub-region": return c.subregion;
          case "capital": return c.capitals && c.capitals.length > 0;
          case "currencies": return c.currencies && c.currencies.length > 0;
          case "languages": return c.languages && c.languages.length > 0;
          default: return false;
        }
      });
      const country = filtered[Math.floor(Math.random() * filtered.length)];
      const { question, answer } = getQuizQuestion(country, type);
      setCurrent({ country, question, answer });
      setOptions(getOptions(filtered, type, answer));
      setSelected(null);
    },
    [countries, quizType]
  );

  useEffect(() => {
    setHighScoreState(getHighScore(quizType));
    setScore(0);
    setQuestionNum(1);
    setShowResult(false);
    setSelected(null);
    if (countries.length > 0) nextQuestion(quizType, countries);
  }, [quizType, countries, nextQuestion]);

  function handleOption(option) {
    if (selected) return;
    setSelected(option);
    const correct = option === current.answer;
    if (correct) {
      toast.success("Correct!", { icon: <FaCheckCircle style={{ color: '#4caf50' }} /> });
      setScore((s) => s + 1);
      if (score + 1 > highScore) {
        setHighScore(quizType, score + 1);
        setHighScoreState(score + 1);
      }
    } else {
      toast.error(`Wrong! Correct: ${current.answer}`, { icon: <FaTimesCircle style={{ color: '#e53935' }} /> });
      setScore((s) => (s > 0 ? s - 1 : 0));
    }
    setTimeout(() => {
      if (questionNum >= 10) setShowResult(true);
      else {
        setQuestionNum((n) => n + 1);
        nextQuestion();
      }
    }, 1200);
  }

  function handleRestart() {
    setScore(0);
    setQuestionNum(1);
    setShowResult(false);
    setSelected(null);
    nextQuestion();
  }

  if (loading || !current) {
    return (
      <div style={{ minHeight: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', color: 'var(--text-color)' }}>
        Loading quiz...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '70vh', padding: 20, backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ height: '100%', width: '100%', maxWidth: 500, backgroundColor: 'var(--nav-bg-color)', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px var(--nav-shadow-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUIZ_TYPES.map((qt) => (
              <button
                key={qt.key}
                onClick={() => setQuizType(qt.key)}
                disabled={showResult}
                style={{
                  backgroundColor: quizType === qt.key ? '#fdd835' : 'var(--bg-color)',
                  color: quizType === qt.key ? '#202D36' : 'var(--text-color)',
                  border: quizType === qt.key ? '2px solid #fdd835' : '1px solid var(--btn-hover)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {qt.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fdd835', fontWeight: 700 }}>
            <FaTrophy /> High Score: {highScore}
          </div>
        </div>
        <hr style={{ borderColor: 'var(--btn-hover)', margin: '16px 0' }} />

        {showResult ? (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <h2 style={{ fontSize: 28, color: '#fdd835', marginBottom: 10 }}>Quiz Finished!</h2>
            <p style={{ fontSize: 20 }}>Your Score: <strong style={{ color: score === highScore ? '#4caf50' : '#e53935' }}>{score}</strong></p>
            <button onClick={handleRestart} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 6, fontWeight: 700, fontSize: 16, backgroundColor: '#fdd835', color: '#202D36', border: 'none', cursor: 'pointer' }}>
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={current.country.flag?.url_png || "https://flagcdn.com/w320/un.png"}
                alt={current.country.names?.common}
                style={{ width: 48, height: 32, borderRadius: 4 }}
                onError={(e) => { e.target.src = "https://flagcdn.com/w320/un.png"; }}
              />
              <span style={{ fontWeight: 700 }}>{current.country.names?.common}</span>
              <span style={{ marginLeft: 'auto', color: '#fdd835', fontWeight: 600 }}>Q{questionNum}/10</span>
            </div>
            <h3 style={{ marginTop: 16, fontSize: 18 }}>{current.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {options.map((option, idx) => (
                <button
                  key={option + idx}
                  onClick={() => handleOption(option)}
                  disabled={!!selected}
                  style={{
                    backgroundColor: selected === option ? (option === current.answer ? '#4caf50' : '#e53935') : 'var(--bg-color)',
                    color: selected === option ? '#fff' : 'var(--text-color)',
                    border: '1px solid var(--btn-hover)',
                    padding: '10px 14px',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: selected ? 'not-allowed' : 'pointer'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <span style={{ fontWeight: 600 }}>Score: {score}</span>
              <button onClick={handleRestart} style={{ border: '1px solid #fdd835', color: '#fdd835', backgroundColor: 'transparent', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
                Restart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NormalQuiz;
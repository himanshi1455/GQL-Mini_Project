import { useQuery, useMutation } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast'; // IMPORT TOAST
import {
  GET_MOVIES,
  ADD_MOVIE,
  TOGGLE_WATCHED,
  DELETE_MOVIE,
} from "./graphql/queries";
import "./App.css";

export default function App() {
  const { data, loading, error } = useQuery(GET_MOVIES);

  // --- 1. STATS LOGIC (New) ---
  const totalMovies = data?.movies?.length || 0;
  const watchedMovies = data?.movies?.filter(m => m.isWatched).length || 0;
  const progress = totalMovies === 0 ? 0 : Math.round((watchedMovies / totalMovies) * 100);

  // --- 2. MUTATIONS WITH TOASTS ---
  const [addMovie] = useMutation(ADD_MOVIE, {
    refetchQueries: [{ query: GET_MOVIES }],
    onCompleted: () => toast.success('Movie added successfully! 🍿', {
      style: { background: '#333', color: '#fff' }
    }),
    onError: (err) => toast.error(`Error: ${err.message}`)
  });

  const [toggleWatched] = useMutation(TOGGLE_WATCHED);

  const [deleteMovie] = useMutation(DELETE_MOVIE, {
    update(cache, { data: { deleteMovie } }) {
      cache.modify({
        fields: {
          movies(existingMovies = [], { readField }) {
            return existingMovies.filter(
              (movie) => readField("id", movie) !== deleteMovie
            );
          },
        },
      });
    },
    onCompleted: () => toast('Movie deleted', { icon: '🗑️', style: { background: '#333', color: '#fff' } }),
  });

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");

  const handleAdd = () => {
    if (!title || !year) return;
    addMovie({ variables: { title, year: Number(year) } });
    setTitle("");
    setYear("");
  };

  // --- ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
  };

  if (loading) return <div className="loading">Loading Cinema...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="app">
      <Toaster position="bottom-right" /> {/* POPUP CONTAINER */}

      {/* HEADER SECTION */}
      <motion.div 
        className="header-section"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1>🎬 Movie<span style={{color:'#e50914'}}>Master</span></h1>
        
        {/* DASHBOARD UI */}
        <div className="stats-container">
          <div className="stat-box">
            <span className="label">Total</span>
            <span className="value">{totalMovies}</span>
          </div>
          <div className="stat-box">
            <span className="label">Watched</span>
            <span className="value" style={{color: '#4ade80'}}>{watchedMovies}</span>
          </div>
          <div className="stat-box wide">
            <span className="label">Progress</span>
            <div className="progress-bar">
              <div className="fill" style={{width: `${progress}%`}}></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* INPUT BAR */}
      <motion.div
        className="input-bar"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <input
          placeholder="Movie Title (e.g. Inception)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="year-input"
        />
        <button onClick={handleAdd}>+ Add Movie</button>
      </motion.div>

      {/* MOVIE GRID */}
      <motion.div
        className="grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <AnimatePresence mode="popLayout">
          {data?.movies.map((m) => (
            <motion.div
              key={m.id}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`card ${m.isWatched ? "watched" : ""}`}
              whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
            >
              <div className="card-content">
                <h3>{m.title}</h3>
                <p>{m.year}</p>
              </div>

              <div className="actions">
                <button
                  className="toggle-btn"
                  onClick={() =>
                    toggleWatched({
                      variables: { id: m.id },
                      optimisticResponse: {
                        toggleWatched: {
                          id: m.id,
                          isWatched: !m.isWatched,
                          __typename: "Movie",
                        },
                      },
                    })
                  }
                >
                  {m.isWatched ? "↩ Unwatch" : "✓ Mark Watched"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteMovie({
                      variables: { id: m.id },
                      optimisticResponse: { deleteMovie: m.id },
                    })
                  }
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
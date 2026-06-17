import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [toggling, setToggling] = useState(new Set());
  const [starred, setStarred] = useState(new Set());

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `http://localhost:3002/repo/user/${userId}`
        );
        const data = await response.json();
        if (!response.ok) {
          console.warn("User repos fetch returned", response.status, data);
          setRepositories([]);
          return;
        }
        setRepositories(data?.repositories || []);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3002/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    const fetchStarred = async () => {
      try {
        const resp = await fetch(`http://localhost:3002/repo/starred/${userId}`);
        if (!resp.ok) {
          setStarred(new Set());
          return;
        }
        const d = await resp.json();
        const ids = (d.repositories || []).map((r) => r._id);
        setStarred(new Set(ids));
      } catch (err) {
        console.error("Error fetching starred repos:", err);
        setStarred(new Set());
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchStarred();
  }, []);

  const handleToggleStar = async (repoId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("You must be signed in to star repositories.");
    try {
      console.log("Toggling star for", repoId);
      // prevent repeated toggles
      setToggling((s) => {
        const next = new Set(s);
        next.add(repoId);
        return next;
      });

      // optimistic UI update
      setStarred((s) => {
        const next = new Set(s);
        if (next.has(repoId)) next.delete(repoId);
        else next.add(repoId);
        return next;
      });

      const resp = await fetch(`http://localhost:3002/star/${userId}/${repoId}`, {
        method: "POST",
      });
      if (!resp.ok) {
        // revert optimistic change on failure
        setStarred((s) => {
          const next = new Set(s);
          if (next.has(repoId)) next.delete(repoId);
          else next.add(repoId);
          return next;
        });
        const errBody = await resp.text();
        console.warn("Toggle star failed:", resp.status, errBody);
        alert("Unable to toggle star. See console for details.");
        return;
      }

      // refresh lists after toggling
      const refreshed = await fetch(`http://localhost:3002/repo/user/${userId}`);
      const data = await refreshed.json();
      setRepositories(data?.repositories || []);
      const all = await fetch(`http://localhost:3002/repo/all`);
      const allData = await all.json();
      setSuggestedRepositories(Array.isArray(allData) ? allData : []);
    } catch (err) {
      console.error("Error toggling star:", err);
    } finally {
      setToggling((s) => {
        const next = new Set(s);
        next.delete(repoId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (searchQuery == "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.map((repo) => {
            const isStarred = starred.has(repo._id);
            return (
              <div key={repo._id} className="suggested-item suggested-list">
                <h4>{repo.name}</h4>
                <p className="desc">{repo.description}</p>
                <button
                  className={`star-btn ${isStarred ? "starred" : ""}`}
                  disabled={toggling.has(repo._id)}
                  onClick={() => handleToggleStar(repo._id)}
                >
                  {isStarred ? "★ Starred" : "☆ Star"}
                </button>
              </div>
            );
          })}
        </aside>
        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.map((repo) => {
            const isStarred = starred.has(repo._id);
            return (
              <div key={repo._id} className="repo-card">
                <h4>{repo.name}</h4>
                <p className="desc">{repo.description}</p>
                <button
                  className={`star-btn ${isStarred ? "starred" : ""}`}
                  disabled={toggling.has(repo._id)}
                  onClick={() => handleToggleStar(repo._id)}
                >
                  {toggling.has(repo._id) ? "..." : isStarred ? "★ Starred" : "☆ Star"}
                </button>
              </div>
            );
          })}
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;

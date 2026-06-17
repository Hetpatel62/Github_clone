import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";

const StarredRepos = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarred = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setRepos([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3002/repo/starred/${userId}`);
        if (!res.ok) {
          console.warn("Failed to fetch starred repos", res.status);
          setRepos([]);
        } else {
          const data = await res.json();
          setRepos(data.repositories || []);
        }
      } catch (err) {
        console.error("Error fetching starred repos", err);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStarred();
  }, []);

  return (
    <>
      <Navbar />
      <section style={{ maxWidth: 980, margin: "36px auto", padding: 16 }}>
        <h2 style={{ color: "#fff" }}>Starred Repositories</h2>
        {loading ? (
          <p style={{ color: "#bbb" }}>Loading...</p>
        ) : repos.length === 0 ? (
          <p style={{ color: "#bbb" }}>No starred repositories yet.</p>
        ) : (
          repos.map((repo) => (
            <div key={repo._id} className="repo-card" style={{ marginBottom: 12 }}>
              <h4>{repo.name}</h4>
              <p className="desc">{repo.description}</p>
            </div>
          ))
        )}
      </section>
    </>
  );
};

export default StarredRepos;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./createRepo.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setMessage("Repository name is required.");
      return;
    }

    const owner = localStorage.getItem("userId");
    if (!owner) {
      setMessage("Unable to create repository: user not signed in.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3002/repo/create", {
        owner,
        name,
        description,
        visibility: true,
        content: [],
        issues: [],
      });

      if (response.status === 201) {
        setMessage("Repository created successfully.");
        setTimeout(() => navigate("/"), 1200);
      } else {
        setMessage(
          response.data?.error || "Unexpected response from server."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error || "Unable to create repository. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="create-repo-page">
        <div className="create-repo-card">
          <h2>Create Repository</h2>
          <p>Enter repository details and submit to create a new repo.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="repo-name">Repository Name</label>
            <input
              id="repo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-cool-repo"
            />

            <label htmlFor="repo-description">Description</label>
            <textarea
              id="repo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the repository"
            />

            <button type="submit">Create Repository</button>
          </form>
          {message && <p className="create-repo-message">{message}</p>}
        </div>
      </section>
    </>
  );
};

export default CreateRepo;

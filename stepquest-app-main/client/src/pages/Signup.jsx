// src/pages/Signup.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If Supabase auto-logs in the user after signup (no email confirmation),
  // redirect them to onboarding immediately.
  useEffect(() => {
    if (user) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email.trim(), password);
      // If email confirmation is required, user won't be set yet.
      // Show a friendly redirect-to-login message instead.
      // If auto-confirmed, the useEffect above handles the redirect.
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-switch">
          <Link to="/login" className="auth-switch-btn">
            Log In
          </Link>
          <button className="auth-switch-btn auth-switch-btn--active">
            Sign Up
          </button>
        </div>

        <h1 className="auth-title">Create your account ✨</h1>
        <p className="auth-subtitle">
          Start tracking your steps, quests and loot across devices.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button
            className="auth-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up with Email"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

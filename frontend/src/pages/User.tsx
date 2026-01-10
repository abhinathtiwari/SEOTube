import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { channelNameState, customUrlState, userEmailState, lastOptimizedAtState, upcomingOptimizationState } from "../state/user";
import Card from "../components/Card";
import "../styles/User.css";

export default function User() {
  const navigate = useNavigate();
  const [email, setEmail] = useRecoilState(userEmailState);
  const [channelName, setChannelName] = useRecoilState(channelNameState);
  const [customUrl, setCustomUrl] = useRecoilState(customUrlState);
  const [lastOptimizedAt, setLastOptimizedAt] = useRecoilState(lastOptimizedAtState);
  const [upcomingOptimization, setUpcomingOptimization] = useRecoilState(upcomingOptimizationState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!email || !channelName || !lastOptimizedAt) {
        setLoading(true);
        try {
          const [userRes, channelRes] = await Promise.all([
            api.get("/users/me"),
            api.get("/users/channel")
          ]);

          if (userRes.data) {
            setEmail(userRes.data.email);
            setLastOptimizedAt(userRes.data.lastOptimizedAt);
            setUpcomingOptimization(userRes.data.upcomingOptimization);
          }
          if (channelRes.data) {
            setChannelName(channelRes.data.channelName);
            setCustomUrl(channelRes.data.customUrl);
          }
        } catch (err) {
          console.error("Failed to fetch user data", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [email, channelName, lastOptimizedAt, setEmail, setChannelName, setCustomUrl, setLastOptimizedAt, setUpcomingOptimization]);

  async function deleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      const url = "/auth/user/deleteaccount";
      await api.delete(url);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Layout>
      <div className="user-profile-container">
        <header className="profile-header">
          <h1>User Profile</h1>
          <p className="subtitle">Manage your account and YouTube channel connection</p>
        </header>

        {loading ? (
          <div className="loading-state">Loading profile data...</div>
        ) : (
          <div className="profile-grid">
            <Card className="profile-card glass-morph">
              <div className="card-section">
                <label>Email Address</label>
                <p className="value">{email || "Not available"}</p>
              </div>
              <div className="card-section">
                <label>YouTube Channel</label>
                <p className="value">{channelName || "No channel connected"}</p>
              </div>
              <div className="card-section">
                <label>Channel URL</label>
                {customUrl ? (
                  <a 
                    href={`https://www.youtube.com/${customUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="value link"
                  >
                    youtube.com/{customUrl}
                  </a>
                ) : (
                  <p className="value">Not available</p>
                )}
              </div>
              <div className="card-section">
                <label>Last Optimized At</label>
                <p className="value highlight">
                  {lastOptimizedAt ? lastOptimizedAt : "Not Yet Updated"}
                </p>
              </div>
              <div className="card-section">
                <label>Upcoming Optimization</label>
                <p className="value">
                  {upcomingOptimization || "Calculating..."}
                </p>
              </div>
            </Card>

            <Card className="danger-zone profile-card glass-morph">
              <h3>Danger Zone</h3>
              <p className="muted">Permanently delete your account and all associated data.</p>
              <button 
                className="btn btn-danger" 
                onClick={deleteAccount}
              >
                Delete Account
              </button>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}

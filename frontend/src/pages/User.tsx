import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { channelNameState, customUrlState, userEmailState, lastOptimizedAtState, upcomingOptimizationState, pauseCronUpdateState } from "../state/user";
import Card from "../components/Card";
import "../styles/User.css";

export default function User() {
  const navigate = useNavigate();
  const [email, setEmail] = useRecoilState(userEmailState);
  const [channelName, setChannelName] = useRecoilState(channelNameState);
  const [customUrl, setCustomUrl] = useRecoilState(customUrlState);
  const [lastOptimizedAt, setLastOptimizedAt] = useRecoilState(lastOptimizedAtState);
  const [upcomingOptimization, setUpcomingOptimization] = useRecoilState(upcomingOptimizationState);
  const [isPaused, setIsPaused] = useRecoilState(pauseCronUpdateState);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

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
            setIsPaused(userRes.data.pauseCronUpdate);
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

  async function toggleUpdates() {
    setToggling(true);
    try {
      const res = await api.post("/users/toggle-updates");
      setIsPaused(res.data.pauseCronUpdate);
    } catch (err) {
      console.error("Failed to toggle updates", err);
    } finally {
      setToggling(false);
    }
  }

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
            <div className="profile-left">
              <Card className="profile-card glass-morph" style={{ padding: '24px' }}>
                <div className="card-section" style={{ padding: '12px 0' }}>
                  <label>Email Address</label>
                  <p className="value">{email || "Not available"}</p>
                </div>
                <div className="card-section" style={{ padding: '12px 0' }}>
                  <label>YouTube Channel</label>
                  <p className="value">{channelName || "No channel connected"}</p>
                </div>
                <div className="card-section" style={{ padding: '12px 0' }}>
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
                <div className="card-section" style={{ padding: '12px 0' }}>
                  <label>Last Optimized</label>
                  <p className="value highlight">
                    {lastOptimizedAt ? lastOptimizedAt : "Not Yet Updated"}
                  </p>
                </div>
                <div className="card-section" style={{ padding: '12px 0', borderBottom: 'none' }}>
                  <label>Next Sync</label>
                  <p className="value">
                    {upcomingOptimization || "Calculating..."}
                  </p>
                </div>
              </Card>
            </div>

            <div className="profile-right">
              <Card className="profile-card glass-morph" style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>Automation</h3>
                  <p className="muted" style={{ fontSize: '0.85rem', marginTop: 4 }}>
                    {isPaused ? "SEO updates are currently paused" : "System is optimizing videos"}
                  </p>
                </div>
                <button 
                  className={`auth-submit-btn ${isPaused ? '' : 'paused-btn'}`}
                  style={{ 
                    width: '100%', 
                    margin: 0,
                    background: isPaused ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'rgba(255,255,255,0.05)',
                    color: isPaused ? '#fff' : 'var(--muted)',
                    border: isPaused ? 'none' : '1px solid rgba(255,255,255,0.1)'
                  }}
                  onClick={toggleUpdates}
                  disabled={toggling}
                >
                  {toggling ? "Updating..." : (isPaused ? "Resume Updates" : "Pause Updates")}
                </button>
              </Card>

              <Card className="danger-zone profile-card glass-morph" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security</h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '16px', marginTop: 4 }}>
                  Delete account and wipe all channel data from our servers.
                </p>
                <button 
                  className="btn-danger" 
                  style={{ width: '100%' }}
                  onClick={deleteAccount}
                >
                  Delete Account
                </button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

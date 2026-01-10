import { useState, useEffect } from "react";
import api from "../api";
import Button from "../components/Button";
import Card from "../components/Card";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userEmailState } from "../state/user";

export default function Auth() {
  const navigate = useNavigate();
  const setEmailState = useSetRecoilState(userEmailState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    // if token cookie exists, go to home
    if (document.cookie.split(";").some(c => c.trim().startsWith("token="))) {
      navigate("/home");
    }
  }, [navigate]);

  const submit = async () => {
    const url = isSignup ? "/auth/user/signup" : "/auth/user/login";
    try {
      await api.post(url, { email, password });
      if (isSignup) {
        window.location.href = "http://localhost:3000/auth/youtube";
      } else {
        setEmailState(email);
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <Card className="auth-card">
        <h2>{isSignup ? "Signup" : "Login"}</h2>

        <input
          className="input"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button variant="primary" onClick={submit}>
            {isSignup ? "Signup" : "Login"}
          </Button>

          <Button variant="ghost" onClick={() => setIsSignup(!isSignup)}>
            Switch to {isSignup ? "Login" : "Signup"}
          </Button>
        </div>
      </Card>
    </Layout>
  );
}

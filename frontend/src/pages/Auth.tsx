import { useState } from "react";
import api from "../api";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const submit = async () => {
    const url = isSignup
      ? "/auth/user/signup"
      : "/auth/user/login";

    await api.post(url, { email, password });

    // redirect to backend OAuth
    console.log(isSignup);
    if(isSignup) window.location.href = "http://localhost:3000/auth/youtube";
    else window.location.href = "http://localhost:5173/home";
  };

  return (
    <div>
      <h2>{isSignup ? "Signup" : "Login"}</h2>

      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit}>
        {isSignup ? "Signup" : "Login"}
      </button>

      <button onClick={() => setIsSignup(!isSignup)}>
        Switch to {isSignup ? "Login" : "Signup"}
      </button>
    </div>
  );
}

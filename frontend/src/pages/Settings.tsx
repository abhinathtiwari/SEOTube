import { useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  
  async function deleteAccount(){
    try{
      const url = "/auth/user/deleteaccount";
      await api.delete(url);
      navigate("/");
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
  }, []);


  return (
    <Layout>
      <h1>Settings</h1>
      <button onClick={()=>{deleteAccount()}}>Delete Account</button>
    </Layout>
  );
}

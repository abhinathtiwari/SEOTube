import { useEffect } from "react";
/** Settings page for managing account preferences and automated update toggles. */
import Layout from "../components/Layout";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { channelNameState, customUrlState, userEmailState } from "../state/user";

export default function Settings() {
  const navigate = useNavigate();
  const email = useRecoilValue(userEmailState);
  const channelName = useRecoilValue(channelNameState);
  const customUrl = useRecoilValue(customUrlState);

  

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
      <p>{email || "-"}</p>
      <p>{channelName || "-"}</p>
      <p>{customUrl || "-"}</p>
      <button onClick={()=>{deleteAccount()}}>Delete Account</button>
    </Layout>
  );
}

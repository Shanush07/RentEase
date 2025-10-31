import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const AuthSyncContext = createContext();

export const AuthSyncProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Sync student with backend (create if not exists)
  const syncStudent = async () => {
    try {
      const token = await getToken({ template: "default" });
      await axios.post("http://localhost:4000/api/students/sync", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Student synced successfully");
    } catch (err) {
      console.error("❌ Error syncing student:", err);
    }
  };

  // 🔹 Fetch current logged-in student info
  const fetchStudent = async () => {
    try {
      const token = await getToken({ template: "default" });
      const res = await axios.get("http://localhost:4000/api/students/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(res.data);
      console.log("✅ Student data fetched:", res.data);
    } catch (err) {
      console.error("❌ Error fetching student:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        await syncStudent();
        await fetchStudent();
      })();
    } else {
      setStudent(null);
      setLoading(false);
    }
  }, [isSignedIn]);

  return (
    <AuthSyncContext.Provider value={{ student, loading }}>
      {children}
    </AuthSyncContext.Provider>
  );
};

export const useStudent = () => useContext(AuthSyncContext);

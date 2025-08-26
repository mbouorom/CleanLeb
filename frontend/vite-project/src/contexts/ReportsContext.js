import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const ReportsContext = createContext();

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const voteReport = async (id) => {
    try {
      await api.put(`/reports/${id}/vote`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ReportsContext.Provider value={{ reports, fetchReports, voteReport, loading }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => useContext(ReportsContext);

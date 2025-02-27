import { useEffect, useState } from "react";
import { getRecommendations } from "../services/api.service.js";

const RecommendationList = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getRecommendations("technology networking").then(setRecommendations);
  }, []);

  return (
    <div>
      <h2>Recommended Topics</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec.label}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationList;

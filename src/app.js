import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/react-hooks";
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GET_DATA = gql`
  query GetAnalysisData {
    getAnalysisData {
      sentimentAnalysis
      tickerAnalysis
    }
  }
`;

const DATA_SUBSCRIPTION = gql`
  subscription DataSubscription {
    onUpdateAnalysisData {
      tickerAnalysis
      sentimentAnalysis
    }
  }
`;

const App = () => {
  const [sentimentData, setSentimentData] = useState({});
  const [sentimentDataStructured, setSentimentDataStructured] = useState([]);
  const [topData, setTopData] = useState({});
  const [topDataStructured, setTopDataStructured] = useState([]);
  const { loading, error, data: initialData, subscribeToMore } = useQuery(
    GET_DATA
  );

  useEffect(() => {
    const temp = [];
    for (const key of Object.keys(topData)) {
      temp.push({
        name: key,
        mentions: topData[key],
      });
    }
    setTopDataStructured(temp);
  }, [topData]);

  useEffect(() => {
    const temp = [];
    for (const key of Object.keys(sentimentData)) {
      temp.push({
        name: key,
        negative: sentimentData[key].neg,
        neutral: sentimentData[key].neu,
        positive: sentimentData[key].pos,
      });
    }
    setSentimentDataStructured(temp);
  }, [sentimentData]);

  useEffect(() => {
    if ((!sentimentData.length || !topData.length) && initialData) {
      setSentimentData(
        JSON.parse(initialData.getAnalysisData.sentimentAnalysis)
      );
      setTopData(JSON.parse(initialData.getAnalysisData.tickerAnalysis));
    }
    dataSubscription(subscribeToMore);
  }, [initialData]);

  const dataSubscription = (subscribeToMore, retrying = 50) => {
    subscribeToMore({
      document: DATA_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        setSentimentData(
          JSON.parse(
            subscriptionData.data.onUpdateAnalysisData.sentimentAnalysis
          )
        );
        setTopData(
          JSON.parse(subscriptionData.data.onUpdateAnalysisData.tickerAnalysis)
        );
      },
      onError: (error) => {
        if (error.errorMessage.includes("Socket")) {
          setTimeout(() => {
            this.dataSubscription(subscribeToMore, retrying * 2);
          }, retrying);
        }
      },
    });
  };

  const customTooltip = ({ payload, active }) => {
    if (active) {
      return (
        <div className="custom-tooltip">
          {payload.map((p) => {
            return (
              <p key={p.name} className="label">{`${p.name}: ${p.value}`}</p>
            );
          })}
        </div>
      );
    }

    return null;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <div className="app">
      <header>
        <h2>Reddit Finance Scraper</h2>
      </header>
      <div className="info-container">
        <h3 className="chart-title">Summary</h3>
        <p>Analyzed 19919 comment threads in 147 posts in 3 subreddits</p>
        <p>Last updated: 5 minutes ago</p>
      </div>
      <main className="main-container">
        <div className="chart-container">
          <h3 className="chart-title">Top mentioned tickers</h3>
          <div className="chart">
            <ResponsiveContainer className="responsive-container">
              <BarChart data={topDataStructured || {}} className="bar-chart">
                <XAxis dataKey="name" stroke="#fff" opacity={0.85} />
                <YAxis dataKey="mentions" stroke="#fff" opacity={0.85} />
                <Tooltip content={(e) => customTooltip(e)} />
                <Bar dataKey="mentions" fill="#f7725d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Top tickers seniment</h3>
          <div className="chart">
            <ResponsiveContainer className="responsive-container">
              <BarChart data={sentimentDataStructured || {}}>
                <XAxis dataKey="name" stroke="#fff" opacity={0.85} />
                <YAxis stroke="#fff" opacity={0.85} />
                <Tooltip content={(e) => customTooltip(e)} />
                <Bar dataKey="positive" fill="#f7723d" />
                <Bar dataKey="neutral" fill="#EAD270" />
                <Bar dataKey="negative" fill="#6662D8" />
                <Legend wrapperStyle={{ position: "relative" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
      <footer>
        <span>
          <a
            href="http://www.ryanjohnsondev.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            © 2021 Ryan Seymore
          </a>
        </span>
      </footer>
    </div>
  );
};

export default App;

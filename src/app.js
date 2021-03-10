import React, { useEffect, useState } from "react";
import Moment from "react-moment";
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
      topSentiment
      topMention
      totalComments
      totalPosts
      totalSubreddits
      timestamp
    }
  }
`;

const DATA_SUBSCRIPTION = gql`
  subscription DataSubscription {
    onUpdateAnalysisData {
      topSentiment
      topMention
      totalComments
      totalPosts
      totalSubreddits
      timestamp
    }
  }
`;

const App = () => {
  const [analysisData, setAnalysisData] = useState({});
  const [sentimentData, setSentimentDataStructured] = useState([]);
  const [mentionData, setMentionDataStructured] = useState([]);
  const { loading, error, data: initialData, subscribeToMore } = useQuery(
    GET_DATA
  );

  useEffect(() => {
    if (Object.keys(analysisData).length === 0) return;
    const tempSentiment = [];
    const tempMention = [];
    const topSentiment = JSON.parse(analysisData.topSentiment);
    const topMention = JSON.parse(analysisData.topMention);
    for (const key of Object.keys(topSentiment)) {
      tempSentiment.push({
        name: key,
        negative: topSentiment[key].neg,
        neutral: topSentiment[key].neu,
        positive: topSentiment[key].pos,
      });
    }
    setSentimentDataStructured(tempSentiment);
    for (const key of Object.keys(topMention)) {
      tempMention.push({
        name: key,
        mentions: topMention[key],
      });
    }
    setMentionDataStructured(tempMention);
  }, [analysisData]);

  useEffect(() => {
    if (initialData && !analysisData.length) {
      setAnalysisData(initialData.getAnalysisData);
    }
    dataSubscription(subscribeToMore);
  }, [initialData]);

  const dataSubscription = (subscribeToMore, retrying = 50) => {
    subscribeToMore({
      document: DATA_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        setAnalysisData(subscriptionData.data.onUpdateAnalysisData);
      },
      onError: ({ errors }) => {
        if (errors && errors[0].message === "Connection closed") {
          setTimeout(() => {
            dataSubscription(subscribeToMore, retrying * 2);
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

  if (loading)
    return (
      <div className="app-message">
        <h1>Loading...</h1>
      </div>
    );

  if (error)
    return (
      <div className="app-message">
        <h1>Error!</h1>
      </div>
    );

  return (
    <div className="app">
      <header>
        <h2>Reddit Finance Scraper</h2>
      </header>
      <div className="info-container">
        <h3 className="chart-title">Summary</h3>

        <p>{`Analyzed ${analysisData.totalComments} comment threads in ${analysisData.totalPosts} posts in ${analysisData.totalSubreddits} subreddits.`}</p>
        <p>
          Last updated:{" "}
          <Moment interval={1000} fromNow utc>
            {analysisData.timestamp}
          </Moment>
        </p>
      </div>
      <main className="main-container">
        <div className="chart-container">
          <h3 className="chart-title">Most Mentioned Tickers</h3>
          <div className="chart">
            <ResponsiveContainer className="responsive-container">
              <BarChart
                data={mentionData || []}
                className="bar-chart"
                margin={{
                  right: 30,
                }}
              >
                <XAxis dataKey="name" stroke="#fff" opacity={0.85} />
                <YAxis dataKey="mentions" stroke="#fff" opacity={0.85} />
                <Tooltip content={(e) => customTooltip(e)} />
                <Bar dataKey="mentions" fill="#FFC760" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Ticker Sentiment</h3>
          <div className="chart">
            <ResponsiveContainer className="responsive-container">
              <BarChart
                data={sentimentData || []}
                margin={{
                  right: 30,
                }}
              >
                <XAxis dataKey="name" stroke="#fff" opacity={0.85} />
                <YAxis stroke="#fff" opacity={0.85} />
                <Tooltip content={(e) => customTooltip(e)} />
                <Bar dataKey="positive" fill="#FFC760" />
                <Bar dataKey="neutral" fill="#4B7AF2" />
                <Bar dataKey="negative" fill="#FB497C" />
                <Legend
                  wrapperStyle={{ position: "relative", marginLeft: 30 }}
                />
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

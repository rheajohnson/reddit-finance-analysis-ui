import React, { useEffect, useState } from "react";
import Header from "components/header";
import Summary from "components/summary";
import Footer from "components/footer";
import Chart from "components/chart";
import { useQuery, gql } from "@apollo/react-hooks";
import { BarChart, XAxis, YAxis, Tooltip, Bar, Legend } from "recharts";

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

  const dataSubscription = (subscribeToMore) => {
    subscribeToMore({
      document: DATA_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        setAnalysisData(subscriptionData.data.onUpdateAnalysisData);
      },
      onError: ({ errors }) => {
        if (errors && errors[0].message === "Connection closed") {
          setTimeout(() => {
            dataSubscription(subscribeToMore);
          }, 5000);
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
      <Header timestamp={analysisData.timestamp} />
      <Summary
        totalComments={analysisData.totalComments}
        totalPosts={analysisData.totalPosts}
        totalSubreddits={analysisData.totalSubreddits}
      />
      <section className="charts-wrapper">
        <Chart title="Most Mentioned Tickers">
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
        </Chart>
        <Chart title="Ticker Sentiment">
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
            <Legend wrapperStyle={{ position: "relative", marginLeft: 30 }} />
          </BarChart>
        </Chart>
      </section>
      <Footer />
    </div>
  );
};

export default App;

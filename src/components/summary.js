import React from "react";

const Summary = ({ totalComments, totalPosts, totalSubreddits }) => {
  return (
    <section className="summary-container">
      <h3 className="section-title">Summary</h3>
      <p>{`Analyzed ${totalComments} comments in ${totalPosts} posts in ${totalSubreddits} subreddits.`}</p>
    </section>
  );
};

export default Summary;

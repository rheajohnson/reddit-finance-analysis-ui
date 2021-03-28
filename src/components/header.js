import React from "react";
import Moment from "react-moment";

const Header = ({ timestamp }) => {
  return (
    <header>
      <h2 className="section-title">Reddit Finance Scraper</h2>
      <p>
        Updated{" "}
        <Moment interval={1000} fromNow utc>
          {timestamp}
        </Moment>
      </p>
    </header>
  );
};

export default Header;

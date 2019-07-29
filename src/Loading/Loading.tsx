import React from "react";
import { Progress } from "reactstrap";

import "./Loading.scss";

export const Loading = ({ text }: { text?: string }) => (
  <div className="loading">
    <p>
      <small>
        <em>{text || "Loading ..."}</em>
      </small>
    </p>
    <Progress striped animated value={50} />
  </div>
);

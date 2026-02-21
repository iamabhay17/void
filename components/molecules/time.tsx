"use client";

import React from "react";

export const ISTTime = () => {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const istTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
      setTime(istTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);
  return <span>{time}</span>;
};

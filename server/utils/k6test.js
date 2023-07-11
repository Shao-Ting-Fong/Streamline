// Import necessary modules
import { check } from "k6";
import http from "k6/http";

//define configuration
export const options = {
  // scenarios: {
  //   //arbitrary name of scenario
  //   average_load: {
  //     executor: "ramping-vus",
  //     stages: [
  //       // ramp up to average load of 20 virtual users
  //       { duration: "10s", target: 20 },
  //       // maintain load
  //       { duration: "50s", target: 20 },
  //       // ramp down to zero
  //       { duration: "5s", target: 0 },
  //     ],
  //   },
  // },

  scenarios: {
    //arbitrary name of scenario:
    breaking: {
      executor: "ramping-vus",
      stages: [
        { duration: "10s", target: 20 },
        { duration: "50s", target: 20 },
        { duration: "50s", target: 40 },
        { duration: "50s", target: 60 },
        { duration: "50s", target: 80 },
        { duration: "50s", target: 100 },
        { duration: "50s", target: 120 },
        { duration: "50s", target: 140 },
        //....
      ],
    },
  },
  //define thresholds
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true }], // availability threshold for error rate
    http_req_duration: ["p(99)<1000"], // Latency threshold for percentile
  },
};

export default function () {
  // define URL and request body
  const url =
    "https://slackalendar.fonguniverse.com/chat/workspace/64a8d35fbd70c6d7898ebdc5/channel/64a8d360bd70c6d7898ebdcb/msg";
  const payload = JSON.stringify({
    username: "Irene",
    password: "irene",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send a post request and save response as a variable
  // const res = http.post(url, payload, params);
  const res = http.get(url);

  // check that response is 200
  check(res, {
    "login response was 200": (res) => res.status == 200,
  });
}

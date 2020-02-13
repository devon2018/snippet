import axios from "axios";
import { window, commands } from "vscode";

axios.defaults.baseURL = "http://tackk.api.localdev:6961/api/";

axios.interceptors.request.use(
  config => {
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    config.headers["Accept"] = "application/json";
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  response => {
    // if (response.headers.authorization) {
    //   let match = response.headers.authorization.match(/Bearer (.+)/)
    //   if (match) localStorage.setItem('token', match[1])
    // }
    return response.data;
  },
  err => {
    console.log(err);
    if (err.response.status === 401) {
      window.showErrorMessage("You have been logged out, please login again");
      commands.executeCommand('extension.login');
    }

    return Promise.reject(err);
  }
);

export default axios;

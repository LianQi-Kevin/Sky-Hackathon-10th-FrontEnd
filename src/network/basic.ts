import axios from "axios";

const basic_url: string = new URL("backend", window.location.href).toString();

const basic_axios = axios.create({
  baseURL: basic_url,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    'Access-Control-Allow-Origin': '*'
  }
});

export default basic_axios;
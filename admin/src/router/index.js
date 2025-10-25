import { useNavigate } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import routes from "./config";

let navigateResolver;

export const navigatePromise = new Promise((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  if (!window.REACT_APP_NAVIGATE) {
    const navigate = useNavigate();
    useEffect(() => {
      window.REACT_APP_NAVIGATE = navigate;
      navigateResolver(window.REACT_APP_NAVIGATE);
    });
  }
  return element;
}
import React, { useEffect } from "react";
import useAuthStore from "../store/authStore";

export const AuthProvider = ({ children }) => {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return children;
};
export default AuthProvider;

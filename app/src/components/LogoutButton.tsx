import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
}

const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  if (!user) return null;

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      className="bg-red-500 hover:bg-red-600"
    >
      Déconnexion
    </Button>
  );
};

export default LogoutButton;

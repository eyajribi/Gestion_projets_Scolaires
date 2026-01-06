import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/auth";

const EmailVerification = () => {
  const [status, setStatus] = useState("pending"); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return setStatus("error");

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000); 
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };
    verify();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-page">
      {status === "pending" && <p>Vérification en cours...</p>}
      {status === "success" && <p>Votre email a été vérifié ! Redirection vers la connexion...</p>}
      {status === "error" && <p>Erreur lors de la vérification de l’email.</p>}
    </div>
  );
};

export default EmailVerification;

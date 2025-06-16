import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

interface AuthWrapperProps {
  onAuthSuccess: () => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(prev => !prev);
  };

  return (
    <>
      {isLoginMode ? (
        <Login onToggleMode={toggleMode} onSuccess={onAuthSuccess} />
      ) : (
        <SignUp onToggleMode={toggleMode} onSuccess={onAuthSuccess} />
      )}
    </>
  );
};

export default AuthWrapper; 
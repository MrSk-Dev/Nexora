import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SplashVisual from '../../components/SplashVisual';

const NexoraSplash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.destination || '/';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(destination, { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [destination, navigate]);

  return <SplashVisual />;
};

export default NexoraSplash;
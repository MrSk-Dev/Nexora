import logo from '../assets/logo.png';

const SplashVisual = () => {
  return (
    <div className="splash-screen">
      <div className="splash-logo-wrapper">
        <img src={logo} alt="Nexora" className="splash-logo-image" />
        <h1 className="splash-brand-name">Nexora</h1>
        <p className="splash-tagline">Your Marketplace, Reimagined</p>
      </div>
    </div>
  );
};

export default SplashVisual;
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-state">
    <div className="spinner spinner-lg"></div>
    <p>{text}</p>
  </div>
);

export default LoadingSpinner;

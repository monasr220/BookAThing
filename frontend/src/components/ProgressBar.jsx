export default function ProgressBar({ step }) {
  return (
    <div className="progress-bar">
      <div className={step >= 1 ? "progress-step active" : "progress-step"}></div>
      <div className={step >= 2 ? "progress-step active" : "progress-step"}></div>
      <div className={step >= 3 ? "progress-step active" : "progress-step"}></div>
    </div>
  );
}

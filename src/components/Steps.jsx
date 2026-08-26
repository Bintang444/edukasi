const STEPS = ["Spin", "Data Diri", "Verifikasi"];

const Steps = ({ current }) => (
  <div className="steps">
    {STEPS.map((label, i) => (
      <div key={label} style={{ display: "contents" }}>
        {i > 0 && <div className={`step-line ${i <= current ? "on" : ""}`} />}
        <div className={`step ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}>
          <div className="step-dot">{i < current ? "✓" : i + 1}</div>
          <div className="step-label">{label}</div>
        </div>
      </div>
    ))}
  </div>
);

export default Steps;

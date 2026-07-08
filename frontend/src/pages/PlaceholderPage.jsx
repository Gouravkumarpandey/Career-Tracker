import React from 'react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="overview-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="dash-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: '16px' }}>
          This feature module is under construction and will be built in future iterations.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;

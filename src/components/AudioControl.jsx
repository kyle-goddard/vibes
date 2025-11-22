import React from 'react';

const AudioControl = ({ isMuted, onToggle }) => {
    return (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
            <button
                onClick={(e) => {
                    onToggle();
                    e.currentTarget.blur();
                }}
                style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    color: '#00ff00',
                    padding: '8px 12px',
                    fontFamily: '"Courier New", Courier, monospace',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textShadow: '0 0 5px #00ff00',
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 255, 0, 0.1)';
                    e.target.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                    e.target.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                }}
            >
                {isMuted ? '🔇 MUTED' : '🔊 AUDIO ON'}
            </button>
        </div>
    );
};

export default AudioControl;

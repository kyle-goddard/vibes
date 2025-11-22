import { useState } from 'react'

function StartScreen({ onStart }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="app-container">
            <h1 className="title">VIBES</h1>
            <p className="subtitle">Immersive Gaming Experience</p>

            <div className="status-box">
                <span className="status-text">System Status: <span className="blink">ONLINE</span></span>
            </div>

            <button
                className="start-btn"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onStart}
            >
                {isHovered ? 'ENTER THE VOID' : "LET'S GO!"}
            </button>
        </div>
    )
}

export default StartScreen

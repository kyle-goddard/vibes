import { useState, useEffect, useRef } from 'react'
import './Cockpit.css'

function Cockpit({ onBack }) {
    const [engineStarted, setEngineStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [originOffset, setOriginOffset] = useState({ x: 0, y: 0 });
    const [isArrowKeyPressed, setIsArrowKeyPressed] = useState(false);
    const [lasers, setLasers] = useState([]);
    const canvasRef = useRef(null);

    // Refs for animation loop to access latest state without re-triggering effect
    const engineStartedRef = useRef(engineStarted);
    const isPausedRef = useRef(isPaused);
    const originOffsetRef = useRef(originOffset);
    const isArrowKeyPressedRef = useRef(isArrowKeyPressed);
    const lasersRef = useRef([]);
    const starsRef = useRef([]);

    // Update refs when state changes
    useEffect(() => {
        engineStartedRef.current = engineStarted;
    }, [engineStarted]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        originOffsetRef.current = originOffset;
    }, [originOffset]);

    useEffect(() => {
        isArrowKeyPressedRef.current = isArrowKeyPressed;
    }, [isArrowKeyPressed]);

    useEffect(() => {
        lasersRef.current = lasers;
    }, [lasers]);

    // Auto-centering effect - gradually move origin back to center
    useEffect(() => {
        if (!engineStarted || isPaused) return;

        let animationFrameId;

        const autoCenterLoop = () => {
            // Only apply auto-centering if no arrow keys are being pressed
            if (!isArrowKeyPressedRef.current) {
                setOriginOffset(prev => {
                    const dampingFactor = 0.95; // Controls how quickly it returns to center
                    const threshold = 0.1; // Stop when very close to center

                    const newX = Math.abs(prev.x) < threshold ? 0 : prev.x * dampingFactor;
                    const newY = Math.abs(prev.y) < threshold ? 0 : prev.y * dampingFactor;

                    return { x: newX, y: newY };
                });
            }

            animationFrameId = requestAnimationFrame(autoCenterLoop);
        };

        animationFrameId = requestAnimationFrame(autoCenterLoop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [engineStarted, isPaused]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (isPaused) {
                    setIsPaused(false);
                } else if (!engineStarted) {
                    setEngineStarted(true);
                } else if (engineStarted && !isPaused) {
                    // Fire lasers during active flight
                    const canvas = canvasRef.current;
                    const targetX = canvas.width / 2 - originOffset.x;
                    const targetY = canvas.height / 2 - originOffset.y;

                    const newLasers = [
                        {
                            id: Date.now() + Math.random(),
                            startX: canvas.width / 2 - 30,
                            startY: canvas.height,
                            currentX: canvas.width / 2 - 30,
                            currentY: canvas.height,
                            targetX: targetX,
                            targetY: targetY,
                            progress: 0
                        },
                        {
                            id: Date.now() + Math.random() + 1,
                            startX: canvas.width / 2 + 30,
                            startY: canvas.height,
                            currentX: canvas.width / 2 + 30,
                            currentY: canvas.height,
                            targetX: targetX,
                            targetY: targetY,
                            progress: 0
                        }
                    ];

                    setLasers(prev => [...prev, ...newLasers]);
                }
            } else if (event.code === 'Escape') {
                if (isPaused) {
                    onBack();
                } else {
                    setIsPaused(true);
                }
            } else if (engineStarted && !isPaused) {
                const step = 10;
                const maxOffset = 300; // Limit how far the origin can move

                let newX = originOffset.x;
                let newY = originOffset.y;
                let isArrowKey = false;

                switch (event.code) {
                    case 'ArrowUp':
                        newY = Math.min(originOffset.y + step, maxOffset);
                        isArrowKey = true;
                        break;
                    case 'ArrowDown':
                        newY = Math.max(originOffset.y - step, -maxOffset);
                        isArrowKey = true;
                        break;
                    case 'ArrowLeft':
                        newX = Math.min(originOffset.x + step, maxOffset);
                        isArrowKey = true;
                        break;
                    case 'ArrowRight':
                        newX = Math.max(originOffset.x - step, -maxOffset);
                        isArrowKey = true;
                        break;
                    default:
                        return; // Exit if not an arrow key
                }

                if (isArrowKey) {
                    setIsArrowKeyPressed(true);
                    setOriginOffset({ x: newX, y: newY });
                }
            }
        };

        const handleKeyUp = (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                setIsArrowKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [engineStarted, isPaused, onBack, originOffset]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Initialize stars if empty
        if (starsRef.current.length === 0) {
            const numStars = 800;
            for (let i = 0; i < numStars; i++) {
                starsRef.current.push({
                    x: Math.random() * canvas.width - canvas.width / 2,
                    y: Math.random() * canvas.height - canvas.height / 2,
                    z: Math.random() * canvas.width
                });
            }
        }

        const draw = () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2 + originOffsetRef.current.x;
            const cy = canvas.height / 2 + originOffsetRef.current.y;
            const stars = starsRef.current;
            const speed = engineStartedRef.current ? 20 : 0.5;

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Only update position if not paused
                if (!isPausedRef.current) {
                    star.z -= speed;

                    if (star.z <= 0) {
                        star.x = Math.random() * canvas.width - canvas.width / 2;
                        star.y = Math.random() * canvas.height - canvas.height / 2;
                        star.z = canvas.width;
                    }
                }

                const x = (star.x / star.z) * canvas.width + cx;
                const y = (star.y / star.z) * canvas.height + cy;
                const size = (1 - star.z / canvas.width) * 3;

                if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
                    const brightness = 1 - star.z / canvas.width;
                    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                    ctx.beginPath();
                    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw and update lasers
            const activeLasers = lasersRef.current;
            const lasersToRemove = [];

            activeLasers.forEach((laser, index) => {
                if (!isPausedRef.current) {
                    // Update laser progress
                    laser.progress += 0.05; // Speed of laser movement

                    if (laser.progress >= 1) {
                        lasersToRemove.push(laser.id);
                        return;
                    }

                    // Calculate current position using easing
                    const easeProgress = laser.progress;
                    laser.currentX = laser.startX + (laser.targetX - laser.startX) * easeProgress;
                    laser.currentY = laser.startY + (laser.targetY - laser.startY) * easeProgress;
                }

                // Draw laser beam
                const gradient = ctx.createLinearGradient(
                    laser.startX, laser.startY,
                    laser.currentX, laser.currentY
                );

                // Create glowing effect
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                gradient.addColorStop(0.3, 'rgba(255, 0, 0, 0.8)');
                gradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#f00';

                ctx.beginPath();
                ctx.moveTo(laser.startX, laser.startY);
                ctx.lineTo(laser.currentX, laser.currentY);
                ctx.stroke();

                // Reset shadow
                ctx.shadowBlur = 0;
            });

            // Remove completed lasers
            if (lasersToRemove.length > 0) {
                setLasers(prev => prev.filter(laser => !lasersToRemove.includes(laser.id)));
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Run once on mount

    return (
        <div className="cockpit-container">
            <div className="viewport">
                <canvas ref={canvasRef} className="starfield-canvas" />
                <div className="planet"></div>
                {!engineStarted && !isPaused && (
                    <div className="instruction-overlay">
                        PRESS SPACE BAR TO START ENGINES
                    </div>
                )}
                {engineStarted && !isPaused && (
                    <div className="pause-hint">
                        HIT ESC TO PAUSE
                    </div>
                )}
                {isPaused && (
                    <div className="instruction-overlay">
                        GAME PAUSED<br />
                        <span style={{ fontSize: '1rem' }}>PRESS SPACE TO RESUME / ESC TO ABORT</span>
                    </div>
                )}
                {engineStarted && (
                    <div
                        className="origin-crosshair"
                        style={{
                            left: `calc(50% + ${-originOffset.x}px)`,
                            top: `calc(50% + ${-originOffset.y}px)`
                        }}
                    />
                )}
            </div>
            <div className="dashboard">
                <div className="panel left-panel">
                    <div className="screen">SYSTEM DIAGNOSTICS</div>
                    <div className="controls">
                        <div className="button-row">
                            <button className="control-btn"></button>
                            <button className="control-btn"></button>
                            <button className="control-btn"></button>
                        </div>
                    </div>
                </div>
                <div className="panel center-panel">
                    <div className="radar"></div>
                </div>
                <div className="panel right-panel">
                    <div className="screen">NAVIGATION</div>
                    <div className="data-readout">
                        <span>VEL: {engineStarted ? '800.00' : '0.00'}</span>
                        <span>POS: [0,0,0]</span>
                        <button className="nav-btn" onClick={onBack}>&lt; ABORT MISSION</button>
                    </div>
                </div>
            </div>
            <div className="overlay"></div>
        </div>
    )
}

export default Cockpit

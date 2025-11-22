import { useState, useEffect, useRef } from 'react'
import './Cockpit.css'

function Cockpit({ onBack }) {
    const [engineStarted, setEngineStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [originOffset, setOriginOffset] = useState({ x: 0, y: 0 });
    const [isArrowKeyPressed, setIsArrowKeyPressed] = useState(false);
    const [lasers, setLasers] = useState([]);
    const [targets, setTargets] = useState([]);
    const [score, setScore] = useState(0);
    const [ammo, setAmmo] = useState(50);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef(null);

    // Refs for animation loop to access latest state without re-triggering effect
    const engineStartedRef = useRef(engineStarted);
    const isPausedRef = useRef(isPaused);
    const originOffsetRef = useRef(originOffset);
    const isArrowKeyPressedRef = useRef(isArrowKeyPressed);
    const lasersRef = useRef([]);
    const starsRef = useRef([]);
    const targetsRef = useRef([]);
    const lastSpawnTimeRef = useRef(0);

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

    useEffect(() => {
        targetsRef.current = targets;
    }, [targets]);

    // Check for game over when ammo runs out
    useEffect(() => {
        if (ammo === 0 && engineStarted && !gameOver) {
            setGameOver(true);
        }
    }, [ammo, engineStarted, gameOver]);

    // Auto-centering effect - gradually move origin back to center
    useEffect(() => {
        if (!engineStarted || isPaused) return;

        let animationFrameId;

        const autoCenterLoop = () => {
            // Only apply auto-centering if no arrow keys are being pressed
            if (!isArrowKeyPressedRef.current) {
                setOriginOffset(prev => {
                    const dampingFactor = 0.98; // Controls how quickly it returns to center
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
                } else if (engineStarted && !isPaused && !gameOver) {
                    // Fire lasers during active flight
                    if (ammo > 0) {
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
                        setAmmo(prev => prev - 1);
                    }
                }
            } else if (event.code === 'Escape') {
                if (isPaused || gameOver) {
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
            const currentTime = Date.now();

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

            // Spawn targets
            if (engineStartedRef.current && !isPausedRef.current) {
                const currentTime = Date.now();
                const spawnInterval = 1000 + Math.random() * 1000; // 1-2 seconds

                if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
                    lastSpawnTimeRef.current = currentTime;

                    // Randomly choose target type
                    const targetType = Math.random() < 0.5 ? 'rock' : 'alien';

                    // Random spawn position (from edges)
                    const spawnSide = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
                    let x, y, vx, vy;

                    const speed = 1 + Math.random() * 1.5;

                    switch (spawnSide) {
                        case 0: // top
                            x = Math.random() * canvas.width;
                            y = -50;
                            vx = (Math.random() - 0.5) * speed;
                            vy = speed;
                            break;
                        case 1: // right
                            x = canvas.width + 50;
                            y = Math.random() * canvas.height;
                            vx = -speed;
                            vy = (Math.random() - 0.5) * speed;
                            break;
                        case 2: // bottom
                            x = Math.random() * canvas.width;
                            y = canvas.height + 50;
                            vx = (Math.random() - 0.5) * speed;
                            vy = -speed;
                            break;
                        case 3: // left
                            x = -50;
                            y = Math.random() * canvas.height;
                            vx = speed;
                            vy = (Math.random() - 0.5) * speed;
                            break;
                    }

                    const newTarget = {
                        id: Date.now() + Math.random(),
                        type: targetType,
                        x,
                        y,
                        vx,
                        vy,
                        size: targetType === 'rock' ? 20 + Math.random() * 30 : 15 + Math.random() * 20,
                        rotation: 0,
                        rotationSpeed: (Math.random() - 0.5) * 0.1,
                        waveOffset: Math.random() * Math.PI * 2,
                        waveAmplitude: targetType === 'alien' ? 50 : 0,
                        waveFrequency: 0.02,
                        health: targetType === 'rock' ? 1 : 2,
                        hit: false,
                        hitTime: 0
                    };

                    setTargets(prev => [...prev, newTarget]);
                }
            }

            // Update and draw targets
            const activeTargets = targetsRef.current;
            const targetsToRemove = [];
            const lasersToRemoveFromCollision = [];

            activeTargets.forEach((target) => {
                if (!isPausedRef.current && !target.hit) {
                    // Update position
                    target.x += target.vx;

                    // Add wave motion for aliens
                    if (target.type === 'alien') {
                        target.y += target.vy + Math.sin(target.x * target.waveFrequency + target.waveOffset) * 0.5;
                    } else {
                        target.y += target.vy;
                    }

                    target.rotation += target.rotationSpeed;

                    // Check if off-screen
                    if (target.x < -100 || target.x > canvas.width + 100 ||
                        target.y < -100 || target.y > canvas.height + 100) {
                        targetsToRemove.push(target.id);
                        return;
                    }

                    // Check collision with lasers
                    activeLasers.forEach((laser) => {
                        const dx = laser.currentX - target.x;
                        const dy = laser.currentY - target.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // Increased collision radius for easier gameplay
                        const collisionRadius = target.size * 1.5;

                        if (distance < collisionRadius) {
                            target.health--;
                            if (target.health <= 0) {
                                target.hit = true;
                                target.hitTime = currentTime;
                                // Increase score based on target type
                                const points = target.type === 'rock' ? 1 : 2;
                                setScore(prev => prev + points);
                            }
                            lasersToRemoveFromCollision.push(laser.id);
                        }
                    });
                }

                // Handle hit animation
                if (target.hit) {
                    const timeSinceHit = Date.now() - target.hitTime;
                    if (timeSinceHit > 300) {
                        targetsToRemove.push(target.id);
                        return;
                    }

                    // Draw explosion effect
                    const explosionProgress = timeSinceHit / 300;
                    const explosionSize = target.size * (1 + explosionProgress * 2);
                    const alpha = 1 - explosionProgress;

                    ctx.save();
                    ctx.globalAlpha = alpha;

                    // Outer explosion ring
                    const gradient = ctx.createRadialGradient(
                        target.x, target.y, 0,
                        target.x, target.y, explosionSize
                    );
                    gradient.addColorStop(0, 'rgba(255, 200, 0, 1)');
                    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
                    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, explosionSize, 0, Math.PI * 2);
                    ctx.fill();

                    // Inner bright flash
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, target.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                    return;
                }

                // Draw target based on type
                ctx.save();
                ctx.translate(target.x, target.y);
                ctx.rotate(target.rotation);

                if (target.type === 'rock') {
                    // Draw space rock (asteroid)
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, target.size);
                    gradient.addColorStop(0, '#8B7355');
                    gradient.addColorStop(0.7, '#5C4033');
                    gradient.addColorStop(1, '#3E2723');

                    ctx.fillStyle = gradient;
                    ctx.strokeStyle = '#3E2723';
                    ctx.lineWidth = 2;

                    // Draw irregular polygon for asteroid
                    ctx.beginPath();
                    const sides = 8;
                    for (let i = 0; i < sides; i++) {
                        const angle = (i / sides) * Math.PI * 2;
                        const radius = target.size * (0.7 + Math.random() * 0.3);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Add some craters
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    for (let i = 0; i < 3; i++) {
                        const craterX = (Math.random() - 0.5) * target.size * 0.8;
                        const craterY = (Math.random() - 0.5) * target.size * 0.8;
                        const craterSize = target.size * 0.15;
                        ctx.beginPath();
                        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Draw alien UFO
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, target.size);
                    gradient.addColorStop(0, '#00ff88');
                    gradient.addColorStop(0.5, '#00cc66');
                    gradient.addColorStop(1, '#008844');

                    // UFO dome
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.ellipse(0, -5, target.size * 0.6, target.size * 0.4, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // UFO base
                    ctx.fillStyle = '#00aa55';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, target.size, target.size * 0.3, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Glow effect
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00ff88';
                    ctx.strokeStyle = '#00ff88';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, target.size, target.size * 0.3, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    // Windows
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#ffff00';
                    for (let i = -1; i <= 1; i++) {
                        ctx.beginPath();
                        ctx.arc(i * target.size * 0.3, -5, target.size * 0.1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                ctx.restore();
            });

            // Remove destroyed targets
            if (targetsToRemove.length > 0) {
                setTargets(prev => prev.filter(target => !targetsToRemove.includes(target.id)));
            }

            // Remove lasers that hit targets
            if (lasersToRemoveFromCollision.length > 0) {
                setLasers(prev => prev.filter(laser => !lasersToRemoveFromCollision.includes(laser.id)));
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
                {isPaused && !gameOver && (
                    <div className="instruction-overlay">
                        GAME PAUSED<br />
                        <span style={{ fontSize: '1rem' }}>PRESS SPACE TO RESUME / ESC TO ABORT</span>
                    </div>
                )}
                {gameOver && (
                    <div className="instruction-overlay" style={{
                        background: 'rgba(0, 0, 0, 0.95)',
                        border: '3px solid #f00',
                        boxShadow: '0 0 20px #f00, inset 0 0 20px rgba(255, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            color: '#f00',
                            marginBottom: '20px',
                            textShadow: '0 0 10px #f00, 0 0 20px #f00'
                        }}>
                            GAME OVER
                        </div>
                        <div style={{
                            fontSize: '2rem',
                            color: '#0ff',
                            marginBottom: '10px',
                            textShadow: '0 0 10px #0ff'
                        }}>
                            FINAL SCORE: {score}
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            color: '#fff',
                            marginTop: '30px'
                        }}>
                            AMMO DEPLETED
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            color: '#888',
                            marginTop: '20px'
                        }}>
                            PRESS ESC TO START OVER
                        </div>
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
                    <div className="screen">WEAPONS SYSTEM</div>
                    <div className="controls">
                        <div className="button-row">
                            <div style={{ color: '#0f0', fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
                                AMMO: {ammo}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel center-panel">
                    <div className="radar"></div>
                </div>
                <div className="panel right-panel">
                    <div className="screen">MISSION STATUS</div>
                    <div className="data-readout">
                        <span style={{ color: '#0ff', fontSize: '1.2rem', fontWeight: 'bold' }}>SCORE: {score}</span>
                        <span>VEL: {engineStarted ? '800.00' : '0.00'}</span>
                        <button className="nav-btn" onClick={onBack}>&lt; ABORT MISSION</button>
                    </div>
                </div>
            </div>
            <div className="overlay"></div>
        </div>
    )
}

export default Cockpit

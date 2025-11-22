# 🚀 VIBES - Retro Space Flight Simulator

> *Buckle up, pilot. The stars are calling.*

## 🌌 What is VIBES?

**VIBES** is a retro-inspired space flight simulator that transports you straight into the cockpit of a starship. Built with modern web technologies but designed with classic arcade aesthetics, VIBES delivers that nostalgic rush of piloting through the cosmos with smooth animations, dynamic controls, and an immersive retro soundtrack.

Press the spacebar. Feel the engines roar. Watch the stars streak past as you accelerate into the void. This isn't just a game—it's a *vibe*.

## ✨ Features

- **🎮 Intuitive Flight Controls** - Arrow keys control your star origin, creating dynamic flight maneuvers
- **🎯 Targeting System** - Lock onto targets with the crosshair overlay
- **⚡ Laser Weapons** - Fire dual laser beams with the spacebar during active flight
- **🎵 Retro Soundtrack** - Immersive audio inspired by classic arcade space games
- **🌟 Dynamic Starfield** - Stars that react to your movements, creating a realistic sense of speed
- **🕹️ Classic Arcade Aesthetic** - Retro UI design that feels like stepping into an 80s arcade cabinet

## 🛠️ Tech Stack

- **React 19** - Modern component architecture
- **Vite** - Lightning-fast development and build tooling
- **CSS Animations** - Smooth, performant visual effects
- **Web Audio API** - Retro audio generation and playback

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to the project
cd vibes

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` and prepare for launch! 🚀

## 🎮 How to Play

1. **Start Screen** - Click the "START" button to enter the cockpit
2. **Engine Ignition** - Press `SPACEBAR` to fire up the engines and accelerate
3. **Navigation** - Use `ARROW KEYS` to control your flight path
4. **Combat** - Press `SPACEBAR` during flight to fire laser beams
5. **Audio** - Toggle the retro soundtrack with the audio button (top-right)

## 📁 Project Structure

```
vibes/
├── src/
│   ├── components/
│   │   ├── StartScreen.jsx    # Initial launch screen
│   │   ├── Cockpit.jsx         # Main game view with flight controls
│   │   ├── Cockpit.css         # Starfield animations & cockpit styling
│   │   └── AudioControl.jsx    # Audio toggle component
│   ├── App.jsx                 # Main application logic
│   └── App.css                 # Global styles
├── public/
│   └── retro-tune.wav          # Procedurally generated retro soundtrack
└── generate_track.js           # Audio generation script
```

## 🎨 Design Philosophy

VIBES embraces the golden age of arcade gaming while leveraging modern web capabilities. Every element—from the starfield animation to the laser effects—is crafted to evoke that classic arcade feeling while maintaining smooth, responsive performance.

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Lint code
npm run lint
```

## 🎵 Audio Generation

The retro soundtrack is procedurally generated using the `generate_track.js` script, creating authentic arcade-style music reminiscent of classic space games.

## 🌟 Future Enhancements

- Enemy spacecraft encounters
- Power-up systems
- Multiple levels and missions
- High score tracking
- Multiplayer dogfights

## 📄 License

This project is open source and available for anyone who wants to experience the vibes.

---

**Built with ❤️ and retro vibes** | *May your trajectory be true, pilot.*

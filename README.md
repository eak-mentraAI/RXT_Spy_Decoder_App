# 🕵️ Spy Decoder - Operation Trick-or-Quest

A mobile-optimized Caesar cipher decoder web app for Halloween STEM scavenger hunt events.

## Features

### For Users
- 🔐 Caesar cipher decoding with shift values from -13 to +13
- 🌙 Dark mode with glowing neon UI effects
- 🎉 Success animations with confetti when winning phrases are decoded
- 🔊 Sound effects (with iOS compatibility)
- 📱 Mobile-first responsive design
- 💾 Works offline after first visit (PWA)

### For Admins
- 🔑 Hidden admin panel (access via triple-click on header or Ctrl+Shift+A)
- 🔐 Password: `rxtproduct25`
- 📝 Edit winning phrases (saved in localStorage)
- 📊 View event statistics
- 📥 Export statistics as JSON
- 🗑️ Clear statistics

## Quick Start

### Local Testing
1. Open terminal in the spy-decoder directory
2. Run: `python3 -m http.server 8080`
3. Open browser to: `http://localhost:8080`

### Deployment

#### GitHub Pages
```bash
git init
git add .
git commit -m "Initial spy decoder app"
git branch -M main
git remote add origin [your-repo-url]
git push -u origin main
```
Then enable GitHub Pages in repository settings.

#### Netlify
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the spy-decoder folder to the browser
3. Get instant URL

#### Vercel
```bash
npm i -g vercel
vercel
```

## Usage

### Basic Decoding
1. Enter encrypted message
2. Adjust cipher shift (-13 to +13)
3. Click "DECODE MESSAGE"
4. View decoded result

### Admin Access
1. Triple-click the header OR press Ctrl+Shift+A
2. Enter password: `rxtproduct25`
3. Manage winning phrases and view statistics

### Winning Phrases (Default)
- TOP SECRET
- MISSION COMPLETE
- CRYPTO
- RACKSPACE
- TRICK OR TREAT
- HALLOWEEN
- ACCESS GRANTED

## Keyboard Shortcuts
- **Ctrl/Cmd + Enter**: Decode message
- **Escape**: Clear inputs
- **Ctrl + Shift + A**: Open admin panel

## Mobile Gestures
- **Swipe left** on message input: Clear message
- **Double tap prevention**: No accidental zoom
- **Haptic feedback**: Vibration on button press (supported devices)

## Browser Support
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used
- Pure HTML5, CSS3, JavaScript (no frameworks)
- LocalStorage for data persistence
- Service Worker for offline functionality
- Progressive Web App (PWA) features

## Event Day Checklist
- [ ] Test app on target devices
- [ ] Configure winning phrases in admin panel
- [ ] Generate and print QR codes
- [ ] Brief event staff on admin features
- [ ] Test offline mode
- [ ] Prepare backup (paper decoder wheels)

## Troubleshooting

### Sound not working on iOS
- User needs to interact with page first (tap anywhere)
- Check if device is not in silent mode

### Admin panel won't open
- Try keyboard shortcut (Ctrl+Shift+A)
- Clear browser cache if needed
- Ensure JavaScript is enabled

### Statistics not saving
- Check if localStorage is enabled
- Clear browser data if storage is full

## License
Created for Rackspace Halloween STEM Event 2024

## Credits
- Design & Development: Based on Operation Trick-or-Quest PRD
- Icons: Spy emoji and custom SVG graphics
- Sound Effects: Embedded data URIs for instant loading
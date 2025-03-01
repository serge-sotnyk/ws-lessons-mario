# ws-lessons-mario
Windsurf generated code
https://raw.githack.com/serge-sotnyk/ws-lessons-mario/main/index.html

# Mario-like Platformer Game

A simple browser-based platformer game inspired by Super Mario Bros.

## How to Play

1. Open `index.html` in your web browser
2. Click the "START GAME" button
3. Use the arrow keys to control your character:
   - Left Arrow: Move left
   - Right Arrow: Move right
   - Up Arrow or Spacebar: Jump
   - Enter: Pause the game

## Game Features

- Player character with running and jumping animations
- Platforming mechanics with collision detection
- Enemies that you can defeat by jumping on them
- Collectible coins
- Moving platforms

## Requirements

- Modern web browser with HTML5 and JavaScript support
- No additional libraries or frameworks needed

## Technical Details

The game is built using vanilla JavaScript and HTML5 Canvas. It includes:

- Sprite-based animations
- Physics simulation (gravity, jumping, collision)
- Game loop using requestAnimationFrame
- Object-oriented design with classes for game entities

## Customization

You can customize the game by editing:

- `levels` array in `game.js` to create new levels with different platform layouts
- Add more enemy types or customize existing ones
- Change game constants like gravity, jump force, etc.

## Sprite Sheet

The game requires a sprites.png file. You should add a proper sprite sheet with:
- Player character animations (running, jumping)
- Enemy sprites
- Coin animation frames

## Notes

This is a learning project created as a simple demonstration of game development using HTML and JavaScript.

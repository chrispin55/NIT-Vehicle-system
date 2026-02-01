# 🚀 Auto Git Push System for NIT ITVMS

This system automatically monitors your project files and pushes changes to GitHub whenever you make modifications.

## 🎯 What It Does

- **File Monitoring**: Watches all project files for changes
- **Auto-Commit**: Automatically commits changes with descriptive messages
- **Auto-Push**: Pushes commits to GitHub immediately
- **Debouncing**: Waits 5 seconds after the last change before committing
- **Smart Filtering**: Ignores unnecessary files (node_modules, logs, etc.)

## 🚀 Quick Start

### Option 1: Using npm Scripts (Recommended)

```bash
# Install dependencies (includes chokidar)
npm install

# Start auto-push system
npm run auto-push
```

### Option 2: Using Batch File (Windows)

```bash
# Double-click this file or run from command line
start-auto-push.bat
```

### Option 3: Using Shell Script (Linux/Mac)

```bash
# Make executable and run
chmod +x start-auto-push.sh
./start-auto-push.sh
```

### Option 4: Direct Node.js

```bash
node auto-git-push.js
```

## 📋 Features

### ✅ **Smart File Watching**
- Monitors all files in the project directory
- Ignores unnecessary files and folders:
  - `node_modules/`
  - `.git/`
  - `*.log` files
  - `auto-git-push.js`
  - `package-lock.json`
  - `.env*` files
  - `dist/` and `build/` folders

### ⏱️ **Debouncing System**
- Waits 5 seconds after the last file change
- Prevents multiple commits for rapid changes
- Ensures all related changes are grouped together

### 📝 **Smart Commit Messages**
- Automatic timestamp for each commit
- Descriptive message format
- Example: `Auto-update: Changes detected and pushed automatically - 2026-02-01T16-35-42`

### 🔍 **Change Detection**
- Shows which files were modified
- Displays git status before committing
- Only commits when there are actual changes

### 🛡️ **Error Handling**
- Handles authentication failures gracefully
- Manages network errors with retry logic
- Provides clear error messages

## 🎮 Usage Examples

### While Developing
1. Start the auto-push system
2. Make changes to your code
3. Save files normally
4. Changes are automatically pushed to GitHub after 5 seconds

### Multiple File Changes
```bash
# Edit multiple files
# All changes will be grouped into one commit
# Auto-push waits 5 seconds after your last save
```

### Continuous Development
```bash
# Start the system once
# Work on your project normally
# All changes are automatically synced to GitHub
```

## 📊 What You'll See

```
🚀 Auto Git Push System Starting...
📁 Watching: /path/to/your/project
⏱️  Debounce time: 5000ms
🔄 Ready to auto-commit changes...

📝 File changed: frontend/js/vehicles.js
📝 File changed: backend/routes/vehicles.js

🔄 Starting auto-commit and push process...
📋 Changes detected:
 M frontend/js/vehicles.js
 M backend/routes/vehicles.js
➕ Adding changes...
💾 Committing changes...
📤 Pushing to GitHub...
✅ Successfully pushed changes to GitHub!
🔗 Repository: https://github.com/chrispin55/NIT-Vehicle-system.git
🏁 Auto-commit process completed.
```

## ⚙️ Configuration

You can modify the settings in `auto-git-push.js`:

```javascript
const config = {
  projectPath: __dirname,              // Project directory
  commitMessage: 'Your custom message', // Custom commit message
  debounceTime: 5000,                  // Wait time in milliseconds
  ignorePatterns: [                    // Files to ignore
    '**/node_modules/**',
    '**/.git/**',
    // Add more patterns as needed
  ]
};
```

## 🛑 Stopping the System

Press `Ctrl+C` in the terminal to stop the auto-push system gracefully.

## 🔧 Troubleshooting

### Git Authentication Issues
```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Or use GitHub CLI
gh auth login
```

### Permission Issues
```bash
# Make sure the script is executable (Linux/Mac)
chmod +x start-auto-push.sh
```

### Node.js Not Found
```bash
# Install Node.js from https://nodejs.org/
# Or use package manager like nvm
```

### Dependencies Missing
```bash
# Install required dependencies
npm install chokidar
```

## 🔄 Integration with Development Workflow

### Recommended Workflow
1. **Start auto-push** when you begin development
2. **Work normally** - edit and save files
3. **Auto-push handles** all Git operations
4. **Focus on coding** instead of Git management

### Best Practices
- Keep the auto-push running during development
- Make meaningful changes before saving
- Review commits occasionally on GitHub
- Stop the system when doing large refactoring

### Railway Deployment
Since Railway deploys from GitHub, this auto-push system ensures:
- **Immediate deployment** after changes
- **Always up-to-date** production
- **Version history** of all changes
- **Rollback capability** if needed

## 🎯 Benefits

✅ **Zero-effort Git management**  
✅ **Always synced with GitHub**  
✅ **Automatic Railway deployments**  
✅ **Complete version history**  
✅ **Focus on coding, not Git**  
✅ **No more forgotten commits**  

---

**Start the auto-push system and enjoy seamless development with automatic GitHub synchronization!** 🚀✨

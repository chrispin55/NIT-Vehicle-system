const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');

// Configuration
const config = {
  projectPath: __dirname,
  commitMessage: 'Auto-update: Changes detected and pushed automatically',
  debounceTime: 5000, // Wait 5 seconds after last change before committing
  ignorePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/*.log',
    '**/auto-git-push.js',
    '**/package-lock.json',
    '**/.env*',
    '**/dist/**',
    '**/build/**'
  ]
};

class AutoGitPush {
  constructor() {
    this.isProcessing = false;
    this.timeout = null;
    this.watcher = null;
    this.init();
  }

  init() {
    console.log('🚀 Auto Git Push System Starting...');
    console.log(`📁 Watching: ${config.projectPath}`);
    console.log(`⏱️  Debounce time: ${config.debounceTime}ms`);
    console.log('🔄 Ready to auto-commit changes...\n');

    // Start file watcher
    this.startWatcher();
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  startWatcher() {
    this.watcher = chokidar.watch(config.projectPath, {
      ignored: config.ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    this.watcher
      .on('change', (filePath) => this.handleChange(filePath, 'changed'))
      .on('add', (filePath) => this.handleChange(filePath, 'added'))
      .on('unlink', (filePath) => this.handleChange(filePath, 'deleted'))
      .on('error', (error) => console.error('❌ Watcher error:', error));
  }

  handleChange(filePath, action) {
    console.log(`📝 File ${action}: ${path.relative(config.projectPath, filePath)}`);
    
    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Set new timeout for debouncing
    this.timeout = setTimeout(() => {
      this.commitAndPush();
    }, config.debounceTime);
  }

  async commitAndPush() {
    if (this.isProcessing) {
      console.log('⏳ Already processing changes, skipping...');
      return;
    }

    this.isProcessing = true;
    console.log('\n🔄 Starting auto-commit and push process...');

    try {
      // Check if we're in a git repository
      await this.executeCommand('git status --porcelain');
      
      // Check if there are changes to commit
      const status = await this.executeCommand('git status --porcelain');
      
      if (!status.trim()) {
        console.log('✅ No changes to commit');
        this.isProcessing = false;
        return;
      }

      console.log('📋 Changes detected:');
      console.log(status);

      // Add all changes
      console.log('➕ Adding changes...');
      await this.executeCommand('git add .');

      // Commit changes
      console.log('💾 Committing changes...');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const commitMessage = `${config.commitMessage} - ${timestamp}`;
      await this.executeCommand(`git commit -m "${commitMessage}"`);

      // Push to GitHub
      console.log('📤 Pushing to GitHub...');
      await this.executeCommand('git push origin main');

      console.log('✅ Successfully pushed changes to GitHub!');
      console.log(`🔗 Repository: https://github.com/chrispin55/NIT-Vehicle-system.git`);

    } catch (error) {
      console.error('❌ Error during auto-commit:', error.message);
      
      // Handle common git errors
      if (error.message.includes('nothing to commit')) {
        console.log('ℹ️  No changes to commit');
      } else if (error.message.includes('Authentication failed')) {
        console.log('⚠️  Git authentication failed. Please check your credentials.');
      } else if (error.message.includes('remote')) {
        console.log('⚠️  Network error. Will retry next time.');
      }
    } finally {
      this.isProcessing = false;
      console.log('🏁 Auto-commit process completed.\n');
    }
  }

  executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: config.projectPath }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${error.message}\n${stderr}`));
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  shutdown() {
    console.log('\n🛑 Shutting down Auto Git Push system...');
    if (this.watcher) {
      this.watcher.close();
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    console.log('✅ Auto Git Push system stopped.');
    process.exit(0);
  }
}

// Start the auto-push system
new AutoGitPush();

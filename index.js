const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to run a shell command
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function main() {
  try {
    const repoPath = path.join(__dirname, 'zero-cost-website');
    
    // Install dependencies
    console.log('Installing dependencies...');
    await runCommand('npm install', repoPath);

    // Start the development server
    console.log('Starting the development server...');
    // Use exec instead of runCommand to keep the process running
    const serverProcess = exec('npm run dev -- --host 0.0.0.0 --port 5000', { 
      cwd: repoPath 
    });

    // Forward stdout and stderr to console
    serverProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(data);
    });

    // Handle process exit
    serverProcess.on('exit', (code) => {
      console.log(`Development server exited with code ${code}`);
    });

  } catch (error) {
    console.error('Error setting up the project:', error);
  }
}

// Run the main function
main();

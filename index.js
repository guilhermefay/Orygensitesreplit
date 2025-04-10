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
    
    // Instalar dependências adicionais para o servidor Express
    console.log('Installing Express server dependencies...');
    await runCommand('npm install express cors stripe', repoPath);

    // Start the Express API server
    console.log('Starting the Express API server...');
    
    // Não é necessário copiar, já criamos o arquivo diretamente
    // no diretório correto usando o editor de strings
    
    // Execute o servidor no diretório correto
    const apiServerProcess = exec('node server.js', { 
      cwd: repoPath
    });

    // Forward stdout and stderr to console for API server
    apiServerProcess.stdout.on('data', (data) => {
      console.log(`[API] ${data}`);
    });

    apiServerProcess.stderr.on('data', (data) => {
      console.error(`[API] ${data}`);
    });

    // Handle API server process exit
    apiServerProcess.on('exit', (code) => {
      console.log(`API server exited with code ${code}`);
    });

    // Start the development server
    console.log('Starting the development server...');
    // Use exec instead of runCommand to keep the process running
    const serverProcess = exec('npm run dev -- --host 0.0.0.0 --port 5000', { 
      cwd: repoPath 
    });

    // Forward stdout and stderr to console for development server
    serverProcess.stdout.on('data', (data) => {
      console.log(`[DEV] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[DEV] ${data}`);
    });

    // Handle development server process exit
    serverProcess.on('exit', (code) => {
      console.log(`Development server exited with code ${code}`);
    });

  } catch (error) {
    console.error('Error setting up the project:', error);
  }
}

// Run the main function
main();

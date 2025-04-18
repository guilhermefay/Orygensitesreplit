import { exec as execCallback } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Usar util.promisify para transformar exec em uma função assíncrona
import { promisify } from 'util';
const exec = promisify(execCallback);

// Function to run a shell command
async function runCommand(command, cwd) {
  try {
    const { stdout, stderr } = await exec(command, { cwd });
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(stdout);
    return stdout;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

// Configurar __dirname equivalente para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const repoPath = path.join(__dirname, 'zero-cost-website');
    
    // Install dependencies
    console.log('Installing dependencies...');
    await runCommand('npm install', repoPath);
    
    // Instalar dependências adicionais para o servidor Express
    console.log('Installing Express server dependencies...');
    await runCommand('npm install express cors stripe', repoPath);

    // Construa a aplicação para produção
    console.log('Building the React application...');
    try {
      await runCommand('npm run build', repoPath);
      console.log('Build completed successfully');
    } catch (error) {
      console.error('Error during build:', error);
      console.log('Continuing with development server...');
    }

    // Inicie o servidor Express (que também serve os arquivos estáticos)
    console.log('Starting the Express server...');
    const serverProcess = execCallback('PORT=5000 node server.js', { 
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

import { spawn } from 'child_process';

const arg = process.argv[2];

const targetHost = `https://rt-${arg}.valetax.internal/`;

const child = spawn('cross-env', [`VITE_TARGET_HOST=${targetHost}`, 'vite'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code);
});

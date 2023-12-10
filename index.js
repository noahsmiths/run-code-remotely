const { spawn } = require('node:child_process');
const server = require('http').createServer();
const io = require('socket.io')(server);

const port = 3000;

io.on('connection', (socket) => {
    const process = spawn('python3', ['-m', 'script']);

    // Effectively "pipe" stdout and stderr to client and stdin from client
    process.stdout.on('data', (data) => {
        socket.emit('stdout', data.toString());
    });

    process.stderr.on('data', (data) => {
        socket.emit('stderr', data.toString());
    });

    socket.on('stdin', (data) => {
        process.stdin.write(`${data}\n`);
    });

    // Make sure if one side terminates, the other definitely does too
    process.on('close', () => {
        socket.disconnect();
    });

    socket.on('disconnect', () => {
        process.kill();
    });
});

server.listen(3000, () => {
    console.log(`Listening on port ${port}...`);
});
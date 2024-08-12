const http = require('http');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { StringDecoder } = require('string_decoder');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the 'uploads' folder

// Serve the HTML form
function serveForm(req, res) {
    fs.readFile('public/index.html', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
}

// Serve CSS files
function serveCSS(req, res) {
    const filePath = path.join(__dirname, 'public', req.url);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        }
    });
}

// Handle form submission
function handleFormSubmission(req, res) {
    upload.single('resume')(req, res, (err) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        const formData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            education: req.body.education,
            experience: req.body.experience,
            skills: req.body.skills,
            projects: req.body.projects,
            coverLetter: req.body.coverLetter,
            resume: req.file ? req.file.filename : 'No file uploaded'
        };

        // Log the data to the console
        console.log('Form Data:', formData);

        // Save to a file
        fs.appendFile('submissions.txt', JSON.stringify(formData) + '\n', (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Application submitted successfully!');
            }
        });
    });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        serveForm(req, res);
    } else if (req.method === 'GET' && req.url.endsWith('.css')) {
        serveCSS(req, res);
    } else if (req.method === 'POST' && req.url === '/submit-application') {
        handleFormSubmission(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

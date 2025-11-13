
// Endpoint pour l'écosystème
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    project: '$project',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

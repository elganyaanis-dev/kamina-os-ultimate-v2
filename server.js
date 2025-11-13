const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// =====================
// ENDPOINTS ÉCOSYSTÈME
// =====================

// Santé du projet - Pour le dashboard maître
app.get('/api/health', (req, res) => {
  try {
    const files = fs.readdirSync('.');
    const packageJson = fs.existsSync('package.json') 
      ? JSON.parse(fs.readFileSync('package.json', 'utf8'))
      : {};
    
    res.json({
      status: 'healthy',
      project: '$project',
      timestamp: new Date().toISOString(),
      version: packageJson.version || '1.0.0',
      totalFiles: files.length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Informations du projet
app.get('/api/project-info', (req, res) => {
  try {
    const files = fs.readdirSync('.', { recursive: true });
    const fileTypes = {
      js: files.filter(f => f.endsWith('.js')).length,
      html: files.filter(f => f.endsWith('.html')).length,
      json: files.filter(f => f.endsWith('.json')).length,
      css: files.filter(f => f.endsWith('.css')).length,
      sol: files.filter(f => f.endsWith('.sol')).length,
      py: files.filter(f => f.endsWith('.py')).length,
      other: files.filter(f => {
        const ext = path.extname(f);
        return !['.js','.html','.json','.css','.sol','.py'].includes(ext) && ext !== '';
      }).length
    };
    
    const packageInfo = fs.existsSync('package.json') 
      ? JSON.parse(fs.readFileSync('package.json', 'utf8'))
      : {};
    
    res.json({
      name: '$project',
      type: '$project'.includes('blockchain') ? 'BLOCKCHAIN' : 
            '$project'.includes('elganyaia') ? 'AI' :
            '$project'.includes('kamina') ? 'OS' : 'GENERAL',
      fileTypes,
      package: packageInfo,
      dependencies: packageInfo.dependencies || {},
      scripts: packageInfo.scripts || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statut du réseau écosystème
app.get('/api/network-status', async (req, res) => {
  try {
    // URLs des autres projets de l'écosystème
    const ecosystemProjects = {
      'elganyaia-11.4-deployer': 'https://elganyaia-114-deployer.vercel.app',
      'elganyaia-11.4-final': 'https://elganyaia-114-final.vercel.app',
      'blockchain-kamina-v2': 'https://blockchain-kamina-v2.vercel.app',
      'blockchain-kamina': 'https://blockchain-kamina.vercel.app',
      'kamina-os-ultimate-v2': 'https://kamina-os-ultimate-v2.vercel.app',
      'kamina-os-ultimate': 'https://kamina-os-ultimate.vercel.app'
    };
    
    const networkStatus = {};
    
    for (const [project, url] of Object.entries(ecosystemProjects)) {
      try {
        const response = await fetch(\`\${url}/api/health\`);
        if (response.ok) {
          const data = await response.json();
          networkStatus[project] = {
            status: 'online',
            ...data
          };
        } else {
          networkStatus[project] = {
            status: 'offline',
            error: 'Health check failed'
          };
        }
      } catch (error) {
        networkStatus[project] = {
          status: 'offline',
          error: error.message
        };
      }
    }
    
    res.json(networkStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// ROUTE PRINCIPALE
// =====================
app.get('/', (req, res) => {
  const html = \`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$project - Écosystème Connecté</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .ecosystem-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: rgba(255,255,255,0.1);
            padding: 25px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn {
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            margin: 5px;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #059669;
            transform: translateY(-2px);
        }
        .api-status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 8px;
            background: rgba(255,255,255,0.1);
        }
        .status-online { border-left: 4px solid #10b981; }
        .status-offline { border-left: 4px solid #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 $project</h1>
            <p>Partie intégrante de l'écosystème - Connecté et opérationnel</p>
            <div style="margin-top: 20px;">
                <button class="btn" onclick="testHealth()">🧪 Tester Santé</button>
                <button class="btn" onclick="openDashboard()">🏠 Dashboard Maître</button>
                <button class="btn" onclick="checkNetwork()">🌐 Vérifier Réseau</button>
            </div>
        </div>
        
        <div class="ecosystem-grid">
            <div class="card">
                <h3>📊 Informations Projet</h3>
                <div id="projectInfo">
                    <p>Chargement...</p>
                </div>
            </div>
            
            <div class="card">
                <h3>🔗 Écosystème</h3>
                <div id="ecosystemStatus">
                    <p>Chargement du réseau...</p>
                </div>
            </div>
            
            <div class="card">
                <h3>🎯 Actions Rapides</h3>
                <button class="btn" onclick="refreshAll()">🔄 Actualiser Tout</button>
                <button class="btn" onclick="viewAPIs()">📡 Voir APIs</button>
                <button class="btn" onclick="syncWithEcosystem()">🔗 Synchroniser</button>
            </div>
        </div>
        
        <div class="card">
            <h3>📡 Endpoints API</h3>
            <div class="api-status status-online">
                <strong>GET /api/health</strong> - Santé du projet ✅
            </div>
            <div class="api-status status-online">
                <strong>GET /api/project-info</strong> - Informations projet ✅
            </div>
            <div class="api-status status-online">
                <strong>GET /api/network-status</strong> - Statut réseau ✅
            </div>
        </div>
    </div>

    <script>
        // Test de l'endpoint santé
        async function testHealth() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                alert(\`✅ Santé du projet: \${data.status}\\n\${data.project} - Version \${data.version}\`);
            } catch (error) {
                alert('❌ Erreur de santé: ' + error.message);
            }
        }
        
        // Ouvrir le dashboard maître
        function openDashboard() {
            window.open('https://ecosystem-master.vercel.app', '_blank');
        }
        
        // Vérifier le réseau
        async function checkNetwork() {
            try {
                const response = await fetch('/api/network-status');
                const data = await response.json();
                
                let onlineCount = 0;
                let statusHtml = '';
                
                for (const [project, info] of Object.entries(data)) {
                    statusHtml += \`
                        <div class="api-status \${info.status === 'online' ? 'status-online' : 'status-offline'}">
                            <strong>\${project}</strong>: \${info.status}
                        </div>
                    \`;
                    if (info.status === 'online') onlineCount++;
                }
                
                document.getElementById('ecosystemStatus').innerHTML = \`
                    <p>\${onlineCount} projets en ligne</p>
                    \${statusHtml}
                \`;
                
            } catch (error) {
                document.getElementById('ecosystemStatus').innerHTML = '❌ Erreur réseau';
            }
        }
        
        // Charger les informations du projet
        async function loadProjectInfo() {
            try {
                const response = await fetch('/api/project-info');
                const data = await response.json();
                
                document.getElementById('projectInfo').innerHTML = \`
                    <p><strong>Type:</strong> \${data.type}</p>
                    <p><strong>Fichiers:</strong> \${Object.entries(data.fileTypes).map(([type, count]) => \`\${type}: \${count}\`).join(', ')}</p>
                    <p><strong>Dépendances:</strong> \${Object.keys(data.dependencies).length}</p>
                \`;
            } catch (error) {
                document.getElementById('projectInfo').innerHTML = '❌ Erreur chargement';
            }
        }
        
        function refreshAll() {
            loadProjectInfo();
            checkNetwork();
        }
        
        function viewAPIs() {
            alert('Endpoints disponibles:\\n• /api/health\\n• /api/project-info\\n• /api/network-status');
        }
        
        function syncWithEcosystem() {
            alert('🔄 Synchronisation avec l\\'écosystème...');
            refreshAll();
        }
        
        // Initialisation
        loadProjectInfo();
        checkNetwork();
    </script>
</body>
</html>
  \`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(\`🚀 $project - Serveur écosystème démarré sur le port \${PORT}\`);
});

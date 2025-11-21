const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const cwd = process.cwd();
    const apiDir = path.join(cwd, 'api');
    const dataPath = path.join(apiDir, 'data.json');

    const debugInfo = {
      cwd: cwd,
      apiDir: apiDir,
      dataPath: dataPath,
      dataExists: fs.existsSync(dataPath),
      apiDirExists: fs.existsSync(apiDir),
      apiFiles: fs.existsSync(apiDir) ? fs.readdirSync(apiDir) : [],
      rootFiles: fs.readdirSync(cwd)
    };

    if (fs.existsSync(dataPath)) {
      const stats = fs.statSync(dataPath);
      debugInfo.dataSize = stats.size;
      debugInfo.dataSizeMB = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
    }

    return res.status(200).json(debugInfo);
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
};

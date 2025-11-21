const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const cwd = process.cwd();
    const apiDir = path.join(cwd, 'api');
    const oldDataPath = path.join(apiDir, 'data.json');
    const newDataPath = path.join(__dirname, 'data.json');

    const debugInfo = {
      cwd: cwd,
      dirname: __dirname,
      oldDataPath: oldDataPath,
      oldDataExists: fs.existsSync(oldDataPath),
      newDataPath: newDataPath,
      newDataExists: fs.existsSync(newDataPath),
      apiDirExists: fs.existsSync(apiDir),
      apiFiles: fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : [],
      rootFiles: fs.existsSync(cwd) ? fs.readdirSync(cwd) : []
    };

    if (fs.existsSync(newDataPath)) {
      const stats = fs.statSync(newDataPath);
      debugInfo.dataSize = stats.size;
      debugInfo.dataSizeMB = (stats.size / 1024 / 1024).toFixed(2) + ' MB';
    }

    return res.status(200).json(debugInfo);
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
};

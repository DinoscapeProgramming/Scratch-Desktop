const { app, ipcMain, BrowserWindow } = require('electron');
const fs = require("fs");
const path = require('path');
const crypto = require('crypto');
const { Packager } = packager = require('@turbowarp/packager');
const icons = require('./icons.json');

function createWindow() {
  let window = new BrowserWindow({
    show: false,
    title: "Scratch Desktop",
    icon: path.join(__dirname, "assets/favicon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  window.maximize();
  window.show();
  window.loadFile('application/index.html');
  window.on("closed", () => {
    window = null;
  });
  ipcMain.on("loadProject", (event, projectId) => {
    fs.readFile("./projects/data/" + projectId + ".json", (err, projectData) => {
      if (err) return;
      packager.loadProject(fs.readFileSync("./projects/code/" + projectId + ".sb3")).then((loadedProject) => {
        let projectPackager = new Packager();
        projectPackager.project = loadedProject;
        projectPackager.options.loadingScreen.text = JSON.parse(projectData).title;
        projectPackager.options.app.windowTitle = JSON.parse(projectData).title;
        projectPackager.options.username = "Player";
        projectPackager.options.highQualityPen = true;
        projectPackager.options.controls.greenFlag.enabled = true;
        projectPackager.options.controls.stopAll.enabled = true;
        projectPackager.options.controls.fullscreen.enabled = true;
        projectPackager.options.controls.pause.enabled = true;
        projectPackager.options.custom.js = "let uninstallIcon = document.createElement('img'); uninstallIcon.className = 'control-button fullscreen-button'; uninstallIcon.src = '" + icons.uninstallIcon + "'; uninstallIcon.style.marginLeft = '5px'; uninstallIcon.addEventListener('click', () => { require('fs').unlinkSync('./projects/data/" +  projectId + ".json'); require('fs').unlinkSync('./projects/thumbnails/" + projectId + ".png'); require('fs').unlinkSync('./projects/profilePictures/" + projectId + ".png'); require('fs').unlinkSync('./projects/code/" + projectId + ".sb3'); require('electron').ipcRenderer.send('closeProject'); }); let closeIcon = document.createElement('img'); closeIcon.className = 'control-button fullscreen-button'; closeIcon.src = '" + icons.closeIcon + "'; closeIcon.style.marginLeft = '5px'; closeIcon.addEventListener('click', () => { require('electron').ipcRenderer.send('closeProject'); }); document.getElementsByClassName('sc-controls-bar')[0].children[1].appendChild(uninstallIcon); document.getElementsByClassName('sc-controls-bar')[0].children[1].appendChild(closeIcon);";
        projectPackager.package().then(({ data }) => {
          crypto.randomBytes(4, (err, cacheId) => {
            if (err) return;
            if (!fs.readdirSync(__dirname).includes("cache")) fs.mkdirSync("./cache");
            fs.writeFileSync("./cache/" + cacheId.toString("hex") + ".html", data , "utf8");
            window.webContents.once('dom-ready', () => {
              fs.unlinkSync("./cache/" + cacheId.toString("hex") + ".html");
            });
            window.loadURL("file://" + path.join(process.cwd(), "cache", cacheId.toString("hex") + ".html"));
          });
        });
      });
    });
  });
  ipcMain.on("closeProject", () => {
    window.loadFile("application/index.html");
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
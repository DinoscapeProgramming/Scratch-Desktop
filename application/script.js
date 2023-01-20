const electron = require('electron');
const fs = require('fs');
const path = require('path');
const downloader = require("@turbowarp/sbdl");
const { Packager } = packager = require("@turbowarp/packager");

fs.readdirSync("./projects/data").forEach((project) => {
  if (document.getElementById("installedProjectsContainer").children[0].tagName === "H3") document.getElementById("installedProjectsContainer").innerHTML = "";
  let projectImage = new Image();
  projectImage.className = "projectImage";
  projectImage.src = "file://" + path.join(path.dirname(__dirname), "projects/images/" + project.substring(0, project.length - 5)) + ".png";
  projectImage.addEventListener("click", () => {
    electron.ipcRenderer.send("loadProject", project.substring(0, project.length - 5));
  });
  document.getElementById("installedProjectsContainer").appendChild(projectImage);
});

document.getElementById("typeSelect").addEventListener("change", () => {
  if (document.getElementById("typeSelect").value === "installedProjects") {
    document.getElementById("installedProjectsContainer").style.display = "block";
    document.getElementById("installProjectContainer").style.display = "none";
  } else {
    document.getElementById("installProjectContainer").style.display = "block";
    document.getElementById("installedProjectsContainer").style.display = "none";
  }
});

document.getElementById("installProjectButton").addEventListener("click", () => {
  document.getElementById("installProjectInput").reportValidity();
  if (document.getElementById("installProjectInput").checkValidity()) {
    let projectId = document.getElementById("installProjectInput").value;
    document.getElementById("installProjectInput").value = "";
    fetch("https://trampoline.turbowarp.org/proxy/projects/" + projectId)
    .then((response) => response.json())
    .then((projectData) => {
      fs.writeFile("./projects/data/" + projectId + ".json", JSON.stringify({
        ...Object.entries(projectData).filter((item) => !["image", "images", "project_token"].includes(item[0])).reduce((data, item) => ({
          ...data,
          ...{
            [item[0]]: item[1]
          }
        }), {}),
        ...{
          author: {
            ...projectData.author,
            ...{
              profile: Object.entries(projectData.author?.profile).filter((item) => !["images"].includes(item[0])).reduce((data, item) => ({
                ...data,
                ...{
                  [item[0]]: item[1]
                }
              }), {})
            }
          }
        }
      }), (err) => {
        if (err) return;
        fetch(projectData.image)
        .then((response) => response.arrayBuffer())
        .then((image) => {
          fs.writeFile("./projects/images/" + projectId + ".png", Buffer.from(image), (err) => {
            downloader.downloadProjectFromID(projectId).then((project) => {
              fs.writeFile("./projects/code/" + projectId + ".sb3", Buffer.from(project.arrayBuffer), (err) => {
                if (err) return;
                if (document.getElementById("installedProjectsContainer").children[0].tagName === "H3") document.getElementById("installedProjectsContainer").innerHTML = "";
                let projectImage = new Image();
                projectImage.className = "projectImage";
                projectImage.src = "file://" + path.join(path.dirname(__dirname), "projects/images", projectId + ".png");
                projectImage.addEventListener("click", () => {
                  electron.ipcRenderer.send("loadProject", project.substring(0, project.length - 4));
                });
                document.getElementById("installedProjectsContainer").appendChild(projectImage);
              });
            });
          });
        });
      });
    });
  }
});
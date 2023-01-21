const electron = require('electron');
const fs = require('fs');
const path = require('path');
const downloader = require("@turbowarp/sbdl");
const { Packager } = packager = require("@turbowarp/packager");

if (fs.readdirSync(path.dirname(__dirname)).includes("projects") && fs.readdirSync("./projects").includes("data")) {
  fs.readdirSync("./projects/data").forEach((project) => {
    if (document.getElementById("installedProjectsContainer").children[0].tagName === "H3") document.getElementById("installedProjectsContainer").innerHTML = "";
    fs.readFile("./projects/data/" + project, (err, projectData) => {
      if (err) return;
      let container = document.createElement('div');
      container.className = "container";
      let link = document.createElement('a');
      link.className = "thumbnailLink";
      link.addEventListener("click", () => {
        electron.ipcRenderer.send("loadProject", project.substring(0, project.length - 5));
      });
      let image = document.createElement('img');
      image.src = "file://" + path.join(path.dirname(__dirname), "projects/thumbnails/" + project.substring(0, project.length - 5)) + ".png";
      image.className = "thumbnail";
      let info = document.createElement('div');
      info.className = "info";
      let creatorLink = document.createElement('a');
      creatorLink.className = "creatorLink";
      creatorLink.addEventListener("click", () => {
        window.open("https://scratch.mit.edu/users/" + JSON.parse(projectData).author.username, "_blank", "icon=assets/favicon.png");
      });
      let creatorImage = document.createElement('img');
      creatorImage.className = "creatorImage";
      creatorImage.src = "file://" + path.join(path.dirname(__dirname), "projects/profilePictures/" + JSON.parse(projectData).author.id) + ".png";
      let title = document.createElement('div');
      title.id = "titleContainer";
      let titleLink = document.createElement('a');
      titleLink.className = "titleLink";
      titleLink.addEventListener("click", () => {
        electron.ipcRenderer.send("loadProject", project.substring(0, project.length - 5));
      });
      titleLink.title = JSON.parse(projectData).title;
      titleLink.innerText = JSON.parse(projectData).title;
      let creatorContainer = document.createElement('div');
      creatorContainer.className = "creatorContainer";
      let creatorText = document.createElement('a');
      creatorText.className = "creatorText";
      creatorText.addEventListener("click", () => {
        window.open("https://scratch.mit.edu/users/" + JSON.parse(projectData).author.username, "_blank", "icon=assets/favicon.png");
      });
      creatorText.innerText = JSON.parse(projectData).author.username;
      creatorContainer.appendChild(creatorText);
      title.appendChild(titleLink);
      title.appendChild(creatorContainer);
      creatorLink.appendChild(creatorImage);
      info.appendChild(creatorLink);
      info.appendChild(title);
      link.appendChild(image);
      container.appendChild(link);
      container.appendChild(info);
      document.getElementById("installedProjectsContainer").appendChild(container);
    });
  });
}

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
      if (!fs.readdirSync(path.dirname(__dirname)).includes("projects")) fs.mkdirSync("./projects");
      if (!fs.readdirSync("./projects").includes("data")) fs.mkdirSync("./projects/data");
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
        .then((thumbnail) => {
          if (!fs.readdirSync("./projects").includes("thumbnails")) fs.mkdirSync("./projects/thumbnails");
          fs.writeFile("./projects/thumbnails/" + projectId + ".png", Buffer.from(thumbnail), (err) => {
            if (err) return;
            fetch(projectData.author.profile.images["32x32"])
            .then((response) => response.arrayBuffer())
            .then((profilePicture) => {
              if (!fs.readdirSync("./projects").includes("profilePictures")) fs.mkdirSync("./projects/profilePictures");
              fs.writeFile("./projects/profilePictures/" + projectData.author.id + ".png", Buffer.from(profilePicture), (err) => {
                if (err) return;
                downloader.downloadProjectFromID(projectId).then((project) => {
                  if (!fs.readdirSync("./projects").includes("code")) fs.mkdirSync("./projects/code");
                  fs.writeFile("./projects/code/" + projectId + ".sb3", Buffer.from(project.arrayBuffer), (err) => {
                    if (err) return;
                    if (document.getElementById("installedProjectsContainer").children[0].tagName === "H3") document.getElementById("installedProjectsContainer").innerHTML = "";
                    let container = document.createElement('div');
                    container.className = "container";
                    let link = document.createElement('a');
                    link.className = "thumbnailLink";
                    link.addEventListener("click", () => {
                      electron.ipcRenderer.send("loadProject", projectId);
                    });
                    let image = document.createElement('img');
                    image.src = "file://" + path.join(path.dirname(__dirname), "projects/thumbnails/" + projectId) + ".png";
                    image.className = "thumbnail";
                    let info = document.createElement('div');
                    info.className = "info";
                    let creatorLink = document.createElement('a');
                    creatorLink.className = "creatorLink";
                    creatorLink.addEventListener("click", () => {
                      window.open("https://scratch.mit.edu/users/" + projectData.author.username, "_blank", "icon=assets/favicon.png");
                    });
                    let creatorImage = document.createElement('img');
                    creatorImage.className = "creatorImage";
                    creatorImage.src = "file://" + path.join(path.dirname(__dirname), "projects/profilePictures/" + projectData.author.id) + ".png";
                    let title = document.createElement('div');
                    title.id = "titleContainer";
                    let titleLink = document.createElement('a');
                    titleLink.className = "titleLink";
                    titleLink.addEventListener("click", () => {
                      electron.ipcRenderer.send("loadProject", projectId);
                    });
                    titleLink.title = projectData.title;
                    titleLink.innerText = projectData.title;
                    let creatorContainer = document.createElement('div');
                    creatorContainer.className = "creatorContainer";
                    let creatorText = document.createElement('a');
                    creatorText.className = "creatorText";
                    creatorText.addEventListener("click", () => {
                      window.open("https://scratch.mit.edu/users/" + projectData.author.username, "_blank", "icon=assets/favicon.png");
                    });
                    creatorText.innerText = projectData.author.username;
                    creatorContainer.appendChild(creatorText);
                    title.appendChild(titleLink);
                    title.appendChild(creatorContainer);
                    creatorLink.appendChild(creatorImage);
                    info.appendChild(creatorLink);
                    info.appendChild(title);
                    link.appendChild(image);
                    container.appendChild(link);
                    container.appendChild(info);
                    document.getElementById("installedProjectsContainer").appendChild(container);
                  });
                });
              });
            });
          });
        });
      });
    });
  }
});
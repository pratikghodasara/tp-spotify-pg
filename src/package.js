const AdmZip = require("adm-zip");
const path = require("path");
const filesystem = require("fs");
const pkg = require("pkg");
const json = JSON.parse(filesystem.readFileSync("./package.json", "utf8"))


const build = async (platform) => {
    if (filesystem.existsSync(`./${json.name}/${platform}`)) {
        filesystem.rmdirSync(`./${json.name}/${platform}`, { recursive: true });
    }

    if (!filesystem.existsSync(`./${json.name}`)) {
        filesystem.mkdirSync(`./${json.name}`);
    }

    filesystem.mkdirSync(`./${json.name}/${platform}`);
    filesystem.copyFileSync(`./plugin/entry.tp`, `./${json.name}/${platform}/entry.tp`);
    filesystem.copyFileSync(`./resources/${json.name}.png`, `./${json.name}/${platform}/${json.name}.png`);

    let nodebuild = "";
    let executablename = "";

    if (platform == "Linux") {
        nodebuild = 'node18-linux-x64';
    }

    if (platform == "MacOS") {
        nodebuild = 'node18-macos-x64';
    }

    if (platform == "Windows") {
        nodebuild = 'node18-win-x64';
        executablename = `${json.name}.exe`;
    }

    if (platform != "Windows") {
        executablename = json.name;
        filesystem.copyFileSync(`./plugin/${json.name}.sh`, `./${json.name}/${platform}/${json.name}.sh`);
    }

    console.log("Running pkg")
    await pkg.exec([
        "--targets",
        nodebuild,
        "--output",
        `${json.name}/${platform}/${executablename}`,
        ".",
    ]);

    console.log("Running Zip File Creation")
    const zip = new AdmZip()
    zip.addLocalFolder(
        path.normalize(`./${json.name}/${platform}/`),
        json.name
    );

    zip.writeZip(path.normalize(`./${json.name}/${json.name}-${platform}-${json.version}.tpp`))

    console.log("Cleaning Up");
    filesystem.rmSync(`./${json.name}/${platform}`, { recursive: true })
}

const startbuild = async () => {
    await build("Linux");
    await build("MacOS");
    await build("Windows");
}

startbuild();

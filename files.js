import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __staticPath = path.join(__dirname, "static");

export const readFile = (filename) => {
    return fs.readFileSync(path.join(__dirname, filename), { encoding: "utf8", flag: "r" });
};

export const formatSizeUnits = (bytes) => {
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
}

export const getFileSize = (pathname) => {
    const stats = fs.statSync(pathname);
    return formatSizeUnits(stats.size);
};

export const isDirectory = (filePath) => {
    return fs.lstatSync(filePath).isDirectory();
}

export const staticPath = (...filename) => path.join(__staticPath, ...filename);

export const getListOfFiles = (directoryPath) => {
    try {
        // Get list of files in the directory
        const files = fs.readdirSync(directoryPath);
        return files.map((filename) => {
            const filePath = path.join(directoryPath, filename);
            return {
                name: filename,
                size: getFileSize(filePath), directoryPath,
                isDirectory: isDirectory(filePath),
            };
        });
    } catch (error) {
        console.error("Error reading directory:", error);
        return [];
    }
};

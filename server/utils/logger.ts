import fs from "fs";
import path from "path";

const errorLogPath = path.join(__dirname, "../../error.log");

export function initLogger() {
    fs.writeFileSync(errorLogPath, `--- SERVER START: ${new Date().toLocaleString()} ---\n`);
}

export function logError(title: string, error: any) {
    const timestamp = new Date().toLocaleString();
    const message = `[${timestamp}] ${title}: ${error.message || error}\n${error.stack || ""}\n\n`;
    console.error(message);
    fs.appendFileSync(errorLogPath, message);
}

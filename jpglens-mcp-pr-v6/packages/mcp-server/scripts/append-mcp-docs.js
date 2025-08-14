#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sectStart = "<!-- BEGIN: MCP SECTION -->";
const sectEnd = "<!-- END: MCP SECTION -->";
const snippet = fs.readFileSync(path.join(__dirname, "../../README_MCP_SECTION.md"), "utf8");
const readmePath = path.join(__dirname, "../../README.md");
let text = "";
try { text = fs.readFileSync(readmePath, "utf8"); } catch { text = ""; }
if (text.includes(sectStart)) { console.log("MCP section already present in README.md"); process.exit(0); }
const out = (text ? text + "\n\n" : "") + snippet + "\n";
fs.writeFileSync(readmePath, out, "utf8");
console.log("Appended MCP section to README.md");

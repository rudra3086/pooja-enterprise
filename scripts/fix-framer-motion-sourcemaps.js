const fs = require("fs")
const path = require("path")

const projectRoot = process.cwd()
const framerMotionEsDir = path.join(projectRoot, "node_modules", "framer-motion", "dist", "es")

const sourceMapLine = /^\s*\/\/# sourceMappingURL=.*\.mjs\.map\s*$/gm

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    } else if (entry.isFile() && fullPath.endsWith(".mjs")) {
      files.push(fullPath)
    }
  }

  return files
}

function stripSourceMapComments(filePath) {
  const original = fs.readFileSync(filePath, "utf8")
  if (!sourceMapLine.test(original)) {
    sourceMapLine.lastIndex = 0
    return false
  }

  sourceMapLine.lastIndex = 0
  const updated = original.replace(sourceMapLine, "")
  fs.writeFileSync(filePath, updated, "utf8")
  return true
}

function main() {
  if (!fs.existsSync(framerMotionEsDir)) {
    console.log("[postinstall] framer-motion not found, skipping sourcemap cleanup")
    return
  }

  const files = walk(framerMotionEsDir)
  let changed = 0

  for (const file of files) {
    if (stripSourceMapComments(file)) {
      changed += 1
    }
  }

  console.log(`[postinstall] framer-motion sourcemap cleanup complete. Updated ${changed} files.`)
}

main()

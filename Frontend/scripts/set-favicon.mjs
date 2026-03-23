import { copyFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const publicDir = resolve(process.cwd(), "public")
const source = resolve(publicDir, "guts-logo.png")
const target = resolve(publicDir, "favicon.png")

if (!existsSync(source)) {
  console.error("Logo not found: public/guts-logo.png")
  process.exit(1)
}

copyFileSync(source, target)
console.log("Favicon updated: public/favicon.png")

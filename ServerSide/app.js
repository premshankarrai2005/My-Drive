import { readFile, rm, rename } from "node:fs/promises"
import { readdir, open } from "node:fs/promises"
import http from "node:http"
import mime from "mime-types"
import { createWriteStream } from "node:fs"

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*  ")
    res.setHeader("Access-Control-Allow-Headers", "*  ")
    res.setHeader("Access-Control-Allow-Methods", "*  ")
    if (req.url === "/favicon.ico") return res.end("No Such file")

    // serve style.css
    if (req.url === "/style.css") {
        const css = await readFile("./style.css", "utf-8");
        res.setHeader("Content-Type", "text/css");
        return res.end(css);
    }

    if (req.method === "GET") {
        if (req.url === "/") {
            serverDirectory(req, res)
        } else {
            try {
                const [url, queryString] = req.url.split("?")
                const queryParams = {}
                if (queryString) {
                    queryString?.split("&").forEach((pair) => {
                        const [key, value] = pair.split("=")
                        queryParams[key] = value
                    })
                }

                console.log(url);
                console.log(queryParams);
                const fileHandle = await open(`./Storage${decodeURIComponent(url)}`)
                const stat = await fileHandle.stat()


                if (stat.isDirectory()) {
                    serverDirectory(req, res)
                    console.log(req.url);
                } else {
                    const readStream = fileHandle.createReadStream()
                    // fix wrong MIME type
                    let mimeType = mime.lookup(url) || "application/octet-stream";
                    

                    // force correct MIME type for videos
                    if (url.endsWith(".mp4")) mimeType = "video/mp4";

                    // res.setHeader("Content-type", `${mime.contentType(url.slice(1))}`)
                    res.setHeader("Content-Type", mimeType);
                    res.setHeader("Content-Length", stat.size);
                    if (queryParams.action === "download") {
                        res.setHeader("Content-Disposition", `attachment; filename="${url.slice(1)}"`)

                    }

                    readStream.pipe(res)
                }

            } catch (err) {
                console.log(err.message);
                res.write("Not Found!")
            }

        }
    } else if (req.method === "OPTIONS") {
        res.end("OK")
    } else if (req.method === "POST") {
        const writeStream = createWriteStream(`D:\\LearningZone\\Web devlopment related content\\Back\\Project\\ServerSide\\Storage\\${req.headers.filename}`)
        req.on("data", (chunk) => {
            writeStream.write(chunk)
        })
        req.on("end", () => {
            res.end("File Uploaded on the server")
            writeStream.end()
        })
    } else if (req.method === "DELETE") {
        req.on("data", async (chunk) => {
            try {
                const filename = chunk.toString()
                await rm(`./Storage/${filename}`)
                res.end("deleted")
            } catch (error) {
                res.end(error.message)
            }

        })

    } else if (req.method === "PATCH") {
        req.on("data", async (chunk) => {
            const data = JSON.parse(chunk.toString());
            await rename(`./Storage/${data.oldFileName}`, `./Storage/${data.newName}`)
            res.end("File Renamed") 
            
        })
    }

})  

async function serverDirectory(req, res) {
    const [url] = req.url.split("?")
    const fileList = await readdir(`./Storage${url}`)
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(fileList))    
}

server.listen(4000, () => {
    console.log("Server is listening on port:4000");
})
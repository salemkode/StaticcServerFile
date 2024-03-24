import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {
  formatSizeUnits,
  getListOfFiles,
  isDirectory,
  readFile,
  staticPath,
} from "./files.js";
import { getStorageDevices } from "./status.js";
import multer from "multer";

const ADMIN_HASH_PASSWORD = process.env.ADMIN_HASH_PASSWORD;
const JWT_KEY = process.env.JWT_KEY;

const verifyToken = (req, res, next) => {
  const token = req.cookies.auth;
  try {
    if (!token) throw new Error("Invalid token");
    const decoded = jwt.verify(token, JWT_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.redirect("/");
  }
};

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const upload = multer({ dest: "static/" });

app.get("/", (_, res) => {
  res.sendFile(path.resolve("pages/login.html"));
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userMatch = username === "salemkode";
    const passwordMatch = await bcrypt.compare(password, ADMIN_HASH_PASSWORD);

    if (!userMatch && !passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign({}, JWT_KEY, {
      expiresIn: "24h",
    });
    res.cookie("auth", token, { maxAge: 23 * 60 * 60 * 1000 }); // convert from milliseconds to 23 hour
    res.redirect("/files");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/files", verifyToken, async (req, res) => {
  const queryPath = req.query.path || "";
  const currentPath = staticPath(queryPath);

  if (!isDirectory(currentPath)) {
    return res.download(currentPath);
  }

  const listOfFiles = getListOfFiles(currentPath);

  if (currentPath !== staticPath("")) {
    listOfFiles.unshift({
      name: "..",
      size: "",
      isDirectory: true,
    });
  }
  const fileListElement = listOfFiles
    .filter(({ name }) => !name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
    })
    .map(({ name, size, isDirectory }) => {
      return /* HTML */ ` <li class="border-b last:border-b-0">
        <a
          href="/files?path=${path.join(queryPath, name)}"
          class="flex justify-between p-4 hover:bg-gray-200 transition-colors duration-200 text-nowrap gap-3"
        >
          <span class="font-semibold text-ellipsis"
            >${isDirectory ? "🖿" : "🗎"} ${name}</span
          >
          <span class="block font-semibold">${size}</span>
        </a>
      </li>`;
    })
    .join("");

  const disks = await getStorageDevices().then((disks) =>
    disks
      .map(({ device, disks }) => {
        return /* HTML */ ` <li
          class="p-4 hover:bg-gray-200 transition-colors duration-200"
        >
          <span class="block font-semibold">${device}</span>
          ${disks
            .map(
              ({
                fs,
                type,
                size,
                used,
                available,
                use,
                mount,
                rw,
              }) => /* HTML */ `<li
                class="flex justify-between items-center p-4 ps-8 hover:bg-gray-200 transition-colors duration-200"
              >
                <span class="flex gap-2">
                  <div
                    data-progress="${use}"
                    class="progress w-8 border p-0.5 rounded-full"
                  ></div>
                  ${fs.replace("/dev/", "")}
                </span>
                <span>
                  ${formatSizeUnits(used)} / ${formatSizeUnits(size)}
                </span>
              </li>`
            )
            .join("")}
        </li>`;
      })
      .join("")
  );

  const htmlContent = readFile("./pages/files.html")
    .replace("#files", fileListElement)
    .replace("#disks", disks);
  res.send(htmlContent);
});

app.post("/upload", verifyToken, upload.array("file"), (req, res) => {
  res.redirect("/files");
});

app.use(express.static("./static"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server start in http://localhost:" + port);
});

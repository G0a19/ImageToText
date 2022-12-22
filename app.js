const fs = require("fs");
const Tesseract = require("tesseract.js");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fileUploade = require("./middleware/fileUplode");

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("upload", "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

app.post("/", async (req, res, next) => {
  return res.json({ massage: "Hello world" });
});

app.post("/", fileUploade.array("file"), async (req, res, next) => {
  const folderPath = "./upload/images";
  const dir = "./translates";
  let textData = "";
  fs.writeFileSync("./translates/translate.txt", "");
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  } catch (err) {
    throw new Error(err);
  }

  // Read the contents of the folder
  for (let fileNumber = 0; fileNumber < req.files.length; fileNumber++) {
    let file = req.files[fileNumber];
    // Check if the file is an image
    const nameFile = file.originalname.replace(".png", "").replace(".jpg", "");
    // Perform OCR on the image

    Tesseract.recognize(file.path)
      .then(async ({ data: { text } }) => {
        fs.appendFileSync("./translates/" + nameFile + ".txt", text);
        fs.appendFileSync("./translates/translate.txt", nameFile + ":\n", function (err) {
          if (err) throw err;
        });
        await fs.appendFileSync("./translates/translate.txt", text, function (err) {
          if (err) throw err;
          console.log("Saved!");
        });
        await fs.appendFileSync("./translates/translate.txt", "\n\n", function (err) {
          if (err) throw err;
          console.log("Saved!");
        });

        await fs.unlink(file.path, (err) => {});
        textData = await fs.readFileSync("./translates/translate.txt", "utf8");
      })
      .then(async () => {
        if (fileNumber === req.files.length - 1) return await res.json({ massage: textData });
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  // return await res.json({ massage: "finish" });
});

const server = app.listen(port);

const fs = require("fs")
const path = require("path")
const fastmatter = require('fastmatter')
const puppeteer = require('puppeteer-core');
const lineReplace = require('line-replace');

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const exePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:1313';

const screenshotsList = [];

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function getScreenshot(url, filename, isDev = true) {
  const options = {
    product: 'chrome',
    args: [],
    executablePath: exePath,
    headless: true,
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1.5 });
  await page.goto(url);
  await waitFor(1000);
  await page.screenshot({ type: 'png', path: filename });
  await browser.close();

  return;
}

const generateImages = async () => {
  await asyncForEach(filteredFiles, async (file) => {
    await waitFor(50)

    fs.readFile(file, 'utf8', async (err, data) => {
      if (err) throw err

      const content = fastmatter(data)

      if ('ogImage' in content.attributes) {
        console.log(`${file.replace('content/', '')} - og:image found`);
      } else {
        console.log(`${file.replace('content/', '')} - og:image not found`);
        const url = `${BASE_URL}/${content.attributes.permalink}`;
        const filename = `./static/images/og-images/${content.attributes.id}.png`;

        await waitFor(5000)

        getScreenshot(url, filename);

        lineReplace({
          file: file,
          line: 5,
          text: `author: ${content.attributes.author}\nogImage: ${filename.replace('./static', '')}`,
          addNewLine: true,
          callback: ({ file, line, text, replacedText, error }) => {
            console.log(`${file} updated with open graph image`);
          }
        })

      }
    })
  })
}

const allContentFiles = getAllFiles("./content")

let filteredFiles = allContentFiles.filter((file) => file.includes('.md'));
filteredFiles = filteredFiles.reverse();

generateImages();

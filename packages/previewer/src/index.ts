import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { documents, jobs } from "@repo/database/schema";
import chromium from "@sparticuz/chromium";
import { S3Event } from "aws-lambda";
import { SignJWT } from "jose";
import puppeteer from "puppeteer-core";
import { Resource } from "sst";
import { ZodAny, z } from "zod";

function previewCreatorPage(url: string) {
  return `
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
      <style>
          body {
              width: 100vw;
              height: 100vh;
              margin: 0px;
          }
  
          #page {
              display: flex;
              width: 100%;
          }
      </style>
      <title>Document</title>
  </head>
  
  <body>
      <canvas id="page"></canvas>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"></script>
      <script>
          const pdfjsLib = window['pdfjsLib'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
  
          (async () => {
              const pdf = await pdfjsLib.getDocument("${url}").promise;
              const page = await pdf.getPage(1);
  
              const viewport = page.getViewport({ scale: 1 });
  
              const canvas = document.getElementById('page');
              const context = canvas.getContext('2d');
  
              canvas.height = viewport.height;
              canvas.width = viewport.width;
  
              const renderContext = {
                  canvasContext: context,
                  viewport: viewport
              };
  
              await page.render(renderContext).promise;
  
              const completeElement = document.createElement("span");
              completeElement.id = 'renderingComplete';
              document.body.append(completeElement);
          })();
      </script>
  </body>
  `;
}

async function generatePdfPreview(pdfUrl: string) {
  const isLocal = process.env.IS_LOCAL;
  console.log("Is local", isLocal);
  const browser = await puppeteer.launch({
    headless: chromium.headless,
    defaultViewport: null,
    executablePath: isLocal
      ? "/tmp/localChromium/chromium/mac_arm-1368315/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
      : await chromium.executablePath(),
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
  });

  console.log("Generating preview for", pdfUrl);

  const page = await browser.newPage();
  await page.setContent(previewCreatorPage(pdfUrl));
  await page.waitForSelector("#renderingComplete");
  await page.waitForNetworkIdle();
  const pdfPage = await page.$("#page");
  const screenshot = pdfPage!.screenshot({
    type: "png",
    omitBackground: true,
  });

  return screenshot;
}

export const handler = async (event: S3Event) => {
  await Promise.all(
    event.Records.map(async (record) => {
      let imageJobId: string | undefined;

      try {
        const key = record.s3.object.key; // i.e invoices/123.pdf
        const parts = key.split("/");
        const filename = parts[parts.length - 1];
        const refJobId = filename.split(".")[0];

        // start job
        const pdfJobRes = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, refJobId));
        const pdfJob = pdfJobRes[0];

        if (!pdfJob) {
          throw new Error(`Job ${refJobId} not found`);
        }

        if (pdfJob.status !== "COMPLETED") {
          throw new Error(`Job ${refJobId} is not completed`);
        }

        const jobRes = await db
          .insert(jobs)
          .values({
            status: "PENDING",
            startedAt: new Date(),
            refJobId: pdfJob.id,
            projectId: pdfJob.projectId,
            templateId: pdfJob.templateId,
            templateVersion: pdfJob.templateVersion,
            templateVariables: {},
            targetFormat: "IMAGE",
          })
          .returning();
        const job = jobRes[0];
        imageJobId = job.id;

        const res = await db
          .select()
          .from(documents)
          .where(eq(documents.jobId, refJobId));
        const document = res[0];

        const tokenSecret = process.env.DOCUMENT_TOKEN_SECRET;
        if (!tokenSecret) {
          throw new Error("Token secret is not defined");
        }

        const secret = new TextEncoder().encode(tokenSecret);

        const jwt = await new SignJWT({ id: document.id })
          .setProtectedHeader({ alg: "HS256" })
          .sign(secret);

        const pdfUrl = `${process.env.FILE_SERVER_URL}/document/${key}?token=${jwt}`;
        const screenshot = await generatePdfPreview(pdfUrl);
        const previewUrl = `${process.env.FILE_SERVER_URL}/preview/${key}.png?token=${jwt}`;

        // image logic
        const client = new S3Client({});
        const imageBucket = Resource.BuildZeroImageBucket.name;
        const putCommand = new PutObjectCommand({
          Bucket: imageBucket,
          Key: `${key}.png`,
          Body: screenshot,
          ContentType: "image/png",
        });
        await client.send(putCommand);

        await db
          .update(documents)
          .set({
            preview_url: previewUrl,
          })
          .where(eq(documents.jobId, refJobId));

        console.log(
          `Updated document ${document.id} with preview url ${previewUrl}`
        );

        // complete job
        await db
          .update(jobs)
          .set({
            status: "COMPLETED",
            endedAt: new Date(),
          })
          .where(eq(jobs.id, job.id));
      } catch (e) {
        console.error(e);

        if (imageJobId) {
          await db
            .update(jobs)
            .set({
              status: "FAILED",
              errorMessage: (e as z.infer<ZodAny>).message,
            })
            .where(eq(jobs.id, imageJobId));
        }
      }
    })
  );

  return "done";
};

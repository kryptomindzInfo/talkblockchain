// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Demonstrates how to generate images from prompts using Azure OpenAI Batch Image Generation.
 *
 * @summary generates images from prompts using Azure OpenAI Batch Image Generation.
 */

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

// Load the .env file if it exists
require("dotenv").config();

// You will need to set these environment variables or edit the following values
const endpoint = process.env["AZURE_OPENAI_DALLE_ENDPOINT"] || "<endpoint>";
const azureApiKey = process.env["AZURE_OPENAI_DALLE_API_KEY"] || "<api key>";
const deploymentName = process.env["AZURE_OPENAI_DALLE_DEPLOYMENT_NAME"];

module.exports = async function (prompt) {
  try {
    // The prompt to generate images from
    const size = "1024x1024";

    // The number of images to generate
    const n = 1;

    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(azureApiKey)
    );
    const results = await client.getImages(deploymentName, prompt, { n, size });
    let image = results.data[0];
    console.log(image.url);
    return image.url;
  } catch (error) {
    console.error(error);
  }
};

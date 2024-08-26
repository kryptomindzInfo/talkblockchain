var cron = require("node-cron");
var WPAPI = require("wpapi");
var _ = require("lodash");
require("dotenv").config();
var WORDPRESS_AUTH_TOKEN = process.env.WORDPRESS_JWT_AUTH_TOKEN;
var wp = new WPAPI({
  endpoint: process.env.WORDPRESS_SITE,
});
wp.setHeaders("Authorization", `Bearer ${WORDPRESS_AUTH_TOKEN}`);
const generateAIImage = require("./generateAIImage");
const getFeeds = require("./getFeeds");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAll(request) {
  return request.then(function (response) {
    if (!response._paging || !response._paging.next) {
      console.log("Last page");
      return response;
    }
    // Request the next page and return both responses as one collection
    return Promise.all([response, getAll(response._paging.next)]).then(
      function (responses) {
        return _.flatten(responses);
      }
    );
  });
}

async function getPosts(num = null) {
  try {
    let response;
    if (!num) {
      response = await getAll(wp.posts());
    } else {
      response = await wp.posts().perPage(num);
    }
    console.log("Total Posts: ", response.length);
    return response;
  } catch (error) {
    console.error(error);
  }
}

// async function updatePost(id, title, featured_image = null) {
//   try {
//     console.log("Updating post: ", id);
//     console.log("Title: ", title);
//     console.log("Image: ", featured_image);
//     let image_id = featured_image ? { featured_media: featured_image } : {};

//     await wp
//       .posts()
//       .id(id)
//       .update({
//         title,
//         ...image_id,
//       });
//     console.log("Post updated: ", id);
//   } catch (error) {
//     console.error(error);
//   }
// }

async function createPost(id, title, content, featured_image = null) {
  try {
    console.log("Creating Post");
    let image_id = featured_image ? { featured_media: featured_image } : {};

    await wp.posts().create({
      title,
      content,
      status: "publish",
      tags: [1],
      ...image_id,
    });
    console.log("Post updated: ", id);
  } catch (error) {
    console.error(error);
  }
}

async function createMedia(url, name) {
  try {
    let buffer_image = await downloadFile(url);
    const response = await wp
      .media()
      .file(buffer_image, `${name}.jpg`)
      .create();
    return response;
  } catch (error) {
    console.error(error);
  }
}

// Preparing to download image from internet
let downloadFile = async (url) => {
  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch the image. Status code: ${response.status}`
      );
    }
    let imageBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(imageBuffer);
    return buffer;
  } catch (e) {
    console.error(e);
  }
};

//chars is a array of characters to remove from the string
function removeCharacters(chars, string) {
  return string.replace(new RegExp(`[${chars}]`, "g"), "");
  //   return string.replace(new RegExp(chars, "g"), "");
}

// async function main() {
//   const posts = await getPosts(process.env.GET_POSTS);
//   let i = 0;
//   for (const post of posts) {
//     console.log("\n\nPost: ", i++);
//     console.log("Title Before: ", post.title.rendered);
//     const title = removeCharacters(["#", "**"], post.title.rendered);
//     console.log("Title After: ", title);
//     let media;
//     console.log("Featured image exist: ", post.featured_media ? true : false);
//     if (!post.featured_media) {
//       await sleep(20000);
//       const image = await generateAIImage(title);
//       media = await createMedia(image, post.id.toString());
//     }
//     if (post.title.rendered != title || media) {
//       await updatePost(post.id, title, media.id);
//     }
//   }
// }

async function main() {
  const content = await getFeeds();
}

// Runs at 1 AM everyday
// cron.schedule("0 1 * * *", async () => {
//   console.log("Running Cron Job at ", new Date().toLocaleString());
//   await main();
// });

main();

const mongoose = require("mongoose");
const axios = require("axios");
const sharp = require("sharp");
const { ObjectId } = mongoose.Types;
const { UTApi } = require("uploadthing/server");
const { Paddle, Environment } = require("@paddle/paddle-node-sdk");

const utils = {
  utapi: new UTApi(),

  isDev: process.env.ENVIRONMENT === "development",

  message: "Internal server error",

  stringSlug(string, sign = "-") {
    return string
      .toLowerCase() // Convert to lowercase
      .replace(/[\s_&]+/g, sign) // Replace spaces, underscores, and '&' with hyphens
      .replace(/-+/g, sign) // Replace multiple hyphens with a single hyphen
      .replace(/[^\w\-]/g, "") // Remove all non-word characters except hyphens
      .replace(/^-|-$/g, ""); // Remove hyphens at the start or end of the string
  },

  randomKey(length = 5, stringOnly = false) {
    if (stringOnly) {
      const characters = "abcdefghijklmnopqrstuvwxyz";
      return [...Array(length)]
        .map(() => characters[Math.floor(Math.random() * characters.length)])
        .join("");
    } else {
      return [...Array(length)]
        .map(() => Math.random().toString(36)[2])
        .join("");
    }
  },

  paginate(page, perPage) {
    page = Math.max(Number(page) || 1, 1);
    const limit = Math.max(Number(perPage) || 1, 1);
    const skip = (page - 1) * limit;

    return [{ $skip: skip }, { $limit: limit }];
  },

  hasOne(query, from, as, select = []) {
    const $expr = { $eq: ["$_id", `$$${query}`] };
    const pipeline = [{ $match: { $expr } }];
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }
    return [
      {
        $lookup: {
          from,
          let: { [query]: `$${query}` },
          pipeline,
          as,
        },
      },
      {
        $addFields: {
          [as]: { $arrayElemAt: [`$${as}`, 0] },
        },
      },
    ];
  },

  hasMany(
    from,
    localField,
    foreignField,
    as,
    select = [],
    additionalCriteria = {}
  ) {
    const pipeline = [];
    if (Object.keys(additionalCriteria).length) {
      pipeline.push({
        $match: additionalCriteria,
      });
    }
    if (select.length) {
      pipeline.push({
        $project: Object.fromEntries(select.map((key) => [key, 1])),
      });
    }

    return [
      {
        $lookup: {
          from,
          localField,
          foreignField,
          as,
          pipeline,
        },
      },
    ];
  },

  toggle(field) {
    return [{ $set: { [field]: { $eq: [false, `$${field}`] } } }];
  },

  objectID(id) {
    return new ObjectId(id);
  },

  arrayConverter(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  },

  encode(value) {
    return value ? btoa(value) : "";
  },

  decode(value) {
    return value ? atob(value) : "";
  },

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  sendError(obj) {
    throw new Error(JSON.stringify(obj));
  },

  parseError(error) {
    try {
      return JSON.parse(error.message);
    } catch {
      return utils.message;
    }
  },

  async tryFetch(func, times = 3, delay = 1000) {
    for (let attempt = 1; attempt <= times; attempt++) {
      try {
        return await func();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < times)
          await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("All retry attempts failed");
  },

  async uploadBaseImage(base64Image, width = 150, height = 150) {
    const { randomKey, utapi } = utils;
    const imageBuffer = Buffer.from(base64Image.split(",")[1], "base64");
    const processedBuffer = await sharp(imageBuffer)
      .resize({
        width,
        height,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp()
      .toBuffer({ resolveWithObject: true });

    const filename = `${randomKey(12)}`;
    const { data } = await utapi.uploadFiles(
      Object.assign(new Blob([processedBuffer.data]), { name: filename })
    );
    return data;
  },

  paddle() {
    const { isDev } = utils;
    return new Paddle(process.env.PADDLE_API_KEY, {
      environment: isDev ? Environment.sandbox : Environment.production,
    });
  },
};

module.exports = utils;

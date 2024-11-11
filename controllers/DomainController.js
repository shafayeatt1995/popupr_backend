const { Domain } = require("../models");
const cheerio = require("cheerio");
const {
  sendError,
  parseError,
  paginate,
  objectID,
  tryFetch,
  uploadBaseImage,
  utapi,
} = require("../utils");

async function fetchFavicon(domain) {
  try {
    const response = await fetch(`https://${domain}`);
    const data = await response.text();
    const $ = cheerio.load(data);

    let faviconURL =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href");

    if (faviconURL) {
      faviconURL = faviconURL.startsWith("http")
        ? faviconURL
        : `https://${domain}${faviconURL}`;
    } else {
      faviconURL = ``;
    }

    return faviconURL;
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return ``;
  }
}

const controller = {
  async fetchDomain(req, res) {
    try {
      const { _id } = req.user;
      const { page, perPage } = req.query;
      paginate(page, perPage);
      const items = await Domain.aggregate([
        { $match: { userID: objectID(_id) } },
        { $sort: { _id: -1 } },
        ...paginate(page, perPage),
      ]);
      return res.json({ items });
    } catch (error) {
      return res.status(500).json(parseError(error));
    }
  },
  async fetchSingleDomain(req, res) {
    try {
      const { _id } = req.user;
      const { id } = req.query;
      const domain = await Domain.findOne({
        _id: objectID(id),
        userID: objectID(_id),
      });
      return res.json({ domain });
    } catch (error) {
      return res.status(500).json(parseError(error));
    }
  },
  async addDomain(req, res) {
    try {
      const { _id: userID, isFreeUser, isBasicUser } = req.user;

      if (!isFreeUser) {
        let { domain } = req.body;
        domain = domain
          .replace(/^(https?:\/\/)?(www\.)?/, "")
          .toLowerCase()
          .trim()
          .replace(/\/$/, "");

        const domainRegex = /^(?!-)([A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/;
        if (!domainRegex.test(domain)) {
          sendError({ toast: "Invalid domain name" });
        }

        if (isBasicUser) {
          const domainCount = await Domain.countDocuments({ userID });
          if (domainCount >= 1)
            sendError({
              toast: `You can add only 1 Domain. Upgrade now for multiple domains.`,
            });
        }

        const checkDomain = await Domain.findOne({ domain });
        if (checkDomain) sendError({ toast: "Domain already added" });

        const favicon = await tryFetch(() => fetchFavicon(domain));
        await Domain.create({ domain, userID, favicon });

        return res.json({ toast: "Domain added" });
      } else {
        sendError({ toast: "Purchase a plan first." });
      }
    } catch (error) {
      return res.status(500).json(parseError(error));
    }
  },
  async updateTimer(req, res) {
    try {
      const { _id: userID } = req.user;
      const { _id, start, send, hide } = req.body;
      await Domain.updateOne({ _id, userID }, { start, send, hide });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json(parseError(error));
    }
  },
  async updateMessage(req, res) {
    try {
      const { _id: userID } = req.user;
      const { _id, messages, deleteList } = req.body;

      if (deleteList.length > 0) await utapi.deleteFiles(deleteList);

      const newMessages = await Promise.all(
        messages.map(async (msg) => {
          const isBase64 =
            msg.image.startsWith("data:image/") &&
            /^data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+$/.test(msg.image);
          if (msg.key && isBase64) await utapi.deleteFiles([msg.key]);
          const uploadData = isBase64 ? await uploadBaseImage(msg.image) : null;
          return {
            title: msg.title,
            message: msg.message,
            time: msg.time,
            image: uploadData?.url || msg.image,
            key: uploadData?.key || msg.key,
          };
        })
      );

      await Domain.updateOne({ _id, userID }, { messages: newMessages });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async deleteDomain(req, res) {
    try {
      const { _id: userID } = req.user;
      const { _id } = req.query;

      const domain = await Domain.findOne({ _id, userID });
      const keys = domain.messages.map(({ key }) => key);
      if (keys.length > 0) await utapi.deleteFiles(keys);

      await Domain.deleteOne({ _id, userID });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json(parseError(error));
    }
  },
  async domainMessages(req, res) {
    try {
      const { domain } = req.query;
      const dd = await Domain.findOne({ domain }).select({
        hide: 1,
        messages: 1,
        send: 1,
        start: 1,
        _id: 0,
      });

      return res.json({ dd });
    } catch (error) {
      return res.status(200).json({ dd: [] });
    }
  },
};

module.exports = controller;

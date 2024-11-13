const crypto = require("crypto");

const lemonMiddleware = (req, res, next) => {
  try {
    const bodyString = req.body.toString();
    const parseSignature = JSON.parse(bodyString || "{}");

    const hmac = crypto.createHmac("sha256", process.env.LEMON_SIGNATURE);
    const digest = Buffer.from(hmac.update(req.body).digest("hex"), "utf8");
    const signature = Buffer.from(req.get("X-Signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature))
      return res.status(403).send("Invalid Signature");

    req.parseSignature = parseSignature;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).send("Invalid Signature");
  }
};

module.exports = { lemonMiddleware };

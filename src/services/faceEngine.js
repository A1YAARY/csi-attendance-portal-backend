const axios = require("axios");

exports.analyzeFace = async (image) => {

  // remove base64 header
  const base64 = image.replace(/^data:image\/\w+;base64,/, "");

  const res = await axios.post(
    "http://localhost:5001/analyze",
    { image: base64 }
  );

  return res.data;
};
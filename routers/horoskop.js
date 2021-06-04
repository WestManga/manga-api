const router = require("express").Router();
const cheerio = require("cheerio");
const AxiosService = require("../helpers/ramalanService");

// manga popular ----Ignore this for now --------
router.get("/ramalan-bintang/hari-ini/", async (req, res) => {
  res.send({
    message: "nothing",
  });
});

//serach manga ------Done-----------
router.get("/horoskop/hari-ini/:query", async (req, res) => {
  const query = req.params.query;
  const url = `https://www.ramalan-harian.com/ramalan-bintang/hari-ini/${query}.htm`;
  // belom
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".main_content");
    let horoskop_today = [];
    const obj = {};

    /* Get Title, Type, Author, Status */
    const getMeta = element.find("#horo_intro").first();
    obj.title = $(getMeta).find("h2").text().trim().replace("Iklim astral Anda", "");
    obj.intro = $('#horo_intro').find("p").text().trim();

    /* Kelucuan */
    element.find('#horo_content').each((idx, el) => {
      let judul_horoskop = $(el).find("h3").text.trim();
      let isi_horoskop = $(el).find("p").text.trim();
      horoskop_today.push({
        judul_horoskop,isi_horoskop,
      })
    })

    res.status(200).send(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

module.exports = router;

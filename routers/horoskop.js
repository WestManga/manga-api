const router = require("express").Router();
const cheerio = require("cheerio");
const ramalanService = require("../helpers/ramalanService");

// manga popular ----Ignore this for now --------
router.get("/", async (req, res) => {
  res.send({
    message: "HOLAAAAAAAAAAAAAAAA",
  });
});

//serach manga ------Done-----------
router.get("/today/:query", async (req, res) => {
  const query = req.params.query;
  const url = `https://www.ramalan-harian.com/ramalan-bintang/hari-ini/${query}.htm`;
  // belom
  try {
    const response = await ramalanService(url);
    const $ = cheerio.load(response.data);
    const element = $("#content");
    const obj = {};

    /* Get Title, Type, Author, Status */
    obj.title = $('#breadcrumbs > a:nth-child(4)').text();
    obj.intro = $('#horo_intro').find("p").text().trim();

    /* Isi */
    obj.keseharian = element.find('#horo_content > div:nth-child(1)').find("p").text().trim();
    obj.cinta = element.find('#horo_content > div:nth-child(2)').find("p").text().trim();
    obj.keuangan = element.find('#horo_content > div:nth-child(5)').find("p").text().trim();
    obj.pekerjaan = element.find('#horo_content > div:nth-child(6)').find("p").text().trim();
    obj.last_update = $('#stm').text();

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

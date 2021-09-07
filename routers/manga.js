const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://westmanga.info/manga/";
const AxiosService = require("../helpers/axiosService");

// manga popular
router.get("/manga/popular", async (req, res) => {
  const url = baseUrl;
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $("div.hotslid");
    let manga_list = [];
    let title, thumb, endpoint ;
    element.find("div.bsx").each((idx, el) => {
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace('/manga/','');
      thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
      title = $(el).find("a").attr("title");
      last_chapter = $(el).find("div.bigor > div.adds > div.epxs").text();
      rating = $(el).find("div.bigor > div.adds > div.rt > div > div.numscore").text();
      manga_list.push({
        title,
        thumb,
        last_chapter,
        rating,
        endpoint,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});

// manga wm new update
router.get("/manga/newupdate", async (req, res) => {
  const url = baseUrl;
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $("#content > div.wrapper > div.postbody > div:nth-child(1) > div.listupd");
    let manga_list = [];
    let title, thumb, endpoint ;
    element.find("div.bsx").each((idx, el) => {
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace('/manga/','');
      thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
      title = $(el).find("a").attr("title");
      update_on = $(el).find("div.adds > div.epxdate").text();
      chapter = $(el).find("div.adds > a > div.epxs").text();
      manga_list.push({
        title,
        thumb,
        update_on,
        chapter,
        endpoint,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});

//serach manga ------Done-----------
router.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  const url = `https://westmanga.info/?s=${query}`;
  // belom
  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $("div.listupd");
    let manga_list = [];
    let title, thumb, endpoint ;
    element.find("div.bs").each((idx, el) => {
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "").replace('/manga/','');
      thumb = $(el).find("div.bsx > a > div.limit > img").attr("src");
      title = $(el).find("a").attr("title");
      manga_list.push({
        title,
        thumb,
        endpoint,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});

// detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
  const response = await AxiosService("manga/"+slug);
  const $ = cheerio.load(response.data);
  const element = $("div.postbody");
  let genre_list = [];
  let chapter = [];
  const obj = {};

  /* Get Title, Type, Author, Status */
  const getMeta = element.find("div.seriestucon").first();
  obj.title = $('div.seriestuheader > h1.entry-title').text().trim();

  /* Status */
  obj.status = $('div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > table > tbody > tr:nth-child(1) > td:nth-child(2)').text().trim();
  obj.author = $('div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > table > tbody > tr:nth-child(3) > td:nth-child(2)').text().trim();
  obj.type = $('div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > table > tbody > tr:nth-child(2) > td:nth-child(2)').text().trim();
  obj.last_update = $('div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > time').text().trim();
  obj.last_chapter = $('#chapterlist > ul > li:nth-child(1) > div > div.eph-num > a > span.chapternum').text().trim();
  obj.rating = $('div.seriestucon > div.seriestucontent > div.seriestucontl > div.rating.bixbox > div > div.num').attr("content");

  /* Set Manga Endpoint */
  obj.manga_endpoint = `https://westmanga.info/manga/${slug}`;

  /* Get Manga Thumbnail */
  obj.thumb = element.find("div.thumb > img").attr("src");

  element.find("div.seriestucon > div.seriestucontent > div.seriestucontentr > div.seriestucont > div > div").each((idx, el) => {
    let genre_name = $(el).find("a").text().trim();
    genre_list.push({
      genre_name,
    });
  });

  obj.genre_list = genre_list;

  /* Get Synopsis */
  const getSinopsis = element.find("div.entry-content").first();
  obj.synopsis = $(getSinopsis).find("p").text().trim();

  $('#chapterlist > ul')
  .find('li')
  .each((index, el) => {
    let chapter_title = $(el).find("div.eph-num > a > span.chapternum").text()
    let chapter_endpoint = $(el).find("div.eph-num > a").attr("href")
    if(chapter_endpoint !== undefined){
      const rep = chapter_endpoint.replace('https://westmanga.info/','')
    let chapter_download = $(el).find("div.dt > a").attr("href")
        chapter.push({
          chapter_title,
          chapter_endpoint:rep,
          chapter_download,
        }); 
      }
    });

    obj.chapter = chapter;

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

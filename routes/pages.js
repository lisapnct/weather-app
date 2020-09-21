const express = require("express");
const router = new express.Router();
const weatherData = require("../public/js/weatherData");
const CityModel = require("./../models/City");
const uploader = require("../config/cloudinary");

router.get("/", (req, res) => {
  res.render("home", {
    title: "WEATHER APP",
  });
});

router.get("/favorites", async (req, res) => {
  res.render("favorites", {
    cities: await CityModel.find(),
    title: "FAVORITE CITIES",
    css: ["mod.favorites"],
  });
});

router.get("/favorites/:id/delete", async (req, res, next) => {
  try {
    await CityModel.findByIdAndRemove(req.params.id);
    res.redirect("/favorites");
  } catch (err) {
    next(err);
  }
});

router.post("/add-city", uploader.single("image"), async (req, res, next) => {
  const city = req.body;
  console.log(req.file);
  if (req.file) {
    // can use an image (need to add it to the form)
    city.image = req.file.path;
  }
  try {
    const dbResult = await CityModel.create(city);
    res.redirect("/favorites");
  } catch (dbError) {
    next(dbError);
  }
});

router.get("/add-city", (req, res) => {
  res.render("addCity", {
    title: "ADD A NEW CITY",
    css: ["mod.form"],
  });
});

router.get("/favorites/:name", (req, res, next) => {
  city = `${req.params.name}`;
  res.render("home", { 
    city, 
    title: "WEATHER APP" });
});

router.get("/update-city/:id", (req, res, next) => {
  CityModel.findById(req.params.id)
    .then((city) => {
      res.render("updateCity", {
        city,
        css: ["mod.form"],
        title: "UPDATE THIS CITY",
      });
    })
    .catch(next);
});

router.post("/update-city/:id", async (req, res, next) => {
  try {
    await CityModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/favorites");
  } catch (err) {
    next(err);
  }
});

// My API calling open weather map api
//localhost:8080/weather?address=xxx
router.get("/weather", (req, res) => {
  const address = req.query.address;

  if (!address) {
    return res.send({
      error: "please enter a city",
    });
  }

  weatherData(
    address,
    (
      error,
      {
        temperature,
        description,
        cityName,
        humidity,
        wind,
        sunrise,
        sunset,
      } = {}
    ) => {
      if (error) {
        return res.send({ error });
      }
      console.log(
        temperature,
        description,
        cityName,
        humidity,
        wind,
        sunrise,
        sunset
      );
      res.send({
        cityName,
        temperature,
        description,
        humidity,
        wind,
        sunrise,
        sunset,
      });
    }
  );
});

router.get("*", (req, res) => {
  res.render("404", { title: "page not found" });
});

module.exports = router;

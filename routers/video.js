module.exports = app => {
    const EXPRESS = require("express")
    const ROUTER = EXPRESS.Router({
        mergeParams: true
    })

    const VIDEOS = require("../modules/video").videos

    // video list
    ROUTER.get("/list/:page",async (req, res) => {
        let list = await VIDEOS.find().skip((req.params.page - 1) * 10)
            .limit(10).exec()
        if (list.length == 0) return res.status(204)
            .send({ message: "Sorry!No more content!" })
        res.send(list)
    })

    // video sort query
    ROUTER.get("/sort/:type/:page",async (req, res) => {
        let list = await VIDEOS.find({ type: req.params.type })
            .skip((req.params.page - 1) * 10).limit(10).exec()
        if (list.length == 0) return res.status(204)
            .send("Sorry!No " + req.params.type + " content found!")
        res.send(list)
    })

    // video actor query
    ROUTER.get("/actor/:actor/:page", async (req, res) => {
        let list = await VIDEOS.find({ actor: req.params.actor })
            .skip((req.params.page - 1) * 10).exec()
        if (list.length == 0) return res.status(204)
            .send("Sorry!Did not find " +  req.params.actor + " content!")
        res.send(list)
    })

    // video language query
    ROUTER.get("/language/:language/:page", async (req, res) => {
        let list = await VIDEOS.find({ language: req.params.language })
            .skip((req.params.page -1) * 10).limit(10).exec()
        if (list.length ==0) return res.status(204)
            .send("Sorry!No " + req.params.language + " content found!")
    })
    
    // video date
    ROUTER.get("/date/:date/:page", async (req, res) => {
        let list = await VIDEOS.find({ released: req.params.date })
            .skip((req.params.page -1) * 10).limit(10).exec()
        if (list.length == 0) return res.status(204)
            .send("Sorry!Didn't find the content of " + req.params.date)
        res.send(list)
    })

    // video area query
    ROUTER.get("/area/:area/:page", async (req, res) => {
        let list = await VIDEOS.find({ area: req.params.area })
            .skip((req.params.area -1) * 10).limit(10).exec()
        if (list.length == 0) return res.status(204)
            .send("Sorry!No content found in " + req.params.area + "!")
    })

    // video details
    ROUTER.get("/video/:title", async (req, res) => {
        let video = await VIDEOS.findOne({ title: req.params.title }).exec()
        if (video == null) return res.status(204)
            .send("Sorry!《" + req.params.title + "》 is not found!")
        res.send(video)
    })

    app.use("/api/video", ROUTER)
}
module.exports = app => {
    const express = require("express")
    const router = express.Router()
    const marked = require("marked")
    const Note = require("../modules/notes").notes
    const Tag = require("../modules/notes").tags
    const Directory = require("../modules/notes").dirs
    const ObjectId = require("mongoose").Types.ObjectId

    // tag manage
    async function tags (model, tags) {
        const items = []
        for (index in tags) {
            const res = await Tag.findOne({ tag: tags[index] })
            if (res == null) {
               const nohave = await Tag.insertMany({
                    tag: tags[index], notes: model
                })
                items.push(nohave[0]._id)
            } else {
                const dohave = res.notes
                dohave.push(ObjectId(model))
                await Tag.updateMany({ _id: res._id },
                    { notes: dohave }, { upsert: true })
                items.push(res._id)
            }
        }
        return items
    }

    // directory manage
    async function dir(model, dir) {
        const res = await Directory.findOne({ directory: dir })
        if (res == null) {
            const nohave = await Directory.insertMany({
                directory: dir, notes: model
            })
            return nohave[0]._id
        } else {
            const dohave = res.notes
            dohave.push(ObjectId(model))
            await Directory.updateMany({ _id: res._id },
                { notes: dohave }, { upsert: true })
            return res._id
        }
    }

    // index / note list
    router.get("/", async (req, res) => {
        const notes = await Note.find().populate("tags")
            .populate("directory").exec()
        for (index in notes) {
            if (notes[index].content != undefined) {
                const cont = marked(notes[index].content)
                notes[index].content = cont.substring(0, 255) + "..."
            }
        }
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("index", { title: "首页", notes, lists, tags })
    })

    // note edit
    router.get("/edit/:title", async (req, res) => {
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: req.params.title, lists, tags })
    })

    router.get("/edit", async (req, res) => {
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("edit", { title: "新建笔记", lists, tags })
    })

    // note save
    router.post("/note", async (req, res) => {
        const dohave = await Note.find({ title: req.body.title }).exec()
        if (dohave.length != 0) {
            res.send("The article already exists!")
        } else {
            const model = new Note({
                _id: new ObjectId,
                title: req.body.title,
                author: req.body.author,
                content: req.body.content,
            })
            model.directory = await dir(model._id, req.body.directory)
            model.tags = await tags(model._id, req.body.tags)
            model.save(function (err) {
                if (err) return err
            })
            res.send("success")
        }
    })

    // note descrption
    router.get("/note/:title", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title })
                    .populate("directory").populate("tags").exec()
        if (note != null) note.content = marked(note.content)
        const lists = await Directory.find().populate("notes").exec()
        const tags = await Tag.find().populate("notes").exec()
        res.render("content", { title: req.params.title, note, lists, tags })
    })

    // note have
    router.get("/:id", async (req, res) => {
        const note = await Note.findOne({ title: req.params.title }).exec()
        res.send(note)
    })

    // note update
    router.put("/note", async (req, res) => {
        await Note.updateMany({ _id: req.body._id }, {
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            directory: await dir(req.body._id, req.body.directory),
            tags: await tags(req.body._id, req.body.tags),
        }, { upsert: true })
        res.send("note update success")
    })

    // note delete
    router.delete("/note", async (req, res) => {
        await Note.deleteOne({ _id: req.body._id })
        res.send("note delete success")
    })

    app.use("/", router)
}
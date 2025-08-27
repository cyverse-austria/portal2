const router = require('express').Router();

router.post('/bisque', async (req, res) => {
    console.log("BisQue test");
    console.log(req.body);
    return res.status(200).send("success");
});

module.exports = router;
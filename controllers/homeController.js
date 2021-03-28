import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: `The server is running on the ${process.env.NODE_ENV} environment!` });
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.json({ Hello: 'From Mars' });
});

export default router;
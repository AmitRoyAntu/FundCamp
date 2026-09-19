import express from 'express';
import { assistant, campaignHelper } from '../controllers/aiController.js';
import { aiRateLimit } from '../middleware/aiRateLimit.js';
import { verifyToken, optionalVerifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public assistant. optionalVerifyToken does not block anonymous callers — it only
// identifies a signed-in one so the rate limiter can put them in the higher per-user
// bucket instead of the anonymous per-IP one.
router.post('/ai/assistant', optionalVerifyToken, aiRateLimit, assistant);

// Campaign writing helper. Authenticated, because writing assistance consumes more
// tokens per call and it reads the creator's own draft.
router.post('/ai/campaign-helper', verifyToken, aiRateLimit, campaignHelper);

export default router;

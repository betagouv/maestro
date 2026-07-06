import { z } from 'zod';

// Disable Zod's JIT compilation, which  would require CSP 'unsafe-eval'
z.config({ jitless: true });

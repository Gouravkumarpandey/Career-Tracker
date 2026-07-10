// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, it's empty so Vite's proxy handles /api/* → localhost:3000
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;

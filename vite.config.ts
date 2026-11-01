import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { VitePWA } from 'vite-plugin-pwa';

function deleteAccountPlugin(): Plugin {
  return {
    name: 'delete-account-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/delete-account' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const authHeader = req.headers.authorization || '';
              const token = authHeader.replace(/^Bearer\s+/i, '').trim();
              if (!token) {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, error: 'Unauthorized: Missing token' }));
                return;
              }

              let parsedBody: Record<string, string> = {};
              try {
                if (body) parsedBody = JSON.parse(body);
              } catch {
                // Ignore parse error
              }

              const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || parsedBody.supabaseUrl;
              const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
              const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || parsedBody.anonKey;

              if (!supabaseUrl) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: 'Missing Supabase configuration' }));
                return;
              }

              // Verify user identity with the provided JWT token
              const verifyClient = createClient(supabaseUrl, serviceRoleKey || anonKey || '');
              const { data: { user }, error: authErr } = await verifyClient.auth.getUser(token);

              if (authErr || !user) {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, error: 'Invalid or expired user session' }));
                return;
              }

              // If service role key is present on server, execute admin deletion
              if (serviceRoleKey) {
                const adminClient = createClient(supabaseUrl, serviceRoleKey, {
                  auth: { autoRefreshToken: false, persistSession: false },
                });

                // Delete all user data explicitly to avoid orphan records
                await adminClient.from('study_sessions').delete().eq('user_id', user.id);
                await adminClient.from('tasks').delete().eq('user_id', user.id);
                await adminClient.from('exams').delete().eq('user_id', user.id);
                await adminClient.from('study_routines').delete().eq('user_id', user.id);
                await adminClient.from('subjects').delete().eq('user_id', user.id);
                await adminClient.from('profiles').delete().eq('id', user.id);

                // Permanently delete user authentication account
                const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user.id);
                if (deleteErr) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: deleteErr.message }));
                  return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, message: 'Account permanently deleted from Supabase Auth and database' }));
                return;
              }

              // Signal to client that user identity was verified and RPC deletion can proceed
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, useRpc: true, userId: user.id }));
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: errorMsg }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      deleteAccountPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'StudyMate BD - Student Study Planner',
          short_name: 'StudyMate BD',
          description: 'Mobile-first student study planner for Bangladeshi students with offline routine, tasks, exam countdown, and Pomodoro focus timer.',
          theme_color: '#C5A7E2',
          background_color: '#F8F7FA',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache local and CDN study images for offline use in Bangladesh
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'study-assets-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
        html2canvas: 'html2canvas-pro',
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


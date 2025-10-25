import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import AutoImport from 'unplugin-auto-import/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const base = process.env.BASE_PATH || '/'
const isPreview = !!process.env.IS_PREVIEW

export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview)
  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          'react': [
            'React','useState','useEffect','useContext','useReducer','useCallback',
            'useMemo','useRef','useImperativeHandle','useLayoutEffect','useDebugValue',
            'useDeferredValue','useId','useInsertionEffect','useSyncExternalStore',
            'useTransition','startTransition','lazy','memo','forwardRef',
            'createContext','createElement','cloneElement','isValidElement'
          ]
        },
        {
          'react-router-dom': [
            'useNavigate','useLocation','useParams','useSearchParams',
            'Link','NavLink','Navigate','Outlet'
          ]
        },
        {
          'react-i18next': ['useTranslation','Trans']
        }
      ],
      dts: false,
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    outDir: 'out',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // explicitly define your main entry file
  optimizeDeps: {
    entries: ['src/main.jsx']
  }
})

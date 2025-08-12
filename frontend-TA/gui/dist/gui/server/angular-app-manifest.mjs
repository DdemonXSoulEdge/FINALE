
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/auth/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7NPRC4B4.js",
      "chunk-SJSFS7QI.js"
    ],
    "route": "/tasks"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-7NPRC4B4.js",
      "chunk-SJSFS7QI.js"
    ],
    "route": "/tasks/create"
  },
  {
    "renderMode": 2,
    "route": "/auth"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-UHNW4ZYI.js",
      "chunk-SJSFS7QI.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-UHNW4ZYI.js",
      "chunk-SJSFS7QI.js"
    ],
    "route": "/auth/register"
  },
  {
    "renderMode": 2,
    "route": "/dashlogs"
  },
  {
    "renderMode": 2,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 858, hash: 'd1b9797619508c9d716aa1ed0d1f5fe75d793f32ea9bf99f8c65749fcbb1db6c', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1102, hash: '8daf4df9a3f69907ea069b7ccdc26bf1ba2b1497c82ca7ae0ee6597e4785d733', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'tasks/create/index.html': {size: 2587, hash: '115f867055525e23dfa82323351f9c4bd5753cb9f8ca428e78ecf22a84a7ce4a', text: () => import('./assets-chunks/tasks_create_index_html.mjs').then(m => m.default)},
    'auth/login/index.html': {size: 4912, hash: '10ad3809bf6520614a0901ec7cac4e900e5342440aec9a747f14be8b979ea49a', text: () => import('./assets-chunks/auth_login_index_html.mjs').then(m => m.default)},
    'tasks/index.html': {size: 2587, hash: '115f867055525e23dfa82323351f9c4bd5753cb9f8ca428e78ecf22a84a7ce4a', text: () => import('./assets-chunks/tasks_index_html.mjs').then(m => m.default)},
    'auth/index.html': {size: 2482, hash: 'd4c6ea5855732a47ea4f254dc9bd1ce8ca12666e59da73556f9e55c79a1fdb85', text: () => import('./assets-chunks/auth_index_html.mjs').then(m => m.default)},
    'auth/register/index.html': {size: 4887, hash: '9e2f447a002917bd0b593655ebb681a92bd471388c625c96ec55f06a766f7af0', text: () => import('./assets-chunks/auth_register_index_html.mjs').then(m => m.default)},
    'dashlogs/index.html': {size: 2482, hash: 'd4c6ea5855732a47ea4f254dc9bd1ce8ca12666e59da73556f9e55c79a1fdb85', text: () => import('./assets-chunks/dashlogs_index_html.mjs').then(m => m.default)},
    'styles-MYJFEBJ4.css': {size: 13204, hash: 'VhuLoCO66to', text: () => import('./assets-chunks/styles-MYJFEBJ4_css.mjs').then(m => m.default)}
  },
};

'use strict';

const CONFIG = {
  // GASデプロイ後にここにURLを入力してください
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyNrz5k9NIK7lQdCrcK3DGrav5txk_c7C2mzkwha7daMionYzz68uw5VhbnnvRBV1Z1vg/exec',

  // ユーザーマップ（URLトークン → ユーザー情報）
  USERS: {
    'k7x9m2p4q1w3': { name: '宮下 怜',  isAdmin: true  },
    'p4r8n1q6w3e5': { name: '坂井 裕美', isAdmin: false },
    'q6w3y5j1s7r9': { name: '伊藤 美彩', isAdmin: false },
    'j1s7t4m9v2y8': { name: '宮城 香帆', isAdmin: false },
    'm9v2u6b5h4t3': { name: '横山 うみ', isAdmin: false },
    'b5h4c8k7x9u2': { name: '中村 琴菜', isAdmin: false },
  },

  // 管理者専用トークン（西守・鈴木・宮下が共用）
  ADMIN_TOKEN: 'adm_wx8k3m2p9q1r4',

  // ブランド定義
  BRANDS: [
    {
      code: 'VCCD',
      name: 'VC/C+D',
      isStripe: true,
      color1: '#FF7A30',
      color2: '#7ED8A0',
      textColor: '#fff',
    },
    { code: 'CCERA', name: 'C+Cera',     isStripe: false, color: '#FF6B9D', textColor: '#fff' },
    { code: 'SB',    name: 'SkinBeauty', isStripe: false, color: '#C4934A', textColor: '#fff' },
    { code: 'MI',    name: 'MINERALion', isStripe: false, color: '#1E3A8A', textColor: '#fff' },
    { code: 'CBD',   name: 'CBD',        isStripe: false, color: '#1B7A4A', textColor: '#fff' },
    { code: 'NONE',  name: '識別なし',   isStripe: false, color: '#9CA3AF', textColor: '#fff' },
    { code: 'NA',    name: '対象外',     isStripe: false, color: '#E5E7EB', textColor: '#9CA3AF' },
  ],

  // 表示時間帯（9時〜19時の開始時間）
  HOURS: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],

  // 絶対に変更できない対象外（12時）
  FIXED_NA_HOURS: [12],

  // デフォルト対象外だが上書き可能（18〜19時）
  DEFAULT_NA_HOURS: [18, 19],

  // 内部コード
  BRAND_UNSET: 'UNSET',
  BRAND_NA: 'NA',
};

export const GAME_WIDTH = 1680
export const GAME_HEIGHT = 1050
export const SPRITE_SIZE = 64
export const LOADING_BAR_HEIGHT = 4
export const BACKGROUND_COLOR = 0x081c1b
export const LOADING_BAR_COLOR = 0x1d8d80
export const PROPS_FRAME_SIZE = 32

export const FONT_OPTIONS = [
    { key: 'neuro', label: '//ALIEN123', x: 186, y: 466 },
    { key: 'font', label: '//ALIEN123', x: 310, y: 469 },
]

export const ALPHA_CONTROL_POSITION = {
    textX: 36,
    textY: 510,
    rangeX: 110,
    rangeY: 540,
}
export const FONT_SIZE_POSITION = {
    textX: 36,
    textY: 570,
    buttonXStart: 50,
    buttonY: 610,
    buttonOffset: 40,
}

export const FONT_SCALES = [1, 1.618, 3.236, 4.854]

export const TEXT_SELECT_FONT_POSITION = { x: 36, y: 470 }
export const FONT_SIZE_LABEL_POSITION = { x: 36, y: 570 }
export const FONT_SELECT_LABEL_TEXT = 'SELECT FONT:'
export const FONT_SIZE_LABEL_TEXT = 'FONT SIZE'
export const DEFAULT_FONT_SIZE = 16
export const FONT_HOVER_COLOR = 0x1d8d80
export const FONT_DEFAULT_COLOR = 0xffffff

// TEXT EDITOR

export const HUD_VOLUME = 0.2
export const BEEP_VOLUME = 0.2
export const INPUT_STYLE_TEXT_BOX = {
    'border-style': 'double',
    'font-size': '21px',
    padding: '8px',
    'font-family': 'courier',
    'background-color': '#000000',
    'border-color': '#fff',
    color: '#ffffff',
    'border-width': '3px',
    'border-radius': '0px',
    'text-transform': 'uppercase',
    outline: '0',
    position: 'absolute',
    left: 0,
    top: 0,
    'z-index': '999',
}
export const TEXT_POSITION = { x: 32, y: 620 }
export const TEXT_SIZE = 16
export const INPUT_TEXT_POSITION = { x: 150, y: 590 }
export const BUTTON_POSITION = { x: 312, y: 590 }
export const DK_TIMEOUT = 100
export const DK_INITIAL_VALUE = false
export const DK_FINAL_VALUE = true
export const EDITOR_SCENE_KEY = 'editor'
export const TEXT_SCENE_KEY = 'TextScene'

const BASE_X = 32
const BASE_Y = 32
const TEXT_SPAN = 26
const FONT_SIZE = 16
const NEURO_FONT = 'neuro'
const FONT = 'font'
const TINT_MAIN = 0x1d8d80
const TINT_SECONDARY = 0xf0f0f0
const TINT_TERTIARY = 0x555555
const ALPHA_MAIN = 1
const ALPHA_SECONDARY = 0.95
const TEXT_Y = 720

export const EDITOR_TEXTS = [
    {
        x: BASE_X,
        y: BASE_Y,
        font: FONT,
        text: '0',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_xpos',
    },
    {
        x: BASE_X,
        y: BASE_Y + TEXT_SPAN,
        font: FONT,
        text: 'DRAWING TOOL',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_state',
    },
    {
        x: BASE_X,
        y: BASE_Y + TEXT_SPAN * 2,
        font: FONT,
        text: '',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_mirror',
    },
    {
        x: BASE_X,
        y: BASE_Y + TEXT_SPAN * 3,
        font: FONT,
        text: '',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_switch_layer_ctr',
    },
    {
        x: BASE_X,
        y: BASE_Y + TEXT_SPAN * 5,
        font: NEURO_FONT,
        text: '//MAIN ICONS',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_icons1',
    },
    {
        x: BASE_X,
        y: BASE_Y + TEXT_SPAN * 9,
        font: NEURO_FONT,
        text: '//MAIN PROPS',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_icons2',
    },
    {
        x: BASE_X,
        y: TEXT_Y + 275,
        font: NEURO_FONT,
        text: 'WEYLAND-YUTANI CORP · BBW',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_initial2',
    },
    {
        x: BASE_X,
        y: TEXT_Y + 296,
        font: NEURO_FONT,
        text: 'SOFTWARE: NEWT Blueprint Builder v111',
        size: FONT_SIZE,
        tint: TINT_TERTIARY,
        alpha: ALPHA_MAIN,
        key: 'text_initial3',
    },
    {
        x: 832,
        y: TEXT_Y + 56,
        font: NEURO_FONT,
        text: 'https://delacannon.itch.io',
        size: FONT_SIZE,
        tint: TINT_TERTIARY,
        alpha: ALPHA_MAIN,
        key: 'text_initial_itch',
        rotation: 1.57079633,
        interactive: true,
        url: 'https://delacannon.itch.io',
    },
    {
        x: BASE_X,
        y: TEXT_Y - 222,
        font: NEURO_FONT,
        text: '',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: 0.5,
        key: 'text_instructions',
    },
    {
        x: BASE_X,
        y: TEXT_Y - 64,
        font: NEURO_FONT,
        text: '//INSTRUCTIONS',
        size: 32,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_initial',
    },
    {
        x: BASE_X,
        y: TEXT_Y,
        font: FONT,
        text: '[H] HELP',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_help',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN,
        font: FONT,
        text: '[SPACE] SWITCH LAYERS MAP/PROPS',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_MAIN,
        key: 'text_switch_layer',
    },

    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 2,
        font: FONT,
        text: '[I] DOWNLOAD MAP AS PNG',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_print_img',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 3,
        font: FONT,
        text: '[P] DOWNLOAD MAP AS PDF',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_print',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 4,
        font: FONT,
        text: '[C] CREATE-TXT',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_create',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 5,
        font: FONT,
        text: '[ESC] RESET-MAP::[F1] SHARE-MAP::[F2] RANDOM MAP',
        size: FONT_SIZE,
        tint: TINT_MAIN,
        alpha: ALPHA_MAIN,
        key: 'text_clearMap',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 6,
        font: FONT,
        text: '[X,Y] ENABLE X/Y-AXIS SYMMETRY',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_xaxis',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 7,
        font: FONT,
        text: '[R,B] CHANGE SCREEN COLOR',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_yaxis',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 8,
        font: FONT,
        text: '[B] ADJUST SCREEN BRIGHTNESS',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_traking',
    },
    {
        x: BASE_X,
        y: TEXT_Y + TEXT_SPAN * 9,
        font: FONT,
        text: '[N] ADJUST SCREEN NOISE',
        size: FONT_SIZE,
        tint: TINT_SECONDARY,
        alpha: ALPHA_SECONDARY,
        key: 'text_screen_noise',
    },
]

export const INPUT_STYLE = {
    'border-style': 'double',
    'font-size': '18px',
    padding: '4px',
    'font-family': 'courier',
    'background-color': '#000000',
    'border-color': '#fff',
    color: '#ffffff',
    'border-width': '3px',
    'border-radius': '0px',
    'text-transform': 'uppercase',
    outline: '0',
}

export const INPUT_STYLE_RANGE = {
    width: '150px',
    'background-color': 'white',
    outline: '0',
    '-webkit-appearance': 'none',
    height: '10px',
}

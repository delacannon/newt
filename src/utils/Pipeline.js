import Phaser from 'phaser';

const CustomPipeline2 = new Phaser.Class({
  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

  initialize: function CustomPipeline2(game) {
    Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
      game: game,
      renderer: game.renderer,
      fragShader: [
        'precision mediump float;',

        'uniform float     time;',
        'uniform float     brigt;',
        'uniform float     noiser;',
        'uniform float         r;',
        'uniform float          b;',
        'uniform vec2      resolution;',
        'uniform sampler2D uMainSampler;',
        'uniform vec2      mouse;',

        'varying vec2 outTexCoord;',

        'float noise(vec2 pos) {',
        'return fract(sin(dot(pos, vec2(12.9898 - time,78.233 + time))) * 43758.5453);',
        '}',

        'void main( void ) {',

        '//vec2 normalPos = gl_FragCoord.xy / resolution.xy;',
        'vec2 normalPos = outTexCoord;',
        'vec2 pointer = mouse / resolution;',
        'float pos = (gl_FragCoord.y / resolution.y);',
        'float mouse_dist = length(vec2((pointer.x - normalPos.x) * (resolution.x / resolution.y), pointer.y - normalPos.y));',
        'float distortion = clamp(1.0 - (mouse_dist + 0.1) * 3.0, 0.0, 1.0);',

        'float c = sin(pos * 1000.0) * 0.15 + 0.15;',
        'c = pow(c, 0.9);',
        'c *= 0.15;',

        'float band_pos = fract(time * 0.3) * 5.0 - 1.0;',
        'c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 1.0) * 0.1;',

        'c += distortion * 0.08;',
        '// noise',
        'c += (noise(gl_FragCoord.xy) - brigt) * (noiser);',

        'vec4 pixel = texture2D(uMainSampler, outTexCoord);',
        'pos -= (distortion * distortion) * 0.1;',

        'gl_FragColor = pixel + vec4( r, c, b, 0.75 );',
        '}',
      ].join('\n'),
    });
  },
});

export default CustomPipeline2;

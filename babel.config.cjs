// Jest(babel-jest) 전용 변환 설정. Vite 빌드에는 영향을 주지 않는다.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
}

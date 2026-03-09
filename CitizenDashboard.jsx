// frontend/babel.config.js

module.exports = function(api) {
  api.cache(true);
  return {
    // CRITICAL FIX: Add nativewind/babel as the last preset here
    presets: [
      'babel-preset-expo',
      'nativewind/babel' 
    ],
    // REMOVE the plugins: [] array entirely
  };
};
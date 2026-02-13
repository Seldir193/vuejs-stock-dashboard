const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0].__VUE_OPTIONS_API__ = true;
      args[0].__VUE_PROD_DEVTOOLS__ = false;
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
      return args;
    });
  },
});

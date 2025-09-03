// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      "vue/first-attribute-linebreak": [
        "error",
        {
          singleline: "ignore",
          multiline: "beside",
        },
      ],
    },
  }
);

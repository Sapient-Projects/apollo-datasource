const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");

function uppercaseDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const uppercaseDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (uppercaseDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === "string") {
            return result.toUpperCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}

function lowercaseDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const uppercaseDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (uppercaseDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === "string") {
            return result.toLowerCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}

module.exports = {
  uppercaseDirectiveTransformer,
  lowercaseDirectiveTransformer
};

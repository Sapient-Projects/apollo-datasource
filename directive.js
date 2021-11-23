const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { uid } = require("./util");
const { ApolloError } = require("apollo-server-errors");

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
      const lowercaseDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (lowercaseDirective) {
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

function authDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          const payload = JSON.parse(context.user);
          // const review = context.dataSources.reviews.getReviewById(args.id);
          if (payload.uid !== result.authorID) {
            result.body = null;
          }
          return result;
        };
      }
      return fieldConfig;
    },
    [MapperKind.OBJECT_TYPE]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (authDirective) {
        // const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          const payload = JSON.parse(context.user);
          if (payload.uid !== uid) {
            throw new ApolloError(
              "Cannot get review of another user",
              "REVIEW_BODY_ACCESS_DENIED",
              {
                user: uid,
              }
            );
          }
          const result = await resolve(source, args, context, info);
          return result;
        };
      }
      return fieldConfig;
    },
  });
}

module.exports = {
  uppercaseDirectiveTransformer,
  lowercaseDirectiveTransformer,
  authDirectiveTransformer,
};
